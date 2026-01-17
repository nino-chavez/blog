/**
 * ResearchCitation component for Signal Dispatch
 *
 * Provides inline citation references to research notes.
 * Can be used as:
 * 1. Inline superscript citation: <ResearchCitation slug="cognitive-foundry-red-team" num={1} />
 * 2. Expandable inline reference: <ResearchCitation slug="cognitive-foundry-red-team" inline />
 * 3. Full citation block: <ResearchCitation slug="cognitive-foundry-red-team" block />
 */

import type { ReactNode } from 'react';
import { Book, ArrowUpRight } from '@phosphor-icons/react';

interface ResearchCitationProps {
  /** Slug of the research note being cited */
  slug: string;
  /** Title of the research note (for display) */
  title: string;
  /** Citation number for superscript references */
  num?: number;
  /** Render as inline expandable reference */
  inline?: boolean;
  /** Render as full citation block */
  block?: boolean;
  /** Optional note about what specifically is being cited */
  note?: string;
  /** Children for block citations */
  children?: ReactNode;
}

export function ResearchCitation({
  slug,
  title,
  num,
  inline = false,
  block = false,
  note,
  children
}: ResearchCitationProps) {
  const href = `/research/${slug}`;

  // Superscript citation number (default behavior)
  if (!inline && !block) {
    return (
      <sup className="ml-0.5">
        <a
          href={href}
          className="text-athletic-brand-violet hover:text-athletic-court-orange transition-colors text-xs font-medium no-underline"
          title={title}
        >
          [{num || '?'}]
        </a>
      </sup>
    );
  }

  // Inline expandable reference
  if (inline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-athletic-brand-violet/10 border border-athletic-brand-violet/20 text-sm">
        <Book size={14} className="text-athletic-brand-violet" weight="duotone" />
        <a
          href={href}
          className="text-athletic-brand-violet hover:text-athletic-court-orange transition-colors no-underline"
        >
          {title}
        </a>
        {note && <span className="text-zinc-500 ml-1">— {note}</span>}
      </span>
    );
  }

  // Full citation block
  if (block) {
    return (
      <aside className="my-8 p-6 rounded-xl border border-zinc-700/50 bg-gradient-to-r from-athletic-brand-violet/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <Book size={24} className="text-athletic-brand-violet" weight="duotone" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm uppercase tracking-wider text-athletic-brand-violet">
                Supporting Research
              </h4>
              <a
                href={href}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-athletic-brand-violet transition-colors no-underline"
              >
                View full note <ArrowUpRight size={12} />
              </a>
            </div>
            <a
              href={href}
              className="block text-lg font-semibold text-zinc-200 hover:text-athletic-court-orange transition-colors no-underline"
            >
              {title}
            </a>
            {note && (
              <p className="text-zinc-400 text-sm italic">{note}</p>
            )}
            {children && (
              <div className="text-zinc-300 text-sm leading-relaxed pt-2 border-t border-zinc-700/50">
                {children}
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return null;
}

export default ResearchCitation;
