import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';
import { getCategoryButtonClass } from '../utils/category-colors';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  postCounts: Record<string, number>;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  postCounts,
}: CategoryFilterProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort categories by post count and split into primary and overflow
  const sortedCategories = [...categories].sort((a, b) => {
    return (postCounts[b] || 0) - (postCounts[a] || 0);
  });

  const primaryCategories = sortedCategories.slice(0, 4);
  const overflowCategories = sortedCategories.slice(4);

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
    setIsDropdownOpen(false);
  };

  const isOverflowCategorySelected = overflowCategories.includes(selectedCategory || '');

  return (
    <div
      className={`sticky top-16 z-40 transition-all duration-reaction ${
        isSticky ? 'bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50 py-3 sm:py-4 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8' : 'py-2'
      }`}
    >
      <div className="relative">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
          <span className="text-xs sm:text-sm font-medium text-zinc-400 whitespace-nowrap flex-shrink-0">Filter:</span>

        {/* All Posts button */}
        <motion.button
          onClick={() => onSelectCategory(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: selectedCategory === null ? 1.05 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`px-3 sm:px-4 py-2 sm:py-3 min-h-[40px] sm:min-h-[44px] rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-reaction flex-shrink-0 ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange text-white shadow-lg shadow-athletic-brand-violet/25'
              : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-athletic-court-orange/50 hover:text-athletic-court-orange'
          }`}
        >
          All Posts
          <span className="ml-1.5 sm:ml-2 opacity-70">
            ({Object.values(postCounts).reduce((a, b) => a + b, 0)})
          </span>
        </motion.button>

        {/* Primary category buttons (top 4 by post count) */}
        {primaryCategories.map((category) => {
          const isSelected = selectedCategory === category;
          const buttonClasses = getCategoryButtonClass(category, isSelected);
          return (
            <motion.button
              key={category}
              onClick={() => handleCategoryClick(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: isSelected ? 1.05 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`px-3 sm:px-4 py-2 sm:py-3 min-h-[40px] sm:min-h-[44px] rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-reaction border flex-shrink-0 ${buttonClasses} ${isSelected ? 'shadow-lg' : ''}`}
            >
              {category}
              <span className="ml-1.5 sm:ml-2 opacity-70">({postCounts[category] || 0})</span>
            </motion.button>
          );
        })}

        {/* More dropdown for overflow categories */}
        {overflowCategories.length > 0 && (
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: isOverflowCategorySelected ? 1.05 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`px-3 sm:px-4 py-2 sm:py-3 min-h-[40px] sm:min-h-[44px] rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-reaction flex items-center gap-1.5 sm:gap-2 border ${getCategoryButtonClass(selectedCategory || '', isOverflowCategorySelected)} ${isOverflowCategorySelected ? 'shadow-lg' : ''}`}
            >
              {isOverflowCategorySelected ? selectedCategory : 'More'}
              <motion.span
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <CaretDown
                  size={14}
                  weight="bold"
                  className="sm:w-4 sm:h-4"
                />
              </motion.span>
            </motion.button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full mt-2 left-0 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg shadow-black/50 min-w-[180px] sm:min-w-[200px] py-2 z-50 max-h-[300px] overflow-y-auto"
                >
                  {overflowCategories.map((category, index) => {
                    const isSelected = selectedCategory === category;
                    const buttonClasses = getCategoryButtonClass(category, isSelected);
                    return (
                      <motion.button
                        key={category}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.15 }}
                        onClick={() => handleCategoryClick(category)}
                        className={`w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium transition-colors duration-reaction flex items-center justify-between ${buttonClasses}`}
                      >
                        <span>{category}</span>
                        <span className="text-xs opacity-70">({postCounts[category] || 0})</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        </div>
        
        {/* Gradient fade on right to indicate more content on mobile/tablet */}
        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none lg:hidden" />
      </div>

      {/* Custom scrollbar hide for horizontal scroll */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
