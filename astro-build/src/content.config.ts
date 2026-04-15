import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared schema for supportedBy references (used by blog, whitepapers, presentations)
const supportedBySchema = z.array(z.object({
  slug: z.string(),
  // How this research note is referenced in the content
  relationship: z.enum([
    'based-on',      // Primary source - the content is derived from this research
    'informed-by',   // Secondary source - research influenced but didn't drive the content
    'responds-to',   // The content is a response or critique of this research
    'extends',       // The content builds upon this research
  ]).default('informed-by'),
})).optional();

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()).optional(),
    author: z.string().default('Nino Chavez'),
    status: z.enum(['published', 'draft', 'unlisted']).default('published'),
    privateToken: z.string().optional(),
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
      position: z.number().int().positive(),
    }).optional(),
    // Research notes that support this content
    supportedBy: supportedBySchema,
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
    // Companion content - links to related blog post
    companionOf: z.object({
      type: z.enum(['post']),
      slug: z.string(),
    }).optional(),
    // Research notes that support this content
    supportedBy: supportedBySchema,
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
    // Research notes that support this content
    supportedBy: supportedBySchema,
  }),
});

const tutorialCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/tutorials' }),
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
    // Tutorial-specific fields
    duration: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    prerequisites: z.array(z.string()).optional(),
    objectives: z.array(z.string()).optional(),
    // Companion content - links to related presentation, post, or whitepaper
    companionOf: z.object({
      type: z.enum(['blog', 'whitepaper', 'presentation']),
      slug: z.string(),
    }).optional(),
    // Research notes that support this content
    supportedBy: supportedBySchema,
  }),
});

const fictionCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/fiction' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()).optional(),
    author: z.string().default('Nino Chavez'),
    status: z.enum(['published', 'draft']).default('published'),
    excerpt: z.string().optional().default(''),
    tags: z.array(z.string()).optional(),
    featureImage: z.string().optional(),
    // Fiction-specific fields
    form: z.enum(['flash', 'short-story', 'novelette', 'novella']).default('short-story'),
    genre: z.array(z.string()).optional(),
    contentWarnings: z.array(z.string()).optional(),
    // Series membership - for serialized fiction (chapters of a longer work)
    series: z.object({
      slug: z.string(),
      title: z.string(),
      position: z.number().int().positive(),
      totalChapters: z.number().int().positive().optional(),
    }).optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }).optional(),
  }),
});

const counterpointCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/counterpoints' }),
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
    // Which blog post does this counterpoint challenge?
    challengesPost: z.object({
      slug: z.string(),
    }),
    // Who generated this challenge?
    challengeSource: z.object({
      name: z.string(),
      type: z.enum(['ai-analysis', 'external-contributor', 'self-critique']).default('ai-analysis'),
      url: z.string().optional(),
    }),
    // Research notes that support this content
    supportedBy: supportedBySchema,
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

// Research Notes are working documents that capture deep research, analysis,
// and methodology. They can be internal (for reference while writing) or
// published (as methodology transparency / supporting material).
//
// URL structure: /research/[slug]
const researchNotesCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/research-notes' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()).optional(),
    author: z.string().default('Nino Chavez'),
    excerpt: z.string().optional().default(''),

    // What type of research note is this?
    noteType: z.enum([
      'red-team-analysis',   // Adversarial critique of a thesis
      'research-synthesis',  // Compiled research supporting content
      'literature-review',   // Survey of existing work on a topic
      'methodology',         // How an analysis was conducted
      'data-analysis',       // Raw data exploration and findings
      'interview-notes',     // Synthesized insights from interviews
      'market-research',     // Industry/market analysis
    ]),

    // Where did this research originate?
    origin: z.enum([
      'internal',   // Created by Signal Dispatch (you)
      'external',   // Received from outside source (like the deep research you shared)
      'collaborative', // Co-created with external parties
    ]).default('internal'),

    // For external research, who provided it?
    externalSource: z.object({
      name: z.string(),           // e.g., "Deep Research AI Analysis"
      organization: z.string().optional(),
      url: z.string().optional(),
      receivedAt: z.string().or(z.date()).optional(),
    }).optional(),

    // Visibility status
    visibility: z.enum([
      'internal',    // Only for your reference while writing
      'published',   // Public at /research/[slug]
    ]).default('internal'),

    // What content does this research support? (reverse link)
    supportsContent: z.array(z.object({
      type: z.enum(['blog', 'whitepaper', 'presentation', 'tutorial']),
      slug: z.string(),
    })).optional(),

    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  whitepapers: whitepaperCollection,
  presentations: presentationCollection,
  tutorials: tutorialCollection,
  fiction: fictionCollection,
  counterpoints: counterpointCollection,
  series: seriesCollection,
  'research-notes': researchNotesCollection,
};
