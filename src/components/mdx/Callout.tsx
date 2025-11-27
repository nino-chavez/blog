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
      border: 'border-athletic-court-orange',
      bg: 'bg-gradient-to-r from-athletic-court-orange/10 to-transparent',
      iconColor: 'text-athletic-court-orange',
      titleColor: 'text-athletic-court-orange',
      defaultTitle: 'Signal',
    },
    noise: {
      icon: WaveSquare,
      weight: 'regular' as IconWeight,
      border: 'border-athletic-brand-violet',
      bg: 'bg-gradient-to-r from-athletic-brand-violet/10 to-transparent',
      iconColor: 'text-athletic-brand-violet',
      titleColor: 'text-athletic-brand-violet',
      defaultTitle: 'Context',
    },
    insight: {
      icon: Lightbulb,
      weight: 'duotone' as IconWeight,
      border: 'border-gradient-to-b from-athletic-brand-violet to-athletic-court-orange',
      bg: 'bg-gradient-to-r from-athletic-brand-violet/10 via-athletic-court-orange/5 to-transparent',
      iconColor: 'text-athletic-brand-violet',
      titleColor: 'text-transparent bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange bg-clip-text',
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
