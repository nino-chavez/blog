import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('native Substack schedules retain their dates and are not manual publishing work', () => {
  const root = mkdtempSync(join(tmpdir(), 'syndication-native-schedule-test-'))
  try {
    const blog = join(root, 'blog')
    const here = join(blog, 'syndication')
    const content = join(blog, 'astro-build/src/content/blog')
    mkdirSync(here, { recursive: true })
    mkdirSync(content, { recursive: true })
    const builder = join(here, 'build-queue.mjs')
    copyFileSync(new URL('./build-queue.mjs', import.meta.url), builder)
    const clock = join(root, 'clock.mjs')
    writeFileSync(clock, `const RealDate = Date; globalThis.Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : ['2026-10-10T12:00:00-05:00'])) }
      static now() { return new RealDate('2026-10-10T12:00:00-05:00').getTime() }
    };`)
    const fixtures = [
      ['scheduled-fresh', 'Native fresh fixture', '2026-10-10', '2026-10-11', true],
      ['scheduled-old', 'Native older fixture', '2025-01-01', '2026-11-01', true],
      ['manual-draft', 'Manual draft fixture', '2026-10-10', '2026-10-12', false],
      ['new-piece', 'Unscheduled fixture', '2026-10-10', null, false],
    ]
    for (const [slug, title, publishedAt] of fixtures) {
      writeFileSync(join(content, `${slug}.mdx`), `---\ntitle: "${title}"\npublishedAt: "${publishedAt}"\nstatus: "published"\n---\nSynthetic test content, not a publication.\n`)
    }
    const items = fixtures.filter((f) => f[3]).map(([slug, title, , date, native]) => ({
      id: `blog/${slug}`, title, routes: {
        substack: { mode: 'full', state: 'draft', scheduledFor: date, pinnedFor: date,
          postId: 42, url: 'https://example.test/draft',
          ...(native ? { platformState: 'scheduled', scheduledAt: `${date}T14:00:00Z` } : {}) },
      },
    }))
    writeFileSync(join(here, 'queue.json'), JSON.stringify({ items }))
    const run = (...args) => execFileSync(process.execPath, ['--import', clock, builder, ...args], {
      cwd: blog, env: { ...process.env, TZ: 'America/Chicago' }, encoding: 'utf8',
      input: '', timeout: 10000,
    })
    run()
    const queue = JSON.parse(readFileSync(join(here, 'queue.json'), 'utf8'))
    for (const [slug, , , date] of fixtures.filter((f) => f[4])) {
      const route = queue.items.find((i) => i.id === `blog/${slug}`).routes.substack
      assert.equal(route.state, 'draft')
      assert.equal(route.platformState, 'scheduled')
      assert.equal(route.scheduledFor, date)
      assert.equal(route.backfill, undefined)
    }
    const freshSlots = queue.items.filter((i) => !i.routes.substack.platformState).map((i) => i.routes.substack.scheduledFor)
    assert.ok(!freshSlots.includes('2026-10-11'), 'the native release reserves its date')
    const before = readFileSync(join(here, 'queue.json'), 'utf8')
    const due = run('--due', '--days', '40')
    assert.doesNotMatch(due, /Native fresh fixture|Native older fixture/)
    assert.match(due, /Manual draft fixture.*\[drafted — publish it\]/)
    assert.equal(readFileSync(join(here, 'queue.json'), 'utf8'), before, '--due remains read-only')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
