#!/usr/bin/env node
// Post a queued LinkedIn item by driving the composer in browser-box.
//
//   node syndication/post-linkedin.mjs --dry            # validate only; never opens the composer
//   node syndication/post-linkedin.mjs --id <queue-id>  # publish that one
//   node syndication/post-linkedin.mjs --due            # publish everything due today or earlier
//
// --dry checks the target list, the caption files, their length against the
// composer's limit, and that the browser profile is still signed in — then
// exits. It does not open the composer, because opening and filling the
// composer is itself capable of publishing: on 2026-08-10 a --dry run put a
// real post on the account. The old flag suppressed the Post click, which is
// several steps too late. See the incident note at the composer below.
//
// There is no LinkedIn API credential (see README). This drives the signed-in
// profile inside browser-box so nothing takes over the screen:
//   browser-box start --profile social      # CDP on 9400
//
// The composer is a Quill editor. Setting .textContent or .innerHTML leaves
// Quill's internal model empty and the Post button disabled, so text goes in
// through real CDP keyboard input via page.type().

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { homedir } from 'node:os'
import { reviewMismatches } from './caption-review-lib.mjs'

// puppeteer-core is not a dependency of this repo. browse-tool already owns the
// browser side of this workflow (browser-box, BROWSE_PORT), so borrow its copy
// rather than duplicating a 300MB tree here. BROWSE_TOOL_HOME overrides.
const browseHome = process.env.BROWSE_TOOL_HOME || resolve(homedir(), 'Workspace/dev/tools/browse-tool')
const puppeteerPath = resolve(browseHome, 'node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')
if (!existsSync(puppeteerPath)) {
  console.error(`puppeteer-core not found under ${browseHome}.\nInstall browse-tool, or set BROWSE_TOOL_HOME.`)
  process.exit(1)
}
const puppeteer = (await import(pathToFileURL(puppeteerPath).href)).default

const HERE = dirname(fileURLToPath(import.meta.url))
const QUEUE = resolve(HERE, 'queue.json')
const REVIEW_RECEIPTS = resolve(HERE, 'caption-review-receipts.json')
const PORT = process.env.BROWSE_PORT || 9400
const today = new Date().toLocaleDateString('en-CA') // local date; toISOString is UTC and rolls over at 19:00 CDT

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null }
const DRY = has('--dry')

const queue = JSON.parse(readFileSync(QUEUE, 'utf8'))
const reviewReceipts = JSON.parse(readFileSync(REVIEW_RECEIPTS, 'utf8'))

const wantId = val('--id')
const targets = queue.items.filter((i) => {
  const r = i.routes.linkedin
  if (!r || r.state !== 'eligible') return false
  if (wantId) return i.id === wantId
  if (has('--due')) return (r.scheduledFor ?? '9999') <= today
  return false
})

if (!targets.length) {
  console.log('nothing selected — pass --id <queue-id> or --due')
  process.exit(0)
}

// A LinkedIn slot with no caption cannot be posted. Fail before opening a browser.
for (const item of targets) {
  const cap = item.routes.linkedin.caption
  if (!cap) throw new Error(`${item.id}: no caption on the route`)
  const p = resolve(HERE, cap)
  if (!existsSync(p)) throw new Error(`${item.id}: caption file missing: ${cap}`)
}

// A caption may carry its link below a marker instead of in the body. LinkedIn
// demotes posts containing an external link, and the measurement that produced
// this convention is blunt: 11 requests reached the site from LinkedIn in seven
// days against roughly 1,600 impressions a week (2026-08-23). Body goes in the
// composer; the marked remainder becomes the first comment.
// Trailing newline is optional: splitCaption trims first, so requiring \n after
// the marker let a marker with an empty tail survive into the post body.
//
// Module scope, deliberately. This first lived inside the `if (DRY)` block, so
// --dry exercised it and the live path threw ReferenceError on the line that
// reads the caption — which is to say the feature only ever ran in the mode
// that cannot publish. A dry run is not a test of the live path when the two
// paths do not share the code.
const FIRST_COMMENT_MARKER = /\n---\s*first-comment\s*---\s*(?:\n|$)/
const BLOG_LINK_IN_BODY = /https:\/\/(?:www\.)?ninochavez\.co\/blog(?:\/|\b)/i
function splitCaption(raw) {
  const text = raw.trim()
  if (!FIRST_COMMENT_MARKER.test(text)) return { body: text, firstComment: null }
  const [body, ...rest] = text.split(FIRST_COMMENT_MARKER)
  return { body: body.trim(), firstComment: rest.join('\n').trim() || null }
}

