/**
 * Callout component for Signal Dispatch presentations
 * Left-bordered block for key insights at bottom of slides
 */

import type { ReactNode } from 'react';

export type CalloutColor =
  | 'amber'   // Warnings, uncomfortable truths
  | 'violet'  // Key insights, principles
  | 'cyan'    // Technical notes
  | 'emerald' // Solutions
  | 'blue'    // Platform-specific (Windows)
  | 'red';    // Security warnings

interface CalloutProps {
  children: ReactNode;
  label?: string;
  color?: CalloutColor;
}

const colorConfig: Record<CalloutColor, { bg: string; border: string; text: string }> = {
  amber: {
    bg: 'bg-gradient-to-r from-amber-500/10 to-transparent',
    border: 'border-l-4 border-amber-500',
    text: 'text-amber-500',
  },
  violet: {
    bg: 'bg-gradient-to-r from-indigo-500/10 to-transparent',
    border: 'border-l-4 border-indigo-500',
    text: 'text-indigo-400',
  },
  cyan: {
    bg: 'bg-gradient-to-r from-cyan-500/10 to-transparent',
    border: 'border-l-4 border-cyan-400',
    text: 'text-cyan-400',
  },
  emerald: {
    bg: 'bg-gradient-to-r from-emerald-500/10 to-transparent',
    border: 'border-l-4 border-emerald-400',
    text: 'text-emerald-400',
  },
  blue: {
    bg: 'bg-gradient-to-r from-[#0078D4]/10 to-transparent',
    border: 'border-l-4 border-[#0078D4]',
    text: 'text-white',
  },
  red: {
    bg: 'bg-gradient-to-r from-red-500/10 to-transparent',
    border: 'border-l-4 border-red-400',
    text: 'text-red-400',
  },
};

export function Callout({ children, label, color = 'violet' }: CalloutProps) {
  const config = colorConfig[color];

  return (
    <div className={`${config.bg} ${config.border} p-6 rounded-r-xl`}>
      <p className="text-xl text-white/90">
        {label && <span className={`font-bold ${config.text}`}>{label}:</span>}{' '}
        {children}
      </p>
    </div>
  );
}

export default Callout;
