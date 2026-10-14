import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fingerprintOf, pickPostUrl } from './linkedin-post-lib.mjs'

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
