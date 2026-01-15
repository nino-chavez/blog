import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === params.slug);

  if (!post) {
    return new Response(JSON.stringify({
      error: 'Post not found',
      slug: params.slug,
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return new Response(JSON.stringify({
    slug: post.id,
    title: post.data.title,
    excerpt: post.data.excerpt,
    content: post.body, // Raw markdown content for LLMs
    publishedAt: post.data.publishedAt,
    updatedAt: post.data.updatedAt,
    category: post.data.category,
    tags: post.data.tags,
    author: post.data.author || 'Nino Chavez',
    url: `https://ninochavez.co/blog/${post.id}`,
    featureImage: post.data.featureImage,
    source: post.data.source,
    linkedinUrl: post.data.linkedinUrl,
    meta: {
      wordCount: post.body?.split(/\s+/).length || 0,
      readingTime: Math.ceil((post.body?.split(/\s+/).length || 0) / 200),
    },
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
};
