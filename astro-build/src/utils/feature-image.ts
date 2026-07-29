/**
 * Responsive sources for the local feature/hero images in `public/`.
 *
 * Every local hero ships as a 1200w original plus a 600w sibling named
 * `<name>-600w.webp`. The sibling is NOT optional and NOT generated at build
 * time — it is a committed file, and `scripts/check-feature-images.mjs` fails
 * the build when a referenced image is missing one.
 *
 * That gate exists because the failure is close to invisible without it. The
 * srcset candidate a browser picks depends on viewport AND device pixel ratio:
 * with `sizes` below, a 390px phone at DPR 2 or 3 needs ~780–1170px and takes
 * the 1200w candidate, so a missing 600w file renders fine on most modern
 * phones. It breaks at DPR 1, and it 404s for every crawler that walks srcset.
 * 56 of the 260 referenced images had no sibling and nothing had reported it.
 *
 * Remote images (Cloudflare Images) resize through URL parameters and have no
 * `-600w` sibling to point at, so they get no srcset from here at all. The
 * previous per-template guard tested for `imagedelivery.net` by name, which
 * only two of the three call sites did and no call site did correctly — any
 * other absolute URL still had `.webp` string-replaced into a 404.
 */

/** Matches the `sizes` used by both the in-page hero and its preload hint. */
export const FEATURE_IMAGE_SIZES = '(max-width: 768px) 100vw, 1200px';

/**
 * True when `src` is a site-local `.webp` we ship a 600w sibling for.
 * Absolute URLs and non-webp assets are excluded — neither has a sibling.
 */
export function hasMobileVariant(src: string): boolean {
  return src.startsWith('/') && src.endsWith('.webp');
}

/** `/images/generated/x.webp` -> `/images/generated/x-600w.webp`. */
export function mobileVariant(src: string): string {
  return src.replace(/\.webp$/, '-600w.webp');
}

/** The two-candidate srcset, or `undefined` when `src` has no 600w sibling. */
export function featureImageSrcset(src: string): string | undefined {
  if (!hasMobileVariant(src)) return undefined;
  return `${mobileVariant(src)} 600w, ${src} 1200w`;
}

/** `sizes`, paired with `featureImageSrcset` — `undefined` when there is no srcset. */
export function featureImageSizes(src: string): string | undefined {
  return hasMobileVariant(src) ? FEATURE_IMAGE_SIZES : undefined;
}
