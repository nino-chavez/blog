#!/usr/bin/env node
// Every local hero image ships as a 1200w original plus a committed 600w
// sibling named `<name>-600w.webp`. `src/utils/feature-image.ts` puts that
// sibling in the srcset unconditionally for site-local `.webp` paths, so a
// missing file is a 404 the moment a client picks the small candidate.
//
// Nothing surfaced that on its own. srcset selection is DPR-scaled, so a phone
// at DPR 2–3 takes the 1200w candidate and renders fine; only DPR-1 clients and
// crawlers that walk srcset ever request the 600w. 56 of 260 referenced images
// were missing one and the only evidence was 404s in edge telemetry.
//
// So the check runs BEFORE `astro build` — fail in seconds, not after a full
// build and pagefind index.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const PUBLIC_DIR = resolve("public");
const CONTENT_DIR = resolve("src/content");

// The default BaseLayout `image`, preloaded by every `type="article"` page that
// passes no image of its own. It needs a sibling for the same reason.
const LAYOUT_DEFAULT_IMAGES = ["/og_image.webp"];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const referenced = new Map(); // image path -> first file that referenced it

for (const file of walk(CONTENT_DIR).filter((f) => /\.mdx?$/.test(f))) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(
    /(?:featureImage|ogImage):\s*["'](\/[^"']+\.webp)["']/g
  )) {
    if (!referenced.has(match[1])) referenced.set(match[1], file);
  }
}
for (const image of LAYOUT_DEFAULT_IMAGES) {
  referenced.set(image, "src/layouts/BaseLayout.astro (default)");
}

const missing = [];
for (const [image, source] of referenced) {
  const variant = image.replace(/\.webp$/, "-600w.webp");
  if (!existsSync(join(PUBLIC_DIR, variant))) {
    missing.push({ variant, image, source });
  }
}

if (missing.length > 0) {
  console.error(
    `\n[check-feature-images] ${missing.length} referenced image(s) have no 600w sibling:\n`
  );
  for (const { variant, source } of missing) {
    console.error(`  missing public${variant}`);
    console.error(`     referenced by ${source.replace(`${process.cwd()}/`, "")}`);
  }
  console.error(
    `\n  Generate each from its 1200w original, matching the existing set:\n` +
      `    cd public/images/generated\n` +
      `    magick <name>.webp -resize 600x -quality 92 -define webp:method=6 <name>-600w.webp\n` +
      `  Then commit the .webp files — they are not built, they are shipped.\n`
  );
  process.exit(1);
}

console.log(
  `[check-feature-images] ${referenced.size} referenced images, all have a 600w sibling`
);
