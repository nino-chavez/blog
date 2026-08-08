#!/usr/bin/env node
// Source-fidelity gate for syndication captions.
//
// Why this exists as code rather than a rule in a doc: on 2026-08-03 a caption
// shipped claiming "before I could hand this work to a machine, most of it just
// didn't happen." The source post says the opposite — that the work is invisible
// to a sprint board and a git log, not that it wasn't happening. The claim
// survived a voice audit, six editing passes, an n-gram scan, and four threshold
// checks, because every one of those compared captions to each other or to a
// number. None re-read the source.
//
// The mechanism is drift-by-copying: after the first draft, the caption becomes
// the working source of truth and each later edit is a copy of a copy. A rule
// that says "check the source" does not survive that, because the editor believes
// they already did. A command does.
//
// Three classes, checked differently:
//   NUMBERS       — mechanizable. Every figure in a caption must appear in its
//                   source. Fails the build.
//   FIRST-PERSON  — not mechanizable. Claims about what the author did, believed,
//                   or observed cannot be verified by matching; they require
//                   reading. Printed with the source path so the reading has a
//                   worklist and cannot be skipped silently.
//   REPETITION    — mechanizable, added 2026-08-04. No two captions may share a
//                   five-word run. Captions are drafted weeks apart from the same
//                   voice and often the same source, so phrasing converges without
//                   anyone deciding it should.
//   SCOPE         — the mirror image, added 2026-08-04. Claims about the reader
//                   or about people in general. A caption can break fidelity in
//                   either direction: narrowing a source's general claim onto the
//                   author, or widening a claim about his system onto everyone.
//                   The second kind cost a comment thread that opened by
//                   disputing a premise instead of engaging the argument.
//
// Usage:
//   node syndication/check-captions.mjs            # all captions
//   node syndication/check-captions.mjs <slug>     # one, by caption filename fragment
//
// Exit codes: 0 clean, 1 unverified figures, 2 missing source, 3 repeated phrasing.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const HERE = dirname(fileURLToPath(import.meta.url))
const CAPTION_ROOT = join(HERE, 'captions')

