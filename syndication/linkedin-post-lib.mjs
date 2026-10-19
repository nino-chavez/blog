// Find a LinkedIn post just published from this profile, and add its first
// comment. Used by post-linkedin.mjs; the read-only half is also used by
// check-linkedin-post.mjs.
//
// Two things broke on 2026-10-14 (There's No Replicator Yet) and are why this
// file exists:
//
// - /in/me/recent-activity/all/ rendered "Nothing to see for now" inside the
//   browser-box profile, with zero [data-urn] nodes, so the old scan never
//   found the post. The profile page /in/me/ did list it, with the post's own
//   /feed/update/urn:li:activity:<id>/ link three ancestors above its text.
// - The comment box is now a TipTap editor,
//   div[role="textbox"][aria-label="Text editor for creating comment"], open on
//   the post's own page. The old div.ql-editor selector matched nothing.
//
// The functions are split by what they can do. findPostUrl and commentPresent
// only read. submitComment is the only one that types or clicks. A check that
// must not post imports the first two and never the third: a guard inside the
// function that acts does not make running it safe (see the 2026-08-10 note in
// post-linkedin.mjs).

// A caption may carry its link below a marker instead of in the body. LinkedIn
// demotes posts containing an external link (measured 2026-08-23: 11 site
// visits from LinkedIn in seven days against roughly 1,600 impressions a week).
// Trailing newline is optional: splitCaption trims first, so requiring \n after
// the marker let a marker with an empty tail survive into the post body.
//
// Shared, deliberately. This first lived inside post-linkedin.mjs's `if (DRY)`
// block, so --dry exercised it and the live path threw ReferenceError on the
// line that reads the caption — which is to say the feature only ever ran in
// the mode that cannot publish. A dry run is not a test of the live path when
// the two paths do not share the code.
export const FIRST_COMMENT_MARKER = /\n---\s*first-comment\s*---\s*(?:\n|$)/
export function splitCaption(raw) {
  const text = raw.trim()
  if (!FIRST_COMMENT_MARKER.test(text)) return { body: text, firstComment: null }
  const [body, ...rest] = text.split(FIRST_COMMENT_MARKER)
  return { body: body.trim(), firstComment: rest.join('\n').trim() || null }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PROFILE_PAGES = [
  'https://www.linkedin.com/in/me/',
  'https://www.linkedin.com/in/me/recent-activity/all/',
]
const COMMENT_EDITOR = 'div[role="textbox"][aria-label="Text editor for creating comment"]'

// The first line of the caption, whitespace-collapsed, at most 60 characters.
// Not body.slice(0, 60): a first paragraph shorter than 60 characters would
// carry the paragraph break and the next line's start, and LinkedIn renders
// that break differently from the source.
export function fingerprintOf(body) {
  const first = String(body).split('\n').map((l) => l.trim()).find(Boolean) ?? ''
  return first.replace(/\s+/g, ' ').slice(0, 60).trim()
}

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()
const bare = (u) => String(u).split('?')[0]

// Fail closed: exactly one distinct post URL identifies the post. None, or two
// different posts carrying the same text (a repost, a duplicate), is no answer.
export function pickPostUrl(urls) {
  const unique = [...new Set(urls.map(bare))]
  return unique.length === 1 ? unique[0] : null
}

// The post just published, from the links found after posting, minus every
// post that already carried the same opening before it. Without the exclusion,
// an older post with the same first line is the only match while the new one
// has not appeared yet, and the comment lands on the old post.
export function newPostUrl(links, exclude = []) {
  const known = new Set(exclude.map(bare))
  return pickPostUrl(links.filter((u) => !known.has(bare(u))))
}

// When the comment text also sits in the post body, "is the comment there?"
// cannot be answered by looking for the text, so the comment step is skipped.
export function commentAlsoInBody(body, comment) {
  return Boolean(comment) && norm(body).includes(norm(comment))
}

// Runs in the page, so it must be self-contained (puppeteer ships its source,
// and LinkedIn's CSP rules out rebuilding helpers with eval there). Text is
// compared whitespace-collapsed on both sides, across open shadow roots.
//
//   'links' — from each innermost element carrying `fingerprint`, walk up
//             (crossing shadow hosts) to the first ancestor holding a
//             /feed/update/ link and return every distinct link there, so a
//             container holding several posts reports all of them.
//   'posts' — how many distinct post containers carry `fingerprint`, where a
//             post container is the first ancestor that also holds the comment
//             editor. On a post's own page this must be exactly 1; sidebars and
//             recommended posts have no editor and do not count.
//   'has'   — 1 if `needle` shows in that post's own region, 0 if not, -1 if
//             there is not exactly one post container to start from. The
//             region is wider than the container: on 2026-10-14 the comment
//             editor sat inside the post's listitem, four levels above its
//             text, but the comments rendered in a sibling block that joins
//             the post only ten levels further up (section "Primary content").
//             Scoping to the container read an existing comment as missing,
//             which would have posted a duplicate. So the region grows from
//             the container while each ancestor holds at most one post link,
//             exactly one comment editor, and no <aside>, and stops before the
//             sidebars or a second post. "At most one" link, not "exactly
//             one": on 2026-10-19 the post's own page carried no
//             /feed/update/ link at all, so the old exactly-one rule stopped
//             at the container and read the comment (four levels up, inside
//             "Primary content") as missing, twice. The editor count is what
//             keeps a second post out now that the link count can be zero.
export function scanInPage(fingerprint, needle, mode, editorSelector) {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
  const up = (n) => n.parentElement || (n.getRootNode && n.getRootNode().host) || null
  const all = []
  const visit = (root) => {
    for (const el of root.querySelectorAll('*')) {
      all.push(el)
      if (el.shadowRoot) visit(el.shadowRoot)
    }
  }
  visit(document)
  const innermost = (text) => {
    const t = norm(text)
    const hits = all.filter((el) => norm(el.textContent).includes(t))
    return hits.filter((el) => ![...el.children].some((c) => hits.includes(c)))
  }
  const matches = innermost(fingerprint)
  if (mode === 'links') {
    const out = []
    for (const el of matches) {
      let node = el
      for (let i = 0; i < 40 && node; i++) {
        if (node.querySelectorAll) {
          const links = [...node.querySelectorAll('a[href*="/feed/update/urn:li:"]')].map((a) => a.href.split('?')[0])
          if (links.length) { out.push(...new Set(links)); break }
        }
        node = up(node)
      }
    }
    return out
  }
  const containers = []
  for (const el of matches) {
    let node = el
    for (let i = 0; i < 40 && node; i++) {
      if (node.querySelector && node.querySelector(editorSelector)) {
        if (!containers.includes(node)) containers.push(node)
        break
      }
      node = up(node)
    }
  }
  if (mode === 'posts') return containers.length
  if (containers.length !== 1) return -1
  const postLinks = (n) => new Set([...n.querySelectorAll('a[href*="/feed/update/urn:li:"]')].map((a) => a.href.split('?')[0])).size
  const editors = (n) => n.querySelectorAll(editorSelector).length
  let scope = containers[0]
  for (let next = up(scope); next && next.querySelectorAll; next = up(next)) {
    if (postLinks(next) > 1 || editors(next) !== 1 || next.querySelector('aside')) break
    scope = next
  }
  const inside = (el) => { for (let x = el; x; x = up(x)) if (x === scope) return true; return false }
  const n = norm(needle)
  return all.some((el) => inside(el) && norm(el.textContent).includes(n)) ? 1 : 0
}

const scan = (page, fingerprint, needle, mode) => page.evaluate(scanInPage, fingerprint, needle, mode, COMMENT_EDITOR)

async function profileLinks(page, url, fingerprint) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await sleep(8000)
  for (let i = 0; i < 3; i++) { await page.evaluate(() => window.scrollBy(0, 900)); await sleep(2000) }
  return scan(page, fingerprint, null, 'links')
}

