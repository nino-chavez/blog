/**
 * BeforeAfter component for Signal Dispatch blog posts
 * Provides side-by-side comparison layout
 */

import type { ReactNode } from 'react';

interface BeforeAfterProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfter({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
      {/* Before */}
      <div className="relative rounded-xl border border-signal-coral/30 bg-signal-coral/5 p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-signal-coral/50" />
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-signal-coral mb-3">
          {beforeLabel}
        </span>
        <div className="text-zinc-300 leading-relaxed [&>p]:m-0">
          {before}
        </div>
      </div>

      {/* After */}
      <div className="relative rounded-xl border border-signal-coral/30 bg-signal-coral/5 p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-signal-coral/50" />
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-signal-coral mb-3">
          {afterLabel}
        </span>
        <div className="text-zinc-300 leading-relaxed [&>p]:m-0">
          {after}
        </div>
      </div>
    </div>
  );
}

export default BeforeAfter;
