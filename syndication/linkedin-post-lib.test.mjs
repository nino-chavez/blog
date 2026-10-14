import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fingerprintOf, pickPostUrl, newPostUrl, commentAlsoInBody } from './linkedin-post-lib.mjs'

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
