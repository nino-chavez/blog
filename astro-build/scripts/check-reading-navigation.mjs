import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Run against the built site. Supply the workspace's existing Playwright module.
const [modulePath, baseURL, output] = process.argv.slice(2);
if (!modulePath || !baseURL || !output) throw new Error('Expected Playwright module, preview URL, output directory');
const { chromium } = await import(pathToFileURL(modulePath));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [1280, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const ready = () => page.locator('[data-ready="true"]').waitFor();
    const openList = async () => {
      if (!await page.locator('#choose-another-post').getAttribute('open').then((value) => value !== null)) {
        await page.locator('#choose-another-post > summary').click();
      }
    };
    const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    const response = await page.goto(`${baseURL}/blog/archive`);
    assert.equal(response.status(), 200);
    await ready();
    await noOverflow();
    assert.ok((await page.locator('.article-content').innerText()).length > 8000, 'complete latest article');
    assert.equal(await page.locator('[data-reading-neighbor="newer"]:visible').count(), 0, 'newest boundary');
    assert.equal(await page.locator('[data-reading-neighbor="older"]:visible').count(), 2, 'continuation at both ends');
    await page.screenshot({ path: `${output}/home-${width}.png` });
    await openList();
    await page.locator('#reading-list-query').fill('AI');
    await page.locator('.reading-list__search button').click();
    await ready();
    assert.match(page.url(), /q=AI/);
    await page.locator('[data-reading-next]').click();
    await ready();
    assert.match(page.url(), /page=2/);
    const selected = page.locator('[data-reading-row]:visible').nth(2);
    const slug = await selected.getAttribute('data-slug');
    const title = await selected.locator('a').innerText();
    await selected.locator('a').click();
    await ready();
    assert.equal(await page.locator('.article-title').innerText(), title);
    assert.ok((await page.locator('.article-content').innerText()).length > 1000, 'full selected article');
    assert.match(page.url(), new RegExp(`/blog/${slug}\\?`));
    assert.ok(!page.url().includes('undefined'));
    if (width < 900) assert.equal(await page.locator('#choose-another-post').getAttribute('open'), null, 'article opens with list collapsed');
    await noOverflow();
    await page.screenshot({ path: `${output}/article-${width}.png` });
    const olderTitle = await page.locator('[data-reading-neighbor="older"] a').first().innerText();
    await page.locator('[data-reading-neighbor="older"] a').first().click();
    await ready();
    assert.equal(await page.locator('.article-title').innerText(), olderTitle);
    assert.equal(new URL(page.url()).searchParams.get('from'), slug, 'neighbor retains source row');
    await page.locator('[data-reading-back]').last().click();
    await ready();
    assert.equal(new URL(page.url()).searchParams.get('q'), 'AI');
    assert.equal(new URL(page.url()).searchParams.get('page'), '2');
    assert.equal(new URL(page.url()).hash, `#post-${slug}`);
    assert.equal(await page.evaluate(() => document.activeElement?.closest('[data-reading-row]')?.getAttribute('data-slug')), slug, 'return focuses original row');
    await page.reload();
    await ready();
    assert.equal(await page.locator('#reading-list-query').inputValue(), 'AI');
    assert.match(await page.locator('[data-reading-page-status]').innerText(), /^Page 2 /);
    await page.screenshot({ path: `${output}/returned-list-${width}.png` });
    await page.goBack();
    await ready();
    assert.equal(await page.locator('.article-title').innerText(), olderTitle, 'browser Back returns to article');
    await page.locator('.reading-end').scrollIntoViewIfNeeded();
    if (width >= 900) {
      const list = await page.locator('.reading-list').boundingBox();
      assert.ok(list.y >= 0 && list.y < 40, 'post list stays beside the article while reading');
    }
    await page.screenshot({ path: `${output}/article-end-${width}.png` });
    await page.goto(`${baseURL}/blog/archive?q=no-such-post-92735`);
    await ready();
    assert.equal(await page.locator('[data-reading-empty]').isVisible(), true);
    assert.equal(await page.locator('[data-reading-neighbor]:visible').count(), 0);
    await noOverflow();
    await page.goto(`${baseURL}/blog/archive?page=99999#choose-another-post`);
    await ready();
    assert.equal(await page.locator('[data-reading-next]').isVisible(), false);
    const last = page.locator('[data-reading-row]:visible a').last();
    const lastTitle = await last.innerText();
    await last.click();
    await ready();
    assert.equal(await page.locator('.article-title').innerText(), lastTitle);
    assert.equal(await page.locator('[data-reading-neighbor="older"]:visible').count(), 0, 'oldest boundary');
    assert.equal(await page.locator('a[href*="undefined"]').count(), 0);
    assert.deepEqual(errors, []);
    results.push({ width, readingLoop: 'pass', boundaries: 'pass', noResults: 'pass', contextAndFocus: 'pass', overflow: 'none', errors });
    await page.close();
  }
  const utilities = await browser.newPage();
  await utilities.goto(`${baseURL}/blog/the-rules-of-the-road-still-apply`);
  assert.equal(await utilities.locator('link[rel="canonical"]').getAttribute('href'), 'https://ninochavez.co/blog/the-rules-of-the-road-still-apply');
  await utilities.locator('[data-search-trigger]').first().click();
  await utilities.locator('.pagefind-ui__search-input').fill('rules of the road');
  await utilities.locator('.pagefind-ui__result-link').first().waitFor();
  const searchLinks = await utilities.locator('.pagefind-ui__result-title a').evaluateAll((links) => links.map((link) => link.href));
  assert.ok(searchLinks.length > 0);
  assert.ok(searchLinks.every((href) => !['/blog', '/blog/archive'].includes(new URL(href).pathname.replace(/\/$/, ''))), 'search returns the original article, not duplicate reading entrances');
  await utilities.locator('#search-close').click();
  await utilities.locator('.article-toc summary').click();
  const heading = await utilities.locator('.article-toc a').first().getAttribute('href');
  await utilities.locator('.article-toc a').first().click();
  assert.equal(new URL(utilities.url()).hash, heading, 'article anchors stay local');
  for (const path of ['/blog/series', '/blog/fiction', '/blog/tutorials', '/blog/whitepapers', '/blog/presentations', '/blog/counterpoints', '/blog/tags']) {
    const response = await utilities.goto(baseURL + path);
    assert.equal(response.status(), 200, path);
    assert.equal(await utilities.locator('.signal-dispatch-header').count(), 1);
  }
  results.push({ searchAndCanonical: 'pass', localArticleAnchor: 'pass', otherWritingFormats: '7 routes pass' });
  for (const width of [390, 320]) {
    await utilities.setViewportSize({ width, height: 900 });
    await utilities.goto(`${baseURL}/blog/tags`);
    await utilities.locator('.signal-dispatch-header summary').click();
    assert.equal(await utilities.locator('.signal-dispatch-header__more a:visible').count(), 8, 'all sections are reachable on a phone');
    assert.equal(await utilities.evaluate(() => document.documentElement.scrollWidth), width);
    await utilities.screenshot({ path: `${output}/sections-${width}.png` });
    await utilities.locator('.signal-dispatch-header__more a[href="/blog/fiction"]').click();
    assert.equal(new URL(utilities.url()).pathname, '/blog/fiction');
    await utilities.locator('.signal-dispatch-footer').scrollIntoViewIfNeeded();
    await utilities.locator('.signal-dispatch-footer summary').click();
    assert.equal(await utilities.locator('.signal-dispatch-footer details a:visible').count(), 4);
    await utilities.locator('.signal-dispatch-footer details a').last().scrollIntoViewIfNeeded();
    await utilities.waitForFunction(() => document.querySelector('.signal-dispatch-footer').getBoundingClientRect().bottom <= innerHeight + 1);
    await utilities.screenshot({ path: `${output}/footer-${width}.png` });
  }
  results.push({ mobileSectionsAndFeeds: '390 and 320 px pass' });
  await utilities.close();
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  const page = await noJS.newPage();
  await page.goto(`${baseURL}/blog/the-rules-of-the-road-still-apply`);
  assert.ok((await page.locator('.article-content').innerText()).length > 8000);
  assert.equal(await page.locator('[data-reading-row]:visible').count(), await page.locator('[data-reading-row]').count(), 'no-JS archive remains browsable');
  const href = await page.locator('[data-reading-row] a').nth(1).getAttribute('href');
  assert.ok(href && !href.includes('undefined'));
  await page.goto(new URL(href, baseURL).href);
  assert.equal(await page.locator('.article-title').innerText(), 'The Hire Who Never Remembers');
  results.push({ javaScriptDisabled: 'full article and native post links pass' });
  await noJS.close();
  await writeFile(`${output}/receipt.json`, JSON.stringify({ baseURL, checkedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
