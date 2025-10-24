import { useState, useEffect, useRef } from 'react';
import { Search, X, ExternalLink, Image, Radio } from 'lucide-react';

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
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile Icon */}
            <div className="sm:hidden group relative">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange p-[2px]">
                <div className="flex items-center justify-center w-full h-full bg-zinc-950 rounded-md">
                  <Radio className="w-4 h-4 text-athletic-brand-violet" />
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
          </div>

          {/* Right Side: Search + Icons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            {/* Search Button/Input */}
            <div className="relative min-w-0">
              {!isSearchOpen ? (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                  aria-label="Open search"
                >
                  <Search className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded">
                    /
                  </kbd>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 w-full max-w-[240px] sm:max-w-[360px]">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={localQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search posts..."
                      className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 text-sm bg-zinc-900 border border-athletic-brand-violet/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-athletic-brand-violet/50 text-white placeholder-zinc-500"
                    />
                  </div>
                  <button
                    onClick={handleClearSearch}
                    className="p-1.5 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Portfolio Link */}
            <a
              href="https://nino.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-1.5 text-zinc-400 hover:text-athletic-brand-violet transition-colors flex-shrink-0"
              aria-label="Portfolio"
            >
              <ExternalLink className="w-4 h-4" />
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
              <Image className="w-4 h-4" />
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
