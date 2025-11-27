import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search posts...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on "/" key (but not in inputs)
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Clear search on "Escape" key
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear();
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative w-full">
      <div
        className={`relative flex items-center transition-all duration-reaction border ${
          isFocused
            ? 'border-athletic-brand-violet'
            : 'border-zinc-800'
        } rounded-xl bg-zinc-900/50 backdrop-blur-sm`}
      >
        <MagnifyingGlass size={20} weight="regular" className="absolute left-4 text-zinc-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent pl-12 pr-12 py-4 text-white placeholder:text-zinc-500 focus:outline-none"
          aria-label="Search blog posts"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full hover:bg-zinc-800 transition-colors group"
            aria-label="Clear search"
          >
            <X size={16} weight="bold" className="text-zinc-500 group-hover:text-white transition-colors" />
          </button>
        )}
      </div>
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 text-sm text-zinc-400 px-4">
          <span className="text-athletic-brand-violet">{query.length}</span> character{query.length !== 1 && 's'} entered
          <span className="ml-3 text-zinc-600">• Press Esc to clear</span>
        </div>
      )}

      {!isFocused && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 text-xs text-zinc-600 px-4">
          Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">/</kbd> to search
        </div>
      )}
    </div>
  );
}
