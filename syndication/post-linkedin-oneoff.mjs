#!/usr/bin/env node
// Post a one-off LinkedIn caption that is not a queued blog drip.
//
//   node syndication/post-linkedin-oneoff.mjs --file <path> --dry   # fill + screenshot, DO NOT publish
//   node syndication/post-linkedin-oneoff.mjs --file <path>         # publish
//
// post-linkedin.mjs only reaches items in queue.json, and queue.json is
// generated from blog content. An announcement about a repository has no blog
// source, so it can never be selected there. Same browser-box connection, same
// Quill technique, no queue entry and no ledger write — nothing here is part of
// the drip, so nothing here should pretend to be.
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

const body = readFileSync(file, 'utf8').trim()
console.log(`${DRY ? 'DRY  ' : 'post '} ${file}`)
console.log(`   ${body.split(/\s+/).length} words, ${body.length} chars`)

const browser = await puppeteer.connect({
  browserURL: `http://127.0.0.1:${process.env.BROWSE_PORT || 9400}`,
  defaultViewport: null,
})

const page = await browser.newPage()
await page.goto('https://www.linkedin.com/feed/?shareActive=true', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 8000))

const EDITOR_SEL = '>>> div.ql-editor[contenteditable="true"]'
let editor = null
for (let i = 0; i < 20 && !editor; i++) {
  editor = await page.$(EDITOR_SEL).catch(() => null)
  if (!editor) await new Promise((r) => setTimeout(r, 1000))
}
if (!editor) throw new Error('composer editor not found — is the box still signed in?')

await editor.click()
await editor.type(body, { delay: 1 })
await new Promise((r) => setTimeout(r, 7000))  // let the link preview attach

const shot = val('--shot') || '/tmp/linkedin-oneoff.png'
await page.screenshot({ path: shot })
console.log(`   screenshot ${shot}`)

const typed = await page.$eval(EDITOR_SEL, (el) => el.innerText.trim())
const ok = typed.length >= body.length * 0.95
console.log(`   editor holds ${typed.length}/${body.length} chars ${ok ? 'ok' : 'SHORT'}`)
if (!ok) throw new Error('composer did not receive the full caption — not publishing')

if (DRY) {
  console.log('   --dry: composer left open, nothing published')
  await browser.disconnect()
  process.exit(0)
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
console.log('   published')
await page.close()
await browser.disconnect()
