/**
 * Blog Post Type Definitions
 *
 * Defines the schema for blog posts stored as MDX files with frontmatter.
 * Based on Ghost CMS export structure with extensions for analytics and SEO.
 *
 * Decision Reference: 2025-10-12-bsbr (Content Ownership Strategy)
 * Schema Reference: .agent-os/product/blog-mdx-schema.md
 */

/**
 * Frontmatter metadata for blog posts
 */
export interface BlogPostFrontmatter {
  // Required fields
  title: string;
  slug: string;
  publishedAt: string; // ISO 8601 date string
  author: string;
  status?: 'published'; // Optional - defaults to published if not specified

  // Optional content fields
  excerpt?: string;
  updatedAt?: string; // ISO 8601 date string
  featured?: boolean;
  featureImage?: string;
  tags?: string[];
  category?: string;
  readTime?: string; // Reading time estimate (e.g., "5 min read")

  // Source attribution (for multi-platform content)
  source?: 'ghost' | 'linkedin' | 'medium' | 'devto' | 'gamma';
  linkedinUrl?: string; // Original LinkedIn post URL
  externalUrl?: string; // Generic external source URL

  // Gamma presentation integration
  gammaId?: string; // Gamma presentation ID for embedding
  presentationType?: 'gamma'; // Type of presentation (future: support other platforms)

  // SEO metadata
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };

  // Analytics data (from Ghost/CSV export)
  analytics?: {
    sends?: number;
    opens?: number;
    clicks?: number;
    signups?: number;
  };
}

/**
 * Complete blog post with content and computed fields
 */
export interface BlogPost extends BlogPostFrontmatter {
  content: string; // Markdown/MDX content
  readingTime: number; // Calculated reading time in minutes
  wordCount: number; // Calculated word count
  url: string; // Generated URL path (/blog/{slug})
}

/**
 * Blog post metadata for listing pages (without full content)
 */
export interface BlogPostSummary extends Omit<BlogPost, 'content'> {
  excerpt: string; // Always present for summaries
}

/**
 * Blog tag with post count
 */
export interface BlogTag {
  name: string;
  slug: string;
  count: number;
}

/**
 * Blog category with post count
 */
export interface BlogCategory {
  name: string;
  slug: string;
  count: number;
}

/**
 * Blog archive entry (year/month grouping)
 */
export interface BlogArchiveEntry {
  year: number;
  month: number;
  monthName: string; // "January", "February", etc.
  count: number;
  posts: BlogPostSummary[];
}

/**
 * Blog listing filter options
 */
export interface BlogFilters {
  tag?: string;
  category?: string;
  year?: number;
  month?: number;
  featured?: boolean;
  search?: string;
}

/**
 * Blog listing result with pagination
 */
export interface BlogListingResult {
  posts: BlogPostSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters?: BlogFilters;
}

/**
 * Reading time calculation options
 */
export interface ReadingTimeOptions {
  wordsPerMinute?: number; // Default: 200
  includeCodeBlocks?: boolean; // Default: true
}

/**
 * Ghost CMS export structure (for migration script)
 */
export interface GhostExportPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string | null;
  mobiledoc: string | null;
  lexical: string | null;
  plaintext: string;
  feature_image: string | null;
  featured: number; // 0 or 1 (boolean)
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  custom_excerpt: string | null;
  canonical_url: string | null;
  custom_template: string | null;
  email_recipient_filter: string;
  newsletter_id: string | null;
}

/**
 * Ghost CSV analytics export structure
 */
export interface GhostAnalyticsRow {
  id: string;
  title: string;
  url: string;
  author: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  featured: string; // "true" or "false"
  tags: string; // Comma-separated
  post_access: string;
  email_recipients: string;
  sends: string; // Number as string
  opens: string; // Number as string
  clicks: string; // Number as string
  signups: string; // Number as string
  feedback_more_like_this: string;
  feedback_less_like_this: string;
}

/**
 * Tag mapping from Ghost to normalized categories
 */
export const TAG_TO_CATEGORY_MAP: Record<string, string> = {
  'commerce': 'Commerce',
  'ai': 'AI & Automation',
  'consulting-in-practice': 'Consulting',
  'field-notes': 'Field Notes',
  'reflection': 'Reflections',
  'meta-on-meta': 'Meta',
  'leadership': 'Leadership',
  'grid-level-thinking': 'Strategy',
  'philosophy': 'Philosophy',
  'commerce-drift': 'Commerce',
};

/**
 * Default category for posts without recognizable tags
 */
export const DEFAULT_CATEGORY = 'Insights';
