/**
 * FeatureList component for Signal Dispatch presentations
 * Lists with arrows or checkmarks
 */

import type { ReactNode } from 'react';

export type FeatureListVariant = 'arrow' | 'check' | 'x';
export type FeatureListColor = 'violet' | 'cyan' | 'emerald' | 'amber' | 'red' | 'muted';

interface FeatureListProps {
  items: ReactNode[];
  variant?: FeatureListVariant;
  color?: FeatureListColor;
}

const colorClasses: Record<FeatureListColor, string> = {
  violet: 'text-indigo-400',
  cyan: 'text-cyan-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-500',
  red: 'text-red-400',
  muted: 'text-white/30',
};

const symbols: Record<FeatureListVariant, string> = {
  arrow: '→',
  check: '✓',
  x: '×',
};

export function FeatureList({ items, variant = 'arrow', color = 'violet' }: FeatureListProps) {
  const symbol = symbols[variant];
  const symbolColor = colorClasses[color];
  const textColor = variant === 'x' ? 'text-white/50' : 'text-white/70';

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className={`mt-1 ${symbolColor}`}>{symbol}</span>
          <span className={textColor}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default FeatureList;
