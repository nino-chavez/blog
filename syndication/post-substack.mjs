#!/usr/bin/env node
// Post a queued Substack item by driving the editor in browser-box.
//
//   node syndication/post-substack.mjs --dry --id <queue-id>   # fill a draft, screenshot, DO NOT publish
//   node syndication/post-substack.mjs --id <queue-id>         # fill and publish (EMAILS SUBSCRIBERS)
//   node syndication/post-substack.mjs --no-email --id <id>    # publish to the archive, no email
//
// --no-email is what the 143-entry backfill needs: it reaches entry parity with
// the blog without sending 143 pieces of mail. It fails closed — if the toggle
// or the button label cannot be confirmed, it publishes nothing.
//   node syndication/post-substack.mjs --due                   # everything due today or earlier
//
// There is no Substack API credential (see README). This drives the signed-in
// profile inside browser-box:  browser-box start --profile social   (CDP 9400)
//
// mode `full` sends the body across. Rather than re-render MDX, it lifts the
// already-rendered `.prose` block from the live page and pastes it as HTML —
// Substack's editor is TipTap/ProseMirror, which converts pasted HTML into real
// headings, code blocks, tables and quotes. Assigning innerHTML instead would
// leave ProseMirror's document model empty.
//
// PUBLISHING EMAILS SUBSCRIBERS AND CANNOT BE UNSENT. --dry is the default
// posture for anything you have not eyeballed.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { homedir } from 'node:os'

const browseHome = process.env.BROWSE_TOOL_HOME || resolve(homedir(), 'Workspace/dev/tools/browse-tool')
const puppeteerPath = resolve(browseHome, 'node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')
if (!existsSync(puppeteerPath)) {
  console.error(`puppeteer-core not found under ${browseHome}. Install browse-tool, or set BROWSE_TOOL_HOME.`)
  process.exit(1)
}
const puppeteer = (await import(pathToFileURL(puppeteerPath).href)).default

const HERE = dirname(fileURLToPath(import.meta.url))
const QUEUE = resolve(HERE, 'queue.json')
const PORT = process.env.BROWSE_PORT || 9400
const PUB = process.env.SUBSTACK_PUB || 'https://signaldispatch.substack.com'
// Read the body from the deploy preview: the apex bot-blocks headless Chrome.
const ORIGIN = process.env.BLOG_ORIGIN || 'https://ninochavez-blog.pages.dev'
const today = new Date().toLocaleDateString('en-CA') // local date; toISOString is UTC and rolls over at 19:00 CDT

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null }
const NO_EMAIL = has('--no-email')
const DRY = has('--dry')

const queue = JSON.parse(readFileSync(QUEUE, 'utf8'))
const wantId = val('--id')
const targets = queue.items.filter((i) => {
  const r = i.routes.substack
  if (!r || r.state !== 'eligible') return false
  if (wantId) return i.id === wantId
  if (has('--due')) return (r.scheduledFor ?? '9999') <= today
  // Backfill entries carry no date on purpose — parity is a run, not a drip —
  // so --due can never reach them. `full` only: this script always lifts and
  // pastes the body, and a `link` item is marked that way precisely because its
  // body does not survive Substack's editor. Sending one here would publish the
  // broken paste the mode exists to prevent.
  if (has('--backfill')) return r.backfill === true && r.mode === 'full'
  return false
})

const LIMIT = Number(val('--limit') || 0)
if (LIMIT > 0) targets.length = Math.min(targets.length, LIMIT)

if (!targets.length) {
  console.log('nothing selected — pass --id <queue-id> or --due')
  process.exit(0)
}

