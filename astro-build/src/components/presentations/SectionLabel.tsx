/**
 * Section label component for Signal Dispatch presentations
 * Small uppercase label above slide headings indicating theme/category
 */

import type { ReactNode } from 'react';

export type SectionLabelColor =
  | 'amber'    // Tension, problems, friction
  | 'cyan'     // Patterns, technical, comparisons
  | 'emerald'  // Solutions, hardware, strategies
  | 'violet'   // Key concepts, distinctions
  | 'red'      // Security, warnings, crises
  | 'neutral'; // Discussion, general

interface SectionLabelProps {
  children: ReactNode;
  color?: SectionLabelColor;
}

const colorClasses: Record<SectionLabelColor, string> = {
  amber: 'text-amber-500',
  cyan: 'text-cyan-400',
  emerald: 'text-emerald-400',
  violet: 'text-indigo-400',
  red: 'text-red-400',
  neutral: 'text-white/40',
};

export function SectionLabel({ children, color = 'violet' }: SectionLabelProps) {
  return (
    <div className={`text-sm font-semibold uppercase tracking-widest mb-4 ${colorClasses[color]}`}>
      {children}
    </div>
  );
}

export default SectionLabel;
