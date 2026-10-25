#!/usr/bin/env node
// Invoke the Worker only for Astro's runtime routes. Broad static exclusions
// such as /blog/* would bypass a runtime endpoint nested under that path.
// Static pages and Pagefind assets remain on the Pages asset server.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const routesPath = resolve("dist/_routes.json");

if (!existsSync(routesPath)) {
  console.log("[optimize-routes] dist/_routes.json not found, skipping");
  process.exit(0);
}

const data = JSON.parse(readFileSync(routesPath, "utf8"));

const worker = resolve("dist/_worker.js");
const manifests = readdirSync(worker).filter((name) => /^manifest_.*\.mjs$/.test(name));
if (manifests.length !== 1) throw new Error("Expected one Astro server manifest");
const { manifest } = await import(pathToFileURL(resolve(worker, manifests[0])).href);
data.include = manifest.routes
  .filter(({ routeData }) => !routeData.prerender)
  .map(({ routeData }) => routeData.route.replace(/\[.*$/, "*"));
data.exclude = [];

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
if (data.include.length === 0 || data.include.length + data.exclude.length > 100) {
  throw new Error("[optimize-routes] Invalid Cloudflare Pages rule count");
}
if (over.length > 0) {
  console.error(
    `[optimize-routes] FAIL — ${over.length} rule(s) still over 100 chars:`
  );
  for (const r of over) console.error(`  ${r.length} ${r}`);
  process.exit(1);
}

writeFileSync(routesPath, JSON.stringify(data, null, 2) + "\n");
console.log("[optimize-routes] dist/_routes.json optimized");
