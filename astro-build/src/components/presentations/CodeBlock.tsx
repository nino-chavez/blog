/**
 * CodeBlock component for Signal Dispatch presentations
 * Styled code blocks for terminal output and code snippets
 */

import type { ReactNode } from 'react';

interface CodeBlockProps {
  children: ReactNode;
  inline?: boolean;
}

export function CodeBlock({ children, inline = false }: CodeBlockProps) {
  if (inline) {
    return (
      <code className="bg-black/40 px-2 py-1 rounded text-cyan-400 font-mono text-sm">
        {children}
      </code>
    );
  }

  return (
    <code className="block bg-black/40 px-4 py-3 rounded-lg text-cyan-400 font-mono text-sm">
      {children}
    </code>
  );
}

export default CodeBlock;
