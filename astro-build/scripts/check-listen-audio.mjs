#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { files, sha256, sourceHash } from './listen-lib.mjs';

export function checkAudio(root) {
  const approved = new Set();
  for (const path of files(join(root, 'src/content/blog')).filter((path) => path.endsWith('.mdx'))) {
    const essay = matter(readFileSync(path, 'utf8'));
    const audio = essay.data.audio;
    if (!audio) continue;
    if ((essay.data.status || 'published') !== 'published' || audio.status !== 'approved') {
      throw new Error('Audio requires a published essay and explicit recording approval.');
    }
    if (typeof audio.src !== 'string' || !/^\/blog\/audio\/[a-z0-9-]+\.mp3$/.test(audio.src)) {
      throw new Error('Approved audio must use /blog/audio/<name>.mp3.');
    }
    if (!(Number.isFinite(audio.durationSeconds) && audio.durationSeconds > 0) || !audio.narrator?.trim()) {
      throw new Error('Approved audio needs a duration and narrator.');
    }
    const asset = join(root, 'public', audio.src);
    if (approved.has(asset)) throw new Error('An approved recording must belong to one essay.');
    if (!existsSync(asset)) throw new Error('An approved recording is missing.');
    if (audio.sha256 !== sha256(readFileSync(asset))) throw new Error('Recording bytes changed after approval.');
    if (audio.sourceSha256 !== sourceHash(essay)) throw new Error('Essay changed after recording approval.');
    approved.add(asset);
  }
  const audioFiles = files(join(root, 'public')).filter((path) => /\.(mp3|wav|m4a|ogg|flac|aac|opus)$/i.test(path));
  if (audioFiles.some((path) => !approved.has(path))) throw new Error('Public audio has no approved, published essay owner.');
  return approved.size;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(`[check-listen-audio] ${checkAudio(process.cwd())} approved recordings; no unapproved public audio`);
  } catch (error) {
    console.error(`[check-listen-audio] FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
