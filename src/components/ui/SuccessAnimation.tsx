/**
 * SuccessAnimation - Animated success indicator using Lottie
 * Shows a checkmark animation, then optionally hides
 */

import { useState, useEffect } from 'react';
import { LottieAnimation } from './LottieAnimation';
import { Check } from '@phosphor-icons/react';

interface SuccessAnimationProps {
  /** Whether to show the animation */
  show: boolean;
  /** Size of the animation */
  size?: 'sm' | 'md' | 'lg';
  /** Auto-hide after this many milliseconds (0 = don't auto-hide) */
  autoHideAfter?: number;
  /** Callback when animation completes or auto-hides */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { width: 20, height: 20 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
};

export function SuccessAnimation({
  show,
  size = 'md',
  autoHideAfter = 2000,
  onComplete,
  className = '',
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(show);
  const dimensions = sizeMap[size];

  useEffect(() => {
    if (show) {
      setVisible(true);
      if (autoHideAfter > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          onComplete?.();
        }, autoHideAfter);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [show, autoHideAfter, onComplete]);

  if (!visible) return null;

  // CSS fallback for reduced-motion
  const fallback = (
    <div
      className="flex items-center justify-center rounded-full bg-green-500"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <Check size={dimensions.width * 0.6} weight="bold" className="text-white" />
    </div>
  );

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <LottieAnimation
        src="/lottie/success-check.json"
        width={dimensions.width}
        height={dimensions.height}
        loop={false}
        autoplay
        fallback={fallback}
        aria-label="Success"
      />
    </div>
  );
}

export default SuccessAnimation;
