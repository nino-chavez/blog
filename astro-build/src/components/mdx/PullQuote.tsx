/**
 * PullQuote component for Signal Dispatch blog posts
 * Provides styled blockquotes with visual emphasis
 */

import type { ReactNode } from 'react';
import { Quotes } from '@phosphor-icons/react';

interface PullQuoteProps {
  children: ReactNode;
  author?: string;
  source?: string;
}

export function PullQuote({ children, author, source }: PullQuoteProps) {
  return (
    <figure className="relative my-12 mx-0 md:-mx-8 lg:-mx-12">
      {/* Quote mark decoration */}
      <div className="absolute -top-4 left-0 md:left-4">
        <Quotes
          size={48}
          weight="fill"
          className="text-athletic-brand-violet/20"
        />
      </div>

      <blockquote className="relative pl-8 md:pl-16 pr-4 md:pr-8">
        {/* Gradient accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-athletic-brand-violet to-athletic-court-orange rounded-full" />

        <div className="text-2xl md:text-3xl font-light text-zinc-200 italic leading-relaxed">
          {children}
        </div>

        {(author || source) && (
          <figcaption className="mt-4 text-sm text-zinc-500">
            {author && (
              <span className="font-medium text-zinc-400">— {author}</span>
            )}
            {author && source && <span className="mx-2">·</span>}
            {source && <cite className="not-italic">{source}</cite>}
          </figcaption>
        )}
      </blockquote>
    </figure>
  );
}

export default PullQuote;
