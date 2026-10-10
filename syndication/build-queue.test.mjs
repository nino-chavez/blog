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

test('an explicit LinkedIn pick admits an Applied piece without changing the default or origin guard', () => {
  const root = mkdtempSync(join(tmpdir(), 'syndication-applied-pick-test-'))
  try {
    const blog = join(root, 'blog')
    const here = join(blog, 'syndication')
    const content = join(blog, 'astro-build/src/content/blog')
    mkdirSync(here, { recursive: true })
    mkdirSync(content, { recursive: true })
    const builder = join(here, 'build-queue.mjs')
    copyFileSync(new URL('./build-queue.mjs', import.meta.url), builder)
    for (const slug of ['picked', 'unpicked']) {
      const dir = join(root, 'nc-demos/applied', slug)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'meta.json'), JSON.stringify({ title: `${slug} Applied fixture`, date: '2026-10', relatedSessionSlugs: [] }))
      writeFileSync(join(dir, 'deck.html'), '<p>Synthetic fixture, not a publication.</p>')
    }
    writeFileSync(join(content, 'imported.mdx'), '---\ntitle: "Imported LinkedIn fixture"\npublishedAt: "2026-10-10"\nstatus: "published"\nsource: "linkedin"\n---\nSynthetic fixture, not a publication.\n')
    writeFileSync(join(here, 'linkedin-picks.json'), JSON.stringify({ picks: [{ id: 'applied/picked' }, { id: 'blog/imported' }] }))
    writeFileSync(join(here, 'queue.json'), JSON.stringify({ items: [{ id: 'applied/picked', routes: {
      linkedin: { mode: 'skip', state: 'skip', pinnedFor: '2026-11-01', scheduledFor: null },
      substack: { mode: 'link', state: 'draft', platformState: 'scheduled', scheduledFor: '2026-11-01', pinnedFor: '2026-11-01', postId: 42 },
    } }] }))
    execFileSync(process.execPath, [builder], { cwd: blog, env: { ...process.env, TZ: 'America/Chicago' }, encoding: 'utf8', input: '', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'] })
    const queue = JSON.parse(readFileSync(join(here, 'queue.json'), 'utf8'))
    const picked = queue.items.find((i) => i.id === 'applied/picked')
    assert.equal(picked.routes.linkedin.mode, 'native')
    assert.equal(picked.routes.linkedin.state, 'eligible')
    assert.equal(picked.routes.linkedin.scheduledFor, '2026-11-01')
    assert.equal(picked.routes.substack.scheduledFor, '2026-11-01')
    assert.equal(picked.routes.substack.postId, 42)
    assert.equal(queue.items.find((i) => i.id === 'applied/unpicked').routes.linkedin.mode, 'skip')
    const imported = queue.items.find((i) => i.id === 'blog/imported').routes.linkedin
    assert.equal(imported.mode, 'skip')
    assert.equal(imported.reason, 'originated on LinkedIn')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('approved outcome pairs keep LinkedIn pinned to their Substack release day', () => {
  const queue = JSON.parse(readFileSync(new URL('./queue.json', import.meta.url), 'utf8'))
  const ids = [
    'blog/making-club-videos-without-opening-an-editor',
    'blog/a-product-prototype-someone-else-can-build',
    'blog/photography-reports-that-help-me-choose',
    'applied/one-capture-two-outputs',
  ]
  for (const id of ids) {
    const item = queue.items.find((i) => i.id === id)
    assert.ok(item, id)
    const { linkedin, substack } = item.routes
    if (linkedin.state !== 'eligible') continue
    const releaseDay = substack.pinnedFor || substack.scheduledFor
    assert.match(releaseDay, /^\d{4}-\d{2}-\d{2}$/, id)
    assert.equal(linkedin.pinnedFor, releaseDay, `${id}: regeneration must keep the paired date`)
    assert.equal(linkedin.scheduledFor, releaseDay, `${id}: the publisher must read the paired date`)
  }
})
