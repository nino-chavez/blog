/**
 * Signal Dispatch OG share-card builder — 1200×630, rendered at build time via
 * @cf-wasm/og (Satori + resvg, node variant).
 *
 * Same learnings as the photography / rally-hq / letspepper cards: correct
 * 1200×630, on-brand, single origin-relative og:image per route, and the card
 * never depends on a remote fetch so it can't fail the most-shared URL.
 *
 * Layout is the site's own "CURRENT WORKING SET" band, scaled to a share card:
 * a hairline-ruled header (wordmark / date), an optically centred title over a
 * faint column grid, and a hairline-ruled footer (meta / byline). The coral
 * chip carries the category and is the one element that still reads at the
 * ~500px width a LinkedIn or X feed actually renders.
 *
 * Fonts must be passed as buffers — Satori resolves neither system fonts nor
 * CSS @font-face, so an unspecified family silently renders as DejaVu. The
 * subsets in ./og-fonts are the latin slices of @fontsource/inter@5.3.0,
 * vendored rather than read from node_modules so the card survives dependency
 * pruning. WOFF, not WOFF2: Satori's font parser does not support WOFF2, which
 * is all @fontsource-variable ships.
 */

import { ImageResponse } from '@cf-wasm/og/node'
import React from 'react'
import fs from 'node:fs'
import path from 'node:path'

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

const INK = '#0a0a0b' // brand surface.background
const CORAL = '#e86c5d' // Signal Coral — the single accent
const WHITE = '#ffffff'
const MUTED = '#9ca3af' // brand neutral-400
const HAIRLINE = 'rgba(255,255,255,0.10)' // band rules
const GRID = 'rgba(255,255,255,0.028)' // column rules, texture strength

/**
 * Read at module scope so a broken font path fails the build loudly rather than
 * emitting 300-odd cards in the wrong typeface. Resolved from cwd because these
 * cards are prerendered — `astro build` runs from the project root — and a
 * bundled `import.meta.url` would point at the output chunk, not at src/.
 */
const FONT_DIR = path.join(process.cwd(), 'src/lib/og-fonts')
const FONTS = [400, 600, 700, 800].map((weight) => ({
	name: 'Inter',
	data: fs.readFileSync(path.join(FONT_DIR, `inter-${weight}.woff`)),
	weight: weight as 400 | 600 | 700 | 800,
	style: 'normal' as const
}))

export interface CardData {
	/** Headline. Sized down in four steps; 100+ chars still fits. */
	title: string
	/** Coral chip text — category, collection name, or section. */
	kicker: string
	/** Header right — a date, or the origin on the site-wide card. */
	date: string
	/** Footer left — reading time, or what the publication contains. */
	meta: string
	/** Site-wide card only: the standfirst under the title. */
	tagline?: string
}

const el = React.createElement
const row = (style: React.CSSProperties, ...kids: React.ReactNode[]) =>
	el('div', { style: { display: 'flex', ...style } }, ...kids)
const column = (style: React.CSSProperties, ...kids: React.ReactNode[]) =>
	el('div', { style: { display: 'flex', flexDirection: 'column', ...style } }, ...kids)
const text = (style: React.CSSProperties, value: string) =>
	el('div', { style: { display: 'flex', ...style } }, value)

const caps = (size: number, color: string, weight = 600, tracking = '0.2em'): React.CSSProperties => ({
	fontSize: `${size}px`,
	fontWeight: weight,
	letterSpacing: tracking,
	textTransform: 'uppercase',
	color
})

/** Step the title down as it lengthens. Longest live title is 99 characters. */
function titleSize(title: string) {
	const steps: [number, number][] = [
		[26, 84],
		[46, 72],
		[72, 60],
		[Infinity, 50]
	]
	return steps.find(([max]) => title.length <= max)![1]
}

