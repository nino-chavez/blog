#!/usr/bin/env node
/**
 * Generate a blog feature image locally. No API, no cost, no network.
 *
 * Replaces the OpenRouter pipeline in `generate-illustration-images.js`
 * (gemini-2.5-flash concept -> gpt-5-image render -> vision judge), which
 * billed per image and produced a different picture every run. This one is a
 * typographic card rendered from the site's own tokens, so the same post
 * always yields the same bytes.
 *
 * Deliberately different from the illustrated back catalogue. Signal Dispatch
 * is a single-accent brand and the palette audit concluded the fix for
 * AI-generic design was rationing visual markers, so the card carries one.
 *
 * Type note: DESIGN.md names Rival Sans for display, but it is not installed
 * and the site does not serve it — only @fontsource-variable/inter ships.
 * Display renders in Inter. Overlines use the system mono stack because
 * JetBrains Mono is likewise not installed locally.
 *
 * Emits BOTH sizes. `check-feature-images.mjs` runs before `astro build` and
 * fails when a referenced image has no `<name>-600w.webp` sibling, so a
 * single file would break the build on the post being published.
 *
 *   node scripts/generate-feature-image.mjs <slug> [--dir blog] [--overline "Field Notes"]
 *
 * Reads title from the post frontmatter. Writes:
 *   public/images/generated/<slug>.webp        1200x675
 *   public/images/generated/<slug>-600w.webp    600x338
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const RENDER_KIT = resolve(process.env.HOME, 'Workspace/dev/tools/render-kit/bin/render-kit.mjs');
const TEMPLATE = join(HERE, 'templates', 'feature-image.html');
const OUT_DIR = join(ROOT, 'public', 'images', 'generated');

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

if (!slug) {
  console.error('Usage: generate-feature-image.mjs <slug> [--dir blog] [--overline "Field Notes"]');
  process.exit(1);
}
if (!existsSync(RENDER_KIT)) {
  console.error(`render-kit not found at ${RENDER_KIT}`);
  process.exit(1);
}

const dir = flag('dir', 'blog');
const postPath = ['mdx', 'md']
  .map((ext) => join(ROOT, 'src', 'content', dir, `${slug}.${ext}`))
  .find(existsSync);

if (!postPath) {
  console.error(`No post found for slug "${slug}" in src/content/${dir}/`);
  process.exit(1);
}

// Frontmatter title, quoted with either delimiter, single-quote escapes undone.
const front = readFileSync(postPath, 'utf8').split(/^---$/m)[1] ?? '';
const titleLine = front.match(/^title:\s*(.+)$/m);
if (!titleLine) {
  console.error(`No title in frontmatter of ${postPath}`);
  process.exit(1);
}
const title = titleLine[1].trim().replace(/^['"]|['"]$/g, '').replace(/''/g, "'");

const overline = flag('overline', dir === 'blog' ? 'Field Notes' : dir);

mkdirSync(OUT_DIR, { recursive: true });
const tmpPng = join(OUT_DIR, `_${slug}.render.png`);
const dataFile = join(OUT_DIR, `_${slug}.data.json`);

import('node:fs').then(({ writeFileSync }) => {
  writeFileSync(dataFile, JSON.stringify({ title, overline, domain: 'ninochavez.co' }));

  // scale 2 renders at 2400x1350 so the 1200w downsample is resampled, not
  // native — text edges hold up under Substack and LinkedIn recompression.
  execFileSync('node', [
    RENDER_KIT, TEMPLATE,
    '--data', dataFile,
    '--out', tmpPng,
    '--scale', '2',
  ], { stdio: 'inherit' });

  return Promise.all([
    sharp(tmpPng).resize(1200, 675).webp({ quality: 90 }).toFile(join(OUT_DIR, `${slug}.webp`)),
    sharp(tmpPng).resize(600, 338).webp({ quality: 88 }).toFile(join(OUT_DIR, `${slug}-600w.webp`)),
  ]);
}).then(() => {
  unlinkSync(tmpPng);
  unlinkSync(dataFile);
  console.log(`\n  ${title}`);
  console.log(`  public/images/generated/${slug}.webp        1200x675`);
  console.log(`  public/images/generated/${slug}-600w.webp    600x338`);
  console.log(`\n  featureImage: "/images/generated/${slug}.webp"`);
}).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