// The first-comment convention is an acceptance rule, not an optional caption
// shape. Keep this check in the live publisher too: a build can be skipped, and
// a syntactically valid body URL is exactly what slipped through on 2026-08-23.
for (const item of targets) {
  const p = resolve(HERE, item.routes.linkedin.caption)
  const { body, firstComment } = splitCaption(readFileSync(p, 'utf8'))
  if (BLOG_LINK_IN_BODY.test(body)) {
    throw new Error(`${item.id}: blog link is in the LinkedIn body — move it below --- first-comment ---`)
  }
  if (firstComment && !BLOG_LINK_IN_BODY.test(firstComment)) {
    throw new Error(`${item.id}: first comment exists but does not contain the blog link`)
  }
  const stale = reviewMismatches(item, reviewReceipts.receipts[item.id])
  if (stale.length) {
    throw new Error(
      `${item.id}: editorial review is stale: ${stale.join(', ')}\n` +
      `Review the current inputs, then run:\n` +
      `node syndication/record-caption-review.mjs --id ${item.id} --reviewed-by <name> --confirm-reviewed`
    )
  }
}

const browserURL = `http://127.0.0.1:${PORT}`
const browser = await puppeteer.connect({ browserURL, defaultViewport: null })

// LinkedIn truncates a share past this and the composer silently stops
// accepting keys, which reads downstream as "the editor came up short" with no
// indication of why. Checking it here means a caption that cannot fit is caught
// before anything is typed rather than halfway through typing it.
const CHAR_LIMIT = 3000

// --- --dry ends here, before any composer exists ------------------------------
//
// This is the whole fix from the 2026-08-10 incident. A dry-run flag cannot make
// an action safe when the setup for that action can perform it, so --dry does
// not reach the setup at all: no composer page, no click, no keystroke. What it
// can verify without typing, it verifies.
if (DRY) {
  const page = await browser.newPage()
  // The plain feed, deliberately NOT ?shareActive=true — that deep link is what
  // opens the composer modal.
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 5000))
  const session = await page.evaluate(() => ({
    path: location.pathname,
    loginForm: !!document.querySelector('form.login__form, input[name="session_key"]'),
  }))
  const signedIn = !session.loginForm && !/^\/(login|checkpoint|uas|signup)/.test(session.path)
  console.log(`session: ${signedIn ? 'signed in' : 'NOT SIGNED IN'} (at ${session.path})`)
  await page.close().catch(() => {})
  await browser.disconnect()

  let bad = 0
  for (const item of targets) {
    const { body, firstComment } = splitCaption(readFileSync(resolve(HERE, item.routes.linkedin.caption), 'utf8'))
    const over = body.length > CHAR_LIMIT
    if (over) bad++
    console.log(
      `\nDRY   ${item.id}` +
        `\n   scheduled ${item.routes.linkedin.scheduledFor ?? '(none)'}  mode ${item.routes.linkedin.mode}` +
        `\n   ${body.split(/\s+/).length} words, ${body.length}/${CHAR_LIMIT} chars${over ? '  OVER LIMIT' : ''}` +
        `\n   caption ${item.routes.linkedin.caption}` +
        `\n   opens: ${body.split('\n')[0].slice(0, 78)}` +
        `\n   first comment: ${firstComment ?? '(none — link stays in the body)'}`,
    )
  }
  console.log(`\n${targets.length} would post, ${bad} over the limit. Composer never opened; nothing was typed.`)
  process.exit(signedIn && !bad ? 0 : 1)
}

