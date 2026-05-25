#!/usr/bin/env node
// Capture current-state baselines for the brownfield Stage 1 audit.
//
// Reads the surface × breakpoint matrix below, drives the browse-tool Chrome
// instance, sets the viewport per breakpoint, navigates to each surface, and
// writes <surface>--<breakpoint>.png into blueprint/research/current-state/.
//
// Prerequisite: `browse-start --profile-name signal-dispatch-blueprint` is
// running. The script connects via CDP; if it can't, fail loud.

import puppeteer from "/Users/nino/Workspace/dev/tools/browse-tool/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import { mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const HERE = dirname(__filename);
const OUT_DIR = resolve(HERE, "..", "research", "current-state");

const BASE = "https://ninochavez.co";

const SURFACES = [
  { id: "home",                 path: "/blog" },
  { id: "archive-tags",         path: "/blog/tags" },
  { id: "tag-detail",           path: "/blog/tags/architecture" },
  { id: "series-index",         path: "/blog/series" },
  { id: "series-detail",        path: "/blog/series/agentic-workflows-in-practice" },
  { id: "whitepapers-index",    path: "/blog/whitepapers" },
  { id: "whitepaper-detail",    path: "/blog/whitepapers/big-blueprint-methodology" },
  { id: "presentations-index",  path: "/blog/presentations" },
  { id: "presentation-detail",  path: "/blog/presentations/anatomy-of-ai-native-development" },
  { id: "counterpoints-index",  path: "/blog/counterpoints" },
  { id: "counterpoint-detail",  path: "/blog/counterpoints/process-beats-inspection" },
  { id: "tutorials-index",      path: "/blog/tutorials" },
  { id: "fiction-index",        path: "/blog/fiction" },
  { id: "post-detail",          path: "/blog/the-scaffolding-the-agent-doesnt-build" },
];

const BREAKPOINTS = [
  { id: "375",  width: 375,  height: 812 }, // iPhone-ish
  { id: "768",  width: 768,  height: 1024 }, // tablet portrait
  { id: "1024", width: 1024, height: 768 },  // tablet landscape / small laptop
  { id: "1440", width: 1440, height: 900 },  // desktop
];

// --- Connect to the browse-tool Chrome via the same state file convention.

const STATE_FILE = join(tmpdir(), "browse-tool-state.json");
function readPort() {
  if (!existsSync(STATE_FILE)) return 9222;
  try { return JSON.parse(readFileSync(STATE_FILE, "utf8")).port ?? 9222; }
  catch { return 9222; }
}

const port = readPort();
let browser;
try {
  browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${port}`,
    defaultViewport: null,
  });
} catch (err) {
  console.error(`Cannot connect to Chrome on port ${port}. Run 'browse-start --profile-name signal-dispatch-blueprint' first.\n${err.message}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

// Open a single fresh page we own (don't fight other tabs).
const page = await browser.newPage();

let total = 0, ok = 0;
const failures = [];

try {
  for (const bp of BREAKPOINTS) {
    await page.setViewport({ width: bp.width, height: bp.height, deviceScaleFactor: 1 });
    for (const s of SURFACES) {
      total++;
      const url = BASE + s.path;
      const out = join(OUT_DIR, `${s.id}--${bp.id}.png`);
      const stamp = `${s.id}--${bp.id}`;
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        // Give post-load JS (lazy images, fonts) a moment to settle.
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: out, fullPage: true, type: "png" });
        console.log(`OK   ${stamp}  →  ${out}`);
        ok++;
      } catch (err) {
        console.error(`FAIL ${stamp}  ${err.message}`);
        failures.push({ stamp, url, error: err.message });
      }
    }
  }
} finally {
  await page.close();
  browser.disconnect();
}

console.log(`\nCaptured ${ok}/${total} surfaces × breakpoints into ${OUT_DIR}`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ${f.stamp}  ${f.url}\n    ${f.error}`);
  process.exit(1);
}
