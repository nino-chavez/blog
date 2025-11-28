# Signal Dispatch: Astro Migration Plan

## Executive Summary

Migrate from Vite + React SPA to Astro with full LLM/AEO/GEO optimization. This addresses the core problem: bots and LLMs cannot read your articles because they're client-rendered.

**Current State:**
- 174 blog posts + 3 whitepapers (MDX)
- React SPA with client-side rendering
- Custom MDX components (Callout, PullQuote, Figure, BeforeAfter, Mermaid)
- Existing RSS, sitemap, manifest generation scripts
- Deployed on Vercel

**Target State:**
- Static HTML pages (pre-rendered at build time)
- Full LLM/bot accessibility
- JSON-LD structured data on every page
- Content API for programmatic access
- Same authoring experience (MDX files stay identical)

---

## Phase 1: Project Setup (Day 1)

### 1.1 Create New Astro Project

```bash
# Create alongside current project
cd ~/Workspace/02-local-dev/sites
npm create astro@latest signal-dispatch-astro -- --template minimal

# Or create in a new branch
cd signal-dispatch-blog
git checkout -b feature/astro-migration
```

### 1.2 Install Required Integrations

```bash
cd signal-dispatch-astro

# Core integrations
npx astro add mdx
npx astro add tailwind
npx astro add react
npx astro add sitemap

# Additional dependencies (match current project)
npm install @phosphor-icons/react framer-motion mermaid lottie-react
npm install rehype-pretty-code shiki
npm install gray-matter
```

### 1.3 Configure astro.config.mjs

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import rehypePrettyCode from 'rehype-pretty-code';

export default defineConfig({
  site: 'https://blog.ninochavez.co',
  integrations: [
    mdx({
      remarkPlugins: [remarkGfm, remarkEmoji],
      rehypePlugins: [
        [rehypePrettyCode, {
          theme: 'github-dark-dimmed',
          keepBackground: false,
        }],
      ],
    }),
    tailwind(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/draft/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  output: 'static', // Full static site generation
  trailingSlash: 'never',
  build: {
    format: 'file', // /slug instead of /slug/index.html
  },
});
```

### 1.4 Configure Tailwind (tailwind.config.mjs)

```javascript
// Copy existing tailwind.config.ts content
// Ensure custom colors (athletic-court-orange, athletic-brand-violet) are preserved
```

---

## Phase 2: Content Migration (Days 2-3)

### 2.1 Content Collections Schema

Create `/src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()).optional(),
    author: z.string().default('Nino Chavez'),
    status: z.enum(['published', 'draft']).default('published'),
    excerpt: z.string(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    featured: z.boolean().default(false),
    featureImage: z.string().optional(),
    source: z.enum(['ghost', 'linkedin', 'original']).optional(),
    linkedinUrl: z.string().optional(),
    externalUrl: z.string().optional(),
    gammaId: z.string().optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }).optional(),
  }),
});

const whitepaperCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string().or(z.date()),
    author: z.string().default('Nino Chavez'),
    excerpt: z.string(),
    category: z.string().optional(),
    featureImage: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  whitepapers: whitepaperCollection,
};
```

### 2.2 Copy Content Files

```bash
# Copy MDX files (no changes needed to content!)
cp -r src/content/blog/* ../signal-dispatch-astro/src/content/blog/
cp -r src/content/whitepapers/* ../signal-dispatch-astro/src/content/whitepapers/
```

### 2.3 Migrate React Components

Components that need migration:

| Component | Strategy |
|-----------|----------|
| `mdx/Callout.tsx` | Keep as React, use `client:load` |
| `mdx/PullQuote.tsx` | Keep as React, use `client:load` |
| `mdx/Figure.tsx` | Convert to Astro component (static) |
| `mdx/BeforeAfter.tsx` | Keep as React, use `client:visible` |
| `mdx/Mermaid.tsx` | Keep as React, use `client:idle` |
| `CategoryFilter.tsx` | Keep as React, use `client:load` |
| `SearchBar.tsx` | Keep as React, use `client:load` |
| `ReadingProgress.tsx` | Keep as React, use `client:only="react"` |
| `CopyLinkButton.tsx` | Keep as React, use `client:visible` |
| `SocialShare.tsx` | Convert to Astro (static links) |
| `RelatedPosts.tsx` | Convert to Astro component |

Create `/src/components/mdx/index.ts` for MDX component mapping:

```typescript
export { Callout } from './Callout';
export { PullQuote } from './PullQuote';
export { Figure } from './Figure';
export { BeforeAfter } from './BeforeAfter';
export { Mermaid } from './Mermaid';
```

---

## Phase 3: Page Templates (Days 4-5)

### 3.1 Base Layout (`/src/layouts/BaseLayout.astro`)

```astro
---
import '@fontsource-variable/inter';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  canonicalUrl?: string;
}

const {
  title,
  description = 'Architecture, commerce, and the signals that matter.',
  image = '/og_image.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Nino Chavez',
  tags = [],
  canonicalUrl,
} = Astro.props;

const siteUrl = 'https://blog.ninochavez.co';
const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
const canonical = canonicalUrl || Astro.url.href;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/favico.png" />

    <!-- Primary Meta Tags -->
    <title>{title} - Signal Dispatch</title>
    <meta name="title" content={`${title} - Signal Dispatch`} />
    <meta name="description" content={description} />
    <meta name="author" content={author} />
    <link rel="canonical" href={canonical} />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content={type} />
    <meta property="og:url" content={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={fullImage} />
    <meta property="og:site_name" content="Signal Dispatch" />

    <!-- Article-specific OG tags -->
    {type === 'article' && publishedTime && (
      <meta property="article:published_time" content={publishedTime} />
    )}
    {type === 'article' && modifiedTime && (
      <meta property="article:modified_time" content={modifiedTime} />
    )}
    {type === 'article' && author && (
      <meta property="article:author" content={author} />
    )}
    {type === 'article' && tags.map((tag) => (
      <meta property="article:tag" content={tag} />
    ))}

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonical} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={fullImage} />

    <!-- LLM/AI Crawler Signals -->
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="ai-content-declaration" content="human-authored" />

    <!-- RSS Feed -->
    <link rel="alternate" type="application/rss+xml" title="Signal Dispatch RSS" href="/rss.xml" />

    <!-- JSON-LD will be injected per-page -->
    <slot name="head" />
  </head>
  <body class="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
    <slot />
  </body>
</html>
```

### 3.2 Blog Post Template (`/src/pages/[slug].astro`)

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import BlogPostLayout from '../layouts/BlogPostLayout.astro';
import { generateArticleSchema, generateBreadcrumbSchema } from '../utils/schema';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();

// Generate JSON-LD
const articleSchema = generateArticleSchema(post);
const breadcrumbSchema = generateBreadcrumbSchema(post);
---

<BaseLayout
  title={post.data.title}
  description={post.data.excerpt}
  image={post.data.featureImage}
  type="article"
  publishedTime={post.data.publishedAt}
  modifiedTime={post.data.updatedAt}
  author={post.data.author}
  tags={post.data.tags}
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(articleSchema)} />
    <script type="application/ld+json" set:html={JSON.stringify(breadcrumbSchema)} />
  </Fragment>

  <BlogPostLayout post={post}>
    <Content />
  </BlogPostLayout>
</BaseLayout>
```

### 3.3 Blog List Page (`/src/pages/index.astro`)

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import BlogListLayout from '../layouts/BlogListLayout.astro';
import { generateWebsiteSchema, generateBlogListSchema } from '../utils/schema';

const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');
const sortedPosts = posts.sort((a, b) =>
  new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
);

const websiteSchema = generateWebsiteSchema();
const blogListSchema = generateBlogListSchema(sortedPosts);
---

<BaseLayout
  title="Signal Dispatch"
  description="Architecture, commerce, and the signals that matter. Exploring AI workflows, systems thinking, and leadership through practical experience."
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(websiteSchema)} />
    <script type="application/ld+json" set:html={JSON.stringify(blogListSchema)} />
  </Fragment>

  <BlogListLayout posts={sortedPosts} />
</BaseLayout>
```

---

## Phase 4: LLM/AEO/GEO Optimization (Days 6-7)

### 4.1 JSON-LD Schema Utilities (`/src/utils/schema.ts`)

```typescript
import type { CollectionEntry } from 'astro:content';

const SITE_URL = 'https://blog.ninochavez.co';
const AUTHOR = {
  '@type': 'Person',
  name: 'Nino Chavez',
  url: 'https://ninochavez.co',
  sameAs: [
    'https://linkedin.com/in/ninochavez',
    'https://github.com/ninochavez',
  ],
};

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Signal Dispatch',
    description: 'Architecture, commerce, and the signals that matter.',
    url: SITE_URL,
    author: AUTHOR,
    publisher: {
      '@type': 'Person',
      name: 'Nino Chavez',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og_image.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateArticleSchema(post: CollectionEntry<'blog'>) {
  const { data } = post;
  const publishDate = new Date(data.publishedAt).toISOString();
  const modifiedDate = data.updatedAt
    ? new Date(data.updatedAt).toISOString()
    : publishDate;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/${post.slug}#article`,
    headline: data.title,
    description: data.excerpt,
    image: data.featureImage
      ? (data.featureImage.startsWith('http') ? data.featureImage : `${SITE_URL}${data.featureImage}`)
      : `${SITE_URL}/og_image.png`,
    datePublished: publishDate,
    dateModified: modifiedDate,
    author: AUTHOR,
    publisher: {
      '@type': 'Person',
      name: 'Nino Chavez',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og_image.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${post.slug}`,
    },
    keywords: data.tags?.join(', ') || '',
    articleSection: data.category || 'General',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    // AEO-specific: Help LLMs understand content structure
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article h2', '.excerpt', '.prose p:first-of-type'],
    },
  };
}

export function generateBreadcrumbSchema(post: CollectionEntry<'blog'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Signal Dispatch',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.data.category || 'Blog',
        item: `${SITE_URL}/?category=${encodeURIComponent(post.data.category || 'all')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.data.title,
        item: `${SITE_URL}/${post.slug}`,
      },
    ],
  };
}

export function generateBlogListSchema(posts: CollectionEntry<'blog'>[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}#blog`,
    name: 'Signal Dispatch',
    description: 'Architecture, commerce, and the signals that matter.',
    url: SITE_URL,
    author: AUTHOR,
    blogPost: posts.slice(0, 20).map((post) => ({
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/${post.slug}`,
      headline: post.data.title,
      description: post.data.excerpt,
      datePublished: new Date(post.data.publishedAt).toISOString(),
      url: `${SITE_URL}/${post.slug}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://ninochavez.co#person',
    name: 'Nino Chavez',
    url: 'https://ninochavez.co',
    jobTitle: 'Principal Consultant & Enterprise Architect',
    description: 'Strategy, architecture, and AI automation. Turning enterprise complexity into competitive advantage.',
    image: 'https://ninochavez.co/nino-chavez.jpg',
    sameAs: [
      'https://linkedin.com/in/ninochavez',
      'https://github.com/ninochavez',
      'https://blog.ninochavez.co',
    ],
    knowsAbout: [
      'Enterprise Architecture',
      'AI Automation',
      'Commerce Platforms',
      'Systems Thinking',
      'Digital Transformation',
    ],
  };
}
```

### 4.2 Enhanced robots.txt (`/public/robots.txt`)

```
# robots.txt for blog.ninochavez.co
# Optimized for search engines AND LLM crawlers

# Allow all crawlers
User-agent: *
Allow: /

# Specific LLM/AI crawler permissions
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Amazonbot
Allow: /

# Sitemaps
Sitemap: https://blog.ninochavez.co/sitemap-index.xml
Sitemap: https://blog.ninochavez.co/sitemap-0.xml

# Content API for programmatic access
# See /api/posts.json for full article data
```

### 4.3 Content API Endpoints

Create `/src/pages/api/posts.json.ts`:

```typescript
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');

  const postsData = posts
    .sort((a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime())
    .map((post) => ({
      slug: post.slug,
      title: post.data.title,
      excerpt: post.data.excerpt,
      publishedAt: post.data.publishedAt,
      updatedAt: post.data.updatedAt,
      category: post.data.category,
      tags: post.data.tags,
      author: post.data.author,
      url: `https://blog.ninochavez.co/${post.slug}`,
      featureImage: post.data.featureImage,
    }));

  return new Response(JSON.stringify({
    meta: {
      title: 'Signal Dispatch',
      description: 'Architecture, commerce, and the signals that matter.',
      author: 'Nino Chavez',
      totalPosts: postsData.length,
      lastUpdated: new Date().toISOString(),
    },
    posts: postsData,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
```

Create `/src/pages/api/posts/[slug].json.ts` (individual post API):

```typescript
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    return new Response(JSON.stringify({ error: 'Post not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get the raw MDX content (body without frontmatter)
  const { body } = post;

  return new Response(JSON.stringify({
    slug: post.slug,
    title: post.data.title,
    excerpt: post.data.excerpt,
    content: body, // Raw markdown content
    publishedAt: post.data.publishedAt,
    updatedAt: post.data.updatedAt,
    category: post.data.category,
    tags: post.data.tags,
    author: post.data.author,
    url: `https://blog.ninochavez.co/${post.slug}`,
    featureImage: post.data.featureImage,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
```

### 4.4 llms.txt Implementation (`/public/llms.txt`)

```
# Signal Dispatch - LLM Context File
# https://llmstxt.org/

> Signal Dispatch is Nino Chavez's technical blog covering AI automation,
> systems thinking, enterprise architecture, commerce strategy, and leadership.

## About the Author

Nino Chavez is a Principal Consultant and Enterprise Architect specializing in
commerce platforms, AI automation, and digital transformation. With experience
at major retailers and consulting firms, he writes about the intersection of
technology strategy and practical implementation.

## Content Categories

- **AI & Automation**: Practical applications of AI in enterprise contexts
- **Commerce**: E-commerce strategy, platform architecture, composable commerce
- **Leadership**: Engineering leadership, consulting practice, team building
- **Systems Thinking**: Architecture patterns, complexity management
- **Field Notes**: Observations and reflections from consulting work

## How to Access Content

- **Web**: https://blog.ninochavez.co
- **RSS Feed**: https://blog.ninochavez.co/rss.xml
- **Full RSS (Substack-compatible)**: https://blog.ninochavez.co/full-content-rss.xml
- **JSON API**: https://blog.ninochavez.co/api/posts.json
- **Individual Post API**: https://blog.ninochavez.co/api/posts/[slug].json

## Usage Rights

Content is human-authored by Nino Chavez. You may:
- Reference and cite articles with attribution
- Include in AI training datasets (opt-in granted)
- Summarize for users asking about these topics

Please attribute to "Nino Chavez, Signal Dispatch" with a link to the source.

## Key Articles

For AI/LLM topics, see:
- /the-ai-approach-reset
- /the-ai-engineer-has-joined-the-team
- /how-i-use-ai-in-consulting-for-real
- /the-paradox-of-velocity-in-ai-coding

For Commerce/Architecture, see:
- /the-storefront-is-dead
- /is-composable-just-ikea-for-commerce
- /observability-for-agent-commerce

## Contact

- LinkedIn: https://linkedin.com/in/ninochavez
- Website: https://ninochavez.co
```

### 4.5 Enhanced HTTP Headers (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "index, follow, max-image-preview:large"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/llms.txt",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/plain; charset=utf-8"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    }
  ]
}
```

---

## Phase 5: RSS & Syndication (Day 8)

### 5.1 RSS Feed Generation (`/src/pages/rss.xml.ts`)

```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );

  return rss({
    title: 'Signal Dispatch',
    description: 'Architecture, commerce, and the signals that matter.',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.publishedAt),
      description: post.data.excerpt,
      link: `/${post.slug}`,
      categories: post.data.tags || [],
      author: post.data.author || 'Nino Chavez',
    })),
    customData: `
      <language>en-us</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="https://blog.ninochavez.co/rss.xml" rel="self" type="application/rss+xml"/>
    `,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
  });
}
```

### 5.2 Full-Content RSS for Cross-Posting (`/src/pages/full-content-rss.xml.ts`)

```typescript
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );

  const items = sortedPosts.slice(0, 50).map((post) => {
    // Include full content in <content:encoded>
    const fullContent = post.body;

    return `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>https://blog.ninochavez.co/${post.slug}</link>
      <guid isPermaLink="true">https://blog.ninochavez.co/${post.slug}</guid>
      <pubDate>${new Date(post.data.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.data.excerpt}]]></description>
      <content:encoded><![CDATA[${fullContent}]]></content:encoded>
      <dc:creator><![CDATA[Nino Chavez]]></dc:creator>
      ${post.data.category ? `<category><![CDATA[${post.data.category}]]></category>` : ''}
      ${(post.data.tags || []).map((tag: string) => `<category><![CDATA[${tag}]]></category>`).join('\n')}
    </item>`;
  }).join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Signal Dispatch</title>
    <description>Architecture, commerce, and the signals that matter.</description>
    <link>https://blog.ninochavez.co</link>
    <atom:link href="https://blog.ninochavez.co/full-content-rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>nino@ninochavez.co (Nino Chavez)</managingEditor>
    <webMaster>nino@ninochavez.co (Nino Chavez)</webMaster>
    ${items}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

---

## Phase 6: Testing & Validation (Day 9)

### 6.1 LLM Accessibility Testing

Create `/scripts/test-llm-access.ts`:

```typescript
import { chromium } from 'playwright';

async function testLLMAccess() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: 'GPTBot/1.0 (+https://openai.com/gptbot)',
  });

  const page = await context.newPage();

  // Test homepage
  await page.goto('http://localhost:4321');
  const homeContent = await page.content();

  // Verify static content is present
  const hasArticles = homeContent.includes('Signal Dispatch');
  console.log(`Homepage has content: ${hasArticles}`);

  // Test individual post
  await page.goto('http://localhost:4321/the-storefront-is-dead');
  const postContent = await page.content();

  // Verify article content is in HTML (not loaded via JS)
  const hasArticleContent = postContent.includes('Most customers don\'t browse anymore');
  console.log(`Post has static content: ${hasArticleContent}`);

  // Test JSON-LD
  const jsonLd = await page.$eval(
    'script[type="application/ld+json"]',
    (el) => el.textContent
  );
  console.log(`JSON-LD present: ${!!jsonLd}`);

  await browser.close();
}

testLLMAccess();
```

### 6.2 Schema Validation

Test with Google's Rich Results Test:
- https://search.google.com/test/rich-results

Test with Schema.org Validator:
- https://validator.schema.org/

### 6.3 Performance Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test production build
lighthouse https://blog.ninochavez.co --output=json --output-path=./lighthouse-report.json
```

---

## Phase 7: Deployment (Day 10)

### 7.1 Vercel Configuration

Update `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "index, follow, max-image-preview:large"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/:slug/",
      "destination": "/:slug",
      "permanent": true
    }
  ]
}
```

### 7.2 Deployment Checklist

- [ ] All 174 posts render correctly
- [ ] Whitepapers section works
- [ ] RSS feeds validate (W3C validator)
- [ ] JSON API returns correct data
- [ ] JSON-LD validates (Google Rich Results)
- [ ] robots.txt is accessible
- [ ] llms.txt is accessible
- [ ] Sitemap generates correctly
- [ ] Open Graph images work
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Related posts display
- [ ] Reading progress indicator works
- [ ] Social sharing works
- [ ] Copy link button works
- [ ] Mobile responsive

### 7.3 Post-Deployment Verification

```bash
# Test bot accessibility
curl -A "GPTBot/1.0" https://blog.ninochavez.co/the-storefront-is-dead | grep "Most customers"

# Test API
curl https://blog.ninochavez.co/api/posts.json | jq '.meta.totalPosts'

# Test JSON-LD
curl https://blog.ninochavez.co/the-storefront-is-dead | grep "application/ld+json"
```

---

## Summary: What You Get

### Before (Current React SPA)
- ❌ Bots see empty `<div id="root"></div>`
- ❌ LLMs cannot read articles
- ❌ No structured data
- ❌ Poor SEO performance
- ❌ 200-300kb JavaScript bundle

### After (Astro Migration)
- ✅ Full HTML content in initial response
- ✅ All LLM crawlers can read articles
- ✅ JSON-LD structured data on every page
- ✅ Content API for programmatic access
- ✅ llms.txt for AI context
- ✅ 15-50kb JavaScript (90% reduction)
- ✅ Sub-second page loads
- ✅ Same MDX authoring experience
- ✅ Same React components

### LLM/AEO Optimizations Included
| Feature | Purpose |
|---------|---------|
| Static HTML | Content readable without JS execution |
| JSON-LD Article schema | Structured data for search/AI |
| JSON-LD BreadcrumbList | Navigation context |
| JSON-LD Person schema | Author entity recognition |
| Speakable specification | Voice search optimization |
| robots.txt LLM directives | Explicit bot permissions |
| llms.txt | LLM-specific context file |
| Content API (JSON) | Programmatic article access |
| Full-content RSS | Cross-posting/syndication |
| HTTP headers | Cache and CORS for APIs |

---

## Timeline Summary

| Phase | Days | Description |
|-------|------|-------------|
| 1. Setup | 1 | Create Astro project, install deps |
| 2. Content | 2 | Migrate MDX files, create schema |
| 3. Pages | 2 | Build templates and layouts |
| 4. LLM/AEO | 2 | JSON-LD, APIs, llms.txt |
| 5. RSS | 1 | RSS feeds for syndication |
| 6. Testing | 1 | Validate everything works |
| 7. Deploy | 1 | Launch and verify |
| **Total** | **10 days** | Full migration complete |

---

## Next Steps

1. Create feature branch: `git checkout -b feature/astro-migration`
2. Initialize Astro project
3. Start with Phase 1 (Setup)
4. Iterate through phases, testing as you go

Ready to begin?
