import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const script = fileURLToPath(new URL("./check-post-api.mjs", import.meta.url));

function check(t, { routes = { version: 1, include: ["/blog/api/posts/*"], exclude: [] }, artifacts = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), "blog-post-api-check-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const api = join(root, "dist/blog/api");
  mkdirSync(join(api, "posts"), { recursive: true });
  if (routes !== null) writeFileSync(join(root, "dist/_routes.json"), JSON.stringify(routes));
  for (const [slug, payload] of Object.entries(artifacts)) {
    writeFileSync(join(api, "posts", `${slug}.json`), JSON.stringify(payload));
  }
  return spawnSync(process.execPath, [script], { cwd: root, input: "", encoding: "utf8", timeout: 10000 });
}

test("accepts runtime routing without static JSON", (t) => {
  const result = check(t);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /runtime publication check; no static artifacts/);
});

test("rejects retained static JSON without logging private names or content", (t) => {
  const result = check(t, { artifacts: {
    "private-fixture": { slug: "private-fixture", content: "Private body" },
  } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /1 static post JSON artifacts/);
  assert.doesNotMatch(result.stderr, /private-fixture|Private body/);
});

test("rejects a broad static exclusion overriding the runtime route", (t) => {
  const result = check(t, { routes: { include: ["/blog/api/posts/*"], exclude: ["/blog/*"] } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /bypasses the runtime publication check/);
});

test("rejects missing routes", (t) => {
  assert.notEqual(check(t, { routes: null }).status, 0);
});

test("rejects a route that never invokes the post endpoint", (t) => {
  const result = check(t, { routes: { include: ["/_image"], exclude: [] } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /bypasses the runtime publication check/);
});

test("routing keeps static pages out of the Worker without excluding the JSON endpoint", (t) => {
  const root = mkdtempSync(join(tmpdir(), "blog-post-api-routes-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "dist/_worker.js"), { recursive: true });
  writeFileSync(join(root, "dist/_routes.json"), JSON.stringify({
    version: 1, include: ["/*"], exclude: ["/blog/*"],
  }));
  const routes = [
    { routeData: { route: "/blog/[slug]", prerender: true } },
    { routeData: { route: "/blog/private/[token]/[slug]", prerender: true } },
    { routeData: { route: "/blog/api/posts/[slug].json", prerender: false } },
    { routeData: { route: "/_image", prerender: false } },
    { routeData: { route: "/_server-islands/[name]", prerender: false } },
  ];
  writeFileSync(join(root, "dist/_worker.js/manifest_fixture.mjs"),
    `export const manifest = ${JSON.stringify({ routes })};`);
  const optimize = fileURLToPath(new URL("./optimize-routes.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [optimize], { cwd: root, input: "", encoding: "utf8", timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
  const generated = JSON.parse(readFileSync(join(root, "dist/_routes.json"), "utf8"));
  assert.deepEqual(generated, {
    version: 1,
    include: ["/blog/api/posts/*", "/_image", "/_server-islands/*"],
    exclude: [],
  });
});