// Read-only. Every post on the profile pages that already opens with this
// fingerprint. post-linkedin.mjs takes this before posting and passes it to
// findPostUrl as `exclude`.
export async function existingPostUrls(page, fingerprint) {
  const out = []
  for (const url of PROFILE_PAGES) out.push(...(await profileLinks(page, url, fingerprint)))
  return [...new Set(out.map(bare))]
}

// Read-only. Returns the post's /feed/update/ URL, or null. Retries with
// reloads until the deadline, because a post can take a while to appear on the
// profile: the old six-second look missed it. Links in `exclude` (posts that
// existed before this one) never count.
export async function findPostUrl(page, fingerprint, { exclude = [], timeoutMs = 90000, log = () => {} } = {}) {
  if (!fingerprint || fingerprint.length < 20) throw new Error('fingerprint too short to identify a post')
  const known = new Set(exclude.map(bare))
  const deadline = Date.now() + timeoutMs
  let attempt = 0
  while (Date.now() < deadline) {
    for (const url of PROFILE_PAGES) {
      attempt++
      const links = await profileLinks(page, url, fingerprint)
      const fresh = [...new Set(links.map(bare))].filter((u) => !known.has(u))
      const picked = newPostUrl(links, exclude)
      log(`lookup ${attempt} ${url.replace('https://www.linkedin.com', '')}: ${links.length} link(s), ${fresh.length} new${picked ? ' -> ' + picked : ''}`)
      if (picked) return picked
      if (fresh.length > 1) return null // ambiguous now; waiting will not make it less so
      if (Date.now() >= deadline) break
    }
  }
  return null
}