const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${PORT}`, defaultViewport: null })

for (const item of targets) {
  const mode = item.routes.substack.mode
  console.log(`\n${DRY ? 'DRY  ' : 'post '} ${item.id}  (${mode})`)

  // 1. Lift the rendered body. Reading .innerHTML in-page means the browser has
  //    already parsed the nesting; a regex over the raw response cannot close
  //    the div correctly.
  const src = await browser.newPage()
  const path = new URL(item.url).pathname
  await src.goto(ORIGIN + path, { waitUntil: 'domcontentloaded' })

  // Poll for the body instead of sleeping a fixed 2.5s. Fiction pages hydrate
  // slower than that, and a fixed wait turns "not ready yet" into "no content
  // here" — indistinguishable from a genuinely missing container, which is how
  // this presented when it killed a 50-item backfill run on entry seven.
  //
  // Two containers, because fiction renders into `.fiction-prose` rather than
  // the `.prose` every other collection uses. `.prose` stays first so nothing
  // about the existing collections changes.
  const BODY_SEL = '.prose, .fiction-prose'
  await src
    .waitForFunction(
      (sel) => {
        const el = document.querySelector(sel)
        return el && (el.innerText || '').trim().split(/\s+/).length > 50
      },
      { timeout: 25000, polling: 500 },
      BODY_SEL
    )
    .catch(() => {})

  const { html, text, counts } = await src.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return { html: '', text: '', counts: {} }
    const clone = el.cloneNode(true)
    const tableCount = clone.querySelectorAll('table').length

    // Substack's paste handler discards table structure — a two-column table
    // arrives as "ServerToolschrome-devtools-mcp29", one unreadable run of text.
    // Code blocks survive intact, so render each table as aligned monospace text
    // inside a <pre>. Whitepapers use tables heavily, so this is not one-off.
    for (const t of clone.querySelectorAll('table')) {
      const rows = [...t.querySelectorAll('tr')].map((tr) =>
        [...tr.querySelectorAll('th,td')].map((c) => c.innerText.trim()),
      )
      if (!rows.length) continue
      const cols = Math.max(...rows.map((r) => r.length))
      const width = Array.from({ length: cols }, (_, c) =>
        Math.max(...rows.map((r) => (r[c] || '').length)),
      )
      const line = (r) => r.map((v, c) => (v || '').padEnd(width[c])).join('  ').trimEnd()
      const out = [line(rows[0]), width.map((w) => '-'.repeat(w)).join('  '), ...rows.slice(1).map(line)]
      const pre = document.createElement('pre')
      pre.textContent = out.join('\n')
      t.replaceWith(pre)
    }

    // <PullQuote> renders as <figure><blockquote><div>text</div><figcaption>.
    // Substack's paste handler discards the <figure> and takes its contents
    // with it, so the quote's sentence never arrives. Caught 2026-08-10 on
    // blog/the-ai-analyst: 1653 words in, 1634 out, and the only prose missing
    // was the pull quote — which is unique copy there, not a repeat of a body
    // line, so it was a silently lost sentence rather than a lost duplicate.
    //
    // Rebuild each one as a bare <blockquote> of paragraphs, which pastes
    // intact. Only figures that actually contain a blockquote are touched, so
    // image figures keep whatever handling they already get.
    let quoteCount = 0
    for (const f of clone.querySelectorAll('figure')) {
      const inner = f.querySelector('blockquote')
      if (!inner) continue
      const lines = inner.innerText.split('\n').map((l) => l.trim()).filter(Boolean)
      if (!lines.length) continue
      const bq = document.createElement('blockquote')
      for (const l of lines) {
        const p = document.createElement('p')
        p.textContent = l
        bq.appendChild(p)
      }
      f.replaceWith(bq)
      quoteCount++
    }

    return {
      html: clone.innerHTML,
      text: clone.innerText,
      counts: {
        h2: clone.querySelectorAll('h2').length,
        pre: clone.querySelectorAll('pre').length,
        table: tableCount,
        quote: clone.querySelectorAll('blockquote').length,
        pullquote: quoteCount,
      },
    }
  }, BODY_SEL)
  await src.close()
  if (!html) throw new Error(`${item.id}: no body block (${BODY_SEL}) found at ${ORIGIN + path}`)
  console.log(`   source ${text.split(/\s+/).length} words — h2:${counts.h2} pre:${counts.pre} (${counts.table} table->pre) quote:${counts.quote} (${counts.pullquote} figure->quote)`)

  // 2. Open a fresh draft.
  const page = await browser.newPage()
  await page.goto(`${PUB}/publish/post?type=newsletter`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 9000))

  const titleEl = await page.waitForSelector('textarea[data-testid="post-title"]', { timeout: 30000 })
  await titleEl.click()
  await titleEl.type(item.title, { delay: 5 })

  // 3. Paste the body as HTML. ProseMirror only ingests content through its
  //    paste handler, so hand it a real ClipboardEvent carrying text/html.
  const editor = await page.waitForSelector('div[data-testid="editor"][contenteditable="true"]', { timeout: 30000 })
  await editor.click()
  await new Promise((r) => setTimeout(r, 800))
  await page.evaluate((html, text) => {
    const el = document.querySelector('div[data-testid="editor"][contenteditable="true"]')
    el.focus()
    const dt = new DataTransfer()
    dt.setData('text/html', html)
    dt.setData('text/plain', text)
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
  }, html, text)
  await new Promise((r) => setTimeout(r, 5000))

  const got = await page.$eval('div[data-testid="editor"]', (el) => ({
    words: el.innerText.trim().split(/\s+/).length,
    h2: el.querySelectorAll('h1,h2,h3').length,
    pre: el.querySelectorAll('pre').length,
    table: el.querySelectorAll('table').length,
  }))
  console.log(`   editor  ${got.words} words — headings:${got.h2} pre:${got.pre} table:${got.table}`)

  const shot = `/tmp/substack-${item.id.replace(/\W+/g, '-')}.png`
  await page.screenshot({ path: shot, fullPage: false })
  console.log(`   screenshot ${shot}`)

  if (got.words < text.split(/\s+/).length * 0.9) {
    throw new Error('editor received noticeably less than the source — not publishing')
  }

  if (DRY) {
    console.log(`   --dry: draft left open at ${page.url()} — nothing published, no email sent`)
    continue
  }

  // A backfill entry exists to reach archive parity, not to be mailed. Refusing
  // here rather than trusting the operator to remember the flag on every run.
  if (item.routes.substack.backfill && !NO_EMAIL) {
    throw new Error(
      `${item.id} is a backfill entry; publishing it would email subscribers a piece from the archive. ` +
        'Re-run with --no-email.'
    )
  }

  // 4. Publish. Substack's flow is Continue -> a review modal -> the send button.
  const clickText = async (labels) => {
    const handles = await page.$$('button, [role="button"]')
    for (const h of handles) {
      const t = await h.evaluate((el) => (el.innerText || '').trim())
      if (labels.some((l) => t === l || t.startsWith(l))) { await h.click(); return t }
    }
    return null
  }
  const first = await clickText(['Continue', 'Publish'])
  if (!first) throw new Error('could not find Continue/Publish')
  await new Promise((r) => setTimeout(r, 6000))

  // --- email suppression -------------------------------------------------
  // The review modal's Delivery section owns whether subscribers get mail. The
  // control is NOT the input[type=checkbox] in that block — that input is a
  // hidden proxy React ignores. Clicking it flips `.checked` in the DOM while
  // the app's state, and the rendered tick, stay exactly where they were.
  // Verified 2026-08-10 by screenshot: input read `checked:false` while the box
  // was still visibly green. Building on that reading would have emailed the
  // whole backfill while the code reported it had not.
  //
  // The real widget is a Radix-style button carrying `data-track-input`, and
  // `data-state` is the authoritative value.
  const EMAIL_TOGGLE = 'button[role="checkbox"][data-track-input="send_email"]'
  const emailState = () =>
    page.$eval(EMAIL_TOGGLE, (el) => el.getAttribute('data-state')).catch(() => null)

  if (NO_EMAIL) {
    const before = await emailState()
    if (before === null) throw new Error('delivery toggle not found — refusing to publish blind')
    if (before === 'checked') {
      const el = await page.$(EMAIL_TOGGLE)
      await el.click()
      await new Promise((r) => setTimeout(r, 2500))
    }
    // Two signals, and both must agree before anything is clicked. The toggle is
    // our own action; the button label is Substack's independent report of what
    // it is about to do. Substack renames it "Publish now" when mail is off.
    const after = await emailState()
    const labels = await page.$$eval('button,[role=button]', (els) =>
      els.map((e) => (e.innerText || '').trim()).filter((t) => /^(send|publish)/i.test(t))
    )
    const emailsOff = after === 'unchecked' && labels.some((t) => t === 'Publish now')
    const stillSends = labels.some((t) => /^Send to everyone/i.test(t))
    if (!emailsOff || stillSends) {
      throw new Error(
        `--no-email could not be confirmed (toggle=${after}, buttons=${JSON.stringify(labels)}). ` +
          'NOT publishing. An unsent email cannot be recalled, so this fails closed.'
      )
    }
    console.log('   email suppressed — toggle unchecked, button reads "Publish now"')
  }

  // Pick the button that matches the mode we are actually in, rather than taking
  // whichever send-ish label appears first. The old list tried "Send to everyone
  // now" ahead of "Publish now", so it always took the emailing branch.
  const wanted = NO_EMAIL ? ['Publish now'] : ['Send to everyone now']
  const second = await clickText(wanted)
  if (!second) throw new Error(`expected button ${wanted[0]} not present — not publishing`)
  await new Promise((r) => setTimeout(r, 8000))
  console.log(`   clicked ${first} -> ${second}`)

  await page.screenshot({ path: shot.replace('.png', '-after.png') })
  item.routes.substack.state = 'posted'
  item.routes.substack.postedAt = today
  item.routes.substack.url = page.url()
  writeFileSync(QUEUE, JSON.stringify(queue, null, 2))
  console.log('   published, recorded in queue.json')
  // Close the editor tab. A single-item run could leak it harmlessly; a 53-item
  // backfill leaks 53 live ProseMirror editors into one container and degrades
  // or kills the browser partway, leaving a half-migrated archive. The --dry
  // path above deliberately leaves its draft open, which is why this sits here
  // rather than in a finally.
  await page.close().catch(() => {})
  // Pace the run. Fifty-plus publishes back to back is a burst no human makes,
  // and the cost of being rate-limited mid-backfill is a half-migrated archive.
  if (targets.length > 1) await new Promise((r) => setTimeout(r, 6000))
}

await browser.disconnect()
