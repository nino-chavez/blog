/**
 * Slide component for Signal Dispatch presentations
 * Renders a single slide with consistent styling and layout options
 * Based on Signal Forge design system
 */

import type { ReactNode } from 'react';

export type SlideLayout =
  | 'default'      // Left-aligned content (standard)
  | 'title'        // Centered title slide
  | 'split'        // Two columns
  | 'grid'         // Three-column grid
  | 'table'        // Optimized for table display
  | 'comparison'   // Before/After comparison
  | 'quote';       // Large quote styling

interface SlideProps {
  children: ReactNode;
  layout?: SlideLayout;
  className?: string;
}

export function Slide({ children, layout = 'default', className = '' }: SlideProps) {
  // Layout classes control vertical/horizontal alignment of the slide
  const layoutClasses: Record<SlideLayout, string> = {
    default: 'items-center justify-center',          // Vertically centered, content left-aligned
    title: 'items-center justify-center text-center', // Full center for title
    split: 'items-center justify-center',             // Two columns
    grid: 'items-center justify-center',              // Three columns
    table: 'items-center justify-center',             // Table-optimized
    comparison: 'items-center justify-center',        // Comparison layout
    quote: 'items-center justify-center text-center', // Centered quote
  };

  // Content wrapper classes control max-width and internal layout
  const contentClasses: Record<SlideLayout, string> = {
    default: 'max-w-5xl w-full',
    title: 'max-w-4xl w-full',
    split: 'max-w-5xl w-full',
    grid: 'max-w-5xl w-full',
    table: 'max-w-5xl w-full',
    comparison: 'max-w-5xl w-full',
    quote: 'max-w-3xl w-full',
  };

  return (
    <div
      className={`slide flex flex-col ${layoutClasses[layout]} ${className}`}
      data-layout={layout}
    >
      <div className={contentClasses[layout]}>
        {children}
      </div>
    </div>
  );
}

export default Slide;
