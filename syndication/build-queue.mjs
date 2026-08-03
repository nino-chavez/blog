#!/usr/bin/env node
// Build the syndication queue: which pieces go to which platform, in what order,
// on what date. Reads the content collections directly, so the queue reflects
// what is actually published rather than a list maintained by hand.
//
//   node syndication/build-queue.mjs            # rewrite queue.json
//   node syndication/build-queue.mjs --report   # print the tallies, write nothing
//   node syndication/build-queue.mjs --refresh  # re-pull the Substack archive first
//
// Re-running preserves every `posted` mark and reschedules only the unposted
// tail. That is the point: the ledger is the memory, and new writing joins the
// drip without disturbing what already went out.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const BLOG = join(HERE, '..', 'astro-build', 'src', 'content')
const DEMOS = join(HERE, '..', '..', 'nc-demos')
const QUEUE = join(HERE, 'queue.json')
const SITE = 'https://ninochavez.co'

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f, d) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : d)
const report = has('--report')
const refresh = has('--refresh')

// ---------------------------------------------------------------- read content

// Deliberately a line scanner, not a YAML parser. The frontmatter here is flat
// except for `series` and `tags`, both of which we only need shallowly, and a
// dependency-free script can run from any of these repos without an install.
function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text)
  if (!m) return null
  const [, fm, body] = m
  const get = (k) => {
    const v = new RegExp(`^${k}:\\s*"?([^"\\n]*)"?`, 'm').exec(fm)
    return v ? v[1].trim() : ''
  }
  // `companionOf` names the piece this one was written alongside — a tutorial
  // and the essay it teaches, a whitepaper and the post that provoked it. It is
  // a nested key, so it needs its own read rather than the flat `get`.
  const companion = /^companionOf:\s*\n(?:\s+\w+:.*\n)*?\s+slug:\s*"?([^"\n]+)"?/m.exec(fm)

  return {
    title: get('title'),
    date: get('publishedAt').slice(0, 10),
    category: get('category'),
    status: get('status') || 'published', // schema default, content.config.ts
    featured: get('featured') === 'true',
    origin: get('source'), // "linkedin" on the 34 imported from Pulse
    inSeries: /^series:/m.test(fm),
    companionOf: companion ? companion[1].trim() : '',
    words: body.trim().split(/\s+/).length,
  }
}

function readCollection(name) {
  const dir = join(BLOG, name)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const fm = frontmatter(readFileSync(join(dir, f), 'utf8'))
      if (!fm) return null
      const slug = f.replace(/\.mdx$/, '')
      // Every collection lives UNDER /blog/, including the non-blog ones —
      // /blog/whitepapers/<slug>, not /whitepapers/<slug>. Guessed the other
      // way first and every non-blog URL 404'd. That is not cosmetic: a
      // canonical_url pointing at a 404 is worse for search than sending none,
      // and it is the reason the dev.to route exists at all. Checked live
      // against the site for each collection.
      const path = name === 'blog' ? `/blog/${slug}` : `/blog/${name}/${slug}`
      return { ...fm, collection: name, slug, url: SITE + path }
    })
    .filter(Boolean)
}

// Demos carry `date` at month precision ("2026-07") and order by `number`;
// applied companions carry no date at all. Both are evergreen technique pieces,
// so an exact date buys nothing — what matters is the running order, which
// `number` gives for demos and the demo link gives for companions.
function readDemos() {
  const out = []
  for (const kind of ['demos', 'applied']) {
    const dir = join(DEMOS, kind)
    if (!existsSync(dir)) continue
    for (const slug of readdirSync(dir)) {
      const meta = join(dir, slug, 'meta.json')
      if (!existsSync(meta)) continue
      let m = {}
      try {
        m = JSON.parse(readFileSync(meta, 'utf8'))
      } catch {
        continue
      }
      const month = /^\d{4}-\d{2}$/.test(m.date || '') ? `${m.date}-01` : ''
      out.push({
        collection: kind,
        slug,
        title: m.title || slug,
        date: month,
        // `hook` / `for` / `get` / `do` on a demo, `description` on a companion:
        // the copy each piece already uses to sell itself. Carried through so
        // caption drafting starts from Nino's words rather than a fresh summary.
        pitch: m.hook || m.description || m.cardDesc || '',
        number: m.number || '',
        // An applied companion names the demo it was distilled from; that demo
        // is the same subject, so the two must not land in the same week.
        companionOf: (m.relatedSessionSlugs || [])[0] || '',
        words: 0,
        status: 'published',
        featured: false,
        origin: '',
        inSeries: false,
        category: 'Demo',
        url: `${SITE}/demos/${kind === 'applied' ? 'applied/' : ''}${slug}`,
      })
    }
  }
  return out
}

