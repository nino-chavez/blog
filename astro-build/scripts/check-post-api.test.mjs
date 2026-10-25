import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const script = fileURLToPath(new URL("./check-post-api.mjs", import.meta.url));

function check(t, { index = [{ slug: "published" }], artifacts = { published: { slug: "published", content: "Public body" } } } = {}) {
  const root = mkdtempSync(join(tmpdir(), "blog-post-api-check-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const api = join(root, "dist/blog/api");
  mkdirSync(join(api, "posts"), { recursive: true });
  if (index !== null) writeFileSync(join(api, "posts.json"), JSON.stringify({ posts: index }));
  for (const [slug, payload] of Object.entries(artifacts)) {
    writeFileSync(join(api, "posts", `${slug}.json`), JSON.stringify(payload));
  }
  return spawnSync(process.execPath, [script], { cwd: root, input: "", encoding: "utf8", timeout: 10000 });
}

test("accepts the complete published JSON set", (t) => {
  const result = check(t);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 published post JSON files; no extra artifacts/);
});

test("rejects extra draft or unexpected JSON artifacts without logging their names", (t) => {
  const result = check(t, { artifacts: {
    published: { slug: "published", content: "Public body" },
    "private-fixture": { slug: "private-fixture", content: "Private body" },
  } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /1 unexpected JSON artifacts/);
  assert.doesNotMatch(result.stderr, /private-fixture|Private body/);
});

test("rejects a missing published artifact", (t) => {
  const result = check(t, { artifacts: {} });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /1 missing published artifacts/);
});

test("rejects a missing public index", (t) => {
  assert.notEqual(check(t, { index: null }).status, 0);
});

test("rejects the wrong post payload at a published path", (t) => {
  const result = check(t, { artifacts: { published: { slug: "other", content: "Wrong body" } } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Published post payload is invalid/);
});
