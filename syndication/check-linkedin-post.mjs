#!/usr/bin/env node
// Read-only: find a LinkedIn post from this profile and say whether its first
// comment is on it. Writes nothing, types nothing, clicks nothing.
//
//   node syndication/check-linkedin-post.mjs --id <queue-id>
//   node syndication/check-linkedin-post.mjs --fingerprint "<first line of the post>"
//   add --comment "<text>" to check for that text instead of the caption's comment
//
// Use it when post-linkedin.mjs reports the comment SKIPPED or FAILED, to get
// the post URL for the ledger and to confirm a hand-added comment landed.
// It imports only the read half of linkedin-post-lib.mjs, never submitComment.
//   browser-box start --profile social      # CDP on 9400

import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { homedir } from 'node:os'
import { splitCaption, fingerprintOf, findPostUrl, openPost, commentAlsoInBody, commentPresent } from './linkedin-post-lib.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null }

let fingerprint = val('--fingerprint')
let firstComment = null
let body = ''
const id = val('--id')
if (id) {
  const queue = JSON.parse(readFileSync(resolve(HERE, 'queue.json'), 'utf8'))
  const item = queue.items.find((i) => i.id === id)
  const cap = item?.routes?.linkedin?.caption
  if (!cap) throw new Error(`${id}: no LinkedIn caption in queue.json`)
  const split = splitCaption(readFileSync(resolve(HERE, cap), 'utf8'))
  fingerprint = fingerprintOf(split.body)
  firstComment = split.firstComment
  body = split.body
}
if (val('--comment')) firstComment = val('--comment')
if (!fingerprint) {
  console.log('pass --id <queue-id> or --fingerprint "<first line of the post>"')
  process.exit(2)
}

const browseHome = process.env.BROWSE_TOOL_HOME || resolve(homedir(), 'Workspace/dev/tools/browse-tool')
const puppeteerPath = resolve(browseHome, 'node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')
if (!existsSync(puppeteerPath)) throw new Error(`puppeteer-core not found under ${browseHome}`)
const puppeteer = (await import(pathToFileURL(puppeteerPath).href)).default
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${process.env.BROWSE_PORT || 9400}`, defaultViewport: null })
const page = await browser.newPage()
let code = 0
try {
  console.log(`fingerprint: ${fingerprint}`)
  const url = await findPostUrl(page, fingerprint, { timeoutMs: Number(val('--timeout') || 45000), log: (m) => console.log(`  ${m}`) })
  console.log(`post: ${url ?? 'NOT IDENTIFIED'}`)
  if (!url) code = 1
  else {
    await openPost(page, url, fingerprint)
    console.log('post page shows the fingerprint: yes')
  }
  if (url && firstComment && commentAlsoInBody(body, firstComment)) {
    console.log('first comment: cannot check, its text is also in the post body')
    code = 1
  } else if (url && firstComment) {
    const present = await commentPresent(page, url, fingerprint, firstComment)
    console.log(`first comment: ${present ? 'present' : 'MISSING'} (${firstComment})`)
    if (!present) code = 1
  }
} finally {
  await page.close().catch(() => {})
  await browser.disconnect()
}
process.exit(code)