// -------------------------------------------------------------- what is posted

// Substack history is knowable: the archive API lists every post, and titles
// match the blog because they were syndicated from it. Cached to
// substack-archive.json so the normal run works offline.
//
// The cache is a backstop, not the record. Entries already marked `posted`
// survive regeneration, so a stale snapshot can only mis-queue something posted
// to Substack *since* the last refresh — which is exactly what happens if this
// only ever gets fetched by hand. Hence `--refresh`, in the repo rather than in
// somebody's shell history.
//
// It has to run through the logged-in browser, and that is not incidental. The
// PUBLIC archive endpoint (/api/v1/archive) omits bulk-imported posts entirely:
// it reported 23 posts against a real 191, because a prior RSS import brought
// the 2025 back catalogue in and none of it shows there. Building the queue on
// the public number re-queued ~130 essays that were already live on Substack.
// The authenticated dashboard endpoint is the only one that tells the truth, so
// this drives the box rather than fetching directly.
async function refreshSubstack() {
  const port = process.env.BROWSE_PORT || '9400'
  const js = `
    const out = [];
    for (let o = 0; o < 2000; o += 50) {
      const r = await fetch(\`/api/v1/post_management/published?offset=\${o}&limit=50&order_by=post_date&order_direction=desc\`, { credentials: 'include' });
      if (!r.ok) return JSON.stringify({ error: 'HTTP ' + r.status });
      const j = await r.json();
      if (!j.posts || !j.posts.length) break;
      for (const p of j.posts) out.push({ slug: p.slug, title: p.title, date: (p.post_date || '').slice(0, 10) });
      if (j.posts.length < 50) break;
    }
    return JSON.stringify(out);`

  const run = (args, input) =>
    execFileSync(args[0], args.slice(1), {
      input,
      encoding: 'utf8',
      env: { ...process.env, BROWSE_PORT: port },
    })

  try {
    run(['browse-nav', 'https://signaldispatch.substack.com/publish/posts'])
  } catch {
    throw new Error(
      `could not reach a browser on BROWSE_PORT=${port}.\n` +
        `  browser-box start --profile social      # then sign into Substack in the viewer`
    )
  }
  const raw = run(['browse-eval', '--stdin'], js).trim()
  const list = JSON.parse(raw.startsWith('"') ? JSON.parse(raw) : raw)
  if (list.error) throw new Error(`substack dashboard: ${list.error} (still signed in?)`)
  list.sort((a, b) => a.date.localeCompare(b.date))
  writeFileSync(join(HERE, 'substack-archive.json'), JSON.stringify(list, null, 1) + '\n')
  console.log(`refreshed substack-archive.json (${list.length} posts, latest ${list.at(-1)?.date})`)
}

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')

function substackPosted() {
  const f = join(HERE, 'substack-archive.json')
  if (!existsSync(f)) return new Set()
  return new Set(JSON.parse(readFileSync(f, 'utf8')).map((p) => norm(p.title)))
}

// LinkedIn history was recorded as unrecoverable at first, and that was wrong.
// `source: linkedin` only marks the 34 articles imported FROM Pulse; it says
// nothing about blog posts SHARED to LinkedIn as links. Those are readable:
// each share renders a preview card whose title is the linked page's title.
// Harvested from the activity feed into linkedin-shares.json — see the README
// for the procedure, which is not a simple scroll.
function linkedinShared() {
  const f = join(HERE, 'linkedin-shares.json')
  if (!existsSync(f)) return new Set()
  return new Set(JSON.parse(readFileSync(f, 'utf8')).map((p) => norm(p.title)))
}

// ------------------------------------------------------------------- routing