// Every platform directory under captions/ is checked, not just linkedin.
// build-queue.mjs resolves `captions/<platform>/<id>.md` for ANY platform
// (line 488), so a substack/ or devto/ directory wires itself into the queue
// the moment it exists. A gate that only read linkedin/ would let that copy
// ship unverified — and 35 substack routes are `link` mode, which means a
// written framing note, which means the same fidelity rules apply.
const PLATFORMS = existsSync(CAPTION_ROOT)
  ? readdirSync(CAPTION_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : []
const CONTENT = join(HERE, '..', 'astro-build', 'src', 'content')
const DEMOS = join(homedir(), 'Workspace', 'dev', 'apps', 'nc-demos')

const filter = process.argv[2]

// Captions are named <collection>--<slug>.md. Blog-side collections resolve to a
// single .mdx; demos and applied resolve to a directory whose meta.json + deck.html
// together carry the argument (those pieces have no markdown body at all).
function sourceFor(file) {
  const [collection, ...rest] = file.replace(/\.md$/, '').split('--')
  const slug = rest.join('--')
  if (['blog', 'whitepapers', 'tutorials'].includes(collection)) {
    const p = join(CONTENT, collection, `${slug}.mdx`)
    return existsSync(p) ? { path: p, text: readFileSync(p, 'utf8') } : { path: p, text: null }
  }
  const dir = join(DEMOS, collection === 'demos' ? 'demos' : 'applied', slug)
  if (!existsSync(dir)) return { path: dir, text: null }
  let text = ''
  for (const f of ['meta.json', 'deck.html']) {
    const p = join(dir, f)
    if (!existsSync(p)) continue
    text += ' ' + readFileSync(p, 'utf8')
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  }
  return { path: dir, text }
}

// Commas are stripped so "38,322" in a caption matches "38322" nowhere but
// "38,322" everywhere — normalise both sides rather than guessing the format.
const figures = (s) => new Set((s.match(/\b\d[\d,]*(?:\.\d+)?\b/g) || []).map((n) => n.replace(/,/g, '')))

// Every first-person sentence gets read. An earlier version also required a
// verb from PAST_TENSE below, on the theory that present-tense opinion ("I
// think X is wrong") is argument rather than a claim about the author's
// history. That gate ran clean over captions carrying four real violations,
// because the violations used verbs nobody thought to list: "which I hadn't
// THOUGHT to do until recently", "sharpen it more than I EXPECTED", "I'd been
// READING one for the other". The verb list is now a sort order, not a filter
// — relocation hides in whichever verb the list is missing.
const FIRST_PERSON = /\b(I|I'd|I've|I'm|I'll|my|mine|me|myself)\b/i
const PAST_TENSE =
  /\b(was|were|had|did|didn't|got|built|ran|wrote|asked|installed|pointed|found|kept|spent|skipped|been|assumed|guessed|logged|typed|measured|watched|noticed|tried|used to)\b/i

// The mirror image, and the reason this second pass exists. Relocation narrows
// a source's general claim onto Nino. The same instinct also runs the other
// way: a claim the source makes about HIS system gets widened onto everyone
// ("a README is the file you write once and never open again"), which a reader
// can deny from experience in one line. Both break the same rule — the caption
// changed the scope the source assigned.
//
// FIRST_PERSON cannot see these; they contain no first-person pronoun. A manual
// scan cannot be trusted either: on 2026-08-04 one such line was fixed and its
// twin four paragraphs up, in the same caption, survived the same read.
//
// This deliberately has no companion verb list. The first draft paired it with
// one (skip/write/read/want/...) and that filter silently dropped "Nothing ever
// PROMPTS you to take something out" — reproducing, in a new check written the
// same day, the exact bug the PAST_TENSE note above describes. A verb list
// fails on the verb nobody listed, and it fails silently, which is the worst
// property a gate can have. Pronoun alone: 26 printed lines become 75. That is
// the correct trade — 49 lines of noise cost a few seconds of reading, and one
// silent miss costs a published correction.
const SCOPE_CLAIM = /\b(you|your|you're|nobody|no one|everyone|everybody|anyone|people|most people|nearly every|almost every)\b/i

// Five-word runs, used for the repetition check. Five is short enough to catch a
// reworded-but-not-rewritten passage and long enough that ordinary English does
// not collide: at 23 captions the count is 0, so any hit is a real echo.
//
// This existed as an ad-hoc command in a prior session and the README cites it as
// one of the checks the 8/4 caption "survived". It was never in the repo, which is
// why it caught nothing on 2026-08-04 when a Substack note was drafted by
// rearranging the LinkedIn caption for the same piece instead of returning to the
// source: 70 shared runs, the same drift-by-copying this whole gate exists for.
// One deliberate exception. `link`-mode Substack notes close with a standing
// line explaining why the piece is linked rather than pasted. It is house
// boilerplate and it SHOULD be identical every time — a subscriber reading
// three of them gets the same explanation in the same words, which is the point.
// Varying it to satisfy the check would read as disguising a template.
//
// It is stripped before the comparison rather than whitelisted after, so it can
// never mask a real echo in the sentence next to it.
const BOILERPLATE = /^Linked rather than sent in full[^\n]*$/gim

const fiveGrams = (s) => {
  const w = s.replace(BOILERPLATE, ' ').replace(/https?:\/\/\S+/g, ' ').toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean)
  const out = new Set()
  for (let i = 0; i + 5 <= w.length; i++) out.add(w.slice(i, i + 5).join(' '))
  return out
}
const grams = new Map()

let unverified = 0
let missing = 0
const worklist = []
const scopelist = []

let total = 0
for (const platform of PLATFORMS) {
  const dir = join(CAPTION_ROOT, platform)
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    total++
    if (filter && !file.includes(filter)) continue
    const caption = readFileSync(join(dir, file), 'utf8').replace(/https?:\/\/\S+/g, '')
    grams.set(`${platform}/${file}`, fiveGrams(caption))
    const { path, text } = sourceFor(file)

    if (text === null) {
      console.log(`✗ ${platform}/${file}\n    no source at ${path}`)
      missing++
      continue
    }

    const inSource = figures(text)
    const bad = [...figures(caption)].filter((n) => !inSource.has(n))
    if (bad.length) {
      console.log(`✗ ${platform}/${file}\n    figures absent from source: ${bad.join(', ')}\n    source: ${path}`)
      unverified++
    }

    const sentences = caption
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean)

    const claims = sentences
      .filter((s) => FIRST_PERSON.test(s))
      .sort((a, b) => Number(PAST_TENSE.test(b)) - Number(PAST_TENSE.test(a)))
    if (claims.length) worklist.push({ file: `${platform}/${file}`, path, claims })

    const scoped = sentences.filter((s) => !FIRST_PERSON.test(s) && SCOPE_CLAIM.test(s))
    if (scoped.length) scopelist.push({ file: `${platform}/${file}`, path, claims: scoped })
  }
}