/**
 * Faint vertical rules — the working-set band's column dividers at texture
 * strength. Satori has no blur and no usable box-shadow, so structure like this
 * is how the card gets depth without a background image.
 */
function columnGrid(columns = 5) {
	return row(
		{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
		...Array.from({ length: columns }, (_, i) =>
			el('div', {
				key: `col-${i}`,
				style: {
					display: 'flex',
					flex: 1,
					borderRight: i === columns - 1 ? 'none' : `1px solid ${GRID}`
				}
			})
		)
	)
}

export function buildCard({ title, kicker, date, meta, tagline }: CardData) {
	return column(
		{
			width: `${OG_WIDTH}px`,
			height: `${OG_HEIGHT}px`,
			background: INK,
			fontFamily: 'Inter',
			position: 'relative',
			overflow: 'hidden'
		},
		// Coral glow, lower right. Satori paints in document order, so this stays
		// behind everything declared after it — `z-index` is not supported.
		el('div', {
			key: 'glow',
			style: {
				display: 'flex',
				position: 'absolute',
				bottom: '-240px',
				right: '-180px',
				width: '700px',
				height: '700px',
				borderRadius: '50%',
				background:
					'radial-gradient(circle, rgba(232,108,93,0.13) 0%, rgba(232,108,93,0.035) 45%, transparent 70%)'
			}
		}),
		// Header band
		row(
			{
				height: '96px',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '0 64px',
				borderBottom: `1px solid ${HAIRLINE}`
			},
			text(caps(22, CORAL, 700, '0.22em'), 'Signal Dispatch'),
			text(caps(20, MUTED, 500, '0.16em'), date)
		),
		// Body
		column(
			{ flex: 1, padding: '0 64px', justifyContent: 'center', position: 'relative' },
			columnGrid(5),
			row(
				{ marginBottom: '30px' },
				text(
					{
						...caps(18, INK, 700, '0.16em'),
						background: CORAL,
						padding: '9px 15px 10px',
						borderRadius: '3px'
					},
					kicker
				)
			),
			text(
				{
					fontSize: `${titleSize(title)}px`,
					fontWeight: 800,
					color: WHITE,
					lineHeight: 1.03,
					letterSpacing: '-0.03em',
					maxWidth: '1040px'
				},
				title
			),
			tagline
				? text(
					{ fontSize: '26px', color: MUTED, marginTop: '24px', maxWidth: '820px', lineHeight: 1.35 },
					tagline
				)
				: null
		),
		// Footer band
		row(
			{
				height: '88px',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '0 64px',
				borderTop: `1px solid ${HAIRLINE}`
			},
			text(caps(19, MUTED, 500, '0.16em'), meta),
			text({ fontSize: '21px', fontWeight: 600, color: 'rgba(255,255,255,0.55)' }, 'Nino Chavez')
		)
	)
}

/** Render a built card to a 1200×630 PNG response. */
export function renderCard(data: CardData) {
	return new ImageResponse(buildCard(data), { width: OG_WIDTH, height: OG_HEIGHT, fonts: FONTS })
}

/** `29 Jul 2026` — the date shape the site's own working-set band uses. */
export function cardDate(value: string | Date) {
	return new Date(value)
		.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
		.replace(/,/g, '')
}

export interface BlogCardData {
	title: string
	dateLabel: string
	readingTime: number
	category?: string | null
}

export function renderBlogCard({ title, dateLabel, readingTime, category }: BlogCardData) {
	return renderCard({
		title,
		kicker: category?.trim() || 'Dispatch',
		date: dateLabel,
		meta: `${readingTime} min read`
	})
}

/** The site-wide fallback card — `/og_image.*`, used by every route without one of its own. */
export const SITE_CARD: CardData = {
	title: 'Signal Dispatch',
	kicker: 'Publication',
	date: 'ninochavez.co',
	meta: 'Essays · Whitepapers · Field notes',
	tagline: 'Architecture, commerce, and the signals that matter.'
}