// Three tiers, assigned mechanically. Tier is a running order, not a quality
// score: it decides what drips first, and Nino overrides any entry by editing
// queue.json — a manual `tier` or `state` survives regeneration.
//
// The rules encode one judgment: length and form decide the platform. Long
// argument reads as an essay and belongs where people sit down (Substack).
// Short argument reads as a post and belongs in a feed (LinkedIn). A technique
// with steps belongs where practitioners search for it (dev.to, canonical
// pointing home so the blog keeps the SEO).
// A backlog is not automatically a queue. Routing every published piece put 261
// items in front of LinkedIn — two and a half years at a sustainable cadence,
// which means the tail never ships and the head competes with whatever Nino
// writes next. So essays age out: commentary written against a moment stops
// being worth a reader's time long before it stops being worth hosting. The
// blog stays the archive; syndication carries what still earns attention.
//
// An essay past the horizon still goes out if it was flagged `featured` or runs
// long enough to be an argument rather than a note. Everything outside the
// `blog` collection is exempt — a whitepaper, tutorial, demo, or piece of
// fiction is evergreen by form, not by date.
const HORIZON_MONTHS = 12

function agedOut(p, now) {
  if (p.collection !== 'blog') return false
  if (!p.date) return false
  if (p.featured || p.words >= 1500) return false
  const cut = new Date(now)
  cut.setUTCMonth(cut.getUTCMonth() - HORIZON_MONTHS)
  return p.date < cut.toISOString().slice(0, 10)
}

function route(p, now) {
  const c = p.collection
  const long = p.words >= 1500
  const mid = p.words >= 800 && p.words < 1500

  if (agedOut(p, now)) {
    const reason = `older than ${HORIZON_MONTHS} months and not featured — archive, not drip`
    return {
      tier: 3,
      routes: {
        substack: { mode: 'skip', reason },
        linkedin: { mode: 'skip', reason },
        devto: { mode: 'skip', reason },
      },
    }
  }

  const r = {
    substack: { mode: 'skip', reason: '' },
    linkedin: { mode: 'skip', reason: '' },
    devto: { mode: 'skip', reason: '' },
  }

  if (c === 'series' || c === 'research-notes') {
    // Series entries are index pages; the research note is evidence other
    // pieces cite. Neither is a thing to hand a reader cold.
    r.substack.reason = r.linkedin.reason = r.devto.reason = 'not standalone reader content'
    return { routes: r, tier: 3 }
  }

  if (c === 'fiction') {
    // Serialized run reads on Substack. On LinkedIn the register is wrong and
    // the audience did not come for it.
    r.substack.mode = 'full'
    r.linkedin.reason = 'wrong register for a professional feed'
    return { routes: r, tier: 2 }
  }

  if (c === 'presentations') {
    // MDX decks, not prose. There is nothing to paste into a newsletter.
    r.substack.reason = 'deck, not prose'
    r.linkedin.mode = 'link'
    return { routes: r, tier: 2 }
  }

  if (c === 'demos') {
    // A demo is a rendered session — deck.html plus images and excerpts, not
    // markdown. There is no body to paste into an issue, so Substack gets a
    // short framing note and the link, and the demo stays where it renders.
    r.substack.mode = 'link'
    r.linkedin.mode = 'native'
    return { routes: r, tier: 1 }
  }

  if (c === 'applied') {
    // Routed to dev.to at first, wrongly: an applied companion is a deck.html
    // and a meta.json, with no markdown body anywhere. There is no article to
    // cross-post. It still works as a LinkedIn post because the technique fits
    // in one, written from meta.json's own description.
    r.linkedin.mode = 'native'
    r.devto.reason = 'no markdown body — rendered deck, nothing to cross-post'
    r.substack.reason = 'companion piece; the demo carries the story'
    return { routes: r, tier: 1 }
  }

  if (c === 'tutorials') {
    r.substack.mode = 'full'
    r.linkedin.mode = 'teaser'
    r.devto.mode = 'canonical'
    return { routes: r, tier: 1 }
  }

  if (c === 'whitepapers' || c === 'counterpoints') {
    r.substack.mode = 'full'
    r.linkedin.mode = 'teaser'
    return { routes: r, tier: c === 'whitepapers' ? 1 : 2 }
  }

  // Essays.
  if (long) {
    r.substack.mode = 'full'
    r.linkedin.mode = 'teaser'
  } else if (mid) {
    r.substack.mode = 'full'
    r.linkedin.mode = 'native'
  } else {
    // Under 800 words is a post, not an issue. Sending these to Substack one at
    // a time trains subscribers that the newsletter is thin.
    r.substack.reason = 'too short to carry an issue alone'
    r.linkedin.mode = 'native'
  }

  const tier = p.featured ? 1 : long || mid ? 2 : 3
  return { routes: r, tier }
}

