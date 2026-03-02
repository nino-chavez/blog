import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
export async function GET() {
  const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );

  return rss({
    title: 'Signal Dispatch',
    description: 'Architecture, commerce, and the signals that matter. Exploring AI workflows, systems thinking, and leadership through practical experience.',
    site: 'https://ninochavez.co',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.publishedAt),
      description: post.data.excerpt,
      link: `/blog/${post.id}`,
      categories: post.data.tags || [],
      author: post.data.author || 'Nino Chavez',
    })),
    customData: `
      <language>en-us</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <managingEditor>nino@ninochavez.co (Nino Chavez)</managingEditor>
      <webMaster>nino@ninochavez.co (Nino Chavez)</webMaster>
      <atom:link href="https://ninochavez.co/blog/rss.xml" rel="self" type="application/rss+xml"/>
    `,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
  });
}
