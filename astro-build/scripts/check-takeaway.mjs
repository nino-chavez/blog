#!/usr/bin/env node
/**
 * check-takeaway.mjs — enforces the clause the reader contract already declares.
 *
 * reader-contract.json states the reader's job: "understand the argument, see the
 * evidence, and leave with a usable idea." encounter-audit.mjs checks denied terms,
 * block length, opaque tokens, and undefined acronyms. None of those check whether
 * the reader leaves with anything, so the load-bearing clause was decorative.
 *
 * This makes it structural. A piece published on or after EFFECTIVE_DATE must carry
 * a `takeaway` — one plain sentence naming what the reader can now do, decide, or
 * check. If it can't be written, the piece isn't finished.
 *
 * Deliberately date-gated rather than backfilled: the ~150 pieces predating the
 * contract keep building, and nothing is retrofitted with a sentence its author
 * never wrote.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const EFFECTIVE_DATE = '2026-08-08';
const COLLECTIONS = ['blog', 'whitepapers', 'tutorials'];
const ROOT = path.resolve(import.meta.dirname, '..', 'src', 'content');

const MIN_WORDS = 6;
const MAX_WORDS = 30;

// A takeaway describes what the READER does next. These openings describe the
// piece or its author instead, which is the failure this check exists to catch.
const ABOUT_THE_PIECE = /^(this (post|piece|paper|essay|tutorial)|i |we |the (post|piece|paper|essay)\b)/i;

function frontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const f = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (f) out[f[1]] = f[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const problems = [];

for (const collection of COLLECTIONS) {
  let entries = [];
  try {
    entries = await readdir(path.join(ROOT, collection));
  } catch {
    continue;
  }

  for (const name of entries.filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))) {
    const rel = `src/content/${collection}/${name}`;
    const raw = await readFile(path.join(ROOT, collection, name), 'utf8');
    const fm = frontmatter(raw);
    if (!fm) continue;

    const published = (fm.publishedAt || '').slice(0, 10);
    if (!published || published < EFFECTIVE_DATE) continue;
    if (fm.status === 'draft') continue;

    const takeaway = (fm.takeaway || '').trim();

    if (!takeaway) {
      problems.push(
        `${rel}\n    missing 'takeaway'. One plain sentence: what can the reader do,\n` +
        `    decide, or check after reading? If you can't write it, the piece isn't done.`
      );
      continue;
    }

    const words = takeaway.split(/\s+/).length;
    if (words < MIN_WORDS || words > MAX_WORDS) {
      problems.push(`${rel}\n    'takeaway' is ${words} words; keep it between ${MIN_WORDS} and ${MAX_WORDS}.`);
    }
    if (ABOUT_THE_PIECE.test(takeaway)) {
      problems.push(
        `${rel}\n    'takeaway' describes the piece or its author, not the reader.\n` +
        `    Rewrite so the subject is what the reader does with it.\n    got: "${takeaway}"`
      );
    }
    if (fm.excerpt && norm(fm.excerpt).includes(norm(takeaway))) {
      problems.push(`${rel}\n    'takeaway' is contained in 'excerpt'. It has to add something the excerpt doesn't.`);
    }
    if (fm.title && norm(takeaway) === norm(fm.title)) {
      problems.push(`${rel}\n    'takeaway' restates the title.`);
    }
  }
}

if (problems.length) {
  console.error(`\n[check-takeaway] ${problems.length} problem(s) — reader-contract.json requires the reader to leave with a usable idea:\n`);
  for (const p of problems) console.error(`  ${p}\n`);
  process.exit(1);
}

console.log('[check-takeaway] ok');