// Every route decision runs through here, so the one rule that cannot be got
// wrong is enforced in one place rather than per branch. All 34 imported Pulse
// articles happen to sit in `blog` today; guarding only the essay branch would
// hold now and fail silently the first time one lands in another collection.
function routeWithGuards(p, now) {
  const out = route(p, now)
  if (p.origin === 'linkedin') {
    out.routes.linkedin = { mode: 'skip', reason: 'originated on LinkedIn' }
  }
  return out
}

// ------------------------------------------------------------------ scheduling

// Cadence, one slot per platform-day. Two LinkedIn slots a week is the most a
// personal feed absorbs without the account reading as automated; Substack is
// weekly because an inbox punishes more; dev.to is a slow backfill.
const CADENCE = {
  linkedin: { days: [2, 4], every: 1 }, // Tue, Thu
  substack: { days: [0], every: 1 }, // Sun
  devto: { days: [3], every: 2 }, // Wed, fortnightly
}

function slots(platform, count, from) {
  const { days, every } = CADENCE[platform]
  const out = []
  const d = new Date(from)
  d.setUTCHours(12, 0, 0, 0)
  let week = 0
  let lastWeekKey = null
  while (out.length < count) {
    d.setUTCDate(d.getUTCDate() + 1)
    if (!days.includes(d.getUTCDay())) continue
    const key = `${d.getUTCFullYear()}-${Math.floor(d.getTime() / 6048e5)}`
    if (key !== lastWeekKey) {
      lastWeekKey = key
      week += 1
    }
    if (every > 1 && week % every !== 0) continue
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

// ----------------------------------------------------------------------- build

if (refresh) {
  // A stack trace here would bury the one line that says what to do about it.
  try {
    await refreshSubstack()
  } catch (e) {
    console.error(`refresh failed: ${e.message}`)
    process.exit(1)
  }
}

const collections = [
  ...readCollection('blog'),
  ...readCollection('whitepapers'),
  ...readCollection('tutorials'),
  ...readCollection('counterpoints'),
  ...readCollection('fiction'),
  ...readCollection('presentations'),
  ...readCollection('series'),
  ...readCollection('research-notes'),
  ...readDemos(),
].filter((p) => p.status === 'published')

// Clusters are computed across every collection at once, because the links that
// define a subject cross collection boundaries by nature.
const clusterOf = buildClusters(collections)
const pieces = collections.map((p) => ({ ...p, cluster: clusterOf(p) }))

const onSubstack = substackPosted()
const onLinkedIn = linkedinShared()

const prior = existsSync(QUEUE) ? JSON.parse(readFileSync(QUEUE, 'utf8')) : { items: [] }
const priorById = new Map((prior.items || []).map((i) => [i.id, i]))

const today = new Date().toISOString().slice(0, 10)

const items = pieces.map((p) => {
  const id = `${p.collection}/${p.slug}`
  const { routes, tier } = routeWithGuards(p, today)
  const was = priorById.get(id)
  const out = {
    id,
    title: p.title,
    url: p.url,
    publishedAt: p.date,
    collection: p.collection,
    words: p.words,
    ...(p.pitch ? { pitch: p.pitch } : {}),
    cluster: p.cluster,
    tier: was?.tier ?? tier,
    routes: {},
  }
  for (const [platform, r] of Object.entries(routes)) {
    const prev = was?.routes?.[platform]
    // A recorded post is never recomputed away, and a hand-set state wins over
    // the rule that produced it. Everything else re-derives.
    //
    // `draft` is in this list for a specific reason: a piece pushed to a
    // platform as an unpublished draft already EXISTS there. Letting it fall
    // back to `eligible` would queue it again and create a duplicate on the
    // next run — the failure is invisible until two copies are live.
    if (prev?.state === 'posted' || prev?.state === 'skip-manual' || prev?.state === 'draft') {
      out.routes[platform] = prev
      continue
    }
    let state = r.mode === 'skip' ? 'skip' : 'eligible'
    let postedAt = null
    if (platform === 'substack' && onSubstack.has(norm(p.title))) {
      state = 'posted'
      postedAt = 'archive'
    }
    if (platform === 'linkedin' && onLinkedIn.has(norm(p.title))) {
      state = 'posted'
      postedAt = 'share-history'
    }
    // Captions are files on disk, not queue fields: they are prose, they get
    // edited, and queue.json is regenerated on every run. Recording the path
    // keeps the ledger an index and leaves the writing reviewable in a diff.
    const rel = `captions/${platform}/${id.replace('/', '--')}.md`

    out.routes[platform] = {
      mode: r.mode,
      state,
      ...(r.reason ? { reason: r.reason } : {}),
      ...(existsSync(join(HERE, rel)) ? { caption: rel } : {}),
      postedAt,
      scheduledFor: null,
      url: prev?.url ?? null,
    }
  }
  return out
})

// Order the drip: tier first, then newest — a 2025 essay is not the thing to
// open with when there is 2026 material that says the same idea better. Undated
// pieces (the applied companions) sort last within their tier rather than first,
// which an empty string would otherwise do.
const order = (a, b) =>
  a.tier - b.tier || (b.publishedAt || '0000').localeCompare(a.publishedAt || '0000')

// Interleave by collection inside each tier. Straight tier-then-date ordering
// put twelve demos in consecutive slots — six weeks of one format, which reads
// as a bot emptying a folder. Round-robin keeps the run order intact within a
// collection while varying what a reader sees week to week.
function interleave(list) {
  const byTier = new Map()
  for (const i of list) {
    if (!byTier.has(i.tier)) byTier.set(i.tier, new Map())
    const buckets = byTier.get(i.tier)
    if (!buckets.has(i.collection)) buckets.set(i.collection, [])
    buckets.get(i.collection).push(i)
  }
  const out = []
  for (const tier of [...byTier.keys()].sort((a, b) => a - b)) {
    // Largest bucket first so the long collections spread evenly rather than
    // bunching at the tail once the short ones are exhausted.
    const buckets = [...byTier.get(tier).values()].sort((a, b) => b.length - a.length)
    while (buckets.some((b) => b.length)) {
      for (const b of buckets) if (b.length) out.push(b.shift())
    }
  }
  return out
}

// Interleaving by collection is not enough. A demo, its applied companion, and
// the tutorial that teaches the same technique are three different collections
// and one subject — the first schedule put all three inside eight days, which
// reads to a follower as saying the same thing three times.
//
// "Same subject" needs a union rather than a single key, because the links run
// through different fields and do not all point at the same node: the tutorial
// names a blog post via `companionOf`, the applied companion names a demo via
// `relatedSessionSlugs`, and the demo shares only its TITLE with that blog post.
// Keying on `companionOf || slug` left the demo and its own tutorial in
// different clusters and two days apart. Union-find over both edge types —
// declared companion, and identical title — collapses the whole family.
function buildClusters(list) {
  const parent = new Map()
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)))
      x = parent.get(x)
    }
    return x
  }
  const add = (x) => (parent.has(x) ? null : parent.set(x, x))
  const union = (a, b) => {
    add(a)
    add(b)
    const [ra, rb] = [find(a), find(b)]
    if (ra !== rb) parent.set(ra, rb)
  }

  const byTitle = new Map()
  for (const p of list) {
    add(p.slug)
    if (p.companionOf) union(p.slug, p.companionOf)
    const t = (p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
    if (!t) continue
    if (byTitle.has(t)) union(p.slug, byTitle.get(t))
    else byTitle.set(t, p.slug)
  }
  return (p) => find(p.slug)
}

