import type { ReactNode } from 'react';

interface CheckpointProps {
  title?: string;
  children: ReactNode;
}

export function Checkpoint({ title = "Checkpoint", children }: CheckpointProps) {
  return (
    <div className="my-8 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-5 not-prose">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">{title}</span>
      </div>
      <div className="prose prose-lg prose-invert max-w-none prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-emerald-300">
        {children}
      </div>
    </div>
  );
}
