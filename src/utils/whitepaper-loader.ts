import type { ComponentType } from 'react';
import manifestData from '../data/whitepaper-manifest.json';

export interface Whitepaper {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  author: string;
  readTime: string;
  featureImage?: string;
  downloadUrl?: string;
  tags?: string[];
  content: ComponentType | string;
}

// Lazy-load all MDX modules for whitepapers
const modules = import.meta.glob<{
  default: React.ComponentType;
  frontmatter: Record<string, any>;
}>('../content/whitepapers/*.mdx', { eager: false });

/**
 * Get a single whitepaper by slug
 */
export async function getWhitepaperBySlug(slug: string): Promise<Whitepaper | null> {
  try {
    const path = `../content/whitepapers/${slug}.mdx`;
    const importFn = modules[path];

    if (!importFn) {
      console.error(`Whitepaper not found: ${slug}`);
      return null;
    }

    const module = await importFn();
    const manifestPost = manifestData.whitepapers.find(p => p.slug === slug);

    if (!manifestPost) {
        console.error(`Whitepaper manifest entry not found: ${slug}`);
        return null;
    }

    return {
      ...manifestPost,
      content: module.default as ComponentType,
    } as Whitepaper;
  } catch (error) {
    console.error(`Failed to load whitepaper: ${slug}`, error);
    return null;
  }
}
