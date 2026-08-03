#!/usr/bin/env node
// Cross-post queued pieces to dev.to, canonical URL pointing at the blog, and
// record the result in queue.json.
//
//   node syndication/post-devto.mjs --dry          # show what is due, post nothing
//   node syndication/post-devto.mjs --dry --all    # ignore the schedule, show everything queued
//   node syndication/post-devto.mjs                # post everything due today or earlier
//   node syndication/post-devto.mjs --limit 1      # post the next one only
//   node syndication/post-devto.mjs --draft        # create unpublished, review on dev.to first
//
// The API key lives in 1Password and is read at run time; nothing here takes it
// as an argument or writes it anywhere.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', 'astro-build', 'src', 'content')
const QUEUE = join(HERE, 'queue.json')
const OP_REF = 'op://Developer Secrets/dev.to blog/credential'

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f, d) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : d)
const dry = has('--dry')
const all = has('--all')
const draft = has('--draft')
const limit = Number(val('--limit', Infinity))

// ------------------------------------------------------------- MDX → markdown

// The tutorials are MDX: they import three wrapper components and use them
// around ordinary markdown. Pasted raw, dev.to renders the tags as literal text
// and the imports as a code-looking preamble — so this maps them rather than
// stripping them, because the props carry real content (an exercise's number,
// title and duration are the heading a reader needs).
//
// Anything else importing or using an unmapped component is refused rather than
// mangled; a half-converted article on someone else's platform is worse than
// one that did not go out.
const MAPPERS = {
  Exercise: (p) =>
    `## Exercise${p.number ? ' ' + p.number : ''}${p.title ? ': ' + p.title : ''}` +
    (p.duration ? `\n\n*${p.duration}*` : ''),
  Checkpoint: () => `### Checkpoint`,
  Template: (p) => `### ${p.title ?? 'Template'}` + (p.description ? `\n\n*${p.description}*` : ''),
}

function props(attrs) {
  const out = {}
  // Handles title="x" and number={1}; both are all these components use.
  for (const m of attrs.matchAll(/(\w+)=(?:"([^"]*)"|\{([^}]*)\})/g)) {
    out[m[1]] = (m[2] ?? m[3]).trim()
  }
  return out
}

const SITE = 'https://ninochavez.co'

function toMarkdown(body, slug) {
  let out = body

  // Site-relative links resolve against dev.to once the article is over there,
  // so every one of them would 404 on someone else's domain. Eleven of these
  // sit across the seven tutorials. Rewritten to absolute rather than removed,
  // because they are the piece pointing at its own companions.
  out = out.replace(/(\]\()(\/[^)\s]*)/g, (_, open, path) => open + SITE + path)

  // Imports of the mapped components are noise once the tags are gone. An
  // import of anything else means the piece uses something this does not
  // understand, and that is a refusal below, not a silent drop.
  out = out.replace(/^import\s+\{[^}]*\}\s+from\s+'@\/components\/tutorials\/[^']*';?\s*$/gm, '')

  for (const [name, render] of Object.entries(MAPPERS)) {
    out = out.replace(new RegExp(`<${name}\\b([^>]*?)/>`, 'g'), (_, a) => render(props(a)))
    out = out.replace(new RegExp(`<${name}\\b([^>]*?)>`, 'g'), (_, a) => render(props(a)))
    out = out.replace(new RegExp(`</${name}>`, 'g'), '')
  }

  // Fenced code blocks legitimately contain angle brackets, heredoc markers and
  // JSX-looking text. Check only outside them, or a shell heredoc terminator
  // (<EOF) reads as an unknown component and blocks a clean article.
  const outsideFences = out.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  const leftover = [...outsideFences.matchAll(/<([A-Z][A-Za-z]*)\b/g)].map((m) => m[1])
  const unknown = [...new Set(leftover)].filter((n) => !(n in MAPPERS))
  if (unknown.length) throw new Error(`${slug}: unmapped MDX component(s) <${unknown.join('>, <')}>`)
  if (/^import\s/m.test(outsideFences)) throw new Error(`${slug}: unhandled import statement`)

  return out.replace(/\n{3,}/g, '\n\n').trim()
}

// Frontmatter writes tags two ways in this repo — inline (`tags: ["a", "b"]`) in
// the tutorials, block list (`tags:\n  - a`) in the essays. Reading only the
// block form silently produced zero tags on every tutorial, and on dev.to a post
// with no tags is a post nobody finds.
function readTags(fm) {
  const inline = /^tags:\s*\[([^\]]*)\]/m.exec(fm)
  if (inline) return [...inline[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1])
  const block = /^tags:\s*\n((?:\s*-\s*.+\n?)+)/m.exec(fm)
  if (block) return [...block[1].matchAll(/^\s*-\s*["']?([^"'\n]+?)["']?\s*$/gm)].map((m) => m[1])
  return []
}