for (const item of targets) {
  const { body, firstComment } = splitCaption(readFileSync(resolve(HERE, item.routes.linkedin.caption), 'utf8'))
  console.log(`\npost  ${item.id}`)
  console.log(`   ${body.split(/\s+/).length} words, ${body.length}/${CHAR_LIMIT} chars`)
  if (body.length > CHAR_LIMIT) {
    throw new Error(`${item.id}: caption is ${body.length} chars, over the ${CHAR_LIMIT} limit — not opening the composer`)
  }

  const page = await browser.newPage()
  // Open the composer by URL. The "Start a post" control has no stable text or
  // class (LinkedIn ships obfuscated class names), and shareActive=true is the
  // documented deep link to the same modal.
  await page.goto('https://www.linkedin.com/feed/?shareActive=true', { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 8000))

  // The editor lives inside a shadow root, so document.querySelector never sees
  // it. `>>>` is puppeteer's deep (shadow-piercing) combinator.
  const EDITOR_SEL = '>>> div.ql-editor[contenteditable="true"]'
  let editor = null
  for (let i = 0; i < 20 && !editor; i++) {
    editor = await page.$(EDITOR_SEL).catch(() => null)
    if (!editor) await new Promise((r) => setTimeout(r, 1000))
  }
  if (!editor) throw new Error('composer editor not found — is the box still signed in?')
  await editor.click()
  // Real keystrokes: the editor only updates its model (and enables Post) on
  // input events, so assigning textContent leaves the button disabled.
  await editor.type(body, { delay: 1 })
  await new Promise((r) => setTimeout(r, 7000))  // let the link preview attach

  const shot = `/tmp/linkedin-${item.id.replace(/\W+/g, '-')}.png`
  await page.screenshot({ path: shot })
  console.log(`   screenshot ${shot}`)

  // Read back through the handle we already hold, NOT a fresh page.$eval on the
  // shadow-piercing selector. `page.$` finds this editor and `page.$eval` does
  // not, because $eval re-queries in page context where `>>>` resolves
  // differently — so the verification threw every time while the typing above
  // had already succeeded.
  //
  // 2026-08-10 INCIDENT — that throw is how a --dry run published a live post.
  // The DRY guard used to sit a few lines below this one, so when this line
  // threw, control never reached it. By then the caption was already public:
  // filling the composer is itself capable of publishing, because
  // `editor.type()` delivers real keystrokes and the handle can detach mid-type
  // (the same detachment that breaks $eval). Whatever receives the remaining
  // keys is no longer the editor.
  //
  // The lesson was structural, not a typo: a dry-run flag cannot make an action
  // safe when the setup for that action can perform it. --dry therefore now
  // returns before the browser reaches this function at all, rather than
  // guarding the click at the end of it. Everything from here down is the live
  // path only, and reaching this line means publishing was already intended.
  const typed = await editor.evaluate((el) => el.innerText.trim()).catch(() => null)
  if (typed === null) {
    throw new Error(
      'editor handle detached during typing — the composer may have already published. ' +
        'CHECK THE ACCOUNT before re-running; do not assume this was a no-op.'
    )
  }
  const ok = typed.length >= body.length * 0.95
  console.log(`   editor holds ${typed.length}/${body.length} chars ${ok ? 'ok' : 'SHORT'}`)
  if (!ok) throw new Error('composer did not receive the full caption — not publishing')

  const buttons = await page.$$('>>> button')
  let btnEl = null
  for (const b of buttons) {
    const info = await b.evaluate((el) => ({ t: (el.innerText || '').trim(), d: el.disabled }))
    if (info.t === 'Post' && !info.d) { btnEl = b; break }
  }
  if (!btnEl) throw new Error('Post button not found or still disabled')
  await btnEl.click()
  await new Promise((r) => setTimeout(r, 8000))

  // ---- first comment -------------------------------------------------------
  // The post is already public at this point. Everything below is additive and
  // must fail closed: the only failure that matters here is commenting on the
  // WRONG post, which is unrecoverable and visible. So the post is identified by
  // its own opening text before a single key is typed, and anything short of a
  // positive match skips the comment and tells the operator to add it by hand.
  if (firstComment) {
    try {
      const fingerprint = body.slice(0, 60)
      await page.goto('https://www.linkedin.com/in/me/recent-activity/all/', { waitUntil: 'domcontentloaded' })
      await new Promise((r) => setTimeout(r, 6000))

      const posts = await page.$$('>>> div.feed-shared-update-v2, >>> div[data-urn]')
      let target = null
      for (const el of posts) {
        const txt = await el.evaluate((n) => (n.innerText || '').trim()).catch(() => '')
        if (txt.includes(fingerprint)) { target = el; break }
        if (target) break
      }
      if (!target) {
        console.log('   first comment SKIPPED — could not positively identify the post just published.')
        console.log(`   add it by hand: ${firstComment}`)
      } else {
        const btns = await target.$$('>>> button')
        let commentBtn = null
        for (const b of btns) {
          const label = await b.evaluate((el) => ((el.getAttribute('aria-label') || el.innerText || '')).trim())
          if (/^comment$/i.test(label)) { commentBtn = b; break }
        }
        if (!commentBtn) throw new Error('comment control not found on the identified post')
        await commentBtn.click()
        await new Promise((r) => setTimeout(r, 3000))

        const box = await target.$('>>> div.ql-editor[contenteditable="true"]')
        if (!box) throw new Error('comment editor not found')
        await box.click()
        await box.type(firstComment, { delay: 1 })
        await new Promise((r) => setTimeout(r, 2000))

        const shot2 = `/tmp/linkedin-${item.id.replace(/\W+/g, '-')}-comment.png`
        await page.screenshot({ path: shot2 })
        console.log(`   comment screenshot ${shot2}`)

        const typedComment = await box.evaluate((el) => el.innerText.trim()).catch(() => null)
        if (typedComment !== firstComment) {
          throw new Error('comment box did not receive the exact text — not submitting')
        }
        // Two things were wrong here on the first live run (2026-08-23), and
        // only fixing both submits the comment.
        //
        // The label is "Comment". "Post"/"Reply" is what this was written for
        // and neither string appears, so the scan found nothing and left the
        // comment typed but unsubmitted under a post that was already public.
        //
        // And the scan has to be scoped to the comment FORM, not the post. The
        // post's own action bar carries a "Comment" button — the toggle that
        // opens the box — and it comes first in document order, so a
        // whole-post scan clicks the toggle and reports success. Walk up from
        // the editor instead and take the last enabled match inside the first
        // ancestor that has one.
        const found = await box.evaluate((el) => {
          const ok = (b) => /^(comment|post|reply)$/i.test((b.innerText || '').trim()) && !b.disabled
          let node = el
          for (let i = 0; i < 8 && node; i++) {
            node = node.parentElement
            if (!node) break
            const hits = [...node.querySelectorAll('button')].filter(ok)
            if (hits.length) {
              hits[hits.length - 1].setAttribute('data-lz-submit', '1')
              return true
            }
          }
          return false
        })
        if (!found) throw new Error('comment submit button not found inside the comment form')
        const submit = await target.$('>>> button[data-lz-submit="1"]')
        if (!submit) throw new Error('could not re-acquire the comment submit button')
        await submit.click()
        await new Promise((r) => setTimeout(r, 6000))

        // Verify rather than assume. Clicking the wrong control also "succeeds".
        const landed = await target.evaluate((n) => (n.innerText || '')).catch(() => '')
        if (!landed.includes(firstComment.slice(0, 40))) {
          throw new Error('clicked submit but the comment is not visible under the post')
        }
        console.log('   first comment posted')
      }
    } catch (err) {
      // Never rethrow: the post itself succeeded and must still be recorded as
      // posted, or a retry would publish it twice.
      console.log(`   first comment FAILED (${err.message}) — post is live; add the comment by hand:`)
      console.log(`   ${firstComment}`)
    }
  }

  item.routes.linkedin.state = 'posted'
  item.routes.linkedin.postedAt = today
  // indent 1, matching build-queue.mjs's own write. At indent 2 this rewrote
  // every one of the file's ~11k lines on each post, burying the three-line
  // state change in a whole-file diff.
  writeFileSync(QUEUE, JSON.stringify(queue, null, 1) + '\n')
  console.log('   published, recorded in queue.json')
  await page.close()
}

await browser.disconnect()
