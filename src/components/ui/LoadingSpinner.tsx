/**
 * LoadingSpinner - Animated loading indicator using Lottie
 * Falls back to CSS spinner for reduced-motion or loading failures
 */

import { LottieAnimation } from './LottieAnimation';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Optional message to display below spinner */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 40, height: 40 },
  lg: { width: 64, height: 64 },
};

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const dimensions = sizeMap[size];

  // CSS fallback spinner for reduced-motion or loading failures
  const fallback = (
    <div
      className="inline-block rounded-full border-2 border-athletic-brand-violet border-r-transparent animate-spin"
      style={{ width: dimensions.width, height: dimensions.height }}
      role="status"
      aria-label="Loading"
    />
  );

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <LottieAnimation
        src="/lottie/loading-signal.json"
        width={dimensions.width}
        height={dimensions.height}
        loop
        autoplay
        fallback={fallback}
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm text-zinc-400 animate-pulse">{message}</p>
      )}
    </div>
  );
}

export default LoadingSpinner;
