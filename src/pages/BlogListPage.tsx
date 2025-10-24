import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Presentation } from 'lucide-react';
import BlogLayout from '../components/BlogLayout';
import HeaderNav from '../components/HeaderNav';
import StickyFilterBar from '../components/StickyFilterBar';
import SEOHead from '../components/SEOHead';
import FadeIn from '../components/FadeIn';
import BackToTop from '../components/BackToTop';
import ScatterToSignal from '../components/ScatterToSignal';
import SourceBadge from '../components/SourceBadge';
import { getAllPosts } from '../utils/mdx-loader';
import type { BlogPost } from '../utils/mdx-loader';
import { getCategoryColors } from '../utils/category-colors';
import { useCanonicalUrl } from '../hooks/useCanonicalUrl';

export default function BlogListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePostCount, setVisiblePostCount] = useState(6);

  const POSTS_PER_PAGE = 6;

  // Set canonical URL for blog index (blog.ninochavez.co)
  useCanonicalUrl('');

  useEffect(() => {
    async function loadPosts() {
      try {
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  // Get unique categories and count posts per category
  // Sort by count descending, group categories with <10 posts into "Other"
  const { categories, postCounts, topCategories } = useMemo(() => {
    const counts: Record<string, number> = {};

    posts.forEach((post) => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    });

    // Sort categories by count (descending)
    const sortedCategories = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    // Separate top categories (>=10 posts) from others (<10 posts)
    const topCats = sortedCategories.filter(cat => counts[cat] >= 10);
    const otherCats = sortedCategories.filter(cat => counts[cat] < 10);
    const otherCount = otherCats.reduce((sum, cat) => sum + counts[cat], 0);

    // Add "Other" category if there are small categories
    const finalCounts = { ...counts };
    if (otherCats.length > 0) {
      finalCounts['Other'] = otherCount;
    }

    return {
      categories: sortedCategories,
      postCounts: finalCounts,
      topCategories: topCats,
    };
  }, [posts]);

  // Get list of "Other" categories (those with <10 posts)
  const otherCategories = useMemo(() => {
    return categories.filter(cat => postCounts[cat] < 10);
  }, [categories, postCounts]);

  // Filter posts by selected category and search query
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory) {
      if (selectedCategory === 'Other') {
        // Show all posts from categories with <10 posts
        filtered = filtered.filter((post) =>
          post.category && otherCategories.includes(post.category)
        );
      } else {
        filtered = filtered.filter((post) => post.category === selectedCategory);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.category?.toLowerCase().includes(query) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [posts, selectedCategory, searchQuery, otherCategories]);

  const featuredPosts = filteredPosts.filter((post) => post.featured).slice(0, 2);
  const allRegularPosts = filteredPosts.filter((post) => !post.featured);
  const regularPosts = allRegularPosts.slice(0, visiblePostCount);
  const hasMorePosts = visiblePostCount < allRegularPosts.length;

  const handleLoadMore = () => {
    setVisiblePostCount((prev) => prev + POSTS_PER_PAGE);
  };

  const handleSelectPost = (slug: string) => {
    navigate(`/${slug}`);
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Signal Dispatch"
        description="Architecture, commerce, and the signals that matter. Exploring AI workflows, systems thinking, and leadership through practical experience."
        url=""
        image="/og_image.png"
      />
      
      {/* Fixed Header with Search and Icon Links */}
      <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      {/* Sticky Filter Bar */}
      {!loading && posts.length > 0 && (
        <StickyFilterBar
          topCategories={topCategories}
          otherCategories={otherCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          postCounts={postCounts}
          totalPosts={posts.length}
        />
      )}

      <BlogLayout>
        <BackToTop />
        <div className="relative">

          <div className="space-y-8">

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-athletic-brand-violet border-r-transparent" />
                <p className="text-zinc-400 mt-4">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-400 text-xl">No posts found.</p>
              </div>
            ) : (
              <>
                {/* Results count - moved here from filter section */}
                {(searchQuery || selectedCategory) && (
                  <div className="text-center text-sm text-zinc-400 py-2">
                    Found <span className="text-athletic-brand-violet font-semibold">{filteredPosts.length}</span> post
                    {filteredPosts.length !== 1 && 's'}
                    {searchQuery && <span> matching <span className="text-white">"{searchQuery}"</span></span>}
                    {selectedCategory && selectedCategory !== 'Other' && <span> in <span className="text-white">{selectedCategory}</span></span>}
                    {selectedCategory === 'Other' && <span> in <span className="text-white">smaller categories</span></span>}
                  </div>
                )}

                {filteredPosts.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <p className="text-zinc-400 text-xl">
                  {searchQuery && selectedCategory
                    ? `No posts found matching "${searchQuery}" in ${selectedCategory} category`
                    : searchQuery
                      ? `No posts found matching "${searchQuery}"`
                      : `No posts found in ${selectedCategory} category`}
                </p>
                <div className="flex gap-3 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 rounded-lg bg-zinc-900 text-athletic-brand-violet hover:bg-zinc-800 transition-colors duration-reaction"
                    >
                      Clear search
                    </button>
                  )}
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="px-4 py-2 rounded-lg bg-zinc-900 text-athletic-brand-violet hover:bg-zinc-800 transition-colors duration-reaction"
                    >
                      Clear category
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Featured Posts */}
                {featuredPosts.length > 0 && (
              <section className="space-y-6 pt-2 relative">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange rounded-full" />
                  <h2 className="text-3xl font-bold text-white">Featured</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredPosts.map((post, index) => (
                    <FadeIn key={post.slug} delay={index * 100}>
                      <article
                      key={post.slug}
                      data-slug={post.slug}
                      className="group cursor-pointer relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 hover:border-athletic-court-orange/50 transition-all duration-reaction hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-athletic-brand-violet/10"
                      style={{ zIndex: 10 }}
                      onClick={() => handleSelectPost(post.slug)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-athletic-brand-violet/5 to-athletic-court-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-reaction" />
                      {/* Corner accent - signal marker */}
                      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-athletic-court-orange/40 group-hover:border-athletic-court-orange/80 rounded-tr-lg transition-all duration-reaction" />
                      <div className="relative space-y-5">
                        {/* Feature Image */}
                        <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden bg-zinc-900">
                          <img
                            src={post.featureImage || '/og_image.png'}
                            alt={post.title}
                            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                            onLoad={(e) => e.currentTarget.style.opacity = '1'}
                            onError={(e) => {
                              e.currentTarget.src = '/og_image.png';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        </div>
                        
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.category && (
                              <span
                                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border transition-colors ${getCategoryColors(post.category).bg} ${getCategoryColors(post.category).border} ${getCategoryColors(post.category).text}`}
                              >
                                {post.category}
                              </span>
                            )}
                            {post.gammaId && (
                              <span
                                className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border transition-colors bg-athletic-brand-violet/10 border-athletic-brand-violet/50 text-athletic-brand-violet flex items-center gap-1"
                                title="Includes Gamma presentation"
                              >
                                <Presentation className="w-3 h-3" />
                                <span className="hidden sm:inline">Presentation</span>
                              </span>
                            )}
                            {post.source && post.source !== 'ghost' && post.source !== 'gamma' && (
                              <SourceBadge
                                source={post.source}
                                externalUrl={post.linkedinUrl || post.externalUrl}
                                size="sm"
                              />
                            )}
                          </div>
                          <time className="text-[10px] sm:text-xs text-zinc-500 flex-shrink-0">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </time>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-athletic-brand-violet group-hover:to-athletic-court-orange group-hover:bg-clip-text transition-all duration-reaction leading-tight">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-zinc-900/50 text-zinc-500 border border-zinc-800/50"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                    </FadeIn>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <section className="space-y-6 relative">
                {/* Section Header with Integrated Animation */}
                <div className="relative">
                  {/* Animation background - positioned behind the header */}
                  <div className="absolute left-0 right-0 -top-8 h-32 pointer-events-none opacity-50 overflow-visible" style={{ zIndex: 0 }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full max-w-7xl">
                        <ScatterToSignal />
                      </div>
                    </div>
                    {/* Text positioned over the signal convergence point */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full max-w-7xl relative">
                        <div className="absolute right-[8%] top-[35%]">
                          <p className="text-xs text-zinc-400 font-light tracking-wide whitespace-nowrap animate-fade-in-up">
                            Finding <span className="text-athletic-brand-violet font-semibold">signal</span> through the <span className="text-zinc-500">noise</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Gradient fade for smooth integration */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />
                  </div>
                  
                  {/* Section Title - on top of animation */}
                  <div className="flex items-center gap-3 relative" style={{ zIndex: 10 }}>
                    <div className="h-1 w-12 bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange rounded-full" />
                    <h2 className="text-3xl font-bold text-white">Latest</h2>
                    {allRegularPosts.length > 0 && (
                      <span className="text-sm text-zinc-500">
                        Showing {regularPosts.length} of {allRegularPosts.length}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {regularPosts.map((post, index) => (
                    <FadeIn key={post.slug} delay={index * 50}>
                      <article
                      data-slug={post.slug}
                      className="group cursor-pointer relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 hover:border-zinc-700 transition-all duration-reaction hover:bg-zinc-900/50 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20"
                      style={{ zIndex: 10 }}
                      onClick={() => handleSelectPost(post.slug)}
                    >
                      <div className="space-y-4">
                        {/* Feature Image */}
                        <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden bg-zinc-900">
                          <img
                            src={post.featureImage || '/og_image.png'}
                            alt={post.title}
                            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
                            onLoad={(e) => e.currentTarget.style.opacity = '1'}
                            onError={(e) => {
                              e.currentTarget.src = '/og_image.png';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.category && (
                              <span
                                className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border transition-colors ${getCategoryColors(post.category).bg} ${getCategoryColors(post.category).border} ${getCategoryColors(post.category).text}`}
                              >
                                {post.category}
                              </span>
                            )}
                            {post.gammaId && (
                              <span
                                className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border transition-colors bg-athletic-brand-violet/10 border-athletic-brand-violet/50 text-athletic-brand-violet flex items-center gap-1"
                                title="Includes Gamma presentation"
                              >
                                <Presentation className="w-3 h-3" />
                                <span className="hidden sm:inline">Presentation</span>
                              </span>
                            )}
                            {post.source && post.source !== 'ghost' && post.source !== 'gamma' && (
                              <SourceBadge
                                source={post.source}
                                externalUrl={post.linkedinUrl || post.externalUrl}
                                size="sm"
                              />
                            )}
                          </div>
                          <time className="text-[10px] sm:text-xs text-zinc-500 flex-shrink-0">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </time>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-athletic-brand-violet group-hover:to-athletic-court-orange group-hover:bg-clip-text transition-all duration-reaction leading-tight">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {post.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded bg-zinc-900/50 text-zinc-500 border border-zinc-800/50"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                    </FadeIn>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMorePosts && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-4 min-h-[44px] rounded-xl bg-zinc-900/50 text-athletic-brand-violet border border-zinc-800 hover:border-athletic-brand-violet/50 hover:bg-athletic-brand-violet/5 transition-all duration-reaction font-medium hover:scale-105"
                    >
                      Load More Posts
                      <span className="ml-2 text-zinc-500">
                        ({allRegularPosts.length - visiblePostCount} remaining)
                      </span>
                    </button>
                  </div>
                )}
              </section>
            )}
            </>
          )}
            </>
          )}
          </div>
        </div>
      </BlogLayout>
    </>
  );
}