const SPACING = 4 // slots; at 2/week on LinkedIn, about two weeks apart

function spaceClusters(list) {
  const pending = [...list]
  const out = []
  const lastSeen = new Map()
  while (pending.length) {
    let pick = pending.findIndex(
      (i) => !lastSeen.has(i.cluster) || out.length - lastSeen.get(i.cluster) >= SPACING
    )
    // Everything left is too close to something already placed. Take the head
    // rather than loop forever: a small cluster of near-identical pieces at the
    // tail is better than no schedule.
    if (pick === -1) pick = 0
    const [item] = pending.splice(pick, 1)
    lastSeen.set(item.cluster, out.length)
    out.push(item)
  }
  return out
}

for (const platform of Object.keys(CADENCE)) {
  const queued = spaceClusters(
    interleave(items.filter((i) => i.routes[platform]?.state === 'eligible').sort(order))
  )
  const dates = slots(platform, queued.length, today)
  queued.forEach((i, n) => {
    i.routes[platform].scheduledFor = dates[n]
  })
}

const tally = (fn) => items.reduce((n, i) => n + (fn(i) ? 1 : 0), 0)
const summary = {}
for (const platform of Object.keys(CADENCE)) {
  // Sort by the assigned date, not by `order`. Scheduling runs on the
  // interleaved sequence, so the piece that sorts first is not the piece that
  // goes out first — reading the date off `order`'s head reported a start two
  // weeks late.
  const dates = items
    .filter((i) => i.routes[platform]?.state === 'eligible')
    .map((i) => i.routes[platform].scheduledFor)
    .sort()
  summary[platform] = {
    posted: tally((i) => i.routes[platform]?.state === 'posted'),
    queued: dates.length,
    skipped: tally((i) => i.routes[platform]?.state?.startsWith('skip')),
    firstSlot: dates[0] ?? null,
    lastSlot: dates.at(-1) ?? null,
  }
}

