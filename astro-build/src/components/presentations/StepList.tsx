/**
 * StepList component for Signal Dispatch presentations
 * Numbered steps in a workflow or process
 */

import type { ReactNode } from 'react';

export type StepColor = 'violet' | 'amber' | 'cyan' | 'emerald';

interface Step {
  content: ReactNode;
  color?: StepColor;
}

interface StepListProps {
  steps: Step[];
  defaultColor?: StepColor;
}

const colorClasses: Record<StepColor, string> = {
  violet: 'bg-indigo-500/20 text-indigo-400',
  amber: 'bg-amber-500/20 text-amber-500',
  cyan: 'bg-cyan-500/20 text-cyan-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
};

export function StepList({ steps, defaultColor = 'violet' }: StepListProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const color = step.color || defaultColor;
        return (
          <div key={index} className="flex items-start gap-4">
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${colorClasses[color]}`}
            >
              {index + 1}
            </span>
            <div className="text-lg text-white/80 pt-0.5">{step.content}</div>
          </div>
        );
      })}
    </div>
  );
}

export default StepList;
