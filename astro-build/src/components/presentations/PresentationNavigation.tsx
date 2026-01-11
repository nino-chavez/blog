/**
 * Presentation navigation component
 * Handles keyboard navigation, progress indicator, and slide controls
 * Uses active-slide paradigm (one slide visible at a time) like signal-forge
 */

import { useEffect, useState, useCallback } from 'react';

interface PresentationNavigationProps {
  totalSlides: number;
  title: string;
}

export function PresentationNavigation({ totalSlides, title }: PresentationNavigationProps) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [actualSlideCount, setActualSlideCount] = useState(totalSlides);

  // Initialize slides - add data attributes and set initial active state
  useEffect(() => {
    const container = document.querySelector('.presentation-container');
    if (!container) return;

    const slides = container.querySelectorAll('.slide');

    // Add data-slide attributes and set initial visibility
    slides.forEach((slide, index) => {
      slide.setAttribute('data-slide', String(index + 1));
      // First slide is active, others hidden
      if (index === 0) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update actual slide count
    setActualSlideCount(slides.length);
  }, []);

  // Update slide visibility when currentSlide changes
  const updateSlideVisibility = useCallback((slideNumber: number) => {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide) => {
      const slideNum = parseInt(slide.getAttribute('data-slide') || '0', 10);
      if (slideNum === slideNumber) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }, []);

  const goToSlide = useCallback((slideNumber: number) => {
    const clampedSlide = Math.max(1, Math.min(slideNumber, actualSlideCount));
    setCurrentSlide(clampedSlide);
    updateSlideVisibility(clampedSlide);
  }, [actualSlideCount, updateSlideVisibility]);

  const nextSlide = useCallback(() => {
    if (currentSlide < actualSlideCount) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, actualSlideCount, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(1);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(actualSlideCount);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, actualSlideCount, toggleFullscreen, isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Touch/swipe support
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextSlide, prevSlide]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between">
          {/* Left: Back link and icon */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <a
              href="/blog/presentations"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-1 -m-1"
              aria-label="Back to presentations"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <div className="hidden xs:flex w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-athletic-brand-violet to-athletic-court-orange items-center justify-center">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
          </div>

          {/* Center: Title - hidden on mobile, visible on larger screens */}
          <div className="hidden md:block flex-1 min-w-0 mx-4">
            <span className="font-semibold text-white/90 truncate block text-center text-sm lg:text-base">
              {title}
            </span>
          </div>

          {/* Right: Navigation controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 1}
              className="w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-sm font-medium text-zinc-400 hover:text-white border border-zinc-700 rounded-lg hover:border-zinc-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
              aria-label="Previous slide"
            >
              <span className="hidden sm:inline">← Prev</span>
              <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Progress dots - visible on larger screens */}
            <div className="hidden lg:flex items-center gap-1.5">
              {Array.from({ length: actualSlideCount }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => goToSlide(num)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    num === currentSlide
                      ? 'bg-athletic-brand-violet w-6'
                      : 'bg-zinc-600 hover:bg-zinc-400 w-2'
                  }`}
                  aria-label={`Go to slide ${num}`}
                />
              ))}
            </div>

            {/* Slide counter - compact on mobile */}
            <button
              onClick={() => {
                const slideNum = prompt(`Go to slide (1-${actualSlideCount}):`);
                if (slideNum) {
                  const num = parseInt(slideNum, 10);
                  if (!isNaN(num)) goToSlide(num);
                }
              }}
              className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 min-w-[40px] sm:min-w-[50px] text-center font-mono py-1 px-1.5 sm:px-2 rounded hover:bg-zinc-800/50 transition-colors touch-manipulation"
              aria-label={`Slide ${currentSlide} of ${actualSlideCount}. Click to jump to slide.`}
            >
              {currentSlide}/{actualSlideCount}
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlide === actualSlideCount}
              className="w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-sm font-medium bg-athletic-brand-violet hover:bg-athletic-brand-violet/80 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
              aria-label="Next slide"
            >
              <span className="hidden sm:inline">Next →</span>
              <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Fullscreen toggle - hidden on small mobile */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex w-9 h-9 items-center justify-center text-zinc-400 hover:text-white border border-zinc-700 rounded-lg hover:border-zinc-500 transition-all touch-manipulation"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange transition-all duration-300"
            style={{ width: `${(currentSlide / actualSlideCount) * 100}%` }}
          />
        </div>
      </nav>

      {/* Swipe hint for mobile - shows briefly on first load */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-zinc-400 sm:hidden pointer-events-none opacity-0 animate-fade-hint">
        Swipe to navigate
      </div>

      {/* Keyboard hint - fixed at bottom right, desktop only */}
      <div className="fixed bottom-6 right-6 z-50 bg-zinc-900/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-zinc-500 hidden md:block">
        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 mx-0.5">←</kbd>
        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 mx-0.5">→</kbd> or
        <kbd className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-400 mx-0.5">space</kbd>
      </div>

      {/* Mobile swipe hint animation */}
      <style>{`
        @keyframes fadeHint {
          0% { opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-hint {
          animation: fadeHint 3s ease-in-out forwards;
        }
      `}</style>
    </>
  );
}

export default PresentationNavigation;