// dev.to tags are alphanumeric only — a hyphenated `agentic-systems` is
// rejected by the API rather than cleaned, and four is the maximum it accepts.
// Sanitising alone leaves tags nobody browses (`agenticsystems`), so the few
// that have an obvious dev.to equivalent are mapped. Edit this map rather than
// hand-editing tags into a post; it is the only place the taxonomy lives.
const TAG_ALIASES = {
  'agentic-systems': 'ai',
  'ai-workflows': 'ai',
  'ai-development': 'ai',
  engineering: 'programming',
  craft: 'programming',
  meta: null, // no dev.to audience; drop rather than post a dead tag
}

const devtoTags = (tags) => {
  const mapped = (tags || []).map((t) => {
    const k = t.toLowerCase()
    return k in TAG_ALIASES ? TAG_ALIASES[k] : k
  })
  return [...new Set(mapped.filter(Boolean).map((t) => t.replace(/[^a-z0-9]/gi, '').toLowerCase()))]
    .filter((t) => t.length > 1 && t.length <= 30)
    .slice(0, 4)
}

// ---------------------------------------------------------------------- source

function readSource(id) {
  const [collection, slug] = id.split('/')
  const file = join(CONTENT, collection, `${slug}.mdx`)
  if (!existsSync(file)) throw new Error(`${id}: no source file at ${file}`)
  const text = readFileSync(file, 'utf8')
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text)
  if (!m) throw new Error(`${id}: no frontmatter`)
  const [, fm, body] = m
  const get = (k) => {
    const v = new RegExp(`^${k}:\\s*"?([^"\\n]*)"?`, 'm').exec(fm)
    return v ? v[1].trim() : ''
  }
  return {
    title: get('title'),
    excerpt: get('excerpt'),
    tags: readTags(fm),
    body: toMarkdown(body, id),
  }
}

// ------------------------------------------------------------------------- run

const queue = JSON.parse(readFileSync(QUEUE, 'utf8'))

// --show prints exactly what would be sent, through the same toMarkdown() the
// publisher uses. Re-implementing the conversion in a throwaway script to
// "check" it proves the throwaway works, not the publisher.
if (has('--show')) {
  const want = val('--show', '')
  const targets = queue.items.filter(
    (i) => i.routes.devto?.mode === 'canonical' && (!want || i.id.includes(want))
  )
  for (const item of targets) {
    let src
    try {
      src = readSource(item.id)
    } catch (e) {
      console.log(`### ${item.id}\n  REFUSED: ${e.message}\n`)
      continue
    }
    // Mechanical checks beat eyeballing 3,500 words: anything the conversion
    // was supposed to remove, found in the output, is a bug.
    const outside = src.body.replace(/```[\s\S]*?```/g, '')
    const bad = {
      'stray JSX': [...outside.matchAll(/<[A-Z][A-Za-z]*/g)].length,
      'relative links': [...src.body.matchAll(/\]\(\/[^)]*\)/g)].length,
      'import lines': [...outside.matchAll(/^import\s/gm)].length,
    }
    const flags = Object.entries(bad).filter(([, n]) => n > 0)
    console.log(
      `### ${item.id}  (${src.body.split(/\s+/).length}w, tags: ${devtoTags(src.tags).join(',')})`
    )
    console.log(flags.length ? `  PROBLEMS: ${flags.map(([k, n]) => `${k}=${n}`).join(' ')}` : '  clean')
    if (want) console.log('\n' + src.body + '\n')
  }
  process.exit(0)
}

const key = execFileSync('op', ['read', OP_REF], { encoding: 'utf8' }).trim()
if (!key) throw new Error(`no dev.to key at ${OP_REF}`)

