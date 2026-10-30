import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const REVIEW_DIR = join(ROOT, '.tmp/listen-preview');
export const FIRST_ESSAYS = ['because-i-can-is-only-half-the-answer', 'the-rules-of-the-road-still-apply'];
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const sourceHash = ({ data, content }) => sha256(JSON.stringify({
  title: data.title, author: data.author || 'Nino Chavez', body: content.trim(),
}));
export function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Listen assets and content must not use symlinks.');
    return entry.isDirectory() ? files(path) : [path];
  });
}
export function readEssay(slug, root = ROOT) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Invalid essay slug.');
  return matter(readFileSync(join(root, 'src/content/blog', `${slug}.mdx`), 'utf8'));
}
export function readManifest(directory = REVIEW_DIR) {
  return JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'));
}
export function localFile(directory, name) {
  if (typeof name !== 'string' || !/^[a-z0-9.-]+$/.test(name) || name.startsWith('.')) {
    throw new Error('Invalid local review filename.');
  }
  return resolve(directory, name);
}

// Deliberately limited to prose essays. Unsupported MDX needs a human-authored
// narration script; silently dropping a table or code block changes the essay.
export function narrationScript(essay) {
  let body = essay.content.trim();
  if (/^\s*(?:```|~~~|import\s|export\s|\|)|<[^>]+>|!\[|\{[^}]*\}/m.test(body)) {
    throw new Error('This essay needs a manually reviewed narration script (complex MDX).');
  }
  body = body
    .replace(/\[Read the letter\.\]\([^\s]+\)/g, '')
    .replace(/\[([^\]]+)\]\((?:[^()]|\([^()]*\))*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*(?:---+|\*\*\*+|___+)\s*$/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\b630\b/g, 'Six Thirty')
    .replace(/ +$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
  if (/\]\(|\[\^|^\s*[-*+]\s/m.test(body)) throw new Error('Review unresolved Markdown before narration.');
  return `${essay.data.title}.\n\nBy ${essay.data.author || 'Nino Chavez'}.\n\n${body}\n`;
}

export function splitScript(text, limit = 4500) {
  const chunks = [];
  for (const paragraph of text.trim().split(/\n\s*\n/)) {
    if (paragraph.length > limit) throw new Error('A paragraph exceeds the narration chunk limit.');
    const last = chunks.at(-1);
    if (last && last.length + paragraph.length + 2 <= limit) chunks[chunks.length - 1] += `\n\n${paragraph}`;
    else chunks.push(paragraph);
  }
  return chunks;
}
