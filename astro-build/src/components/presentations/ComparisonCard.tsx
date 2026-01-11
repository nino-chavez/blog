/**
 * ComparisonCard component for Signal Dispatch presentations
 * Three-column era/epoch cards with visual footer
 */

import type { ReactNode } from 'react';

export type ComparisonCardVariant = 'default' | 'highlighted' | 'muted';

interface ComparisonCardProps {
  era: string;
  title: string;
  description: string;
  footer?: ReactNode;
  variant?: ComparisonCardVariant;
}

const variantClasses: Record<ComparisonCardVariant, { container: string; era: string }> = {
  default: {
    container: 'bg-white/5 border-white/10 hover:border-white/20',
    era: 'text-white/40',
  },
  highlighted: {
    container: 'bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.3)]',
    era: 'text-indigo-400 font-semibold',
  },
  muted: {
    container: 'bg-white/[0.02] border-white/5',
    era: 'text-white/30',
  },
};

export function ComparisonCard({
  era,
  title,
  description,
  footer,
  variant = 'default',
}: ComparisonCardProps) {
  const classes = variantClasses[variant];

  return (
    <div className={`border rounded-2xl p-6 transition-all ${classes.container}`}>
      <div className={`text-sm mb-2 ${classes.era}`}>{era}</div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className={variant === 'highlighted' ? 'text-white/80' : 'text-white/60'}>
        {description}
      </p>
      {footer && (
        <div className="mt-6 pt-4 border-t border-white/10">
          {footer}
        </div>
      )}
    </div>
  );
}

export default ComparisonCard;
