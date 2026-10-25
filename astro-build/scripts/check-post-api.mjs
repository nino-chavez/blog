#!/usr/bin/env node
// Post JSON must go through the runtime publication check, including URLs for
// removed posts whose old static assets may still be cached by Pages.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const directory = resolve("dist/blog/api/posts");
function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

const artifacts = files(directory).filter((path) => path.endsWith(".json"));
if (artifacts.length) {
  // Hosted logs must not disclose private post names or bodies.
  throw new Error(`[check-post-api] FAIL: ${artifacts.length} static post JSON artifacts`);
}

const routes = JSON.parse(readFileSync(resolve("dist/_routes.json"), "utf8"));
const probe = "/blog/api/posts/__publication-check__.json";
const matches = (rule) => rule.endsWith("*")
  ? probe.startsWith(rule.slice(0, -1))
  : probe === rule;
if (!routes.include?.some(matches) || routes.exclude?.some(matches)) {
  throw new Error("[check-post-api] FAIL: post JSON bypasses the runtime publication check");
}

console.log("[check-post-api] Post JSON uses the runtime publication check; no static artifacts");
