/**
 * MDX File Loader
 *
 * Utilities for loading and parsing MDX blog posts.
 * Uses a pre-generated manifest for fast metadata queries, with lazy-loaded MDX content.
 *
 * Performance approach:
 * - List views: Load from lightweight JSON manifest (no MDX parsing)
 * - Individual posts: Lazy-load MDX on demand (code splitting preserved)
 */

import type { BlogPostFrontmatter } from '../types/blog';
import type { ComponentType } from 'react';
import manifestData from '../data/blog-manifest.json';

export interface BlogPost extends BlogPostFrontmatter {
  content: ComponentType | string;
}

export interface ManifestPost {
  slug: string;
  title: string;
  publishedAt: string;
  author: string;
  excerpt?: string;
  featured?: boolean;
  featureImage?: string;
  tags?: string[];
  category?: string;
  readTime?: string;
  source?: 'ghost' | 'linkedin' | 'medium' | 'devto';
  linkedinUrl?: string;
  externalUrl?: string;
}

export interface BlogManifest {
  posts: Array<ManifestPost>;
  categories: string[];
  tags: string[];
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  totalPosts: number;
  lastGenerated: string;
}

// Lazy-load all MDX modules (for individual post content loading only)
const modules = import.meta.glob<{
  default: React.ComponentType;
  frontmatter: BlogPostFrontmatter;
}>('../content/blog/*.mdx', { eager: false });

/**
 * Get all blog posts metadata from pre-generated manifest
 * FAST: Loads from JSON, no MDX parsing
 * Use this for list views, category filters, search, etc.
 */
export function getAllPosts(): Promise<BlogPost[]> {
  const posts = manifestData.posts.map((post) => ({
    ...post,
    content: '', // Content loaded separately when rendering individual posts
  }));

  return Promise.resolve(posts as BlogPost[]);
}

/**
 * Get blog manifest with all metadata, categories, and tags
 * FAST: Pre-indexed at build time
 */
export function getManifest(): BlogManifest {
  return manifestData as BlogManifest;
}

/**
 * Get a single blog post by slug
 * Reuses the same import.meta.glob modules to avoid duplicate imports
 * Merges featureImage from manifest if not present in frontmatter
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const path = `../content/blog/${slug}.mdx`;
    const importFn = modules[path];

    if (!importFn) {
      console.error(`Post not found: ${slug}`);
      return null;
    }

    const module = await importFn();

    // Find corresponding manifest entry to get feature image
    const manifestPost = manifestData.posts.find(p => p.slug === slug);

    return {
      ...module.frontmatter,
      slug,
      // Merge featureImage from manifest if not in frontmatter
      featureImage: module.frontmatter.featureImage || manifestPost?.featureImage,
      content: module.default as ComponentType,
    } as BlogPost;
  } catch (error) {
    console.error(`Failed to load post: ${slug}`, error);
    return null;
  }
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.category === category);
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.tags?.includes(tag));
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.featured === true);
}