const doc = {
  generatedAt: new Date().toISOString().slice(0, 10),
  // This said "unknown" until the activity feed was actually read. The two
  // things being confused: `source: linkedin` marks the 34 articles imported
  // FROM Pulse, and says nothing about posts SHARED TO LinkedIn as links —
  // which the feed does record, one preview card per share. Harvested rather
  // than assumed; the count below is how many of those matched a queue item.
  linkedinHistory: existsSync(join(HERE, 'linkedin-shares.json'))
    ? `harvested from the activity feed (${onLinkedIn.size} link-shares read)`
    : 'unknown — linkedin-shares.json missing, run the harvest in the README',
  cadence: CADENCE,
  summary,
  items: items.sort(order),
}

// Nothing schedules this. The dates are a plan, so the queue has to be able to
// answer "what do I owe right now" in one command — otherwise it is a file you
// have to remember to open, which is the same as not having it.
if (has('--due')) {
  const horizon = Number(val('--days', 14))
  const until = new Date(today)
  until.setUTCDate(until.getUTCDate() + horizon)
  const cutoff = until.toISOString().slice(0, 10)
  let n = 0
  for (const platform of Object.keys(CADENCE)) {
    const due = items
      .filter((i) => i.routes[platform]?.state === 'eligible')
      .filter((i) => (i.routes[platform].scheduledFor ?? '9999') <= cutoff)
      .sort((a, b) => a.routes[platform].scheduledFor.localeCompare(b.routes[platform].scheduledFor))
    if (!due.length) continue
    console.log(`\n${platform.toUpperCase()}`)
    for (const i of due) {
      const r = i.routes[platform]
      const late = r.scheduledFor < today ? ' OVERDUE' : ''
      // A LinkedIn slot with no caption cannot be posted, and that is the whole
      // bottleneck — flag it here rather than at the moment of posting.
      const needs = platform === 'linkedin' && !r.caption ? '  [needs caption]' : ''
      console.log(`  ${r.scheduledFor}${late}  ${r.mode.padEnd(9)} ${i.title.slice(0, 52)}${needs}`)
      n += 1
    }
  }
  console.log(n ? `\n${n} due within ${horizon} days. Nothing posts on its own.` : `nothing due within ${horizon} days`)
  process.exit(0)
}

if (report) {
  console.log(`pieces published: ${items.length}`)
  for (const [k, v] of Object.entries(summary)) {
    console.log(
      `  ${k.padEnd(9)} posted ${String(v.posted).padStart(3)}  queued ${String(v.queued).padStart(3)}` +
        `  skipped ${String(v.skipped).padStart(3)}  ${v.firstSlot ?? '-'} -> ${v.lastSlot ?? '-'}`
    )
  }
} else {
  writeFileSync(QUEUE, JSON.stringify(doc, null, 1) + '\n')
  console.log(`wrote ${QUEUE} (${items.length} pieces)`)
  for (const [k, v] of Object.entries(summary)) {
    console.log(`  ${k.padEnd(9)} ${v.queued} queued through ${v.lastSlot ?? '-'}`)
  }
}