// Publishing a draft happens on dev.to, not here, so without this the ledger
// keeps saying `draft` for something that has been live for weeks — and the
// slug changes on publish, so the stored edit URL goes stale too. Keyed on
// articleId rather than slug for exactly that reason.
if (has('--sync')) {
  const drafts = queue.items.filter((i) => i.routes.devto?.state === 'draft')
  if (!drafts.length) {
    console.log('no dev.to drafts to sync')
    process.exit(0)
  }
  // Authority is /me/published — an explicit list of what is live, matched by
  // id. Asking /articles/{id} and testing `a.published` reads FALSE on a
  // published article: that endpoint omits the field entirely and reports
  // status through `published_at`. It called a live post a draft on the first
  // run. A list you can match against cannot be misread the same way.
  const live = new Map()
  for (let page = 1; page <= 20; page += 1) {
    const res = await fetch(
      `https://dev.to/api/articles/me/published?page=${page}&per_page=100`,
      { headers: { 'api-key': key } }
    )
    if (!res.ok) throw new Error(`dev.to /me/published: HTTP ${res.status}`)
    const batch = await res.json()
    for (const a of batch) live.set(a.id, a)
    if (batch.length < 100) break
  }

  let changed = 0
  for (const item of drafts) {
    const id = item.routes.devto.articleId
    if (!id) {
      console.log(`  ${item.id}: no articleId recorded, cannot sync`)
      continue
    }
    const a = live.get(id)
    if (!a) {
      console.log(`  ${item.id}: still a draft`)
      continue
    }
    item.routes.devto.state = 'posted'
    item.routes.devto.postedAt = (a.published_at ?? '').slice(0, 10) || today
    item.routes.devto.url = a.url
    changed += 1
    console.log(`  ${item.id}: published -> ${a.url}`)
  }
  if (changed) {
    writeFileSync(QUEUE, JSON.stringify(queue, null, 1) + '\n')
    console.log(`\nrecorded ${changed} as posted`)
  }
  process.exit(0)
}
const today = new Date().toISOString().slice(0, 10)

const due = queue.items
  .filter((i) => i.routes.devto?.state === 'eligible')
  .filter((i) => all || (i.routes.devto.scheduledFor ?? '9999') <= today)
  .sort((a, b) => (a.routes.devto.scheduledFor ?? '').localeCompare(b.routes.devto.scheduledFor ?? ''))
  .slice(0, limit)

if (!due.length) {
  const next = queue.items
    .filter((i) => i.routes.devto?.state === 'eligible')
    .map((i) => i.routes.devto.scheduledFor)
    .sort()[0]
  console.log(`nothing due for dev.to today${next ? ` — next is ${next}` : ''}`)
  process.exit(0)
}

let posted = 0
for (const item of due) {
  let src
  try {
    src = readSource(item.id)
  } catch (e) {
    console.error(`  SKIP ${item.id}: ${e.message}`)
    continue
  }
  // The canonical is the whole point of cross-posting here: it tells search
  // engines the blog is the original. Pointing it at a 404 is worse than
  // sending none, and three URLs in the queue are already dead from slug drift.
  // One request before publishing is cheap insurance against a permanent
  // mistake on someone else's platform.
  const head = await fetch(item.url, { method: 'GET', redirect: 'follow' }).catch(() => null)
  if (!head || !head.ok) {
    console.error(`  SKIP ${item.id}: canonical ${item.url} -> ${head ? head.status : 'unreachable'}`)
    continue
  }

  const tags = devtoTags(src.tags)
  console.log(`${dry ? 'would post' : 'posting'}  ${item.id}`)
  console.log(`   title     ${src.title}`)
  console.log(`   canonical ${item.url}`)
  console.log(`   tags      ${tags.join(', ') || '(none)'}`)
  console.log(`   body      ${src.body.split(/\s+/).length} words${draft ? '  [draft]' : ''}`)
  if (dry) continue

  const res = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      article: {
        title: src.title,
        body_markdown: src.body,
        published: !draft,
        canonical_url: item.url,
        description: src.excerpt.slice(0, 250),
        tags,
      },
    }),
  })
  const out = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error(`   FAILED ${res.status}: ${out.error ?? JSON.stringify(out).slice(0, 200)}`)
    continue
  }
  // A draft is not published, so it must not be recorded as posted — otherwise
  // regeneration treats it as done and it sits unpublished on dev.to forever.
  //
  // The URL dev.to returns for a draft is a `temp-slug-<n>` placeholder and it
  // 404s: an unpublished article has no public page. Only `<url>/edit` opens,
  // and only for the signed-in author. Recording the raw url therefore hands
  // back a dead link — so drafts record the edit URL, and `articleId` is kept
  // as the durable key because the slug changes when the piece is published.
  item.routes.devto.state = draft ? 'draft' : 'posted'
  item.routes.devto.postedAt = draft ? null : today
  item.routes.devto.articleId = out.id ?? null
  item.routes.devto.url = draft ? `${out.url}/edit` : (out.url ?? null)
  posted += 1
  console.log(
    `   -> ${item.routes.devto.url}` +
      (draft ? '\n      (draft: only the edit view exists until you publish)' : '')
  )

  // dev.to rate-limits article creation hard; the default is one every 30s and
  // it answers 429, not a queue. Pace rather than retry.
  if (posted < due.length) await new Promise((r) => setTimeout(r, 31_000))
}

if (posted) {
  writeFileSync(QUEUE, JSON.stringify(queue, null, 1) + '\n')
  console.log(`\nrecorded ${posted} in queue.json`)
} else if (!dry) {
  console.log('\nnothing posted; queue.json unchanged')
}
