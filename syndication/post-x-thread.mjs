#!/usr/bin/env node
// Post a numbered thread to X by driving the composer in browser-box.
//
//   node syndication/post-x-thread.mjs --file <path> --dry   # fill + screenshot, DO NOT publish
//   node syndication/post-x-thread.mjs --file <path>         # publish the thread
//
// X is not in the syndication routing table and has no queue entries — see the
// README's "Other platforms" section, which evaluated dev.to and Bluesky and
// never took X up. This is a one-off runner, deliberately not wired into
// queue.json, so adding it does not silently create a fourth channel to feed.
//
// Input format: the file is split on lines beginning "<n>/", and that marker is
// stripped. Each remaining chunk becomes one post in the thread.
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

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null }
const DRY = has('--dry')
const file = val('--file')
if (!file) { console.error('pass --file <path>'); process.exit(1) }

const parts = readFileSync(file, 'utf8')
  .split(/\n(?=\d+\/)/)
  .map((p) => p.trim().replace(/^\d+\/\s*/, '').trim())
  .filter(Boolean)

const over = parts.filter((p) => p.length > 280)
if (over.length) {
  console.error(`${over.length} post(s) exceed 280 characters — not posting.`)
  process.exit(1)
}
console.log(`${DRY ? 'DRY  ' : 'post '} ${file}`)
console.log(`   ${parts.length} posts, max ${Math.max(...parts.map((p) => p.length))} chars`)

const browser = await puppeteer.connect({
  browserURL: `http://127.0.0.1:${process.env.BROWSE_PORT || 9400}`,
  defaultViewport: null,
})

const page = await browser.newPage()
await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 6000))

// Confirm which account is composing before a single keystroke goes in.
const who = await page.evaluate(() => {
  const el = document.querySelector('[data-testid=SideNav_AccountSwitcher_Button]')
  return el ? (el.innerText || '').split('\n').pop() : null
})
console.log(`   composing as ${who ?? 'unknown'}`)

// X keeps more than one composer in the DOM at once — the inline one and the
// modal both expose data-testid="tweetTextarea_0". document.querySelector picks
// whichever is first, which is not necessarily the one on screen, so every
// lookup here filters to the element that actually has a box.
const visible = async (selector) => {
  for (const h of await page.$$(selector)) {
    const box = await h.boundingBox()
    if (box && box.width > 0 && box.height > 0) return h
  }
  return null
}

for (let i = 0; i < parts.length; i++) {
  let box = null
  for (let t = 0; t < 20 && !box; t++) {
    box = await visible(`[data-testid="tweetTextarea_${i}"]`)
    if (!box) await new Promise((r) => setTimeout(r, 500))
  }
  if (!box) throw new Error(`composer field ${i} not found`)
  await box.click()
  // Real keystrokes: the Draft.js editor only updates its model on input events.
  await box.type(parts[i], { delay: 1 })
  await new Promise((r) => setTimeout(r, 800))

  if (i < parts.length - 1) {
    // "Add post" only renders once the current field has content.
    const add = await visible('[data-testid=addButton]')
    if (!add) throw new Error(`could not add post ${i + 2} to the thread`)
    await add.click()
    await new Promise((r) => setTimeout(r, 1400))
  }
}

await new Promise((r) => setTimeout(r, 4000))  // let the link card attach
const shot = val('--shot') || '/tmp/x-thread.png'
await page.screenshot({ path: shot })
console.log(`   screenshot ${shot}`)

if (DRY) {
  console.log('   --dry: composer left open, nothing published')
  await browser.disconnect()
  process.exit(0)
}

const postBtn = await visible('[data-testid=tweetButton]')
if (!postBtn) throw new Error('Post button not found')
if (await postBtn.evaluate((el) => el.getAttribute('aria-disabled') === 'true')) {
  throw new Error('Post button is disabled — thread incomplete')
}
await postBtn.click()
await new Promise((r) => setTimeout(r, 9000))
console.log('   published')
await browser.disconnect()
