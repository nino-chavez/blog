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
// Two classes, checked differently:
//   NUMBERS       — mechanizable. Every figure in a caption must appear in its
//                   source. Fails the build.
//   EXPERIENTIAL  — not mechanizable. First-person claims about what the author
//                   did, believed, or observed cannot be verified by matching;
//                   they require reading. This prints them with the source path
//                   so the reading has a worklist and cannot be skipped silently.
//
// Usage:
//   node syndication/check-captions.mjs            # all captions
//   node syndication/check-captions.mjs <slug>     # one, by caption filename fragment
//
// Exit codes: 0 clean, 1 unverified figures, 2 missing source.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const HERE = dirname(fileURLToPath(import.meta.url))
const CAPTIONS = join(HERE, 'captions', 'linkedin')
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

// A claim is experiential when it is first-person AND asserts something happened.
// Present-tense opinion ("I think X is wrong") is argument, not a factual claim
// about the author's history, and does not need source backing.
const FIRST_PERSON = /\b(I|I'd|I've|I'm|my|me)\b/i
const PAST_ASSERTION =
  /\b(was|were|had|did|didn't|got|built|ran|wrote|asked|installed|pointed|found|kept|spent|skipped|been|assumed|guessed|logged|typed|measured|watched|noticed|tried|used to)\b/i

let unverified = 0
let missing = 0
const worklist = []

for (const file of readdirSync(CAPTIONS).filter((f) => f.endsWith('.md')).sort()) {
  if (filter && !file.includes(filter)) continue
  const caption = readFileSync(join(CAPTIONS, file), 'utf8').replace(/https?:\/\/\S+/g, '')
  const { path, text } = sourceFor(file)

  if (text === null) {
    console.log(`✗ ${file}\n    no source at ${path}`)
    missing++
    continue
  }

  const inSource = figures(text)
  const bad = [...figures(caption)].filter((n) => !inSource.has(n))
  if (bad.length) {
    console.log(`✗ ${file}\n    figures absent from source: ${bad.join(', ')}\n    source: ${path}`)
    unverified++
  }

  const claims = caption
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s && FIRST_PERSON.test(s) && PAST_ASSERTION.test(s))
  if (claims.length) worklist.push({ file, path, claims })
}

if (worklist.length) {
  console.log('\nEXPERIENTIAL CLAIMS — verify each against its source by reading.')
  console.log('No matcher can do this. Absence of a figure is why the 8/4 caption shipped wrong.\n')
  for (const { file, path, claims } of worklist) {
    console.log(`  ${file}\n  source: ${path}`)
    for (const c of claims) console.log(`    · ${c}`)
    console.log()
  }
}

const total = readdirSync(CAPTIONS).filter((f) => f.endsWith('.md')).length
console.log(
  `${total} caption(s): ${unverified} with unverified figures, ${missing} with no source, ` +
    `${worklist.reduce((n, w) => n + w.claims.length, 0)} experiential claim(s) needing a read.`
)

process.exit(missing ? 2 : unverified ? 1 : 0)
