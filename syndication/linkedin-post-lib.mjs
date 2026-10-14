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

// Fail closed: exactly one distinct post URL identifies the post. None, or two
// different posts carrying the same text (a repost, a duplicate), is no answer.
export function pickPostUrl(urls) {
  const unique = [...new Set(urls.map((u) => String(u).split('?')[0]))]
  return unique.length === 1 ? unique[0] : null
}

// Runs in the page, so it must be self-contained (puppeteer ships its source,
// and LinkedIn's CSP rules out rebuilding helpers with eval there). Finds every
// element across open shadow roots whose collapsed text contains `needle`,
// keeping only the innermost matches. mode 'count' returns how many. mode
// 'links' walks up from each match (crossing shadow hosts) to the first
// ancestor holding a /feed/update/ link and returns every distinct link there,
// so a container holding several posts reports all of them and pickPostUrl
// refuses it.
function scanInPage(needle, mode) {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
  const all = []
  const visit = (root) => {
    for (const el of root.querySelectorAll('*')) {
      all.push(el)
      if (el.shadowRoot) visit(el.shadowRoot)
    }
  }
  visit(document)
  const hits = all.filter((el) => norm(el.textContent).includes(needle))
  const innermost = hits.filter((el) => ![...el.children].some((c) => hits.includes(c)))
  if (mode === 'count') return innermost.length
  const out = []
  for (const el of innermost) {
    let node = el
    for (let i = 0; i < 40 && node; i++) {
      if (node.querySelectorAll) {
        const links = [...node.querySelectorAll('a[href*="/feed/update/urn:li:"]')].map((a) => a.href.split('?')[0])
        if (links.length) { out.push(...new Set(links)); break }
      }
      node = node.parentElement || (node.getRootNode && node.getRootNode().host) || null
    }
  }
  return out
}

const linksForText = (page, needle) => page.evaluate(scanInPage, needle, 'links')
const pageHasText = async (page, needle) => (await page.evaluate(scanInPage, needle, 'count')) > 0

// Read-only. Returns the post's /feed/update/ URL, or null. Retries with
// reloads until the deadline, because a post can take a while to appear on the
// profile: the old six-second look missed it.
export async function findPostUrl(page, fingerprint, { timeoutMs = 90000, log = () => {} } = {}) {
  if (!fingerprint || fingerprint.length < 20) throw new Error('fingerprint too short to identify a post')
  const deadline = Date.now() + timeoutMs
  let attempt = 0
  while (Date.now() < deadline) {
    for (const url of PROFILE_PAGES) {
      attempt++
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      await sleep(8000)
      for (let i = 0; i < 3; i++) { await page.evaluate(() => window.scrollBy(0, 900)); await sleep(2000) }
      const links = await linksForText(page, fingerprint)
      const picked = pickPostUrl(links)
      log(`lookup ${attempt} ${url.replace('https://www.linkedin.com', '')}: ${links.length} link(s)${picked ? ' -> ' + picked : ''}`)
      if (picked) return picked
      if (links.length > 1) return null // ambiguous now; waiting will not make it less so
      if (Date.now() >= deadline) break
    }
  }
  return null
}

// Read-only. openPost opens the post and throws if the page does not carry the
// post's own text, so a wrong URL can never read as "comment missing" and lead
// to a comment on the wrong post. commentPresent then reports whether `text`
// already shows on it.
export async function openPost(page, postUrl, fingerprint) {
  await page.goto(postUrl, { waitUntil: 'domcontentloaded' })
  await sleep(9000)
  if (!(await pageHasText(page, fingerprint))) throw new Error(`post text not found at ${postUrl}`)
}

export async function commentPresent(page, postUrl, fingerprint, text) {
  await openPost(page, postUrl, fingerprint)
  return pageHasText(page, text)
}

// Writes. Call only after commentPresent returned false for the same page.
// Every step fails closed; the one thing that cannot be undone is a comment on
// the wrong post or a half-typed one.
export async function submitComment(page, fingerprint, text, { screenshot } = {}) {
  if (!(await pageHasText(page, fingerprint))) throw new Error('post text not on the current page; not commenting')

  let boxes = await page.$$(`>>> ${COMMENT_EDITOR}`)
  if (boxes.length === 0) {
    // Some layouts keep the box closed until the post's Comment toggle is used.
    for (const b of await page.$$('>>> button')) {
      const label = await b.evaluate((el) => (el.getAttribute('aria-label') || el.innerText || '').trim())
      if (/^comment$/i.test(label)) { await b.click(); break }
    }
    await sleep(3000)
    boxes = await page.$$(`>>> ${COMMENT_EDITOR}`)
    if (boxes.length === 0) boxes = await page.$$('>>> div.ql-editor[contenteditable="true"]')
  }
  if (boxes.length !== 1) throw new Error(`expected one comment editor, found ${boxes.length}`)
  const box = boxes[0]

  await box.click()
  await sleep(800)
  await box.type(text, { delay: 5 })
  await sleep(2500)
  if (screenshot) await page.screenshot({ path: screenshot })
  const typed = await box.evaluate((el) => el.innerText.trim()).catch(() => null)
  if (typed !== text) throw new Error('comment box did not receive the exact text; not submitting')

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
  await sleep(7000)

  // Verify rather than assume: clicking the wrong control also "succeeds".
  await page.reload({ waitUntil: 'domcontentloaded' })
  await sleep(9000)
  if (!(await pageHasText(page, text))) throw new Error('clicked submit but the comment is not visible after reload')
  return true
}
