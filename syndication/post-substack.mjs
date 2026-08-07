#!/usr/bin/env node
// Post a queued Substack item by driving the editor in browser-box.
//
//   node syndication/post-substack.mjs --dry --id <queue-id>   # fill a draft, screenshot, DO NOT publish
//   node syndication/post-substack.mjs --id <queue-id>         # fill and publish
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
const today = new Date().toISOString().slice(0, 10)

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null }
const DRY = has('--dry')

const queue = JSON.parse(readFileSync(QUEUE, 'utf8'))
const wantId = val('--id')
const targets = queue.items.filter((i) => {
  const r = i.routes.substack
  if (!r || r.state !== 'eligible') return false
  if (wantId) return i.id === wantId
  if (has('--due')) return (r.scheduledFor ?? '9999') <= today
  return false
})

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
  await new Promise((r) => setTimeout(r, 2500))
  const { html, text, counts } = await src.evaluate(() => {
    const el = document.querySelector('.prose')
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

    return {
      html: clone.innerHTML,
      text: clone.innerText,
      counts: {
        h2: clone.querySelectorAll('h2').length,
        pre: clone.querySelectorAll('pre').length,
        table: tableCount,
        quote: clone.querySelectorAll('blockquote').length,
      },
    }
  })
  await src.close()
  if (!html) throw new Error(`${item.id}: no .prose block found at ${ORIGIN + path}`)
  console.log(`   source ${text.split(/\s+/).length} words — h2:${counts.h2} pre:${counts.pre} (${counts.table} table->pre) quote:${counts.quote}`)

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

  // 4. Publish. Substack's flow is Continue -> Send/Publish on a review screen.
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
  await new Promise((r) => setTimeout(r, 5000))
  const second = await clickText(['Send to everyone now', 'Publish now', 'Send', 'Publish'])
  await new Promise((r) => setTimeout(r, 8000))
  console.log(`   clicked ${first} -> ${second ?? '(no second step)'}`)

  await page.screenshot({ path: shot.replace('.png', '-after.png') })
  item.routes.substack.state = 'posted'
  item.routes.substack.postedAt = today
  item.routes.substack.url = page.url()
  writeFileSync(QUEUE, JSON.stringify(queue, null, 2))
  console.log('   published, recorded in queue.json')
}

await browser.disconnect()
