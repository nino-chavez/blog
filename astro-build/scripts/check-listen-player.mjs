// Like the existing design runner, accepts a path to an installed Playwright.
// Uses a quiet test tone only. Never calls ElevenLabs or alters public content.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync, spawn } from 'node:child_process';
import { ROOT, REVIEW_DIR, readManifest, sha256 } from './listen-lib.mjs';
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.argv[2]);
const directory = path.join(ROOT, '.tmp/listen-player-test');
const evidence = path.join(ROOT, '.tmp/listen-evidence');
fs.mkdirSync(directory, { recursive: true });
fs.mkdirSync(evidence, { recursive: true });
const manifest = readManifest(REVIEW_DIR);
manifest.testFixture = true;
for (const essay of manifest.essays) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=8', '-af', 'volume=0.01', '-c:a', 'libmp3lame', '-b:a', '128k', path.join(directory, essay.audioFile)], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 10000 });
  Object.assign(essay, { narrator: 'Original British narrator', status: 'ready-for-review', durationSeconds: 8, sha256: sha256(fs.readFileSync(path.join(directory, essay.audioFile))) });
}
fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest));
const server = spawn(process.execPath, [path.join(ROOT, 'scripts/preview-listen.mjs'), '--directory', directory, '--port', '4329'], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 180000 });
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Preview startup timeout')), 10000);
  server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
  server.once('error', reject);
  server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Preview exited: ${code}`)); });
});
const base = 'http://127.0.0.1:4329';
const results = [];
try {
  const mp3 = `/audio/${manifest.essays[0].audioFile}`;
  assert.equal((await fetch(base + mp3, { headers: { Range: 'bytes=0-99' } })).status, 206);
  assert.equal((await fetch(base + mp3, { headers: { Range: 'bytes=99999999-' } })).status, 416);
  assert.equal((await fetch(base + '/manifest.json')).status, 404);
  assert.equal((await fetch(base + '/audio/../manifest.json')).status, 404);
  for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
    if (process.argv.includes('--webkit-only') && engineName !== 'webkit') continue;
    const browser = await engine.launch({ headless: true });
    try {
      for (const width of [1440, 390, 320]) {
        const page = await browser.newPage({ viewport: { width, height: width > 400 ? 960 : 844 }, deviceScaleFactor: 1 });
        await page.goto(`${base}/essay/${manifest.essays[0].slug}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        assert.match(await page.locator('.article-title').evaluate((element) => getComputedStyle(element).fontFamily), /Georgia/);
        assert.equal(await page.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor), 'rgb(244, 240, 232)');
        assert.equal(await page.locator('audio').count(), 1);
        assert.match(await page.locator('.essay-audio').innerText(), /AI narration · Original British narrator/);
        assert.equal(await page.locator('audio').getAttribute('autoplay'), null);
        assert.equal(await page.locator('audio').getAttribute('preload'), 'none');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        // Native controls are keyboard focusable; Space starts playback.
        await page.locator('audio').focus();
        await page.keyboard.press('Space');
        try {
          await page.waitForFunction(() => { const a = document.querySelector('audio'); return !a.paused && a.currentTime > 0; }, null, { timeout: 8000 });
        } catch (error) {
          console.error('Playback check', engineName, width, await page.locator('audio').evaluate((audio) => ({
            focus: document.activeElement?.tagName, paused: audio.paused, readyState: audio.readyState, error: audio.error?.message,
          })));
          throw error;
        }
        await page.keyboard.press('Space');
        assert.equal(await page.locator('audio').evaluate((audio) => audio.paused), true);
        await page.locator('audio').evaluate((audio) => { audio.currentTime = 4; });
        await page.waitForFunction(() => Math.abs(document.querySelector('audio').currentTime - 4) < 0.5);
        await page.locator('audio').evaluate((audio) => { audio.currentTime = 0; });
        await page.locator('.article-title').click();
        await page.screenshot({ path: path.join(evidence, `${engineName}-essay-${width}.png`) });
        results.push({ engine: engineName, width, state: 'play, pause, seek; no overflow; no autoplay' });
        await page.goto(base, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('audio').count(), 2);
        assert.ok(!(await page.locator('body').innerText()).includes('AI version of your voice'));
        assert.match(await page.locator('.essay-audio').first().innerText(), /AI narration · Original British narrator/);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (width === 390) await page.screenshot({ path: path.join(evidence, `${engineName}-review-${width}.png`) });
        // Missing-file behavior retains the transcript and direct download link.
        await page.goto(`${base}/essay/${manifest.essays[0].slug}`);
        // WebKit's native media stack can bypass Playwright route interception.
        // Make the loopback server return a real 404 after rendering the player.
        const audioPath = path.join(directory, manifest.essays[0].audioFile);
        fs.renameSync(audioPath, audioPath + '.unavailable');
        try {
          assert.equal((await fetch(base + mp3)).status, 404);
          await page.locator('audio').evaluate((audio) => { audio.src += '?missing-file'; audio.load(); });
          await page.locator('audio').focus();
          await page.keyboard.press('Space');
          await page.locator('[data-audio-error]').waitFor({ state: 'visible', timeout: 8000 });
          assert.equal(await page.getByRole('link', { name: /Try downloading the MP3/ }).count(), 1);
          assert.ok((await page.locator('.article-content').innerText()).startsWith('I’ve described'));
          if (width === 390) await page.screenshot({ path: path.join(evidence, `${engineName}-error-${width}.png`) });
        } catch (error) {
          console.error('Failure-state probe', engineName, width, await page.locator('audio').evaluate((audio) => ({
            src: audio.currentSrc, paused: audio.paused, readyState: audio.readyState, networkState: audio.networkState,
            enhanced: audio.dataset.listenReady, error: audio.error?.message,
          })));
          throw error;
        } finally { fs.renameSync(audioPath + '.unavailable', audioPath); }
        results.push({ engine: engineName, width, state: 'failed audio leaves transcript and direct link usable' });
        await page.close();
      }
      const noJs = await browser.newContext({ javaScriptEnabled: false });
      const page = await noJs.newPage();
      await page.goto(`${base}/essay/${manifest.essays[0].slug}`);
      assert.equal(await page.locator('audio[controls]').count(), 1);
      await noJs.close();
    } finally { await browser.close(); }
  }
  const manifestPath = path.join(directory, 'manifest.json');
  const validManifest = fs.readFileSync(manifestPath);
  try {
    manifest.essays[0].sourceSha256 = '0'.repeat(64);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    assert.equal((await fetch(base + '/')).status, 500);
    assert.equal((await fetch(base + `/essay/${manifest.essays[0].slug}`)).status, 500);
    manifest.essays[0].sourceSha256 = JSON.parse(validManifest).essays[0].sourceSha256;
    manifest.essays[0].sha256 = '0'.repeat(64);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    assert.equal((await fetch(base + mp3)).status, 500);
  } finally { fs.writeFileSync(manifestPath, validManifest); }
  fs.writeFileSync(path.join(evidence, 'checks.json'), JSON.stringify({ testAudio: '8-second quiet synthetic tone, not narration', results, staleSourceAndReplacedAudio: 'rejected' }, null, 2));
  console.log(`PASS: ${results.length} rendered checks (${[...new Set(results.map((result) => result.engine))].join(', ')}); range requests, stale reviews and no-JavaScript markup.`);
} finally {
  server.kill('SIGTERM');
}
