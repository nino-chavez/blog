import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET() {
  const posts = await getCollection('blog', ({ data }) => data.status === 'published');

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );

  return rss({
    title: 'Signal Dispatch',
    description: 'Architecture, commerce, and the signals that matter. Exploring AI workflows, systems thinking, and leadership through practical experience.',
    // The blog index, not the site root: `site` becomes the channel <link>, and this feed is the
    // blog's, not the main site's. full-content-rss.xml already used /blog. Item links below are
    // root-relative, so they resolve against the origin regardless of the base path here.
    site: 'https://ninochavez.co/blog',
    // @astrojs/rss defaults this to TRUE, and nothing here opted out — so every <link> and every
    // <guid isPermaLink="true"> ended in a slash the site does not serve (308 to the bare form).
    // The guid is a permalink by declaration, which makes it the item's identity in every reader
    // and aggregator; pointing it at a redirect is the RSS version of the canonical bug in #42.
    // astro.config.mjs sets trailingSlash: "never" — this is the feed honoring the same rule.
    trailingSlash: false,
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
