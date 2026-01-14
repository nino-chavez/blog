/**
 * JSON-LD Schema Utilities for LLM/AEO/GEO Optimization
 *
 * These schemas help search engines and LLM crawlers understand:
 * - Article structure and metadata
 * - Author information and expertise
 * - Content relationships and navigation
 */

const SITE_URL = 'https://blog.ninochavez.co';

const AUTHOR = {
  '@type': 'Person',
  '@id': 'https://ninochavez.co#person',
  name: 'Nino Chavez',
  url: 'https://ninochavez.co',
  sameAs: [
    'https://linkedin.com/in/ninochavez',
    'https://github.com/ninochavez',
  ],
  jobTitle: 'Product Architect',
  description: 'Product architecture, commerce platforms, and AI automation. Building systems that scale.',
  knowsAbout: [
    'Product Architecture',
    'Commerce Platforms',
    'AI Automation',
    'Systems Thinking',
    'Digital Transformation',
    'Leadership',
  ],
};

const PUBLISHER = {
  '@type': 'Person',
  '@id': 'https://ninochavez.co#person',
  name: 'Nino Chavez',
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og_image.png`,
    width: 1200,
    height: 630,
  },
};

interface BlogPostData {
  id: string;
  data: {
    title: string;
    excerpt: string;
    publishedAt: string | Date;
    updatedAt?: string | Date;
    author?: string;
    category?: string;
    tags?: string[];
    featureImage?: string;
  };
}

/**
 * Generate Website schema for the homepage
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: 'Signal Dispatch',
    description: 'Architecture, commerce, and the signals that matter. Exploring AI workflows, systems thinking, and leadership through practical experience.',
    url: SITE_URL,
    author: AUTHOR,
    publisher: PUBLISHER,
    inLanguage: 'en-US',
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

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(post: BlogPostData) {
  const { data, id } = post;
  const slug = id;
  const publishDate = new Date(data.publishedAt).toISOString();
  const modifiedDate = data.updatedAt
    ? new Date(data.updatedAt).toISOString()
    : publishDate;

  const imageUrl = data.featureImage
    ? (data.featureImage.startsWith('http') ? data.featureImage : `${SITE_URL}${data.featureImage}`)
    : `${SITE_URL}/og_image.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/${slug}#article`,
    headline: data.title,
    description: data.excerpt,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: publishDate,
    dateModified: modifiedDate,
    author: AUTHOR,
    publisher: PUBLISHER,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${slug}`,
    },
    url: `${SITE_URL}/${slug}`,
    keywords: data.tags?.join(', ') || '',
    articleSection: data.category || 'General',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    isPartOf: {
      '@type': 'Blog',
      '@id': `${SITE_URL}#blog`,
      name: 'Signal Dispatch',
    },
    // AEO-specific: Help LLMs understand content structure
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article h2', '.excerpt', '.prose p:first-of-type'],
    },
  };
}

/**
 * Generate BreadcrumbList schema for navigation context
 */
export function generateBreadcrumbSchema(post: BlogPostData) {
  const { data, id } = post;
  const slug = id;

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
      ...(data.category ? [{
        '@type': 'ListItem',
        position: 2,
        name: data.category,
        item: `${SITE_URL}/?category=${encodeURIComponent(data.category)}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: data.category ? 3 : 2,
        name: data.title,
        item: `${SITE_URL}/${slug}`,
      },
    ],
  };
}

/**
 * Generate Blog schema for the blog list page
 */
export function generateBlogSchema(posts: BlogPostData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}#blog`,
    name: 'Signal Dispatch',
    description: 'Architecture, commerce, and the signals that matter. Exploring AI workflows, systems thinking, and leadership through practical experience.',
    url: SITE_URL,
    author: AUTHOR,
    publisher: PUBLISHER,
    inLanguage: 'en-US',
    blogPost: posts.slice(0, 20).map((post) => ({
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/${post.id}`,
      headline: post.data.title,
      description: post.data.excerpt,
      datePublished: new Date(post.data.publishedAt).toISOString(),
      url: `${SITE_URL}/${post.id}`,
      author: {
        '@type': 'Person',
        name: post.data.author || 'Nino Chavez',
      },
    })),
  };
}

/**
 * Generate Person schema for author pages
 */
export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://ninochavez.co#person',
    name: 'Nino Chavez',
    url: 'https://ninochavez.co',
    jobTitle: 'Product Architect',
    description: 'Product architecture, commerce platforms, and AI automation. Building systems that scale.',
    image: 'https://ninochavez.co/nino-chavez.jpg',
    sameAs: [
      'https://linkedin.com/in/ninochavez',
      'https://github.com/ninochavez',
      'https://blog.ninochavez.co',
    ],
    knowsAbout: [
      'Product Architecture',
      'Commerce Platforms',
      'AI Automation',
      'Systems Thinking',
      'Digital Transformation',
      'Leadership',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'commerce.com',
    },
  };
}

/**
 * Generate FAQ schema for posts with Q&A content
 */
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

/**
 * Generate CollectionPage schema for category/tag pages
 */
export function generateCollectionSchema(
  name: string,
  description: string,
  url: string,
  posts: BlogPostData[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/${post.id}`,
        name: post.data.title,
      })),
    },
  };
}
