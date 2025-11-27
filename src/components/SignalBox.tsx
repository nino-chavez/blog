import { type ReactNode } from 'react';
import { Warning, Info, CheckCircle, Lightbulb } from '@phosphor-icons/react';
import type { IconWeight } from '@phosphor-icons/react';

interface SignalBoxProps {
  children: ReactNode;
  type?: 'info' | 'warning' | 'success' | 'tip';
  title?: string;
}

export default function SignalBox({ children, type = 'info', title }: SignalBoxProps) {
  const configs = {
    info: {
      icon: Info,
      weight: 'duotone' as IconWeight,
      borderColor: 'border-athletic-brand-violet',
      bgColor: 'bg-athletic-brand-violet/5',
      iconColor: 'text-athletic-brand-violet',
      titleColor: 'text-athletic-brand-violet',
    },
    warning: {
      icon: Warning,
      weight: 'fill' as IconWeight,
      borderColor: 'border-athletic-warning',
      bgColor: 'bg-athletic-warning/5',
      iconColor: 'text-athletic-warning',
      titleColor: 'text-athletic-warning',
    },
    success: {
      icon: CheckCircle,
      weight: 'duotone' as IconWeight,
      borderColor: 'border-athletic-success',
      bgColor: 'bg-athletic-success/5',
      iconColor: 'text-athletic-success',
      titleColor: 'text-athletic-success',
    },
    tip: {
      icon: Lightbulb,
      weight: 'duotone' as IconWeight,
      borderColor: 'border-athletic-court-orange',
      bgColor: 'bg-athletic-court-orange/5',
      iconColor: 'text-athletic-court-orange',
      titleColor: 'text-athletic-court-orange',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      className={`my-8 rounded-xl border-l-4 ${config.borderColor} ${config.bgColor} p-6 space-y-3`}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} weight={config.weight} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 space-y-2">
          {title && (
            <div className={`font-bold text-sm uppercase tracking-wider ${config.titleColor}`}>
              {title}
            </div>
          )}
          <div className="text-zinc-300 leading-relaxed [&>p]:m-0 [&>p]:leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
