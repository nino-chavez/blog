import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  X,
  ArrowSquareOut,
  Images,
  Broadcast,
  FileText,
} from '@phosphor-icons/react';

interface HeaderNavProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function HeaderNav({ onSearch, searchQuery }: HeaderNavProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not already in an input
      if (e.key === '/' && !isSearchOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setLocalQuery('');
        onSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, onSearch]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Sync with parent search query
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalQuery(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    onSearch('');
    setIsSearchOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/98 backdrop-blur-xl border-b border-zinc-800/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 min-w-0">
          {/* Logo/Title with icon on mobile */}
          <a href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
            {/* Mobile Icon */}
            <div className="sm:hidden group relative">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange p-[2px]">
                <div className="flex items-center justify-center w-full h-full bg-zinc-950 rounded-md">
                  <Broadcast size={16} weight="duotone" className="text-athletic-brand-violet" />
                </div>
              </div>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 border border-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Signal Dispatch
              </span>
            </div>

            {/* Desktop Title */}
            <h1 className="hidden sm:block text-base lg:text-lg font-bold bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange bg-clip-text text-transparent whitespace-nowrap leading-relaxed pb-0.5">
              Signal Dispatch
            </h1>
            <span className="hidden lg:inline text-sm text-zinc-500 whitespace-nowrap">
              · Strategy, insights, and the signals that matter
            </span>
          </a>

          {/* Right Side: Search + Icons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            {/* Search Button/Input */}
            <div className="relative min-w-0">
              <AnimatePresence mode="wait">
                {!isSearchOpen ? (
                  <motion.button
                    key="search-button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    aria-label="Open search"
                  >
                    <MagnifyingGlass size={16} weight="regular" className="flex-shrink-0" />
                    <span className="hidden sm:inline">Search</span>
                    <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded">
                      /
                    </kbd>
                  </motion.button>
                ) : (
                  <motion.div
                    key="search-input"
                    initial={{ opacity: 0, width: 120 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 120 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center gap-1.5 sm:gap-2 max-w-[240px] sm:max-w-[360px]"
                  >
                    <div className="relative flex-1 min-w-0">
                      <MagnifyingGlass size={16} weight="regular" className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-zinc-500 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={localQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 text-sm bg-zinc-900 border border-athletic-brand-violet/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-athletic-brand-violet/50 text-white placeholder-zinc-500"
                      />
                    </div>
                    <motion.button
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.1, duration: 0.15 }}
                      onClick={handleClearSearch}
                      className="p-1.5 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                      aria-label="Close search"
                    >
                      <X size={16} weight="bold" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Whitepapers Link */}
            <a
              href="/whitepapers"
              className="group relative p-1.5 text-zinc-400 hover:text-athletic-brand-violet transition-colors flex-shrink-0"
              aria-label="Whitepapers"
            >
              <FileText size={16} weight="duotone" />
              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-zinc-900 border border-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Whitepapers
              </span>
            </a>

            {/* Portfolio Link */}
            <a
              href="https://nino.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-1.5 text-zinc-400 hover:text-athletic-brand-violet transition-colors flex-shrink-0"
              aria-label="Portfolio"
            >
              <ArrowSquareOut size={16} weight="regular" />
              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-zinc-900 border border-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Portfolio
              </span>
            </a>

            {/* Gallery Link */}
            <a
              href="https://gallery.nino.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-1.5 text-zinc-400 hover:text-athletic-brand-violet transition-colors flex-shrink-0"
              aria-label="Gallery"
            >
              <Images size={16} weight="duotone" />
              <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-zinc-900 border border-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Gallery
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
