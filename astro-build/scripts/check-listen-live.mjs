#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { checkAudio } from './check-listen-audio.mjs';
import { files, sha256 } from './listen-lib.mjs';

// Exercise the deployed delivery path: local preview range support is not proof
// that the production host supports seeking.
const origin = new URL(process.argv[2] || 'https://ninochavez.co').origin;
const root = process.cwd();
checkAudio(root);
const essays = files(join(root, 'src/content/blog'))
  .filter((file) => file.endsWith('.mdx'))
  .map((file) => ({ file, ...matter(readFileSync(file, 'utf8')) }))
  .filter(({ data }) => data.audio);
assert.ok(essays.length, 'No approved recordings to check');
const fetchChecked = (url, options = {}) => fetch(url, {
  ...options, signal: AbortSignal.timeout(30000),
});
const results = await Promise.all(essays.map(async ({ file, data }) => {
  const { audio } = data;
  const slug = file.split('/').at(-1).replace(/\.mdx$/, '');
  const url = new URL(`/blog/${slug}`, origin);
  const audioUrl = new URL(audio.src, origin);
  const result = { slug, url: url.href, audioUrl: audioUrl.href, checks: [] };
  try {
    const page = await fetchChecked(url);
    assert.equal(page.status, 200, 'Article status');
    const html = await page.text();
    assert.equal((html.match(/<audio\b/g) || []).length, 1, 'One player per article');
    assert.ok(html.includes(audio.src), 'Approved recording linked');
    assert.ok(html.includes(`AI narration · ${audio.narrator}.`), 'Narrator disclosure');
    result.checks.push('article player and disclosure');

    const localBytes = readFileSync(join(root, 'public', audio.src));
    const full = await fetchChecked(audioUrl);
    assert.equal(full.status, 200, 'Audio status');
    assert.match(full.headers.get('content-type') || '', /^audio\/mpeg\b/, 'Audio type');
    assert.equal(sha256(Buffer.from(await full.arrayBuffer())), audio.sha256, 'Exact approved bytes');
    result.sha256 = audio.sha256;
    result.checks.push('exact approved recording');

    const head = await fetchChecked(audioUrl, { method: 'HEAD' });
    assert.equal(head.status, 200, 'HEAD status');
    assert.equal(Number(head.headers.get('content-length')), localBytes.length, 'HEAD length');
    assert.equal(head.headers.get('accept-ranges'), 'bytes', 'Advertised seeking support');
    result.checks.push('HEAD and byte-range support');

    for (const [range, start, end] of [
      ['bytes=0-99', 0, 99],
      ['bytes=1000000-1000099', 1000000, 1000099],
      ['bytes=-100', localBytes.length - 100, localBytes.length - 1],
    ]) {
      const response = await fetchChecked(audioUrl, { headers: { Range: range } });
      assert.equal(response.status, 206, `Partial response for ${range}`);
      assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/${localBytes.length}`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), localBytes.subarray(start, end + 1));
      result.checks.push(range);
    }
    const unsatisfied = await fetchChecked(audioUrl, { headers: { Range: `bytes=${localBytes.length}-` } });
    assert.equal(unsatisfied.status, 416, 'Unsatisfiable range');
    assert.equal(unsatisfied.headers.get('content-range'), `bytes */${localBytes.length}`);
    await unsatisfied.body?.cancel();
    result.checks.push('unsatisfiable range');
    result.passed = true;
  } catch (error) {
    result.passed = false;
    result.error = error.message;
  }
  return result;
}));
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), origin, passed: results.every((r) => r.passed), results }, null, 2));
if (results.some((result) => !result.passed)) process.exitCode = 1;
