import { useEffect, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange text-white shadow-lg shadow-athletic-brand-violet/25 hover:shadow-athletic-court-orange/50 transition-all duration-reaction hover:scale-110"
      aria-label="Back to top"
    >
      <ArrowUp size={20} weight="bold" />
    </button>
  );
}
