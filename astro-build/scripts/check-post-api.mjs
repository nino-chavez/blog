#!/usr/bin/env node
// Individual post JSON must expose exactly the posts in the public index.
// Check the built files, including leftovers, before a build can be deployed.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const api = resolve("dist/blog/api");
const directory = join(api, "posts");
const { posts } = JSON.parse(readFileSync(join(api, "posts.json"), "utf8"));
if (!Array.isArray(posts) || posts.some((post) => typeof post.slug !== "string" || !post.slug)) {
  throw new Error("[check-post-api] Public post index is invalid");
}
const expected = new Set(posts.map((post) => `${post.slug}.json`));

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

const actual = new Set(files(directory)
  .filter((path) => path.endsWith(".json"))
  .map((path) => relative(directory, path).split(sep).join("/")));
const unexpected = [...actual].filter((path) => !expected.has(path));
const missing = [...expected].filter((path) => !actual.has(path));

if (unexpected.length || missing.length || expected.size !== posts.length) {
  // Do not disclose non-public post names or content in hosted build logs.
  console.error(`[check-post-api] FAIL: ${unexpected.length} unexpected JSON artifacts, ${missing.length} missing published artifacts`);
  process.exit(1);
}

for (const file of expected) {
  const post = JSON.parse(readFileSync(join(directory, file), "utf8"));
  if (`${post.slug}.json` !== file || typeof post.content !== "string") {
    throw new Error("[check-post-api] Published post payload is invalid");
  }
}

console.log(`[check-post-api] ${expected.size} published post JSON files; no extra artifacts`);
