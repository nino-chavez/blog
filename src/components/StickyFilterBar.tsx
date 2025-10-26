interface StickyFilterBarProps {
  topCategories: string[];
  otherCategories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  postCounts: Record<string, number>;
  totalPosts: number;
}

export default function StickyFilterBar({
  topCategories,
  otherCategories,
  selectedCategory,
  onSelectCategory,
  postCounts,
  totalPosts,
}: StickyFilterBarProps) {
  return (
    <div className="sticky top-20 z-40 bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-800/20 py-3 sm:py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide text-xs sm:text-sm">
            <span className="text-zinc-600 flex-shrink-0">Filter:</span>
          
          <button
            onClick={() => onSelectCategory(null)}
            className={`whitespace-nowrap transition-colors flex-shrink-0 ${
              selectedCategory === null
                ? 'text-athletic-brand-violet font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({totalPosts})
          </button>
          
          <span className="text-zinc-800">·</span>
          
          {topCategories.map((category, index) => (
            <div key={category} className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => onSelectCategory(category)}
                className={`whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'text-athletic-brand-violet font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {category} ({postCounts[category] || 0})
              </button>
              {index < topCategories.length - 1 + (otherCategories.length > 0 ? 1 : 0) && (
                <span className="text-zinc-800">·</span>
              )}
            </div>
          ))}
          
          {otherCategories.length > 0 && (
            <button
              onClick={() => onSelectCategory('Other')}
              className={`whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedCategory === 'Other'
                  ? 'text-athletic-brand-violet font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Other ({postCounts['Other'] || 0})
            </button>
          )}
          </div>
          
          {/* Gradient fade on right to indicate more content */}
          <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950/95 via-zinc-950/70 to-transparent pointer-events-none md:hidden" />
        </div>
      </div>

      {/* Custom scrollbar hide for webkit browsers */}
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
