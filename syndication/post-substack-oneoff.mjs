#!/usr/bin/env node
// Post a one-off Substack piece that is not a queued blog drip.
//
//   node syndication/post-substack-oneoff.mjs --file <path> --dry   # fill a draft, screenshot, DO NOT publish
//   node syndication/post-substack-oneoff.mjs --file <path>         # fill and publish
//
// post-substack.mjs lifts an already-rendered `.prose` block from a live blog
// URL. An announcement with no blog post has no such URL, so it can never be
// selected there. Same browser-box connection, same ProseMirror paste
// technique, no queue entry and no ledger write.
//
// Input: first line `TITLE: ...`, then `---`, then markdown-ish paragraphs.
// Only paragraphs and bare links are supported — this is for short framing
// notes, not for sending a whole essay. Use post-substack.mjs for those.
//
// PUBLISHING EMAILS SUBSCRIBERS AND CANNOT BE UNSENT. --dry is the default
// posture for anything you have not eyeballed.
//
//   browser-box start --profile social      # CDP on 9400

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { homedir } from 'node:os'

const browseHome = process.env.BROWSE_TOOL_HOME || resolve(homedir(), 'Workspace/dev/tools/browse-tool')
const puppeteerPath = resolve(browseHome, 'node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')
if (!existsSync(puppeteerPath)) {
  console.error(`puppeteer-core not found under ${browseHome}. Install browse-tool, or set BROWSE_TOOL_HOME.`)
  process.exit(1)
}
const puppeteer = (await import(pathToFileURL(puppeteerPath).href)).default

const PUB = process.env.SUBSTACK_PUB || 'https://signaldispatch.substack.com'
const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null }
const DRY = has('--dry')
const file = val('--file')
if (!file) { console.error('pass --file <path>'); process.exit(1) }

const raw = readFileSync(file, 'utf8')
const titleMatch = raw.match(/^TITLE:\s*(.+)$/m)
if (!titleMatch) { console.error('file must begin with "TITLE: ..."'); process.exit(1) }
const title = titleMatch[1].trim()
const bodyText = raw.split(/^---\s*$/m).slice(1).join('---').trim()

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const html = bodyText
  .split(/\n{2,}/)
  .map((p) => p.trim())
  .filter(Boolean)
  .map((p) => (/^https?:\/\/\S+$/.test(p) ? `<p><a href="${p}">${p}</a></p>` : `<p>${esc(p).replace(/\n/g, ' ')}</p>`))
  .join('')

console.log(`${DRY ? 'DRY  ' : 'post '} ${file}`)
console.log(`   "${title}" — ${bodyText.split(/\s+/).length} words`)


async function publish(page) {
  const clickText = async (labels) => {
    for (const h of await page.$$('button, [role="button"]')) {
      const t = await h.evaluate((el) => (el.innerText || '').trim())
      if (labels.some((l) => t === l || t.startsWith(l))) { await h.click(); return t }
    }
    return null
  }
  const first = await clickText(['Continue', 'Publish'])
  if (!first) throw new Error('could not find Continue/Publish')
  await new Promise((r) => setTimeout(r, 5000))
  const second = await clickText(['Send to everyone now', 'Publish now', 'Send', 'Publish'])
  await new Promise((r) => setTimeout(r, 9000))
  console.log(`   clicked ${first} -> ${second ?? '(no second step)'}`)
  await page.screenshot({ path: (process.argv.includes('--shot') ? process.argv[process.argv.indexOf('--shot')+1] : '/tmp/substack-oneoff.png').replace('.png', '-after.png') })
  console.log(`   published at ${page.url()}`)
}

const browser = await puppeteer.connect({
  browserURL: `http://127.0.0.1:${process.env.BROWSE_PORT || 9400}`,
  defaultViewport: null,
})

const page = await browser.newPage()

// --draft-url publishes a draft this script already filled, instead of opening
// a fresh one. Without it a --dry run followed by a real run leaves an orphan
// draft behind, because /publish/post always mints a new document.
const draftUrl = val('--draft-url')
if (draftUrl) {
  await page.goto(draftUrl, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 9000))
  const words = await page.$eval('div[data-testid="editor"]', (el) => el.innerText.trim().split(/\s+/).length)
  console.log(`   reusing existing draft — ${words} words already in the editor`)
  if (words < bodyText.split(/\s+/).length * 0.9) throw new Error('existing draft is short — not publishing')
  await publish(page)
  await browser.disconnect()
  process.exit(0)
}

await page.goto(`${PUB}/publish/post?type=newsletter`, { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 9000))

const titleEl = await page.waitForSelector('textarea[data-testid="post-title"]', { timeout: 30000 })
await titleEl.click()
await titleEl.type(title, { delay: 5 })

// ProseMirror only ingests content through its paste handler; assigning
// innerHTML leaves the document model empty.
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
}, html, bodyText)
await new Promise((r) => setTimeout(r, 5000))

const got = await page.$eval('div[data-testid="editor"]', (el) => el.innerText.trim().split(/\s+/).length)
const want = bodyText.split(/\s+/).length
console.log(`   editor holds ${got}/${want} words`)
if (got < want * 0.9) throw new Error('editor received noticeably less than the source — not publishing')

const shot = val('--shot') || '/tmp/substack-oneoff.png'
await page.screenshot({ path: shot })
console.log(`   screenshot ${shot}`)

if (DRY) {
  console.log(`   --dry: draft left at ${page.url()} — nothing published, no email sent`)
  await browser.disconnect()
  process.exit(0)
}

await publish(page)
await browser.disconnect()
