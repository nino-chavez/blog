import { useState, useMemo } from 'react';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  featureImage?: string;
}

interface BlogListProps {
  posts: Post[];
}

// Category colors
const getCategoryColors = (category: string) => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    'AI & Automation': { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
    'Commerce': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
    'Leadership': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    'Consulting Practice': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    'Field Notes': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    'Meta': { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
    'Reflections': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    'Systems Thinking': { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  };
  return colors[category] || { bg: 'bg-zinc-800/50', border: 'border-zinc-700/50', text: 'text-zinc-400' };
};

// Category to image slug mapping
const getCategorySlug = (category: string): string => {
  const slugs: Record<string, string> = {
    'AI & Automation': 'ai-automation',
    'Systems Thinking': 'systems-thinking',
    'Leadership': 'leadership',
    'Consulting Practice': 'consulting',
    'Photography': 'photography',
    'Meta': 'meta',
    'Field Notes': 'field-notes',
    'Reflections': 'reflections',
    'Commerce': 'consulting',
  };
  return slugs[category] || 'ai-automation';
};

// Get image for post
const getPostImage = (post: Post): string => {
  if (post.featureImage) return post.featureImage;
  if (post.category) {
    const slug = getCategorySlug(post.category);
    const variants = slug === 'ai-automation' ? 5 : 3;
    const hash = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variant = (hash % variants) + 1;
    return `/generated/categories/${slug}-${variant}.webp`;
  }
  return '/generated/categories/ai-automation-1.webp';
};

// Fallback image handler
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop';
};

export default function BlogList({ posts }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  // Category stats
  const { categories, postCounts, topCategories, otherCategories } = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.filter(([, count]) => count >= 10).map(([cat]) => cat);
    const other = sorted.filter(([, count]) => count < 10).map(([cat]) => cat);
    const otherCount = other.reduce((sum, cat) => sum + counts[cat], 0);
    if (other.length > 0) counts['Other'] = otherCount;

    return {
      categories: sorted.map(([cat]) => cat),
      postCounts: counts,
      topCategories: top,
      otherCategories: other,
    };
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedCategory) {
        if (selectedCategory === 'Other') {
          if (!post.category || !otherCategories.includes(post.category)) return false;
        } else if (post.category !== selectedCategory) {
          return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          post.title.toLowerCase().includes(q) ||
          post.excerpt?.toLowerCase().includes(q) ||
          post.category?.toLowerCase().includes(q) ||
          post.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [posts, selectedCategory, searchQuery, otherCategories]);

  // Split featured and regular
  const featuredPosts = filteredPosts.filter((p) => p.featured).slice(0, 2);
  const regularPosts = filteredPosts.filter((p) => !featuredPosts.includes(p));
  const visiblePosts = regularPosts.slice(0, visibleCount);
  const hasMore = visibleCount < regularPosts.length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Sticky Filter Bar */}
      <div className="sticky top-[73px] z-40 -mx-4 px-4 py-4 bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-800/50">
        <div className="flex flex-wrap items-center gap-3">
          {/* All Posts */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              !selectedCategory
                ? 'bg-athletic-brand-violet text-white border-athletic-brand-violet'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            All ({posts.length})
          </button>

          {/* Top Categories */}
          {topCategories.map((cat) => {
            const colors = getCategoryColors(cat);
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? `${colors.bg} ${colors.border} ${colors.text}`
                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {cat} ({postCounts[cat]})
              </button>
            );
          })}

          {/* Other dropdown */}
          {otherCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategory(selectedCategory === 'Other' ? null : 'Other')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                selectedCategory === 'Other'
                  ? 'bg-zinc-700 text-white border-zinc-600'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              Other ({postCounts['Other']})
            </button>
          )}

          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-xs ml-auto">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-sm bg-zinc-900/50 border border-zinc-800 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-athletic-brand-violet/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results info */}
      {(searchQuery || selectedCategory) && (
        <p className="text-sm text-zinc-500">
          Showing {filteredPosts.length} posts
          {selectedCategory && <span> in <span className="text-white">{selectedCategory}</span></span>}
          {searchQuery && <span> matching "<span className="text-athletic-brand-violet">{searchQuery}</span>"</span>}
        </p>
      )}

      {/* Featured Section */}
      {featuredPosts.length > 0 && !searchQuery && !selectedCategory && (
        <section className="relative -mx-4 px-4 py-8 rounded-3xl bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-transparent">
          {/* Subtle gradient orb background */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-athletic-brand-violet/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-athletic-court-orange/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-3 mb-6">
            <div className="h-1 w-10 bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange rounded-full" />
            <h2 className="text-xl font-bold text-white">Featured</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">Editor's picks</span>
          </div>
          <div className="relative grid md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => {
              const colors = getCategoryColors(post.category || '');
              return (
                <a key={post.id} href={`/${post.id}`} className="group block">
                  {/* Gradient border wrapper */}
                  <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-athletic-brand-violet/50 via-transparent to-athletic-court-orange/50 group-hover:from-athletic-brand-violet group-hover:to-athletic-court-orange transition-all duration-500">
                    <article className="relative overflow-hidden rounded-2xl bg-zinc-900 group-hover:bg-zinc-900/90 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-athletic-brand-violet/20">
                      {/* Featured badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange text-white shadow-lg">
                          Featured
                        </span>
                      </div>

                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={getPostImage(post)}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-3 text-xs">
                          {post.category && (
                            <span className={`font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>
                              {post.category}
                            </span>
                          )}
                          <span className="text-zinc-500">{formatDate(post.publishedAt)}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-athletic-court-orange transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-zinc-400 text-sm line-clamp-2">{post.excerpt}</p>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-500">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Latest Section */}
      {visiblePosts.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-10 bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange rounded-full" />
            <h2 className="text-xl font-bold text-white">
              {searchQuery || selectedCategory ? 'Results' : 'Latest'}
            </h2>
            <span className="text-sm text-zinc-500">
              {visiblePosts.length} of {regularPosts.length}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {visiblePosts.map((post) => {
              const colors = getCategoryColors(post.category || '');
              return (
                <a key={post.id} href={`/${post.id}`} className="group block">
                  <article className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 transition-all duration-200 hover:bg-zinc-900/50">
                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={getPostImage(post)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        {post.category && (
                          <span className={`font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>
                            {post.category}
                          </span>
                        )}
                        <span className="text-zinc-500">{formatDate(post.publishedAt)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-athletic-court-orange transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-zinc-400 text-sm line-clamp-2">{post.excerpt}</p>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </a>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setVisibleCount((c) => c + 8)}
                className="px-8 py-3 rounded-xl bg-zinc-900/50 text-athletic-brand-violet border border-zinc-800 hover:border-athletic-brand-violet/50 hover:bg-athletic-brand-violet/5 transition-all font-medium"
              >
                Load More
                <span className="ml-2 text-zinc-500">({regularPosts.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <p className="text-zinc-400 text-lg">No posts found</p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-athletic-brand-violet hover:bg-zinc-800 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
