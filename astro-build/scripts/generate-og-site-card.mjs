/**
 * Regenerate the site-wide share card from src/lib/og-card.ts.
 *
 * The card that shipped before this script was hand-authored and orphaned: a
 * violet-to-orange circuit-board gradient left over from the pre-coral brand —
 * the exact palette global.css renounces in writing as "the single most
 * recognizable generated-UI palette". It could not drift back into line with
 * the per-post cards because nothing generated it. Now one builder feeds both.
 *
 * Filenames are fixed, not incidental. `/og_image.png` is the JSON-LD image,
 * `/og_image.webp` is BaseLayout's `image` default (og:image for every route
 * without a card of its own), `-600w.webp` is its responsive derivative, and
 * `public/blog/og_image.png` is the same asset under the served `/blog` prefix.
 * The apex router claims `/og_image` and `/og/` by literal prefix, so renaming
 * any of these needs a router-Worker deploy to stay reachable.
 *
 * Run from astro-build/:  node scripts/generate-og-site-card.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
// og-card.ts resolves its fonts from cwd, matching how `astro build` invokes it.
if (!(await fs.stat('src/lib/og-fonts').catch(() => null))) {
	console.error('Run this from the astro-build/ directory.')
	process.exit(1)
}

const { renderCard, SITE_CARD } = await import('../src/lib/og-card.ts')

const PUBLIC = 'public'
const png = Buffer.from(await renderCard(SITE_CARD).arrayBuffer())

const targets = [
	['og_image.png', png],
	['blog/og_image.png', png],
	['og_image.webp', await sharp(png).webp({ quality: 88 }).toBuffer()],
	['og_image-600w.webp', await sharp(png).resize(600, 315).webp({ quality: 88 }).toBuffer()]
]

for (const [name, buf] of targets) {
	const file = path.join(PUBLIC, name)
	await fs.mkdir(path.dirname(file), { recursive: true })
	await fs.writeFile(file, buf)
	console.log(`${file}  ${(buf.length / 1024).toFixed(0)}kb`)
}
