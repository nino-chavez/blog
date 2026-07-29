#!/usr/bin/env node
// Every URL in the sitemap must have a file in dist to serve it.
//
// `/blog/*` is excluded from the Pages Function in astro.config.mjs, so
// everything under it is served by the static layer alone — a sitemap entry
// with no built file is a hard 404, not an SSR fallback. That is how
// `/blog/drafts` (an SSR-only route, unreachable by design) ended up
// advertised to Google: the sitemap `filter` tested for the substring
// "/draft/", which does not match "/drafts".
//
// Runs after `astro build`, since it reads what the build produced.

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const DIST = resolve("dist");
const sitemapPath = join(DIST, "sitemap-0.xml");

if (!existsSync(sitemapPath)) {
  console.error("[check-sitemap] dist/sitemap-0.xml not found");
  process.exit(1);
}

const urls = [
  ...readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g),
].map((m) => m[1]);

// `build.format: "file"` writes `/blog/x` as `blog/x.html`. A bare `/blog`
// is `blog.html`; `/` is `index.html`.
function servedBy(pathname) {
  const clean = pathname.replace(/\/$/, "");
  if (clean === "") return ["index.html"];
  const rel = clean.slice(1);
  return [`${rel}.html`, `${rel}/index.html`, rel];
}

const missing = urls.filter(
  (url) =>
    !servedBy(new URL(url).pathname).some((candidate) =>
      existsSync(join(DIST, candidate))
    )
);

if (missing.length > 0) {
  console.error(
    `\n[check-sitemap] ${missing.length} sitemap URL(s) have no file in dist:\n`
  );
  for (const url of missing) console.error(`  ${url}`);
  console.error(
    `\n  Either the page should not be in the sitemap (tighten the \`filter\`\n` +
      `  in astro.config.mjs) or it is an SSR route under an excluded prefix\n` +
      `  and cannot be served at all.\n`
  );
  process.exit(1);
}

console.log(`[check-sitemap] ${urls.length} sitemap URLs, all served by dist`);
