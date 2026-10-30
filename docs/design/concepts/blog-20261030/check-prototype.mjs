import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.argv[2]);
const base = process.argv[3] ?? 'http://127.0.0.1:8765';
const out = path.resolve(process.argv[4] ?? 'outputs/blog-rethink-20261030/concepts');
fs.mkdirSync(out, { recursive: true });
const results = [];
const codeOnly = process.argv.includes('--code-only');
const latest = 'because-i-can-is-only-half-the-answer';
const technical = 'setting-up-an-ai-native-dev-environment';
const series = 'spec-driven-development-with-multi-agent-orchestration';

for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const [device, viewport] of [['desktop', { width: 1440, height: 960 }], ['phone', { width: 390, height: 844 }]]) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const concept of ['a', 'b', 'c']) {
        for (const [view, suffix] of [['home', 'view=home'], ['essay', `view=article&post=${latest}`], ['technical', `view=article&post=${technical}`], ['series', `view=article&post=${series}`]]) {
          if (codeOnly && view !== 'technical') continue;
          await page.goto(`${base}/?concept=${concept}&${suffix}`, { waitUntil: 'networkidle' });
          await page.locator('#main').waitFor();
          await page.evaluate(() => document.fonts.ready);
          await page.addStyleTag({ content: '.comparison,.comparison-note{display:none!important}' });
          if (process.argv.includes('--negative-layout')) await page.addStyleTag({ content: 'body{min-width:2000px!important}' });
          const metrics = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, overflow: document.documentElement.scrollWidth - innerWidth, h1: [...document.querySelectorAll('#main h1')].map(x => x.textContent), articleStart: document.querySelector('.article-prose')?.getBoundingClientRect().top ?? null, brokenImages: [...document.querySelectorAll('#main img')].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')), codeFontSize: document.querySelector('.article-prose pre code') ? parseFloat(getComputedStyle(document.querySelector('.article-prose pre code')).fontSize) : null, codeBlocks: document.querySelectorAll('.article-prose pre').length, paragraphs: document.querySelectorAll('.article-prose p').length }));
          if (view === 'technical') {
            metrics.codeContrast = await page.locator('.article-prose pre').evaluateAll(blocks => {
              const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
              return Math.min(...blocks.flatMap(block => {
                const background = luminance(getComputedStyle(block).backgroundColor);
                return [...block.querySelectorAll('code, span')].filter(node => !node.children.length && node.textContent.trim()).map(node => {
                  const foreground = luminance(getComputedStyle(node).color);
                  return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
                });
              }));
            });
            assert.ok(metrics.codeContrast >= 4.5, `Code contrast too low: ${metrics.codeContrast}`);
          }
          assert.equal(metrics.width, viewport.width);
          assert.ok(metrics.overflow <= 1, `${engineName} ${device} ${concept} ${view}: overflow ${metrics.overflow}`);
          assert.equal(metrics.brokenImages.length, 0, `Broken images: ${metrics.brokenImages.join(', ')}`);
          if (view === 'essay') { assert.ok(metrics.paragraphs >= 15); assert.ok(metrics.articleStart < viewport.height, `Opening below viewport: ${concept} ${device} ${metrics.articleStart}`); }
          if (view === 'technical') { assert.equal(metrics.codeBlocks, 12); assert.ok(metrics.codeFontSize >= 12, `Code font too small: ${metrics.codeFontSize}`); }
          if (view === 'series') assert.match(await page.locator('.series-context').innerText(), /Part 6/);
          if (engineName === 'chromium') await page.screenshot({ path: path.join(out, `${concept}-${view}-${device}.png`) });
          if (engineName === 'chromium' && view === 'technical') {
            await page.locator('.article-prose pre').first().scrollIntoViewIfNeeded();
            // Let offscreen text paint after scrolling before saving the review frame.
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            await page.screenshot({ path: path.join(out, `${concept}-code-${device}.png`) });
          }
          results.push({ engine: engineName, device, concept, state: view, ...metrics });
        }
        if (codeOnly) {
          if (concept === 'c') { await page.goto(`${base}/?concept=c&view=home&q=photos`); await page.getByRole('navigation', { name: 'Browse by subject' }).getByRole('link', { name: 'Leadership', exact: true }).click(); assert.ok(!new URL(page.url()).searchParams.has('q')); assert.equal(await page.locator('.library-card').count(), 3); assert.equal(await page.locator('.library-card time').count(), 3); }
          console.log(`PASS ${engineName} ${device} ${concept}: readable code and subject-query reset`); continue;
        }
        await page.goto(`${base}/?concept=${concept}&view=archive`, { waitUntil: 'networkidle' });
        await page.getByLabel('Search essays', { exact: true }).fill('photos');
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        assert.match(page.url(), /q=photos/);
        await page.getByRole('link', { name: 'Trying to teach an AI how I edit photos', exact: true }).click();
        assert.match(page.url(), /view=article/);
        await page.getByRole('link', { name: 'Back to “photos”', exact: true }).click();
        assert.match(page.url(), /view=archive/);
        assert.equal(await page.getByLabel('Search essays', { exact: true }).inputValue(), 'photos');
        assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Trying to teach an AI how I edit photos');
        await page.getByLabel('Search essays', { exact: true }).fill('zzzz-no-such-essay');
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        assert.equal(await page.getByRole('heading', { name: 'No essays found' }).count(), 1);
        if (engineName === 'chromium') await page.screenshot({ path: path.join(out, `${concept}-empty-${device}.png`) });
        await page.getByRole('link', { name: 'Clear search', exact: true }).click();
        assert.equal(await page.getByLabel('Search essays', { exact: true }).inputValue(), '');
        assert.equal(await page.locator('.essay-row').count(), 12);
        await page.getByRole('link', { name: 'Next page', exact: true }).click();
        assert.match(page.url(), /page=2/);
        assert.equal(await page.locator('.essay-row').count(), 12);
        await page.goBack();
        assert.match(page.url(), /page=1/);
        if (device === 'phone') {
          await page.locator('.more-writing summary').click();
          assert.ok(await page.locator('.mobile-fiction').isVisible());
        }
        console.log(`PASS ${engineName} ${device} ${concept}: four content states, search, return focus, empty recovery, pagination, browser Back`);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
}
fs.writeFileSync(path.join(out, codeOnly ? 'code-checks.json' : 'checks.json'), JSON.stringify({ passed: true, cases: results }, null, 2));
console.log(`PASS ${results.length} rendered states across Chromium and WebKit, with ${codeOnly ? 'readable-code and subject checks' : 'reading-loop checks'} for all three concepts.`);
