import assert from 'node:assert/strict'
import { test } from 'node:test'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { fingerprintOf, pickPostUrl, newPostUrl, commentAlsoInBody, scanInPage } from './linkedin-post-lib.mjs'

test('the fingerprint is the first line only, even when that line is short', () => {
  const body = 'People shouldn\'t have to learn this.\n\nSecond paragraph starts here and is long.'
  assert.equal(fingerprintOf(body), "People shouldn't have to learn this.")
})

test('the fingerprint caps a long first line at 60 characters and collapses whitespace', () => {
  const body = 'A family member was copying entries   from a sheet in one browser tab into forms in another.'
  const fp = fingerprintOf(body)
  assert.equal(fp, 'A family member was copying entries from a sheet in one brow')
  assert.ok(fp.length <= 60)
})

test('the fingerprint skips leading blank lines', () => {
  assert.equal(fingerprintOf('\n\n  First real line.\nNext'), 'First real line.')
})

test('exactly one distinct post URL identifies the post, ignoring query strings and repeats', () => {
  const u = 'https://www.linkedin.com/feed/update/urn:li:activity:7516185954521505794/'
  assert.equal(pickPostUrl([u, u + '?utm_source=share', u]), u)
})

test('no URL, or two different posts, is no answer', () => {
  const a = 'https://www.linkedin.com/feed/update/urn:li:activity:1/'
  const b = 'https://www.linkedin.com/feed/update/urn:li:activity:2/'
  assert.equal(pickPostUrl([]), null)
  assert.equal(pickPostUrl([a, b]), null)
  assert.equal(pickPostUrl([b, a, a]), null)
})

test('a post that existed before is never the new post', () => {
  const old = 'https://www.linkedin.com/feed/update/urn:li:activity:1/'
  const fresh = 'https://www.linkedin.com/feed/update/urn:li:activity:2/'
  // The new post has not appeared yet; only the old one carries the line.
  assert.equal(newPostUrl([old], [old]), null)
  // Both visible: the old one is excluded, the new one is the answer.
  assert.equal(newPostUrl([old, fresh + '?x=1'], [old]), fresh)
  // Nothing excluded and two candidates: still no answer.
  assert.equal(newPostUrl([old, fresh], []), null)
})

test('a comment whose text is also in the body cannot be verified, whitespace aside', () => {
  const link = 'https://ninochavez.co/blog/x'
  assert.equal(commentAlsoInBody(`Read it here:\n${link}`, link), true)
  assert.equal(commentAlsoInBody('A body with no link.', link), false)
  assert.equal(commentAlsoInBody('Two   lines\nof comment', 'Two lines of comment'), true)
  assert.equal(commentAlsoInBody('Anything', null), false)
})

// scanInPage runs inside LinkedIn's page, so these tests run it against a
// fixture DOM. jsdom is borrowed from browse-tool the way post-linkedin.mjs
// borrows puppeteer-core; BROWSE_TOOL_HOME overrides the path.
const browseHome = process.env.BROWSE_TOOL_HOME || resolve(homedir(), 'Workspace/dev/tools/browse-tool')
const jsdomPath = resolve(browseHome, 'node_modules/jsdom/lib/api.js')
const { JSDOM } = existsSync(jsdomPath) ? createRequire(import.meta.url)(jsdomPath) : {}

const EDITOR = 'div[role="textbox"][aria-label="Text editor for creating comment"]'
const FP = 'Over two weeks this fall, I typed "merge it" to my coding ag'
const LINK = 'https://ninochavez.co/blog/the-hire-who-never-remembers'

function runScan(html, needle, mode) {
  const dom = new JSDOM(html, { url: 'https://www.linkedin.com/feed/update/urn:li:activity:7518060086099881984/' })
  globalThis.document = dom.window.document
  try { return scanInPage(FP, needle, mode, EDITOR) } finally { delete globalThis.document }
}

const nest = (n, inner) => '<div>'.repeat(n) + inner + '</div>'.repeat(n)
const post = (text, extra = '') =>
  `<div role="listitem"><p>${text}</p>${extra}<div role="textbox" aria-label="Text editor for creating comment"></div></div>`
const comment = (text) => `<div class="comments">${nest(10, `<p><span><span><a href="${text}"><strong>${text}</strong></a></span></span></p>`)}</div>`

// Shape of the post's own page on 2026-10-19 (blog/the-hire-who-never-remembers),
// traced live: no /feed/update/ link anywhere on the page, the comment block
// joining the post's listitem four levels up, inside section "Primary content",
// with the sidebars (<aside>) one level above that section.
const pageOct19 = (commentHtml, sidebar = '') => `<html><body><main>
  <section aria-label="Primary content">${nest(6, nest(4, post(FP)) + commentHtml)}</section>
  <aside>${sidebar}</aside><aside></aside>
</main></body></html>`

test('a link-only first comment on a post page with no permalink is found', { skip: !JSDOM && 'jsdom not found' }, () => {
  const html = pageOct19(comment(LINK))
  assert.equal(runScan(html, null, 'posts'), 1)
  assert.equal(runScan(html, LINK, 'has'), 1)
})

test('with no comment, the same page reads as missing, not unknown', { skip: !JSDOM && 'jsdom not found' }, () => {
  assert.equal(runScan(pageOct19(''), LINK, 'has'), 0)
})

test('the link in a sidebar never counts as the comment', { skip: !JSDOM && 'jsdom not found' }, () => {
  assert.equal(runScan(pageOct19('', `<p>${LINK}</p>`), LINK, 'has'), 0)
})

test('the region stops before a second post with its own comment box', { skip: !JSDOM && 'jsdom not found' }, () => {
  const other = `<div role="listitem"><p>Someone else's post</p>${comment(LINK)}<div role="textbox" aria-label="Text editor for creating comment"></div></div>`
  const html = `<html><body><main><section>${nest(3, nest(4, post(FP)) + nest(2, other))}</section></main></body></html>`
  assert.equal(runScan(html, LINK, 'has'), 0)
})

test('the 2026-10-14 layout still works: one permalink, comments in a sibling block', { skip: !JSDOM && 'jsdom not found' }, () => {
  const permalink = '<a href="https://www.linkedin.com/feed/update/urn:li:activity:7516185954521505794/">1h</a>'
  const html = `<html><body><main><section aria-label="Primary content">${nest(6, nest(4, post(FP, permalink)) + comment(LINK))}</section><aside><p>${LINK}</p></aside></main></body></html>`
  assert.equal(runScan(html, LINK, 'has'), 1)
})