// Some layouts keep the comment box closed until the post's Comment toggle is
// used, and the post container is found through that box. So when no container
// shows, click the toggle once and look again. Opening the box types nothing
// and publishes nothing, which is why the read-only functions may do it.
//
// The toggle must be the target post's own: walking up from the post's text,
// the first ancestor holding a button labelled exactly "Comment" that is not
// itself inside a comment form (an open form's submit button carries the same
// label and would post). It is clicked only when exactly one such button is
// found; otherwise nothing is clicked and the caller fails closed.
function markToggleInPage(fingerprint, editorSelector) {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
  const up = (n) => n.parentElement || (n.getRootNode && n.getRootNode().host) || null
  const all = []
  const visit = (root) => {
    for (const el of root.querySelectorAll('*')) {
      all.push(el)
      if (el.shadowRoot) visit(el.shadowRoot)
    }
  }
  visit(document)
  const t = norm(fingerprint)
  const hits = all.filter((el) => norm(el.textContent).includes(t))
  const innermost = hits.filter((el) => ![...el.children].some((c) => hits.includes(c)))
  const inCommentForm = (b) => {
    let x = b
    for (let i = 0; i < 10 && x; i++) { x = up(x); if (x && x.querySelector && x.querySelector(editorSelector)) return true }
    return false
  }
  const toggles = new Set()
  for (const el of innermost) {
    for (let node = el, i = 0; i < 40 && node; i++, node = up(node)) {
      if (!node.querySelectorAll) continue
      const found = [...node.querySelectorAll('button')].filter((b) =>
        /^comment$/i.test((b.getAttribute('aria-label') || b.innerText || '').trim()) && !inCommentForm(b))
      if (found.length) { found.forEach((b) => toggles.add(b)); break }
    }
  }
  for (const b of document.querySelectorAll('[data-lz-toggle]')) b.removeAttribute('data-lz-toggle')
  if (toggles.size !== 1) return toggles.size
  ;[...toggles][0].setAttribute('data-lz-toggle', '1')
  return 1
}

async function postShownOnce(page, fingerprint) {
  let posts = await scan(page, fingerprint, null, 'posts')
  if (posts === 0) {
    const n = await page.evaluate(markToggleInPage, fingerprint, COMMENT_EDITOR)
    const toggle = n === 1 ? await page.$('>>> button[data-lz-toggle="1"]') : null
    if (!toggle) return 0
    await toggle.click()
    await sleep(3000)
    posts = await scan(page, fingerprint, null, 'posts')
  }
  return posts
}

