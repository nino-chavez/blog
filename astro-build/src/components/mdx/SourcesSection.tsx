/**
 * SourcesSection component for Signal Dispatch
 *
 * Renders an end-of-post "Sources & Supporting Material" section
 * that lists all research notes and external sources that informed the content.
 */

import type { ReactNode } from 'react';
import { Notebook, Link, Flask } from '@phosphor-icons/react';

interface Source {
  /** Citation number for reference */
  num: number;
  /** Slug of the research note (for internal links) */
  slug?: string;
  /** Title of the source */
  title: string;
  /** Type of source */
  type: 'research-note' | 'external' | 'methodology';
  /** Relationship to the content */
  relationship?: 'based-on' | 'informed-by' | 'responds-to' | 'extends';
  /** For external sources: URL */
  url?: string;
  /** Brief description of what this source contributed */
  note?: string;
}

interface SourcesSectionProps {
  sources: Source[];
  children?: ReactNode;
}

const relationshipLabels: Record<string, string> = {
  'based-on': 'Primary source',
  'informed-by': 'Informed by',
  'responds-to': 'Responds to',
  'extends': 'Extends',
};

const typeIcons = {
  'research-note': Notebook,
  'external': Link,
  'methodology': Flask,
};

export function SourcesSection({ sources, children }: SourcesSectionProps) {
  if (sources.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-zinc-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Notebook size={24} className="text-athletic-brand-violet" weight="duotone" />
        <h2 className="text-lg font-bold text-zinc-200">Sources & Supporting Material</h2>
      </div>

      {children && (
        <p className="text-zinc-400 text-sm mb-6">{children}</p>
      )}

      <ol className="space-y-4 list-none pl-0">
        {sources.map((source) => {
          const Icon = typeIcons[source.type];
          const href = source.slug ? `/research/${source.slug}` : source.url;
          const isExternal = source.type === 'external';

          return (
            <li key={source.num} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-athletic-brand-violet/20 text-athletic-brand-violet flex items-center justify-center text-xs font-bold">
                {source.num}
              </span>
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <Icon
                    size={16}
                    className="text-zinc-500 mt-1 flex-shrink-0"
                    weight={source.type === 'research-note' ? 'duotone' : 'regular'}
                  />
                  <div>
                    {href ? (
                      <a
                        href={href}
                        className="text-zinc-200 hover:text-athletic-court-orange transition-colors no-underline font-medium"
                        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {source.title}
                        {isExternal && (
                          <Link size={12} className="inline ml-1 opacity-50" />
                        )}
                      </a>
                    ) : (
                      <span className="text-zinc-200 font-medium">{source.title}</span>
                    )}
                    {source.relationship && (
                      <span className="ml-2 text-xs text-zinc-500 uppercase tracking-wider">
                        ({relationshipLabels[source.relationship]})
                      </span>
                    )}
                    {source.note && (
                      <p className="text-zinc-500 text-sm mt-1">{source.note}</p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default SourcesSection;
