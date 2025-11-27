import { useEffect, useState } from 'react';
import { BookOpen } from '@phosphor-icons/react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from the article
    const article = document.querySelector('article');
    if (!article) return;

    const headingElements = article.querySelectorAll('h2, h3');
    const headingData: Heading[] = [];

    headingElements.forEach((heading, index) => {
      // Create ID if it doesn't exist
      if (!heading.id) {
        const id = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `heading-${index}`;
        heading.id = id;
      }

      headingData.push({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      });
    });

    setHeadings(headingData);

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
      }
    );

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
          <BookOpen size={16} weight="duotone" className="text-athletic-brand-violet" />
          Contents
        </div>

        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                className={`block w-full text-left transition-all duration-reaction ${
                  heading.level === 3 ? 'pl-4' : ''
                } ${
                  activeId === heading.id
                    ? 'text-athletic-court-orange font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
