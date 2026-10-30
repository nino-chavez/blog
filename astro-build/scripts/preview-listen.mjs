#!/usr/bin/env node
import { createServer } from 'node:http';
import { createReadStream, readFileSync, statSync, existsSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { ROOT, REVIEW_DIR, readManifest, localFile, readEssay, sourceHash, sha256 } from './listen-lib.mjs';
import { escapeHtml, renderEssayAudio } from '../src/utils/essay-audio.mjs';

const { values } = parseArgs({ options: { directory: { type: 'string', default: REVIEW_DIR }, port: { type: 'string', default: '4328' } } });
const directory = resolve(values.directory);
if (!directory.startsWith(join(ROOT, '.tmp') + sep)) throw new Error('Listening reviews must stay inside astro-build/.tmp.');
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid local port.');
const types = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' };
const cssPath = join(ROOT, 'src/styles/essay-audio.css');

function sendFile(request, response, path, contentType) {
  const size = statSync(path).size;
  response.setHeader('Content-Type', contentType);
  response.setHeader('Accept-Ranges', 'bytes');
  const range = request.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const suffix = match && !match[1] && match[2] ? Number(match[2]) : null;
    const start = suffix !== null ? Math.max(0, size - suffix) : match?.[1] ? Number(match[1]) : NaN;
    const end = suffix !== null || !match?.[2] ? size - 1 : Math.min(size - 1, Number(match[2]));
    if (suffix === 0 || !Number.isSafeInteger(start) || start < 0 || start >= size || !Number.isSafeInteger(end) || end < start) {
      response.writeHead(416, { 'Content-Range': `bytes */${size}` }); response.end(); return;
    }
    response.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    if (request.method === 'HEAD') response.end(); else createReadStream(path, { start, end }).pipe(response);
  } else {
    response.writeHead(200, { 'Content-Length': size });
    if (request.method === 'HEAD') response.end(); else createReadStream(path).pipe(response);
  }
}

const server = createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  // Reject browser requests addressed to another host, including DNS rebinding.
  if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(request.headers.host)) {
    response.writeHead(403); response.end(); return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://127.0.0.1:${port}`).pathname);
    const manifest = readManifest(directory);
    const ready = (essay) => {
      if (sourceHash(readEssay(essay.slug)) !== essay.sourceSha256) throw new Error('The essay changed. Prepare a fresh narration before reviewing it.');
      if (essay.status !== 'ready-for-review' || !existsSync(localFile(directory, essay.audioFile))) return false;
      if (sha256(readFileSync(localFile(directory, essay.audioFile))) !== essay.sha256) throw new Error('The recording changed. Restore the reviewed take or generate a new one.');
      return true;
    };
    const player = (essay) => renderEssayAudio({ ...essay, src: `/audio/${essay.audioFile}` }, { title: essay.title, id: `audio-${essay.slug}` });
    if (pathname === '/listen.css') return sendFile(request, response, cssPath, 'text/css');
    if (pathname === '/listen.js') return sendFile(request, response, join(ROOT, 'src/scripts/essay-audio.js'), 'text/javascript');
    const audio = manifest.essays.find((essay) => pathname === `/audio/${essay.audioFile}` && ready(essay));
    if (audio) return sendFile(request, response, localFile(directory, audio.audioFile), 'audio/mpeg');
    const article = manifest.essays.find((essay) => pathname === `/essay/${essay.slug}`);
    if (article) {
      const builtPath = join(ROOT, 'dist/blog', `${article.slug}.html`);
      if (!existsSync(builtPath)) throw new Error('Build the site before opening an essay preview.');
      let html = readFileSync(builtPath, 'utf8');
      const slot = `<div data-essay-audio-slot data-essay-source="${article.sourceSha256}">`;
      if (!html.includes(slot)) throw new Error('The built transcript is out of date. Rebuild the site before reviewing audio.');
      // Keep ordinary publication links useful without serving other local routes.
      html = html.replace(/href="(\/(?:blog|about|photography|privacy)(?:[/?#][^"]*)?)"/g, (_, href) => {
        const selected = manifest.essays.find((essay) => href.split(/[?#]/)[0] === `/blog/${essay.slug}`);
        return `href="${selected ? `/essay/${selected.slug}` : `https://ninochavez.co${href}`}"`;
      });
      const notice = `<p style="font:13px/1.5 system-ui;color:#536373;margin:0 0 20px"><a href="/" style="color:#0d5a93;text-decoration:underline;text-underline-offset:3px">Private listening review</a> · ${manifest.testFixture ? 'Test tone — not a voice recording' : 'Not published'}</p>`;
      html = html.replace(slot, `${slot}${notice}${ready(article) ? player(article) : '<p>Waiting for your voice recording.</p>'}`)
        .replace('</head>', '<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/listen.css"><script type="module" src="/listen.js"></script></head>');
      response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(request.method === 'HEAD' ? undefined : html); return;
    }
    // Only built static resources, never Worker code, content JSON or local files.
    if (/^\/(?:_astro|images)\//.test(pathname)) {
      const path = resolve(ROOT, 'dist', `.${pathname}`);
      if (path.startsWith(join(ROOT, 'dist') + sep) && types[extname(path)] && existsSync(path)) return sendFile(request, response, path, types[extname(path)]);
    }
    if (pathname !== '/') { response.writeHead(404); response.end('Not found'); return; }
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(request.method === 'HEAD' ? undefined : `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Listen review — Signal Dispatch</title><link rel="stylesheet" href="/listen.css"><script type="module" src="/listen.js"></script><style>body{margin:0;background:#f4f0e8;color:#122a3c;font:16px/1.6 system-ui}main{max-width:700px;margin:48px auto;padding:0 22px}h1,h2{font-family:Georgia,serif;font-weight:400}h1{font-size:40px;line-height:1.15}h2{font-size:28px;line-height:1.2}a{color:#0d5a93;text-underline-offset:3px}.note{color:#536373}article{padding:20px 0;border-top:1px solid #122a3c38}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.essay-audio{margin-bottom:0;border:0;padding:0}</style></head><body><main><p>Signal Dispatch · Private review</p><h1>Listen before it goes live.</h1><p class="note">${manifest.testFixture ? 'Technical test: these players contain a test tone, not Nino’s voice.' : 'Two essays, narrated with an AI version of your voice. These recordings stay on this computer until you approve them.'}</p>${manifest.essays.map((essay) => `<article><h2>${escapeHtml(essay.title)}</h2>${ready(essay) ? player(essay).replace('The essay below is the transcript.', 'Open the essay to follow the transcript.') : '<p class="note">Waiting for your voice recording. No narration has been generated.</p>'}<p><a href="/essay/${escapeHtml(essay.slug)}">Open essay preview</a></p></article>`).join('')}</main></body></html>`);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain' }); response.end(error.message);
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Private Listen review: http://127.0.0.1:${port}`));
