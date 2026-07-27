/**
 * Callout component for Signal Dispatch blog posts
 * Provides styled callout boxes for signal, noise, insight, and warning types
 */

import type { ReactNode } from 'react';
import { Broadcast, WaveSquare, Lightbulb, Warning } from '@phosphor-icons/react';
import type { IconWeight } from '@phosphor-icons/react';

interface CalloutProps {
  children: ReactNode;
  type?: 'signal' | 'noise' | 'insight' | 'warning';
  title?: string;
}

export function Callout({ children, type = 'signal', title }: CalloutProps) {
  const configs = {
    signal: {
      icon: Broadcast,
      weight: 'duotone' as IconWeight,
      border: 'border-signal-coral',
      bg: 'bg-gradient-to-r from-signal-coral/10 to-transparent',
      iconColor: 'text-signal-coral',
      titleColor: 'text-signal-coral',
      defaultTitle: 'Signal',
    },
    // Three types, three treatments — the accent migration must not flatten them.
    // Coral is the signal itself; context is deliberately quiet; insight uses the
    // declared secondary. Losing the distinction would argue the opposite of what
    // this publication is for.
    noise: {
      icon: WaveSquare,
      weight: 'regular' as IconWeight,
      border: 'border-zinc-700',
      bg: 'bg-gradient-to-r from-zinc-800/40 to-transparent',
      iconColor: 'text-zinc-400',
      titleColor: 'text-zinc-400',
      defaultTitle: 'Context',
    },
    insight: {
      icon: Lightbulb,
      weight: 'duotone' as IconWeight,
      border: 'border-signal-cyan',
      bg: 'bg-gradient-to-r from-signal-cyan/10 to-transparent',
      iconColor: 'text-signal-cyan',
      titleColor: 'text-signal-cyan',
      defaultTitle: 'Insight',
    },
    warning: {
      icon: Warning,
      weight: 'fill' as IconWeight,
      border: 'border-yellow-500',
      bg: 'bg-gradient-to-r from-yellow-500/10 to-transparent',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-500',
      defaultTitle: 'Warning',
    },
  };

  const config = configs[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <aside
      className={`my-8 p-6 rounded-r-xl border-l-4 ${config.border} ${config.bg}`}
      role="note"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={24} weight={config.weight} className={config.iconColor} />
        </div>
        <div className="flex-1 space-y-2">
          {displayTitle && (
            <h4 className={`font-bold text-sm uppercase tracking-wider ${config.titleColor}`}>
              {displayTitle}
            </h4>
          )}
          <div className="text-zinc-300 leading-relaxed [&>p]:m-0 [&>p]:leading-relaxed [&>ul]:mt-2 [&>ul]:space-y-1">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Callout;
