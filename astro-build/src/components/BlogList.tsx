import { useState, useMemo } from 'react';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
}

// Check if post is new (within 7 days)
const isNewPost = (publishedAt: string): boolean => {
  const postDate = new Date(publishedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

interface BlogListProps {
  posts: Post[];
}

// Category badge colors
const getCategoryBadgeClass = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'AI & Automation': 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    'Commerce': 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    'Leadership': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    'Consulting Practice': 'bg-green-500/10 border-green-500/30 text-green-400',
    'Field Notes': 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    'Meta': 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    'Photography': 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    'Systems Thinking': 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  };
  return categoryMap[category] || 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400';
};

export default function BlogList({ posts }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories and count posts per category
  const { categories, postCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    });
    return {
      categories: Object.keys(counts).sort(),
      postCounts: counts,
    };
  }, [posts]);

  // Filter posts based on category and search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category filter
      if (selectedCategory && post.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesExcerpt = post.excerpt?.toLowerCase().includes(query);
        const matchesTags = post.tags?.some((tag) => tag.toLowerCase().includes(query));
        const matchesCategory = post.category?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesExcerpt && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Separate featured posts
  const featuredPost = filteredPosts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured || p !== featuredPost);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="max-w-xl">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        postCounts={postCounts}
      />

      {/* Results count */}
      <div className="text-sm text-zinc-500">
        Showing {filteredPosts.length} of {posts.length} posts
        {selectedCategory && (
          <span> in <span className="text-athletic-brand-violet">{selectedCategory}</span></span>
        )}
        {searchQuery && (
          <span> matching "<span className="text-athletic-court-orange">{searchQuery}</span>"</span>
        )}
      </div>

      {/* Featured Post */}
      {featuredPost && !searchQuery && !selectedCategory && (
        <a href={`/${featuredPost.id}`} className="group block mb-12">
          <article className="relative p-8 md:p-10 rounded-2xl border border-athletic-brand-violet/30 bg-gradient-to-br from-athletic-brand-violet/10 via-transparent to-athletic-court-orange/5 hover:border-athletic-brand-violet/50 transition-all duration-300 hover:shadow-2xl hover:shadow-athletic-brand-violet/10 overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-athletic-brand-violet/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="absolute top-4 right-4">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange text-white shadow-lg shadow-athletic-brand-violet/25">
                Featured
              </span>
            </div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-3 text-sm">
                {isNewPost(featuredPost.publishedAt) && (
                  <span className="font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange text-white text-[10px] animate-pulse">
                    New
                  </span>
                )}
                {featuredPost.category && (
                  <span className={`font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getCategoryBadgeClass(featuredPost.category)}`}>
                    {featuredPost.category}
                  </span>
                )}
                <span className="text-zinc-500">{formatDate(featuredPost.publishedAt)}</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white group-hover:text-athletic-court-orange transition-colors leading-tight">
                {featuredPost.title}
              </h2>
              {featuredPost.excerpt && (
                <p className="text-zinc-400 text-lg leading-relaxed line-clamp-3 max-w-2xl">
                  {featuredPost.excerpt}
                </p>
              )}
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-athletic-brand-violet group-hover:text-athletic-court-orange transition-colors font-semibold">
                  Read article
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </article>
        </a>
      )}

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-400 text-lg">No posts found matching your criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="mt-4 text-athletic-brand-violet hover:text-athletic-court-orange transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularPosts.map((post) => (
            <a key={post.id} href={`/${post.id}`} className="group block">
              <article className="h-full p-6 rounded-xl border border-zinc-800 hover:border-athletic-brand-violet/50 transition-all duration-200 bg-zinc-900/30 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-athletic-brand-violet/5 hover:-translate-y-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs">
                    {isNewPost(post.publishedAt) && (
                      <span className="font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange text-white text-[10px] animate-pulse">
                        New
                      </span>
                    )}
                    {post.category && (
                      <span className={`font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${getCategoryBadgeClass(post.category)}`}>
                        {post.category}
                      </span>
                    )}
                    <span className="text-zinc-500">{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-athletic-court-orange transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
