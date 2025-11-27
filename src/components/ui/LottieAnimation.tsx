/**
 * LottieAnimation - Wrapper component for Lottie animations
 * Respects reduced-motion preferences and provides fallback states
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import type { LottieComponentProps } from 'lottie-react';

// Lazy load lottie-react to reduce initial bundle size
const Lottie = lazy(() => import('lottie-react'));

interface LottieAnimationProps {
  /** Path to the Lottie JSON file (relative to public folder) */
  src?: string;
  /** Or pass animation data directly */
  animationData?: object;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Whether to autoplay the animation */
  autoplay?: boolean;
  /** CSS class name */
  className?: string;
  /** Width of the animation */
  width?: number | string;
  /** Height of the animation */
  height?: number | string;
  /** Callback when animation completes (if not looping) */
  onComplete?: () => void;
  /** Fallback content when animation can't play */
  fallback?: React.ReactNode;
  /** aria-label for accessibility */
  'aria-label'?: string;
}

export function LottieAnimation({
  src,
  animationData: initialData,
  loop = true,
  autoplay = true,
  className,
  width,
  height,
  onComplete,
  fallback,
  'aria-label': ariaLabel,
}: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<object | null>(initialData || null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [error, setError] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Load animation data from src if provided
  useEffect(() => {
    if (src && !initialData) {
      fetch(src)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load animation');
          return res.json();
        })
        .then(setAnimationData)
        .catch(() => setError(true));
    }
  }, [src, initialData]);

  // If user prefers reduced motion, show fallback or nothing
  if (prefersReducedMotion) {
    return fallback ? <>{fallback}</> : null;
  }

  // If error loading, show fallback
  if (error) {
    return fallback ? <>{fallback}</> : null;
  }

  // If no animation data yet, show fallback or loading state
  if (!animationData) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={className}
        style={{ width, height }}
        aria-label={ariaLabel}
        role="img"
      />
    );
  }

  const lottieProps: LottieComponentProps = {
    animationData,
    loop,
    autoplay,
    style: { width, height },
    onComplete,
  };

  return (
    <Suspense
      fallback={
        fallback || (
          <div
            className={className}
            style={{ width, height }}
            aria-label={ariaLabel}
            role="img"
          />
        )
      }
    >
      <div className={className} aria-label={ariaLabel} role="img">
        <Lottie {...lottieProps} />
      </div>
    </Suspense>
  );
}

export default LottieAnimation;
