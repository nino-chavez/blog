import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');

  const postsData = posts
    .sort((a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime())
    .map((post) => ({
      slug: post.id,
      title: post.data.title,
      excerpt: post.data.excerpt,
      publishedAt: post.data.publishedAt,
      updatedAt: post.data.updatedAt,
      category: post.data.category,
      tags: post.data.tags,
      author: post.data.author || 'Nino Chavez',
      url: `https://ninochavez.co/blog/${post.id}`,
      featureImage: post.data.featureImage,
      source: post.data.source,
    }));

  return new Response(JSON.stringify({
    meta: {
      title: 'Signal Dispatch',
      description: 'Architecture, commerce, and the signals that matter.',
      author: 'Nino Chavez',
      website: 'https://ninochavez.co/blog',
      totalPosts: postsData.length,
      lastUpdated: new Date().toISOString(),
      endpoints: {
        posts: '/api/posts.json',
        individualPost: '/api/posts/[slug].json',
        rss: '/blog/rss.xml',
        fullRss: '/blog/full-content-rss.xml',
        llmsContext: '/llms.txt',
      },
    },
    posts: postsData,
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
};
