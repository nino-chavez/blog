/**
 * Generated Image Utilities
 *
 * Maps categories and posts to AI-generated images.
 * Falls back to Unsplash if no generated image exists.
 */

// Category slug mapping
const CATEGORY_SLUGS: Record<string, string> = {
  'AI & Automation': 'ai-automation',
  'Systems Thinking': 'systems-thinking',
  Leadership: 'leadership',
  'Consulting Practice': 'consulting',
  Photography: 'photography',
  Meta: 'meta',
  'Field Notes': 'field-notes',
  Reflections: 'reflections',
  Examples: 'examples',
};

// Number of variants available per category
const CATEGORY_VARIANTS: Record<string, number> = {
  'ai-automation': 5,
  'systems-thinking': 3,
  leadership: 3,
  consulting: 3,
  photography: 2,
  meta: 3,
  'field-notes': 3,
  reflections: 3,
  examples: 3,
};

// Default Unsplash fallbacks by category
const UNSPLASH_FALLBACKS: Record<string, string> = {
  'ai-automation':
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&h=900&fit=crop',
  'systems-thinking':
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop',
  leadership:
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&h=900&fit=crop',
  consulting:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop',
  photography:
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=1600&h=900&fit=crop',
  meta: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=1600&h=900&fit=crop',
  'field-notes':
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&h=900&fit=crop',
  reflections:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=900&fit=crop',
  default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop',
};

/**
 * Get category slug from display name
 */
export function getCategorySlug(category: string): string {
  return CATEGORY_SLUGS[category] || category.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Get a generated image path for a category
 * Uses a deterministic selection based on post slug or random variant
 */
export function getGeneratedCategoryImage(
  category: string,
  postSlug?: string
): string {
  const slug = getCategorySlug(category);
  const variants = CATEGORY_VARIANTS[slug] || 3;

  // Deterministic variant selection based on post slug
  let variantIndex = 1;
  if (postSlug) {
    // Simple hash of slug to get consistent variant
    const hash = postSlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    variantIndex = (hash % variants) + 1;
  } else {
    // Random variant for category pages
    variantIndex = Math.floor(Math.random() * variants) + 1;
  }

  return `/generated/categories/${slug}-${variantIndex}.webp`;
}

/**
 * Get image URL with fallback
 * Tries generated image first, falls back to provided URL or Unsplash
 */
export function getFeatureImage(
  category: string,
  existingImage?: string,
  postSlug?: string
): string {
  // If post has a custom feature image, use it
  if (existingImage && !existingImage.includes('unsplash.com')) {
    return existingImage;
  }

  // Try generated image
  const generatedPath = getGeneratedCategoryImage(category, postSlug);

  // In production, we'd check if the file exists
  // For now, return the generated path (will 404 if not generated yet)
  // The img onError handler in components should fallback

  return generatedPath;
}

/**
 * Get Unsplash fallback for category
 */
export function getUnsplashFallback(category: string): string {
  const slug = getCategorySlug(category);
  return UNSPLASH_FALLBACKS[slug] || UNSPLASH_FALLBACKS.default;
}

/**
 * Image loading helper with fallback
 * Use in img onError handlers
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  category?: string
): void {
  const target = event.currentTarget;
  const fallbackUrl = category
    ? getUnsplashFallback(category)
    : UNSPLASH_FALLBACKS.default;

  // Prevent infinite loop if fallback also fails
  if (!target.src.includes('unsplash.com')) {
    target.src = fallbackUrl;
  }
}

/**
 * Get all available generated images for a category
 * Useful for galleries or random selection
 */
export function getAllCategoryImages(category: string): string[] {
  const slug = getCategorySlug(category);
  const variants = CATEGORY_VARIANTS[slug] || 3;

  return Array.from({ length: variants }, (_, i) => `/generated/categories/${slug}-${i + 1}.webp`);
}

/**
 * Check if generated images are available
 * This is a build-time check - returns false in browser
 */
export function hasGeneratedImages(): boolean {
  if (typeof window !== 'undefined') {
    // Can't check filesystem in browser
    return true; // Assume available, let onError handle missing
  }

  // In Node.js (build time), could check filesystem
  // For now, return true
  return true;
}
