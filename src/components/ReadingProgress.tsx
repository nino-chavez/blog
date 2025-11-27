import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Spring animation for smooth progress
  const springProgress = useSpring(0, { stiffness: 100, damping: 30 });
  const width = useTransform(springProgress, [0, 100], ['0%', '100%']);

  useEffect(() => {
    springProgress.set(progress);
    setIsComplete(progress >= 98);
  }, [progress, springProgress]);

  useEffect(() => {
    const updateProgress = () => {
      // Get scroll position
      const scrollTop = window.scrollY;

      // Get total scrollable height (document height - viewport height)
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      // Calculate progress percentage
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(scrollPercent);
    };

    // Initial calculation
    updateProgress();

    // Update on scroll
    window.addEventListener('scroll', updateProgress, { passive: true });

    // Update on resize (in case content height changes)
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-900/50">
      <motion.div
        className={`h-full bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange ${
          isComplete ? 'shadow-[0_0_12px_2px_rgba(249,115,22,0.6)]' : ''
        }`}
        style={{ width }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      {/* Completion glow pulse effect */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: 2,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange blur-sm"
        />
      )}
    </div>
  );
}
