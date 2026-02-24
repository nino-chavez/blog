import type { ReactNode } from 'react';

interface ExerciseProps {
  number: number;
  title: string;
  duration: string;
  children: ReactNode;
}

export function Exercise({ number, title, duration, children }: ExerciseProps) {
  return (
    <div className="my-10 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent overflow-hidden not-prose">
      <div className="flex items-center gap-3 px-6 py-4 bg-amber-500/10 border-b border-amber-500/20">
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg m-0 leading-tight">{title}</h3>
        </div>
        <span className="flex-shrink-0 text-amber-400/70 text-sm font-medium flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration}
        </span>
      </div>
      <div className="px-6 py-5 prose prose-lg prose-invert max-w-none prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white prose-headings:text-white">
        {children}
      </div>
    </div>
  );
}
