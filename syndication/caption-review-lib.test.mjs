import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import { commentLinksToSource } from './caption-review-lib.mjs'

test('a first comment links to its selected canonical source, not another article or URL substring', () => {
  const demo = 'https://ninochavez.co/demos/applied/one-capture-two-outputs'
  const blog = 'https://ninochavez.co/blog/making-club-videos-without-opening-an-editor'
  for (const source of [demo, blog]) {
    assert.equal(commentLinksToSource(source, source), true)
    assert.equal(commentLinksToSource(`${source}/?utm_source=linkedin#example`, source), true)
    assert.equal(commentLinksToSource(`Source: ${source}\n`, source), true)
    assert.equal(commentLinksToSource(`${source}-different`, source), false)
    assert.equal(commentLinksToSource(`https://example.test/?redirect=${source}`, source), false)
    assert.equal(commentLinksToSource(source.replace('ninochavez.co', 'ninochavez.co.example.test'), source), false)
  }
  assert.equal(commentLinksToSource(blog, demo), false)
  assert.equal(commentLinksToSource(demo, blog), false)
  assert.equal(commentLinksToSource('not a link', demo), false)
  assert.equal(commentLinksToSource(demo, 'not a source URL'), false)
})

test('prose punctuation and the verified www redirect still link to the selected source', () => {
  const source = 'https://ninochavez.co/demos/applied/one-capture-two-outputs'
  for (const comment of [
    `Read it here: ${source}.`,
    `(${source})`,
    `[post](${source})`,
    `"${source}"`,
    `{${source}}`,
    `${source}.,;:!?`,
    source.replace('ninochavez.co', 'www.ninochavez.co'),
  ]) {
    assert.equal(commentLinksToSource(comment, source), true, comment)
  }
  assert.equal(commentLinksToSource(source, source.replace('ninochavez.co', 'www.ninochavez.co')), true)
  assert.equal(commentLinksToSource(source.replace('https:', 'http:'), source), false)
  assert.equal(commentLinksToSource(source.replace('ninochavez.co', 'www.ninochavez.co.example.test'), source), false)
  assert.equal(commentLinksToSource('https://www.example.test/post', 'https://example.test/post'), false)
})

test('existing queued first-comment captions keep their valid source links', () => {
  const queue = JSON.parse(readFileSync(new URL('./queue.json', import.meta.url), 'utf8'))
  let checked = 0
  for (const item of queue.items) {
    const caption = item.routes.linkedin?.caption
    if (!caption) continue
    const file = new URL(`./${caption}`, import.meta.url)
    if (!existsSync(file)) continue
    const comment = readFileSync(file, 'utf8').split(/\n---\s*first-comment\s*---\s*(?:\n|$)/)[1]?.trim()
    if (!comment) continue
    assert.equal(commentLinksToSource(comment, item.url), true, item.id)
    checked++
  }
  assert.ok(checked >= 4, 'the approved outcome batch and existing captions are exercised')
})
