import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );

  const items = sortedPosts.slice(0, 50).map((post) => {
    // Include full content for cross-posting tools
    const fullContent = post.body || '';

    return `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>https://ninochavez.co/blog/${post.id}</link>
      <guid isPermaLink="true">https://ninochavez.co/blog/${post.id}</guid>
      <pubDate>${new Date(post.data.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.data.excerpt}]]></description>
      <content:encoded><![CDATA[${fullContent}]]></content:encoded>
      <dc:creator><![CDATA[Nino Chavez]]></dc:creator>
      ${post.data.category ? `<category><![CDATA[${post.data.category}]]></category>` : ''}
      ${(post.data.tags || []).map((tag: string) => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
    </item>`;
  }).join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Signal Dispatch - Full Content</title>
    <description>Architecture, commerce, and the signals that matter. Full article content for cross-posting and syndication.</description>
    <link>https://ninochavez.co/blog</link>
    <atom:link href="https://ninochavez.co/blog/full-content-rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>nino@ninochavez.co (Nino Chavez)</managingEditor>
    <webMaster>nino@ninochavez.co (Nino Chavez)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} Nino Chavez. All rights reserved.</copyright>
    ${items}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
