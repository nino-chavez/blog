import { useState, useEffect } from 'react';

interface Props {
  variant?: 'article';
}

export default function ReadingProgress({ variant }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const articleRect = article.getBoundingClientRect();
      const articleTop = articleRect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Calculate how far we've scrolled through the article
      const start = articleTop - windowHeight * 0.1;
      const end = articleTop + articleHeight - windowHeight * 0.5;
      const current = scrollY - start;
      const total = end - start;

      const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
      setProgress(percentage);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className={`reading-progress fixed top-0 left-0 right-0 z-[100] h-1 bg-zinc-900/50 pointer-events-none${variant === 'article' ? ' reading-progress--article' : ''}`}
      style={{ contain: 'layout style paint', willChange: 'contents' }}
    >
      <div
        className="reading-progress__fill h-full bg-signal-coral"
        style={{
          width: `${progress}%`,
          transform: 'translateZ(0)',
          willChange: 'width'
        }}
      />
    </div>
  );
}
