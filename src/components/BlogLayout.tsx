import { type ReactNode } from 'react';
import BlogFooter from './BlogFooter';

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8">
        {children}
      </main>

      <BlogFooter />
    </div>
  );
}
