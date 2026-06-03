#!/usr/bin/env node
// Astro's @astrojs/cloudflare adapter generates _routes.json with one entry
// per static page plus the user-extended wildcards. Cloudflare Pages rejects
// (a) any single rule >100 chars and (b) overlapping splat rules.
//
// This script runs after `astro build` and rewrites dist/_routes.json so
// that broader wildcards absorb the rules they cover. The output is the
// minimal equivalent rule set.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const routesPath = resolve("dist/_routes.json");

if (!existsSync(routesPath)) {
  console.log("[optimize-routes] dist/_routes.json not found, skipping");
  process.exit(0);
}

const data = JSON.parse(readFileSync(routesPath, "utf8"));

// Pagefind writes its index + UI bundle to dist/pagefind/ AFTER astro build,
// so the adapter never sees those files when it generates _routes.json. Left
// alone they route to the SSR worker (which 404s them). Exclude the whole
// directory so the static layer serves the search assets.
if (Array.isArray(data.exclude) && !data.exclude.includes("/pagefind/*")) {
  data.exclude.push("/pagefind/*");
}

function coveredByWildcard(rule, wildcards, allowSelf = false) {
  for (const wc of wildcards) {
    if (!allowSelf && rule === wc) continue;
    if (wc.endsWith("/*")) {
      const prefix = wc.slice(0, -2);
      if (rule === prefix || rule.startsWith(prefix + "/")) return true;
    }
  }
  return false;
}

for (const key of ["include", "exclude"]) {
  if (!Array.isArray(data[key])) continue;
  const rules = data[key];
  const wildcards = rules.filter((r) => r.endsWith("/*"));
  // A wildcard is "broad" if no OTHER wildcard covers it
  const broad = wildcards.filter((w) => !coveredByWildcard(w, wildcards));
  // First: drop rules covered by broad wildcards. Then: dedupe exact matches.
  const seen = new Set();
  const deduped = [];
  for (const r of rules) {
    if (seen.has(r)) continue;
    if (broad.includes(r) || !coveredByWildcard(r, broad, true)) {
      seen.add(r);
      deduped.push(r);
    }
  }
  console.log(`[optimize-routes] ${key}: ${rules.length} -> ${deduped.length}`);
  data[key] = deduped;
}

const over = [...(data.include ?? []), ...(data.exclude ?? [])].filter(
  (r) => r.length > 100
);
if (over.length > 0) {
  console.error(
    `[optimize-routes] FAIL — ${over.length} rule(s) still over 100 chars:`
  );
  for (const r of over) console.error(`  ${r.length} ${r}`);
  process.exit(1);
}

writeFileSync(routesPath, JSON.stringify(data, null, 2) + "\n");
console.log("[optimize-routes] dist/_routes.json optimized");
