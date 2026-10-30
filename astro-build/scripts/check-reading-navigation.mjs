import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Verify the built publication, including URL-owned return state and native fallbacks.
const [modulePath, baseURL, output] = process.argv.slice(2);
if (!modulePath || !baseURL || !output) throw new Error('Expected Playwright module, preview URL, output directory');
const { chromium, webkit } = await import(pathToFileURL(modulePath));
await mkdir(output, { recursive: true });
const results = [];
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  try {
    // Analytics and the separately hosted photography tracker are outside this local fixture.
    const isolate = async context => {
      await context.route('**/beacon.min.js*', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
      await context.route('**/photography/site-activity.js*', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
    };
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 960 : 844 }, reducedMotion: 'reduce' });
      await isolate(page.context());
      const errors = [];
      page.on('pageerror', error => errors.push(error.stack || error.message));
      const ready = async () => { await page.locator('[data-ready="true"]').waitFor(); await page.waitForLoadState('networkidle'); };
      const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow at ${width}`);
      const capture = async name => { await page.evaluate(() => document.fonts.ready); await page.screenshot({ path: `${output}/${engineName}-${name}-${width}.png` }); };
      const open = async (path, state = true) => { const response = await page.goto(baseURL + path); assert.equal(response.status(), 200, path); if (state) await ready(); };
      await open('/blog', false);
      assert.equal(await page.locator('.journal-lead').count(), 1);
      assert.equal(await page.locator('.journal-card').count(), 4);
      assert.equal(await page.locator('.subject-nav').count(), 1);
      await noOverflow(); await capture('home');
      await open('/blog/archive');
      assert.equal(await page.locator('.article-content').count(), 0, 'archive is for choosing an essay');
      assert.equal(await page.locator('[data-reading-row]:visible').count(), 12);
      await noOverflow(); await capture('archive');
      await page.locator('#reading-list-query').fill('AI');
      await page.locator('.reading-list__search button').click(); await ready();
      await page.locator('[data-reading-next]').click(); await ready();
      assert.equal(new URL(page.url()).searchParams.get('page'), '2');
      const selected = page.locator('[data-reading-row]:visible').nth(2);
      const slug = await selected.getAttribute('data-slug');
      const title = await selected.locator('a').innerText();
      await selected.locator('a').click(); await ready();
      assert.equal(await page.locator('.article-title').innerText(), title);
      assert.ok((await page.locator('.article-content').innerText()).length > 1000);
      assert.equal(await page.locator('[data-reading-list]').count(), 0, 'focused article has no post index');
      assert.ok(!page.url().includes('undefined'));
      await noOverflow(); await capture('article');
      const older = page.locator('[data-reading-neighbor="older"] a');
      const olderTitle = await older.innerText();
      await older.click(); await ready();
      assert.equal(await page.locator('.article-title').innerText(), olderTitle);
      assert.equal(new URL(page.url()).searchParams.get('from'), slug);
      await page.locator('[data-reading-back]').last().click(); await ready();
      assert.equal(new URL(page.url()).searchParams.get('q'), 'AI');
      assert.equal(new URL(page.url()).searchParams.get('page'), '2');
      assert.equal(new URL(page.url()).hash, `#post-${slug}`);
      assert.equal(await page.evaluate(() => document.activeElement?.closest('[data-reading-row]')?.dataset.slug), slug);
      await page.reload(); await ready();
      assert.equal(await page.locator('#reading-list-query').inputValue(), 'AI');
      assert.match(await page.locator('[data-reading-page-status]').innerText(), /^Page 2 /);
      await capture('returned-list');
      await page.goBack(); await ready();
      assert.equal(await page.locator('.article-title').innerText(), olderTitle);
      await open('/blog/archive?q=no-such-post-92735');
      assert.ok(await page.locator('[data-reading-empty]').isVisible());
      assert.equal(await page.locator('[data-reading-pages]').isVisible(), false);
      await noOverflow(); await capture('empty');
      await page.locator('[data-reading-empty] a').click(); await ready();
      assert.equal(await page.locator('#reading-list-query').inputValue(), '');
      await open('/blog/archive?page=99999#choose-another-post');
      assert.equal(await page.locator('[data-reading-next]').isVisible(), false);
      const last = page.locator('[data-reading-row]:visible a').last();
      const lastTitle = await last.innerText();
      await last.click(); await ready();
      assert.equal(await page.locator('.article-title').innerText(), lastTitle);
      assert.equal(await page.locator('[data-reading-neighbor="older"]:visible').count(), 0);
      await open('/blog/tags/ai-development');
      assert.ok(await page.locator('[data-reading-row]:visible').count());
      assert.ok(await page.locator('[data-reading-row]:visible').evaluateAll(rows => rows.every(row => JSON.parse(row.dataset.tags).includes('ai-development'))));
      await page.locator('#reading-list-query').fill('AI');
      await page.locator('.reading-list__search button').click(); await ready();
      assert.equal(new URL(page.url()).searchParams.get('subject'), 'ai-development');
      const subjectRow = page.locator('[data-reading-row]:visible').first();
      const subjectSlug = await subjectRow.getAttribute('data-slug');
      await subjectRow.locator('a').click(); await ready();
      assert.equal(new URL(page.url()).searchParams.get('subject'), 'ai-development');
      await page.locator('[data-reading-back]').first().click(); await ready();
      assert.equal(new URL(page.url()).searchParams.get('subject'), 'ai-development');
      assert.equal(await page.locator('#reading-list-query').inputValue(), 'AI');
      assert.equal(await page.evaluate(() => document.activeElement?.closest('[data-reading-row]')?.dataset.slug), subjectSlug);
      await noOverflow(); await capture('subject');
      await open('/blog/because-i-can-is-only-half-the-answer');
      assert.ok(await page.locator('.article-content').evaluate(el => el.getBoundingClientRect().top < innerHeight), 'opening prose is visible');
      assert.equal(await page.locator('[data-reading-neighbor="newer"]:visible').count(), 0);
      assert.equal(await page.locator('.article-byline a').getAttribute('target'), '_blank');
      assert.equal(await page.locator('.signal-dispatch-footer a[href="/photography/albums"]').getAttribute('target'), '_blank');
      await noOverflow(); await capture('essay');
      await page.locator('[data-reading-context]').scrollIntoViewIfNeeded();
      await noOverflow(); await capture('essay-end');
      await open('/blog/setting-up-an-ai-native-dev-environment');
      assert.equal(await page.locator('.article-content pre').count(), 12);
      assert.equal(await page.locator('.article-code-block figcaption').count(), 12);
      await noOverflow(); await capture('technical');
      await page.locator('.article-content pre').first().scrollIntoViewIfNeeded();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.ok(await page.locator('.article-content pre code').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 13));
      const lowContrastTokens = await page.locator('.article-content pre').evaluateAll(blocks => {
        const luminance = color => {
          const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; });
          return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
        };
        return blocks.flatMap(block => {
          const background = luminance(getComputedStyle(block).backgroundColor);
          return [...block.querySelectorAll('span')].filter(span => !span.children.length && span.textContent.trim()).map(span => {
            const foreground = luminance(getComputedStyle(span).color);
            return { color: getComputedStyle(span).color, ratio: (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05) };
          }).filter(token => token.ratio < 4.5);
        });
      });
      assert.deepEqual(lowContrastTokens, [], 'syntax tokens meet normal-text contrast');
      await capture('code');
      if (width < 760) {
        const code = page.locator('.article-content pre').first();
        await code.focus(); await code.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('.article-content pre').scrollLeft > 0);
      }
      await open('/blog/spec-driven-development-with-multi-agent-orchestration');
      assert.match(await page.locator('.article-series').innerText(), /Part 6/);
      await noOverflow(); await capture('series');
      assert.equal(await page.locator('a[href*="undefined"]').count(), 0);
      assert.deepEqual(errors, []);
      results.push({ engine: engineName, width, readingLoop: 'pass', subjectSearch: 'pass', returnFocus: 'pass', boundaries: 'pass', proseCodeSeries: 'pass', overflow: 'none' });
      console.log(`PASS ${engineName} ${width}: browsing, focused reading, filters, return focus, code and series`);
      await page.close();
    }
    const page = await browser.newPage();
    await isolate(page.context());
    await page.goto(`${baseURL}/blog/the-rules-of-the-road-still-apply`);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://ninochavez.co/blog/the-rules-of-the-road-still-apply');
    await page.locator('[data-search-trigger]').first().click();
    await page.locator('.pagefind-ui__search-input').fill('rules of the road');
    await page.locator('.pagefind-ui__result-link').first().waitFor();
    const searchLinks = await page.locator('.pagefind-ui__result-title a').evaluateAll(links => links.map(link => link.href));
    assert.ok(searchLinks.length);
    assert.ok(searchLinks.every(href => !['/blog', '/blog/archive'].includes(new URL(href).pathname.replace(/\/$/, ''))));
    await page.locator('#search-close').click();
    await page.locator('.article-toc summary').click();
    const heading = await page.locator('.article-toc a').first().getAttribute('href');
    await page.locator('.article-toc a').first().click();
    assert.equal(new URL(page.url()).hash, heading);
    for (const path of ['/blog/series', '/blog/fiction', '/blog/tutorials', '/blog/whitepapers', '/blog/presentations', '/blog/counterpoints', '/blog/tags']) {
      assert.equal((await page.goto(baseURL + path)).status(), 200, path);
      assert.equal(await page.locator('.signal-dispatch-header').count(), 1);
    }
    await page.setViewportSize({ width: 320, height: 844 });
    await page.locator('.signal-dispatch-header summary').click();
    assert.equal(await page.locator('.signal-dispatch-header__more a:visible').count(), 6);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 320);
    await page.locator('.signal-dispatch-header__more a[href="/blog/fiction"]').click();
    assert.equal(new URL(page.url()).pathname, '/blog/fiction');
    await page.locator('.signal-dispatch-footer summary').click();
    assert.equal(await page.locator('.signal-dispatch-footer details a:visible').count(), 4);
    await page.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const native = await noJS.newPage();
    await native.goto(`${baseURL}/blog/the-rules-of-the-road-still-apply`);
    assert.ok((await native.locator('.article-content').innerText()).length > 8000);
    await native.goto(`${baseURL}/blog/archive`);
    assert.ok(await native.locator('[data-reading-row]:visible').count() > 260);
    const nativeLink = native.locator('[data-reading-row] a').nth(2);
    const nativeTitle = await nativeLink.innerText();
    await nativeLink.click();
    assert.equal(await native.locator('.article-title').innerText(), nativeTitle);
    await native.goto(`${baseURL}/blog/tags/ai-development`);
    assert.ok(await native.locator('[data-reading-row]:visible').count() > 12);
    assert.ok(await native.locator('[data-reading-row]:visible').evaluateAll(rows => rows.every(row => JSON.parse(row.dataset.tags).includes('ai-development'))));
    await noJS.close();
    results.push({ engine: engineName, searchCanonicalAnchors: 'pass', writingFormats: '7 routes pass', mobileMenuFeeds: 'pass', noJavaScript: 'native article, archive and subject routes pass' });
  } finally { await browser.close(); }
}
await writeFile(`${output}/receipt.json`, JSON.stringify({ baseURL, checkedAt: new Date().toISOString(), results }, null, 2));
console.log('PASS all publication reading checks.');
