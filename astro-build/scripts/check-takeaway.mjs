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

// Pairings are printed for pieces published within this window — the ones still
// being edited. Older pieces are checked above but not re-surfaced for reading.
const RECENT_DAYS = 7;
const RECENT_SINCE = new Date(Date.now() - RECENT_DAYS * 864e5).toISOString().slice(0, 10);

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
const pairings = [];

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

    const body = raw.slice(raw.indexOf('---', 3) + 3)
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^#{1,6} .*$/gm, '')
      .replace(/^>.*$/gm, '');
    const opening = body.split(/\s+/).filter(Boolean).slice(0, 150).join(' ');
    // Only pieces still in flight. Printing all eleven on every build turns a
    // required read into wallpaper, which is how a worklist stops being read.
    if (published >= RECENT_SINCE) {
      pairings.push({ rel, takeaway, opening: opening.slice(0, 300) + '…' });
    }
  }
}

// ---------------------------------------------------------------------------
// Did the payoff reach the BODY? (required read, deliberately not a gate)
//
// The frontmatter check above proves a takeaway was written. It cannot prove the
// author transcribed it into the first 150 words, which is where the reader
// actually meets it. Measured 2026-08-23: nine-rgb-points-from-claude-coral
// carries a valid takeaway and states its point at word 364.
//
// This is NOT a mechanical gate, and the failed attempt is worth recording so
// nobody rebuilds it. Lexical overlap between takeaway and opening does not
// discriminate: the-depth-penalty-is-gone, the corpus's model of compliance,
// scores 0.19 while a known failure scores 0.13. That is not noise — the check
// above REJECTS a takeaway contained in the excerpt, so a takeaway is by design a
// paraphrase rather than a repetition. Word matching fights the rule's own intent,
// and any threshold separating those two cases is fitted to one example.
//
// So it prints, like check-captions.mjs's first-person class: the pairing goes in
// front of a human who can judge it in five seconds. A worklist that cannot be
// skipped silently beats a gate that is wrong.
if (pairings.length) {
  console.log(`\n[check-takeaway] ${pairings.length} piece(s) — read each takeaway against its own opening.`);
  console.log(`  Does the first 150 words carry that point? If the reader stops there, do they have it?\n`);
  for (const { rel, takeaway, opening } of pairings) {
    console.log(`  ${rel}`);
    console.log(`    takeaway: ${takeaway}`);
    console.log(`    opens:    ${opening}\n`);
  }
}

if (problems.length) {
  console.error(`\n[check-takeaway] ${problems.length} problem(s) — reader-contract.json requires the reader to leave with a usable idea:\n`);
  for (const p of problems) console.error(`  ${p}\n`);
  process.exit(1);
}

console.log('[check-takeaway] ok');