if (worklist.length) {
  console.log('\nFIRST-PERSON CLAIMS — verify each against its source by reading.')
  console.log('For each one, find the sentence in the source that attributes it to Nino')
  console.log('SPECIFICALLY — not one that supports the idea, one that assigns it to him.')
  console.log('If the source states it generally, the caption must state it generally.')
  console.log('Past-tense claims sort first; they are likelier, not the only risk.\n')
  for (const { file, path, claims } of worklist) {
    console.log(`  ${file}\n  source: ${path}`)
    for (const c of claims) console.log(`    ${PAST_TENSE.test(c) ? '!' : '·'} ${c}`)
    console.log()
  }
}

if (scopelist.length) {
  console.log('\nSCOPE CLAIMS — claims about the reader, or about people in general.')
  console.log('Same test, other direction: find the source sentence that makes this claim')
  console.log('about PEOPLE. If the source only says it about Nino\'s own system, the')
  console.log('caption must say it about his system. A reader who does the thing you said')
  console.log('nobody does will answer the premise instead of the idea.\n')
  for (const { file, path, claims } of scopelist) {
    console.log(`  ${file}\n  source: ${path}`)
    for (const c of claims) console.log(`    ? ${c}`)
    console.log()
  }
}

// Repetition is mechanically decidable, so unlike the two reading worklists it
// gets a verdict rather than a printout to review.
const echoes = []
const names = [...grams.keys()]
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const shared = [...grams.get(names[i])].filter((g) => grams.get(names[j]).has(g))
    if (shared.length) echoes.push({ a: names[i], b: names[j], shared })
  }
}
if (echoes.length) {
  console.log('\nREPEATED PHRASING — these captions share a five-word run.')
  console.log('Rewrite from the source, not from the other caption. Rearranging the')
  console.log('sentences of an existing caption is how the runs survive a rewrite.\n')
  for (const { a, b, shared } of echoes) {
    console.log(`  ${a}\n  ${b}\n    ${shared.length} shared run(s), first: "${shared[0]}"\n`)
  }
}

console.log(
  `${total} caption(s) across ${PLATFORMS.join(', ') || 'no platforms'}: ${unverified} with unverified figures, ${missing} with no source, ` +
    `${worklist.reduce((n, w) => n + w.claims.length, 0)} first-person claim(s) and ` +
    `${scopelist.reduce((n, w) => n + w.claims.length, 0)} scope claim(s) needing a read, ` +
    `${echoes.length} repeated-phrasing pair(s).`
)

process.exit(missing ? 2 : unverified ? 1 : echoes.length ? 3 : 0)
