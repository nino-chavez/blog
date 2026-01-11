/**
 * DataCard component for Signal Dispatch presentations
 * Cards displaying key metrics with icons and large numbers
 */

import type { ReactNode } from 'react';

export type DataCardColor = 'cyan' | 'emerald' | 'amber' | 'violet';

interface DataCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  metric: string;
  description: string;
  metricColor?: DataCardColor;
}

const metricColorClasses: Record<DataCardColor, string> = {
  cyan: 'text-cyan-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-500',
  violet: 'text-indigo-400',
};

export function DataCard({
  icon,
  title,
  subtitle,
  metric,
  description,
  metricColor = 'cyan',
}: DataCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <div className="font-bold text-white">{title}</div>
          {subtitle && <div className="text-sm text-white/50">{subtitle}</div>}
        </div>
      </div>
      <div className={`text-3xl font-bold mb-2 ${metricColorClasses[metricColor]}`}>
        {metric}
      </div>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  );
}

export default DataCard;
