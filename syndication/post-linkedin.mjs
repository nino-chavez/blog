#!/usr/bin/env node
// Post a queued LinkedIn item by driving the composer in browser-box.
//
//   node syndication/post-linkedin.mjs --dry            # open composer, fill, screenshot, DO NOT publish
//   node syndication/post-linkedin.mjs --id <queue-id>  # publish that one
//   node syndication/post-linkedin.mjs --due            # publish everything due today or earlier
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
const ROOT = resolve(HERE, '..')
const QUEUE = resolve(HERE, 'queue.json')
const PORT = process.env.BROWSE_PORT || 9400
const today = new Date().toISOString().slice(0, 10)

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null }
const DRY = has('--dry')

const queue = JSON.parse(readFileSync(QUEUE, 'utf8'))

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

const browserURL = `http://127.0.0.1:${PORT}`
const browser = await puppeteer.connect({ browserURL, defaultViewport: null })

// Find a button/element whose visible text matches, without depending on
// LinkedIn's generated class names, which change without notice.
const clickByText = async (page, texts, tag = '*') => {
  const handle = await page.evaluateHandle(
    (tag, texts) => {
      const els = [...document.querySelectorAll(tag)]
      return els.find((el) => {
        const t = (el.innerText || el.getAttribute('aria-label') || '').trim()
        return texts.some((x) => t === x || t.startsWith(x))
      }) || null
    },
    tag,
    texts,
  )
  const el = handle.asElement()
  if (!el) return false
  await el.click()
  return true
}

for (const item of targets) {
  const body = readFileSync(resolve(HERE, item.routes.linkedin.caption), 'utf8').trim()
  console.log(`\n${DRY ? 'DRY  ' : 'post '} ${item.id}`)
  console.log(`   ${body.split(/\s+/).length} words, ${body.length} chars`)

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

  const typed = await page.$eval(EDITOR_SEL, (el) => el.innerText.trim())
  const ok = typed.length >= body.length * 0.95
  console.log(`   editor holds ${typed.length}/${body.length} chars ${ok ? 'ok' : 'SHORT'}`)
  if (!ok) throw new Error('composer did not receive the full caption — not publishing')

  if (DRY) {
    console.log('   --dry: composer left open, nothing published')
    continue
  }

  const buttons = await page.$$('>>> button')
  let btnEl = null
  for (const b of buttons) {
    const info = await b.evaluate((el) => ({ t: (el.innerText || '').trim(), d: el.disabled }))
    if (info.t === 'Post' && !info.d) { btnEl = b; break }
  }
  if (!btnEl) throw new Error('Post button not found or still disabled')
  await btnEl.click()
  await new Promise((r) => setTimeout(r, 8000))

  item.routes.linkedin.state = 'posted'
  item.routes.linkedin.postedAt = today
  writeFileSync(QUEUE, JSON.stringify(queue, null, 2))
  console.log('   published, recorded in queue.json')
  await page.close()
}

await browser.disconnect()
