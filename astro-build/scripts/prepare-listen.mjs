#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ROOT, DEFAULT_NARRATION, REVIEW_DIR, readEssay, narrationScript, sha256, sourceHash } from './listen-lib.mjs';

export function prepareReview({ slugs = [], root = ROOT, directory = REVIEW_DIR } = {}) {
  if (!slugs.length) throw new Error('Provide at least one post with --slug <slug>. Repeat --slug for a batch.');
  if (new Set(slugs).size !== slugs.length) throw new Error('Each post may appear only once in a review.');
  if (existsSync(join(directory, 'manifest.json'))) {
    throw new Error('A listening review already exists. Preserve it before preparing another.');
  }
  // Validate and prepare the entire batch before writing any review files.
  const prepared = slugs.map((slug) => {
    const essay = readEssay(slug, root);
    if (!['draft', 'unlisted', 'published'].includes(essay.data.status || 'published')) {
      throw new Error('Narration requires a draft, unlisted or published blog post.');
    }
    return { slug, essay, script: narrationScript(essay) };
  });
  const essays = prepared.map(({ slug, essay, script }) => ({
    slug, title: essay.data.title, narrator: DEFAULT_NARRATION.voiceSelection.narrator,
    status: 'awaiting-generation', sourceSha256: sourceHash(essay), scriptSha256: sha256(script),
    characters: script.length, scriptFile: `${slug}.txt`, audioFile: `${slug}-british-v1-raw.mp3`,
  }));
  const manifest = {
    version: 1, createdAt: new Date().toISOString(),
    voiceSelection: { ...DEFAULT_NARRATION.voiceSelection }, essays,
    scriptNotes: ['Title and author are spoken.', 'Link text is retained; URLs are not spoken.',
      'The standalone Read the letter link is omitted.', '630 is pronounced six-three-oh.',
      'Section dividers become pauses; headings remain spoken with ending punctuation.'],
  };
  mkdirSync(directory, { recursive: true });
  for (const { slug, script } of prepared) writeFileSync(join(directory, `${slug}.txt`), script);
  writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { slug: { type: 'string', multiple: true } } });
  const manifest = prepareReview({ slugs: values.slug });
  console.log(`Prepared ${manifest.essays.length} scripts (${manifest.essays.reduce((n, essay) => n + essay.characters, 0)} characters) in ${REVIEW_DIR}`);
  console.log('No audio generated and no publication metadata changed.');
}
