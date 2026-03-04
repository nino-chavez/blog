/**
 * Generated Image Utilities
 * Maps categories to AI-generated images served via Cloudflare Images CDN
 */

import { cfImageUrl, cfSrcSet } from './cloudflare-images';

const CATEGORY_SLUGS: Record<string, string> = {
  "AI & Automation": "ai-automation",
  "Systems Thinking": "systems-thinking",
  Leadership: "leadership",
  "Consulting Practice": "consulting",
  Photography: "photography",
  Meta: "meta",
  "Field Notes": "field-notes",
  Reflections: "reflections",
  Commerce: "consulting", // Map commerce to consulting images
  Examples: "ai-automation",
};

const CATEGORY_VARIANTS: Record<string, number> = {
  "ai-automation": 5,
  "systems-thinking": 3,
  leadership: 3,
  consulting: 3,
  photography: 2,
  meta: 3,
  "field-notes": 3,
  reflections: 3,
};

const UNSPLASH_FALLBACKS: Record<string, string> = {
  "ai-automation":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
  "systems-thinking":
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop",
  leadership:
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop",
  consulting:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
  photography:
    "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&h=450&fit=crop",
  meta: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&h=450&fit=crop",
  "field-notes":
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop",
  reflections:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop",
  default:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop",
};

export function getCategorySlug(category: string): string {
  return (
    CATEGORY_SLUGS[category] || category.toLowerCase().replace(/\s+/g, "-")
  );
}

export function getGeneratedCategoryImage(
  category: string,
  postSlug?: string
): string {
  const slug = getCategorySlug(category);
  const variants = CATEGORY_VARIANTS[slug] || 3;

  let variantIndex = 1;
  if (postSlug) {
    const hash = postSlug
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    variantIndex = (hash % variants) + 1;
  }

  const cfId = `blog-${slug}-${variantIndex}`;
  return cfImageUrl(cfId, 'medium');
}

export function getGeneratedCategoryImageId(
  category: string,
  postSlug?: string
): string {
  const slug = getCategorySlug(category);
  const variants = CATEGORY_VARIANTS[slug] || 3;

  let variantIndex = 1;
  if (postSlug) {
    const hash = postSlug
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    variantIndex = (hash % variants) + 1;
  }

  return `blog-${slug}-${variantIndex}`;
}

export function getGeneratedCategorySrcSet(
  category: string,
  postSlug?: string
): string {
  return cfSrcSet(getGeneratedCategoryImageId(category, postSlug));
}

export function getUnsplashFallback(category: string): string {
  const slug = getCategorySlug(category);
  return UNSPLASH_FALLBACKS[slug] || UNSPLASH_FALLBACKS.default;
}
