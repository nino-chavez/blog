#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FIRST_ESSAYS, REVIEW_DIR, readEssay, narrationScript, sha256, sourceHash } from './listen-lib.mjs';

mkdirSync(REVIEW_DIR, { recursive: true });
if (existsSync(join(REVIEW_DIR, 'manifest.json'))) {
  throw new Error('A listening review already exists. Preserve it; use its scripts or move it aside before preparing another.');
}
const essays = FIRST_ESSAYS.map((slug) => {
  const essay = readEssay(slug);
  if (essay.data.status !== 'published') throw new Error('The first Listen trial uses published essays only.');
  const script = narrationScript(essay);
  writeFileSync(join(REVIEW_DIR, `${slug}.txt`), script);
  return {
    slug, title: essay.data.title, narrator: 'Nino Chavez', status: 'awaiting-voice',
    sourceSha256: sourceHash(essay), scriptSha256: sha256(script), characters: script.length,
    scriptFile: `${slug}.txt`, audioFile: `${slug}.mp3`,
  };
});
writeFileSync(join(REVIEW_DIR, 'manifest.json'), JSON.stringify({
  version: 1, createdAt: new Date().toISOString(), essays,
  scriptNotes: ['Title and author are spoken.', 'Link text is retained; URLs are not spoken.',
    'The standalone Read the letter link is omitted.', '630 is pronounced six-three-oh.',
    'Section dividers become pauses; headings remain spoken with ending punctuation.'],
}, null, 2) + '\n');
console.log(`Prepared ${essays.length} scripts (${essays.reduce((n, essay) => n + essay.characters, 0)} characters) in ${REVIEW_DIR}`);
console.log('No audio generated and no publication metadata changed.');
