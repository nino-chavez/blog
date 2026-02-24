import type { ReactNode } from 'react';

interface TemplateProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Template({ title, description, children }: TemplateProps) {
  return (
    <div className="my-8 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent overflow-hidden not-prose" data-tutorial-template>
      <div className="flex items-center justify-between px-5 py-3 bg-cyan-500/10 border-b border-cyan-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-cyan-400 text-sm font-semibold truncate">{title}</span>
          {description && (
            <span className="text-cyan-400/50 text-sm hidden sm:inline">— {description}</span>
          )}
        </div>
        <button
          className="flex-shrink-0 text-cyan-400/60 hover:text-cyan-400 text-xs font-medium px-2.5 py-1 rounded-md hover:bg-cyan-400/10 transition-colors border border-transparent hover:border-cyan-400/20"
          data-copy-btn
          aria-label={`Copy ${title}`}
        >
          Copy
        </button>
      </div>
      <div className="p-5 prose prose-lg prose-invert max-w-none prose-pre:my-0 prose-pre:bg-black/30 prose-code:text-cyan-300" data-copy-content>
        {children}
      </div>
    </div>
  );
}