// Read-only (it may open the comment box, never type in it). openPost opens the
// post and throws unless the page shows the post exactly once with its comment
// box beside it, so a wrong URL can never read as "comment missing" and lead to
// a comment on the wrong post. commentPresent then reports whether `text` shows
// in that post's own region (not anywhere on the page, where a sidebar or a
// recommended post could carry it).
export async function openPost(page, postUrl, fingerprint) {
  await page.goto(postUrl, { waitUntil: 'domcontentloaded' })
  await sleep(9000)
  const posts = await postShownOnce(page, fingerprint)
  if (posts !== 1) throw new Error(`expected the post once, with its comment box, at ${postUrl}; found ${posts}`)
}

export async function commentPresent(page, postUrl, fingerprint, text) {
  await openPost(page, postUrl, fingerprint)
  const has = await scan(page, fingerprint, text, 'has')
  if (has < 0) throw new Error('could not scope the check to the post')
  return has === 1
}

// Writes. Call only after commentPresent returned false for the same page.
// Every step fails closed; the one thing that cannot be undone is a comment on
// the wrong post or a half-typed one.
export async function submitComment(page, fingerprint, text, { screenshot } = {}) {
  const posts = await postShownOnce(page, fingerprint)
  if (posts !== 1) throw new Error(`post not shown exactly once on the current page (found ${posts}); not commenting`)

  const boxes = await page.$$(`>>> ${COMMENT_EDITOR}`)
  if (boxes.length !== 1) throw new Error(`expected one comment editor, found ${boxes.length}`)
  const box = boxes[0]

  await box.click()
  await sleep(800)
  await box.type(text, { delay: 5 })
  await sleep(2500)
  if (screenshot) await page.screenshot({ path: screenshot })
  const typed = await box.evaluate((el) => el.innerText).catch(() => null)
  if (typed === null || norm(typed) !== norm(text)) throw new Error('comment box did not receive the exact text; not submitting')

  // Scope the submit to the comment form: the post's action bar has its own
  // "Comment" toggle that comes first in document order. Walk up from the editor
  // and take the last enabled match in the first ancestor that has one.
  const found = await box.evaluate((el) => {
    const ok = (b) => /^(comment|post|reply)$/i.test((b.innerText || b.getAttribute('aria-label') || '').trim()) && !b.disabled
    let node = el
    for (let i = 0; i < 10 && node; i++) {
      node = node.parentElement || (node.getRootNode && node.getRootNode().host) || null
      if (!node || !node.querySelectorAll) break
      const hits = [...node.querySelectorAll('button')].filter(ok)
      if (hits.length) { hits[hits.length - 1].setAttribute('data-lz-submit', '1'); return true }
    }
    return false
  })
  if (!found) throw new Error('comment submit button not found inside the comment form')
  const submit = await page.$('>>> button[data-lz-submit="1"]')
  if (!submit) throw new Error('could not re-acquire the comment submit button')
  await submit.click()

  // From here the comment may be live. Verify rather than assume (clicking the
  // wrong control also "succeeds"), but anything short of seeing it is
  // UNVERIFIED, never a plain failure: a comment that renders late, a reload
  // that times out, or a post that cannot be found again all leave a comment
  // that may already exist, and advice to add it by hand would duplicate it.
  let has = -1
  let why = ''
  try {
    await sleep(7000)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await sleep(9000)
    has = (await postShownOnce(page, fingerprint)) === 1 ? await scan(page, fingerprint, text, 'has') : -1
  } catch (e) {
    why = ` (${e.message})`
  }
  if (has === 1) return true
  const err = new Error(has === 0
    ? 'clicked submit; the comment did not show on the first look after reload'
    : `clicked submit; could not look again to confirm the comment${why}`)
  err.code = 'UNVERIFIED'
  throw err
}
