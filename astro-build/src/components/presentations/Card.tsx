/**
 * Card component for Signal Dispatch presentations
 * Semi-transparent container for grouped content
 */

import type { ReactNode } from 'react';

export type CardVariant =
  | 'default'      // Standard: bg-white/5 border-white/10
  | 'highlighted'  // Gradient with glow
  | 'terminal'     // Dark code/terminal style
  | 'warning'      // Red tinted for security
  | 'success';     // Green tinted for solutions

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  hover?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white/5 border-white/10',
  highlighted: 'bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.3)]',
  terminal: 'bg-black/40 border-white/10',
  warning: 'bg-red-500/10 border-red-500/20',
  success: 'bg-emerald-500/10 border-emerald-500/20',
};

export function Card({ children, variant = 'default', className = '', hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:border-white/20 transition-all' : '';

  return (
    <div className={`border rounded-2xl p-6 ${variantClasses[variant]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
