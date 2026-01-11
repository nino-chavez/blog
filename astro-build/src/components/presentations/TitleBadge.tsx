/**
 * TitleBadge component for Signal Dispatch presentations
 * Badge at top of title slides
 */

import type { ReactNode } from 'react';

interface TitleBadgeProps {
  children: ReactNode;
  pulse?: boolean;
}

export function TitleBadge({ children, pulse = true }: TitleBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-medium mb-8">
      {pulse && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
      {children}
    </div>
  );
}

export default TitleBadge;
