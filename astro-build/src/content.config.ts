import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()).optional(),
    author: z.string().default('Nino Chavez'),
    status: z.enum(['published', 'draft']).default('published'),
    excerpt: z.string().optional().default(''),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    featured: z.boolean().default(false),
    featureImage: z.string().optional(),
    source: z.string().optional(),
    linkedinUrl: z.string().optional(),
    externalUrl: z.string().optional(),
    gammaId: z.string().optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }).optional(),
    // Series membership - links post to a series collection
    series: z.object({
      slug: z.string(),
      position: z.number().int().positive(), // 1-based position in series
    }).optional(),
  }),
});

const whitepaperCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/whitepapers' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()).optional(),
    author: z.string().default('Nino Chavez'),
    excerpt: z.string().optional().default(''),
    category: z.string().optional(),
    featureImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const presentationCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/presentations' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()).optional(),
    author: z.string().default('Nino Chavez'),
    excerpt: z.string().optional().default(''),
    category: z.string().optional(),
    featureImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Presentation-specific fields
    duration: z.string().optional(),
    audience: z.string().optional(),
    mode: z.enum(['executive-advisory', 'technical-deep-dive', 'workshop']).optional(),
    // Companion content - links to related blog post or whitepaper
    companionOf: z.object({
      type: z.enum(['blog', 'whitepaper']),
      slug: z.string(),
    }).optional(),
  }),
});

const seriesCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/series' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()).optional(),
    featureImage: z.string().optional(),
    status: z.enum(['active', 'completed']).default('active'),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  whitepapers: whitepaperCollection,
  presentations: presentationCollection,
  series: seriesCollection,
};
