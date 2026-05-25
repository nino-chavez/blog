#!/usr/bin/env node
// Capture peer-publication surfaces for the brownfield competitive leg.
//
// For each site: home + a representative tag/topic/index + a representative
// long-form post. Viewport-only (not full-page) — we're looking for IA cues,
// not full content. Saves into blueprint/research/competitive/captures/.
//
// Prereq: `browse-start --profile-name signal-dispatch-blueprint` running.

import puppeteer from "/Users/nino/Workspace/dev/tools/browse-tool/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const HERE = dirname(__filename);
const OUT_DIR = resolve(HERE, "..", "research", "competitive", "captures");

const SITES = [
  // site_slug, url, surface_slug
  { site: "lethain",          url: "https://lethain.com/",                                   surface: "home" },
  { site: "lethain",          url: "https://lethain.com/tags/",                              surface: "tags" },
  { site: "lethain",          url: "https://lethain.com/staff-eng-engagement-models/",       surface: "post" },
  { site: "simonwillison",    url: "https://simonwillison.net/",                             surface: "home" },
  { site: "simonwillison",    url: "https://simonwillison.net/tags/llms/",                   surface: "tag-large" },
  { site: "simonwillison",    url: "https://simonwillison.net/2025/Jun/14/coding-agent-architectures/", surface: "post" },
  { site: "pragmaticengineer", url: "https://www.pragmaticengineer.com/",                     surface: "home" },
  { site: "pragmaticengineer", url: "https://www.pragmaticengineer.com/archive/",            surface: "archive" },
  { site: "charity-wtf",      url: "https://charity.wtf/",                                   surface: "home" },
  { site: "stratechery",      url: "https://stratechery.com/",                               surface: "home" },
];

const BREAKPOINT = { width: 1440, height: 900 };

const STATE_FILE = join(tmpdir(), "browse-tool-state.json");
const port = (() => {
  if (!existsSync(STATE_FILE)) return 9222;
  try { return JSON.parse(readFileSync(STATE_FILE, "utf8")).port ?? 9222; } catch { return 9222; }
})();

let browser;
try {
  browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null });
} catch (err) {
  console.error(`Cannot connect to Chrome on port ${port}. Run 'browse-start --profile-name signal-dispatch-blueprint' first.\n${err.message}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const page = await browser.newPage();
await page.setViewport({ ...BREAKPOINT, deviceScaleFactor: 1 });

let ok = 0, failures = [];
try {
  for (const s of SITES) {
    const out = join(OUT_DIR, `${s.site}--${s.surface}.png`);
    try {
      await page.goto(s.url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: out, fullPage: false, type: "png" });
      console.log(`OK   ${s.site}/${s.surface}  →  ${out}`);
      ok++;
    } catch (err) {
      console.error(`FAIL ${s.site}/${s.surface}  ${err.message}`);
      failures.push({ ...s, error: err.message });
    }
  }
} finally {
  await page.close();
  browser.disconnect();
}

console.log(`\n${ok}/${SITES.length} captures complete into ${OUT_DIR}`);
if (failures.length) process.exit(1);
