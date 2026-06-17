/**
 * Per-post OG card — /og/[slug].png
 *
 * Prerendered at build time (output: 'server', so this endpoint opts into
 * static generation) into one PNG per published post. BaseLayout points each
 * post's og:image here; the home/site card stays the existing static asset.
 */

import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { renderBlogCard } from '../../lib/og-card'

export const prerender = true

export async function getStaticPaths() {
	const posts = await getCollection('blog')
	return posts
		.filter((p) => p.data.status === 'published')
		.map((post) => ({ params: { slug: post.id } }))
}

export const GET: APIRoute = async ({ params }) => {
	const posts = await getCollection('blog')
	const post = posts.find((p) => p.id === params.slug && p.data.status === 'published')
	if (!post) {
		return new Response('Not found', { status: 404 })
	}

	const wordCount = post.body?.split(/\s+/).filter(Boolean).length ?? 0
	const readingTime = Math.max(1, Math.ceil(wordCount / 200))
	const dateLabel = new Date(post.data.publishedAt).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	})

	return renderBlogCard({
		title: post.data.title,
		dateLabel,
		readingTime,
		category: post.data.category ?? null
	})
}
