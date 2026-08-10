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

  // `series` was previously a bare boolean (`inSeries`) that nothing ever read.
  // The drip needs the slug and the position, because a series has to go out in
  // reading order and the global sort is newest-first. See `order` below.
  const series = /^series:\s*\n(?:\s+\w+:.*\n)*?\s+slug:\s*"?([^"\n]+)"?/m.exec(fm)
  const seriesPos = /^series:\s*\n(?:\s+\w+:.*\n)*?\s+position:\s*(\d+)/m.exec(fm)

  return {
    title: get('title'),
    date: get('publishedAt').slice(0, 10),
    category: get('category'),
    status: get('status') || 'published', // schema default, content.config.ts
    featured: get('featured') === 'true',
    origin: get('source'), // "linkedin" on the 34 imported from Pulse
    series: series ? series[1].trim() : '',
    seriesPos: seriesPos ? Number(seriesPos[1]) : 0,
    companionOf: companion ? companion[1].trim() : '',
    words: body.trim().split(/\s+/).length,
    // Kept as reporting only. Both counts once gated Substack routing, on the
    // premise that `full` meant pasting this source into the editor. The poster
    // lifts the rendered page instead, where tables are rewritten to aligned
    // <pre> and MDX components are already ordinary HTML — so neither count
    // describes anything the poster cannot do. See the routing note in
    // routeWithGuards for the measurements that retired the gate.
    tableRows: (body.match(/^\s*\|/gm) || []).length,
    mdxNodes:
      (body.match(/^import .*from '@\/components/gm) || []).length +
      (body.match(/<(Callout|PullQuote|Figure|Mermaid|Slide|Exercise|Template|Checkpoint)\b/g) || []).length,
    // Components that render to a diagram, image, or deck rather than to text.
    // These are the only ones that genuinely cannot go across: the poster reads
    // innerText, so they lift as empty and the piece silently arrives short.
    nonTextNodes: (body.match(/<(Mermaid|Figure|Slide)\b/g) || []).length,
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
//
// That was the stated intent and it was not implemented: `number` was read here
// and never referenced again, so twelve demos sharing the date "2026-07-01" fell
// through every tiebreak to readdir order and played 4, 12, 8, 9, 2, 11, 3, 5,
// 10, 6, 7, 1 — demo 01 ("Twelve Messages"), the entry point, scheduled last, in
// January 2027. Same defect the series fix caught, second instance.
//
// So a numbered demo run IS a series, and gets the machinery already in the file
// (see `seriesAnchors` below): the run anchors to its newest member's date and
// plays in position order from there, so it lands where newest-first would have
// put it and only the internal order changes. `demos` is not a slug on the site
// — nothing renders it — it is the group key the sort needs.
// `meta.json` carries `date` at month precision ("2026-07"), which every earlier
// version floored to the 1st and then treated as a publication date. It is a
// bucket, not a date, and it was wrong by up to two weeks in one direction only.
// That skew is not cosmetic: it is what sorted eleven demos ahead of essays
// actually written later, and it would have pushed the whole demo run outside a
// 30-day review window that every one of them belongs in.
//
// The real date is the first commit that added the demo's directory. This is the
// only git call outside `refreshSubstack`, and it runs once per demo — 22 short
// invocations, which is cheap at this size and worth the accuracy.
function firstCommitDate(relDir) {
  try {
    const out = execFileSync(
      'git',
      ['-C', DEMOS, 'log', '--diff-filter=A', '--format=%ad', '--date=short', '--', relDir],
      { encoding: 'utf8' }
    )
    // Oldest last: `git log` is newest-first, and the add we want is the first one.
    return out.trim().split('\n').filter(Boolean).at(-1) || ''
  } catch {
    return ''
  }
}

function readDemos() {
  const out = []
  // Demos are read before companions so a companion can inherit its demo's date.
  // It has none of its own, and every date filter in this file therefore dropped
  // all nine of them silently — invisible, because "no date" and "too old" are
  // the same answer to a `>=` against a cutoff. The companion is written from
  // the demo and published alongside it, so the demo's date is the true one.
  const demoDate = new Map()
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
      // Git first, the month bucket only as a fallback for an uncommitted demo.
      const dated = firstCommitDate(`${kind}/${slug}`) || month
      const companionOf = (m.relatedSessionSlugs || [])[0] || ''
      if (kind === 'demos' && dated) demoDate.set(slug, dated)
      out.push({
        collection: kind,
        slug,
        title: m.title || slug,
        date: dated || demoDate.get(companionOf) || '',
        // `hook` / `for` / `get` / `do` on a demo, `description` on a companion:
        // the copy each piece already uses to sell itself. Carried through so
        // caption drafting starts from Nino's words rather than a fresh summary.
        pitch: m.hook || m.description || m.cardDesc || '',
        // An applied companion names the demo it was distilled from; that demo
        // is the same subject, so the two must not land in the same week.
        companionOf,
        words: 0,
        status: 'published',
        featured: false,
        origin: '',
        // Companions are deliberately left out of the run: they carry no number,
        // and each is already tied to its demo by cluster, which spaces the two
        // apart rather than ordering them.
        series: kind === 'demos' && m.number ? 'demos' : '',
        seriesPos: Number(m.number) || 0,
        tableRows: 0,
        mdxNodes: 0,
        nonTextNodes: 0,
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

// Keyed by normalised title rather than reduced to a Set of them, because the
// archive entry carries the slug and the real publication date — the only way
// to turn a draft that went live into a `posted` route with a working URL.
function substackArchive() {
  const f = join(HERE, 'substack-archive.json')
  if (!existsSync(f)) return new Map()
  return new Map(JSON.parse(readFileSync(f, 'utf8')).map((p) => [norm(p.title), p]))
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
// One exception, and it is the one worth knowing: hand-setting `state:
// 'eligible'` on a piece LinkedIn's window has skipped does NOT hold. The window
// runs on every rebuild and recomputes it straight back to `skip`. The override
// there is `admittedOn` — add the field to the route and the piece is
// grandfathered in permanently. That is the way back for anything the 2026-08-09
// reset dropped, including the ten pieces whose captions were already written.
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

// LinkedIn eligibility is membership in `linkedin-picks.json`. That is the whole
// rule, and the file explains why it replaced four successive attempts to infer
// "strongest" from a property of the piece.
//
// Rebuilt 2026-08-09 on the instruction to feed LinkedIn the strongest pieces
// going forward, with the initial set drawn from a review of the last 30 days.
// A review produces a list, so the list is the mechanism. Nothing here computes
// eligibility from dates, tiers, word counts, or flags any more.
function linkedInPicks() {
  const f = join(HERE, 'linkedin-picks.json')
  if (!existsSync(f)) return new Map()
  const doc = JSON.parse(readFileSync(f, 'utf8'))
  return new Map((doc.picks || []).map((p) => [p.id, p]))
}

// A word floor for the feed was written here on 2026-08-09 and removed the same
// day. It is recorded because the mistake is easy to repeat.
//
// The instruction was to pick the best from what was queued — a selection over
// 37 known pieces. A constant in this function is not that. It re-evaluates on
// every rebuild, so it would have silently governed all future writing, and it
// sat ahead of the window check, which meant `admittedOn` could not rescue a
// short piece. That contradicted the documented recovery path: one essay with a
// finished caption (973 words) became unreachable by the exact mechanism it was
// told to use.
//
// A one-time selection belongs in the ledger, not the rules. The four essays cut
// from the feed carry `skip-manual` in queue.json, which survives regeneration
// and expresses what it is — four specific editorial calls, not a policy.

// Retired 2026-08-09. It existed because routing everything at LinkedIn put 261
// items in front of a 2/week feed, and aging essays out was the release valve.
// LinkedIn no longer takes anything it was not explicitly picked for, so the
// pressure it relieved is gone — and Substack is now parity with the blog, which
// an archive cutoff directly contradicts. dev.to keeps its own `skip` reasons
// per collection and never depended on this.
function agedOut() {
  return false
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
    // cross-post.
    //
    // It ran on LinkedIn until 2026-08-09, and the reason it stopped is that a
    // companion and its demo are one subject twice. The demo carries the
    // incident with its numbers; the companion carries the same technique
    // generalized. On a feed six weeks apart that reads as repetition, and the
    // evidence it was too close is mechanical: the only repeated-phrasing
    // failure the caption gate has caught was between a companion and the piece
    // it was distilled from. Seven companions were displacing seven recent
    // essays.
    //
    // Dropping them from the feed alone would have unsyndicated them completely,
    // because this branch also skipped Substack — the first version of this
    // change did exactly that, on a comment asserting Substack would keep them.
    // It would not have. So the companions move rather than stop: `link` mode,
    // a framing note and a link home, which is what demos already do there. An
    // inbox archive is where a generalized technique belongs, and at a daily
    // cadence there is room for it.
    r.linkedin.reason = 'companion duplicates its demo on a feed; the demo carries the incident'
    r.devto.reason = 'no markdown body — rendered deck, nothing to cross-post'
    r.substack.mode = 'link'
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
    // Under 800 words used to be skipped here — "a post, not an issue", on the
    // theory that sending them one at a time trains subscribers that the
    // newsletter is thin. Operator instruction, 2026-08-09: double-post the blog
    // to Substack. Coverage beats issue-weight, so the 18 short essays that rule
    // was holding back go across too. The judgment it encoded is real, and the
    // place to answer it is a digest that batches them, not a silent skip.
    r.substack.mode = 'full'
    r.linkedin.mode = 'native'
  }

  const tier = p.featured ? 1 : long || mid ? 2 : 3
  return { routes: r, tier }
}

// Every route decision runs through here, so the one rule that cannot be got
// wrong is enforced in one place rather than per branch. All 34 imported Pulse
// articles happen to sit in `blog` today; guarding only the essay branch would
// hold now and fail silently the first time one lands in another collection.
function routeWithGuards(p, now, picks) {
  const out = route(p, now)
  const id = `${p.collection}/${p.slug}`
  if (p.origin === 'linkedin') {
    out.routes.linkedin = { mode: 'skip', reason: 'originated on LinkedIn' }
  }
  // The only LinkedIn gate. A piece is fed because it was picked, or not at all.
  if (out.routes.linkedin.mode !== 'skip' && !picks.has(id)) {
    out.routes.linkedin = { mode: 'skip', reason: 'not in linkedin-picks.json' }
  }
  // This gate used to downgrade any piece with tables or MDX nodes to `link`,
  // on the premise that `full` meant a human pasting the source. That premise
  // expired when post-substack.mjs started lifting the RENDERED body off the
  // site, and nothing here was updated to match. The result was a routing rule
  // asserting a limit the poster does not have:
  //
  //   - Tables. post-substack.mjs already rewrites every <table> into an
  //     aligned monospace <pre>, with a comment explaining why. That code had
  //     never once executed, because this gate diverted every table-bearing
  //     piece before the poster could see it. Verified 2026-08-10 on
  //     the-bifurcation-of-autonomy, the heaviest in the corpus: 15 tables,
  //     108 rows, 4689 words in and 4687 out, all 15 converted and aligned.
  //
  //   - MDX. The poster reads rendered HTML, so there is no MDX left by the
  //     time it looks. <Callout> is already an <aside> with a heading;
  //     <PullQuote> is already a <figure><blockquote>. Verified same day on
  //     grade-an-agent-tool-before-you-install-it, which uses five component
  //     types and came across whole.
  //
  // Counting source syntax was the error. A source-level count sees markup it
  // cannot interpret and reports that as an incompatibility, which is a claim
  // about the poster's capability made without reference to the poster.
  //
  // What survives is the narrow case the counts were reaching for: a component
  // that renders to something other than text. Those lift as empty. <Slide> is
  // the only one in the corpus and lives solely in `presentations`, already
  // `link` above; <Mermaid> and <Figure> were named in the old comment but
  // appear in no content file. The guard stays anyway, because the failure is
  // silent — an empty lift reads as a short post, not as an error.
  if (out.routes.substack?.mode === 'full' && p.nonTextNodes > 0) {
    out.routes.substack = {
      mode: 'link',
      reason: 'renders to a diagram or deck, which lifts as empty text',
    }
  }
  return out
}

// ------------------------------------------------------------------ scheduling

// Cadence, one slot per platform-day. Two LinkedIn slots a week is the most a
// personal feed absorbs without the account reading as automated; dev.to is a
// slow backfill.
//
// Substack was weekly, "because an inbox punishes more". Weekly is 4.3 slots a
// month and the blog publishes about 5 essays a month, so a weekly newsletter
// could not mirror the blog even if it carried nothing else — the instruction to
// double-post was arithmetically impossible at that cadence, before any backlog.
//
// Sunday plus Wednesday fixed the mirror and did not fix the backlog: 8.7/month
// against ~5/month of new writing nets 3.7, and 122 queued pieces at that rate
// reach parity in 33 months. That is not catching up, it is holding station.
//
// Operator instruction, 2026-08-09: drip Substack until it is current with the
// blog. Daily is 30/month, nets ~25, and clears the backlog in under five
// months. The cadence is self-limiting by construction — once the queue holds
// only new writing, there are ~5 pieces a month to send and the send rate falls
// back on its own without anyone changing this table. The subscriber-churn risk
// of a daily send is real and belongs to the catch-up window, not to the steady
// state.
const CADENCE = {
  linkedin: { days: [2, 4], every: 1 }, // Tue, Thu
  substack: { days: [0, 1, 2, 3, 4, 5, 6], every: 1 }, // daily, until caught up
  devto: { days: [3], every: 2 }, // Wed, fortnightly
}

// A blog post published in the last two weeks goes to Substack next, ahead of
// everything queued. Without this, "double post" is a lie the ordering tells:
// tier-then-newest puts a fresh tier-2 essay behind all 57 tier-1 items, so the
// mirror would reach subscribers months after the post went live. LinkedIn is
// deliberately excluded — it was asked for a drip, and jumping the newest demo
// ahead of demos 1-12 would re-break the run order fixed one commit ago.
// A one-time pin for the head of a platform's drip lived here. Used 2026-08-10
// to move that day's LinkedIn post off the Tue/Thu cadence, then removed the
// same day — because a pin that survives its own post re-applies to whatever
// item inherits the head, which would have put a second post on the same day.
// A head pin is a single-use tool: set it, run it, delete it.

const MIRROR_DAYS = 14

// Substack is parity with the blog as of 2026-08-09: every entry belongs there,
// so the backlog is not a campaign and does not get dates. Dripping it implied a
// choice about WHICH pieces go, and there is no such choice left to make — the
// answer is all of them. What remains is a backfill work-list, counted and
// reported. Only pieces inside the mirror window carry a scheduled date, because
// those are the ones that still have a send attached.
const SUBSTACK_BACKFILL = true

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

// The LinkedIn feed, read once. See linkedin-picks.json for why selection is a
// file rather than a rule.
const picks = linkedInPicks()

const onSubstack = substackArchive()
const onLinkedIn = linkedinShared()

const prior = existsSync(QUEUE) ? JSON.parse(readFileSync(QUEUE, 'utf8')) : { items: [] }
const priorById = new Map((prior.items || []).map((i) => [i.id, i]))

// Local calendar date, not toISOString() — that is UTC, which rolls over at
// 19:00 CDT. A rebuild on a Saturday evening read "today" as Sunday, skipped
// the next morning's Substack slot, and slid the whole drip a week.
const today = new Date().toLocaleDateString('en-CA')

const items = pieces.map((p) => {
  const id = `${p.collection}/${p.slug}`
  const was = priorById.get(id)
  const { routes, tier } = routeWithGuards(p, today, picks)
  const out = {
    id,
    title: p.title,
    url: p.url,
    publishedAt: p.date,
    collection: p.collection,
    words: p.words,
    ...(p.pitch ? { pitch: p.pitch } : {}),
    ...(p.series ? { series: p.series, seriesPos: p.seriesPos } : {}),
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
    //
    // But `draft` cannot be sticky forever, and that is the other half. The
    // publish button lives on the platform, not here, so a draft mark outlives
    // the draft it describes. dev.to closes the loop with `post-devto.mjs
    // --sync`; Substack has no writer at all, so the refreshed archive is the
    // only thing that can tell the ledger a draft went live. Without this a
    // Substack draft published by hand reads `draft` in perpetuity, its slot
    // never reopens, and `--refresh` — the one command that knows the truth —
    // is short-circuited before it gets a chance to say so.
    const live = platform === 'substack' && prev?.state === 'draft' ? onSubstack.get(norm(p.title)) : null
    if (live) {
      out.routes[platform] = {
        ...prev,
        state: 'posted',
        postedAt: live.date || 'archive',
        url: `https://signaldispatch.substack.com/p/${live.slug}`,
      }
      continue
    }
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

// A series is one editorial unit, so it also has to share one tier. Tier is the
// outermost sort key, so a series split across tiers plays split no matter what
// the date and position rules do: `agentic-workflows-in-practice` had part 2
// featured (tier 1) and the rest tier 2, which scheduled part 2 for 2026-09-17
// and parts 1 and 3-7 for 2027-04 — seven months, in the wrong order, for a
// reader who met part 2 first.
//
// The whole series takes the best tier any member earned. If one entry is strong
// enough to feature, running it alone ahead of its own context is worse than
// running the series at that priority.
for (const [series, tier] of (() => {
  const best = new Map()
  for (const i of items) {
    if (!i.series) continue
    const cur = best.get(i.series)
    if (cur === undefined || i.tier < cur) best.set(i.series, i.tier)
  }
  return best
})()) {
  for (const i of items) if (i.series === series) i.tier = tier
}

// Every series' anchor, computed once over the finished item list rather than
// per comparison — Array#sort calls the comparator O(n log n) times and the
// anchor is a property of the series, not of the pair.
const anchors = seriesAnchors(items)

// Order the drip: tier first, then newest — a 2025 essay is not the thing to
// open with when there is 2026 material that says the same idea better. Undated
// pieces (the applied companions) sort last within their tier rather than first,
// which an empty string would otherwise do — "last within their tier" describes
// this sort, not the schedule. `interleave` re-buckets by collection immediately
// after and round-robins, which is why the undated companions land across
// Aug-Dec rather than at the tail. That is the intent of interleaving, not a
// defect; the sort only has to hand it a stable order to draw from.
//
// Series are the exception, and they were silently broken. Newest-first applied
// to a series plays it backwards: `agentic-workflows-in-practice` was scheduled
// 2,7,6,4,3,1, and `the-taste-test` 1,3,2. A reader meeting part 7 first has no
// way to know parts 1-6 exist. The old `inSeries` boolean was computed and never
// read by anything, so nothing had ever acted on this.
//
// The fix anchors each series to its NEWEST member's date, then plays the
// members in position order from there. The series lands where newest-first
// would have put it, so the drip's shape is unchanged; only the internal order
// is. Anchoring matters for correctness, not just taste: a comparator that
// special-cased same-series pairs while leaving cross-series pairs on raw date
// would not be transitive, and Array#sort on a non-transitive comparator gives
// an arbitrary result rather than an error.
function seriesAnchors(items) {
  const anchor = new Map()
  for (const i of items) {
    if (!i.series) continue
    const cur = anchor.get(i.series)
    const d = i.publishedAt || '0000'
    if (!cur || d > cur) anchor.set(i.series, d)
  }
  return anchor
}

// `byTier` is false for LinkedIn as of 2026-08-09. Tier was the outermost key,
// and `route()` hands every demo and applied companion tier 1, so all 24 of them
// drained before any essay could start — which put thirteen posts written in the
// first week of August behind a July backfill, starting in November. Nothing in
// the date logic was wrong; tier outranked it.
//
// Substack and dev.to keep tier ordering. An inbox and a docs cross-post are
// archives, where running the strongest material first is right. A feed is not
// an archive, and three-month-old commentary competing with this week's writing
// is the thing the whole horizon rule exists to prevent.
const orderWith = (anchor, byTier = true) => (a, b) => {
  const ad = a.series ? anchor.get(a.series) : a.publishedAt || '0000'
  const bd = b.series ? anchor.get(b.series) : b.publishedAt || '0000'
  return (
    (byTier ? a.tier - b.tier : 0) ||
    (bd || '0000').localeCompare(ad || '0000') ||
    // Same series: reading order. Different series sharing an anchor date, or
    // non-series pieces, fall through to their own dates newest-first.
    (a.series && a.series === b.series
      ? a.seriesPos - b.seriesPos
      : (b.publishedAt || '0000').localeCompare(a.publishedAt || '0000'))
  )
}

// Interleave by collection inside each tier. Straight tier-then-date ordering
// put twelve demos in consecutive slots — six weeks of one format, which reads
// as a bot emptying a folder. Round-robin keeps the run order intact within a
// collection while varying what a reader sees week to week.
// `useTier` mirrors `orderWith`'s flag and has to, because this function
// re-imposes whatever the comparator just decided. It groups by tier and emits
// tier 1 entirely before tier 2, so ordering LinkedIn by recency in the sort and
// leaving this alone would have quietly restored the tier-first schedule two
// lines later. One flag, both places, or neither works.
function interleave(list, useTier = true) {
  const byTier = new Map()
  for (const i of list) {
    const key = useTier ? i.tier : 0
    if (!byTier.has(key)) byTier.set(key, new Map())
    const buckets = byTier.get(key)
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

// Two weeks between two pieces on the same subject. This was written as `SPACING
// = 4` with the comment "slots; at 2/week on LinkedIn, about two weeks apart" —
// a duration expressed in slots, which silently stopped meaning two weeks the
// moment a cadence changed. Moving Substack to daily on 2026-08-09 turned four
// slots into four days, and six same-subject pairs landed inside a fortnight
// before this was converted.
//
// So the constant is the duration, and each platform converts it using its own
// cadence. LinkedIn at 2/week still resolves to 4 slots, which is why this is a
// correction rather than a retune.
const SPACING_DAYS = 14

function spacingSlots(platform) {
  const { days, every } = CADENCE[platform]
  const perWeek = days.length / every
  return Math.max(1, Math.round(SPACING_DAYS / (7 / perWeek)))
}

function spaceClusters(list, spacing) {
  const pending = [...list]
  const out = []
  const lastSeen = new Map()
  while (pending.length) {
    let pick = pending.findIndex(
      (i) => !lastSeen.has(i.cluster) || out.length - lastSeen.get(i.cluster) >= spacing
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

// A drafted piece is queued work that happens to be staged already, so it holds
// its slot. Dropping it from the pool hands its date to the next item and
// double-books the day it actually goes out — which is how marking one Substack
// note `draft` put two `link` pieces on 2026-08-09 the first time this ran.
// One predicate, three readers: the scheduler, the summary, and `--due`.
const isQueued = (r) => r?.state === 'eligible' || r?.state === 'draft'

for (const platform of Object.keys(CADENCE)) {
  const all = items.filter((i) => isQueued(i.routes[platform]))
  // Fresh blog posts skip the queue entirely — no interleaving, no cluster
  // spacing. Both exist to vary what a reader sees across a long drip, and a
  // mirror is not a drip: the whole point is that it lands while the piece is
  // new. Newest first among them, so a burst of two publishes in reading order.
  const cutoff = new Date(today)
  cutoff.setUTCDate(cutoff.getUTCDate() - MIRROR_DAYS)
  const isMirror = (i) =>
    platform === 'substack' &&
    i.collection === 'blog' &&
    (i.publishedAt || '') >= cutoff.toISOString().slice(0, 10)
  const mirror = all.filter(isMirror).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const queued = [
    ...mirror,
    ...spaceClusters(
      interleave(
        all.filter((i) => !isMirror(i)).sort(orderWith(anchors, platform !== 'linkedin')),
        platform !== 'linkedin'
      ),
      spacingSlots(platform)
    ),
  ]
  // Substack's backlog gets no dates. Parity means every entry belongs there, so
  // there is nothing left to schedule — assigning slots to 137 pieces would
  // dress a backfill up as a campaign and put the last one in 2027. Only the
  // mirror set carries dates, because only those still have a send attached.
  // Everything else is `backfill`, counted by --due and worked through in a run.
  if (platform === 'substack' && SUBSTACK_BACKFILL) {
    const dates = slots(platform, mirror.length, today)
    mirror.forEach((i, n) => {
      i.routes.substack.scheduledFor = dates[n]
    })
    queued.slice(mirror.length).forEach((i) => {
      i.routes.substack.scheduledFor = null
      i.routes.substack.backfill = true
    })
    continue
  }
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
    .filter((i) => isQueued(i.routes[platform]) && i.routes[platform].scheduledFor)
    .map((i) => i.routes[platform].scheduledFor)
    .sort()
  const backfill = tally((i) => isQueued(i.routes[platform]) && i.routes[platform].backfill)
  summary[platform] = {
    posted: tally((i) => i.routes[platform]?.state === 'posted'),
    queued: dates.length,
    ...(backfill ? { backfill } : {}),
    skipped: tally((i) => i.routes[platform]?.state?.startsWith('skip')),
    firstSlot: dates[0] ?? null,
    lastSlot: dates.at(-1) ?? null,
  }
}

const doc = {
  generatedAt: today,
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
  items: items.sort(orderWith(anchors)),
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
    // `draft` counts as owed, and more so than `eligible`. A drafted piece is
    // written, staged, and one click from live — leaving it out of the owed
    // list hides the cheapest thing on it, and hides it precisely because the
    // work is nearly done. Worse, an invisible draft gets drafted twice.
    const backfill = items.filter(
      (i) => isQueued(i.routes[platform]) && i.routes[platform].backfill
    )
    if (backfill.length) {
      console.log(`\n${platform.toUpperCase()} BACKFILL`)
      console.log(
        `  ${backfill.length} entries missing from ${platform} — no dates; parity is a run, not a drip`
      )
    }
    const due = items
      .filter((i) => isQueued(i.routes[platform]) && !i.routes[platform].backfill)
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
      const staged = r.state === 'draft' ? '  [drafted — publish it]' : ''
      console.log(`  ${r.scheduledFor}${late}  ${r.mode.padEnd(9)} ${i.title.slice(0, 52)}${needs}${staged}`)
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
