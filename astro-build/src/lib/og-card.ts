/**
 * Signal Dispatch OG share-card builder — 1200×630, rendered at build time via
 * @cf-wasm/og (Satori + resvg, node variant). One typography-forward post card.
 *
 * Same learnings as the photography / rally-hq / letspepper cards: correct
 * 1200×630, on-brand, single origin-relative og:image per route, and the card
 * never depends on a remote fetch so it can't fail the most-shared URL.
 */

import { ImageResponse } from '@cf-wasm/og/node'
import React from 'react'

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

const INK = '#0a0a0b' // zinc-950 ground
const CORAL = '#e86c5d' // Signal Coral — primary accent
const WHITE = '#ffffff'
const MUTED = '#a1a1aa' // zinc-400

export interface BlogCardData {
	title: string
	dateLabel: string
	readingTime: number
	category?: string | null
}

export function buildBlogPostCard({ title, dateLabel, readingTime, category }: BlogCardData) {
	const titleSize = title.length > 70 ? '54px' : title.length > 44 ? '66px' : '80px'

	const metaParts = [dateLabel, `${readingTime} min read`]

	return React.createElement(
		'div',
		{
			style: {
				display: 'flex',
				flexDirection: 'column',
				width: `${OG_WIDTH}px`,
				height: `${OG_HEIGHT}px`,
				background: INK,
				padding: '72px 80px',
				fontFamily: 'sans-serif',
				position: 'relative',
				overflow: 'hidden'
			}
		},
		// Coral accent rail down the left edge
		React.createElement('div', {
			key: 'rail',
			style: { display: 'flex', position: 'absolute', top: 0, left: 0, bottom: 0, width: '12px', background: CORAL }
		}),
		// Soft coral glow, lower-right
		React.createElement('div', {
			key: 'glow',
			style: {
				display: 'flex',
				position: 'absolute',
				bottom: '-140px',
				right: '-120px',
				width: '460px',
				height: '460px',
				borderRadius: '50%',
				background: `radial-gradient(circle, ${CORAL}26 0%, transparent 66%)`
			}
		}),
		// Eyebrow: wordmark + optional category
		React.createElement(
			'div',
			{
				key: 'eyebrow',
				style: {
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					gap: '14px',
					marginBottom: '28px',
					zIndex: 1
				}
			},
			React.createElement('div', {
				key: 'wm',
				style: {
					display: 'flex',
					fontSize: '22px',
					fontWeight: 700,
					letterSpacing: '0.22em',
					textTransform: 'uppercase',
					color: CORAL
				}
			}, 'Signal Dispatch'),
			category
				? React.createElement('div', {
					key: 'cat',
					style: { display: 'flex', fontSize: '20px', color: 'rgba(255,255,255,0.28)' }
				}, '·')
				: null,
			category
				? React.createElement('div', {
					key: 'catname',
					style: {
						display: 'flex',
						fontSize: '20px',
						fontWeight: 500,
						letterSpacing: '0.04em',
						textTransform: 'uppercase',
						color: MUTED
					}
				}, category)
				: null
		),
		// Title
		React.createElement('div', {
			key: 'title',
			style: {
				display: 'flex',
				fontSize: titleSize,
				fontWeight: 800,
				color: WHITE,
				lineHeight: '1.04',
				letterSpacing: '-0.02em',
				maxWidth: '1010px',
				zIndex: 1
			}
		}, title),
		// spacer
		React.createElement('div', { key: 'spacer', style: { display: 'flex', flex: 1 } }),
		// Footer: meta + byline
		React.createElement(
			'div',
			{
				key: 'footer',
				style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }
			},
			React.createElement('div', {
				key: 'meta',
				style: { display: 'flex', fontSize: '24px', color: MUTED }
			}, metaParts.join('  ·  ')),
			React.createElement('div', {
				key: 'byline',
				style: { display: 'flex', fontSize: '22px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }
			}, 'Nino Chavez')
		)
	)
}

/** Render a built card to a 1200×630 PNG response. */
export function renderBlogCard(data: BlogCardData) {
	return new ImageResponse(buildBlogPostCard(data), { width: OG_WIDTH, height: OG_HEIGHT })
}
