import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import BlogLayout from '../components/BlogLayout';
import HeaderNav from '../components/HeaderNav';
import SEOHead from '../components/SEOHead';
import ReadingProgress from '../components/ReadingProgress';
import RelatedPosts from '../components/RelatedPosts';
import SourceBadge from '../components/SourceBadge';
import SocialShare from '../components/SocialShare';
import GammaEmbed from '../components/GammaEmbed';
import { getPostBySlug } from '../utils/mdx-loader';
import type { BlogPost } from '../utils/mdx-loader';
import { getCategoryColors } from '../utils/category-colors';
import { useCanonicalUrl } from '../hooks/useCanonicalUrl';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Set canonical URL for SEO (blog.ninochavez.co/:slug)
  useCanonicalUrl(slug ? `/${slug}` : '');

  useEffect(() => {
    // Scroll to top when slug changes (new post loaded)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadPost() {
      if (!slug) return;
      
      try {
        const loadedPost = await getPostBySlug(slug);
        setPost(loadedPost);
      } catch (error) {
        console.error(`Failed to load post: ${slug}`, error);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);
  
  if (loading) {
    return (
      <>
        <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
        <BlogLayout>
          <div className="max-w-4xl mx-auto space-y-8 pt-24">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-zinc-400 hover:text-athletic-court-orange transition-all duration-reaction font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-reaction" />
            Back to all posts
          </button>
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-athletic-brand-violet border-r-transparent" />
            <p className="text-zinc-400 mt-4">Loading post...</p>
          </div>
          </div>
        </BlogLayout>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
        <BlogLayout>
          <div className="max-w-4xl mx-auto space-y-8 pt-24">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-zinc-400 hover:text-athletic-court-orange transition-all duration-reaction font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-reaction" />
            Back to all posts
          </button>
          <div className="text-center py-20">
            <p className="text-zinc-400 text-xl">Post not found.</p>
          </div>
          </div>
        </BlogLayout>
      </>
    );
  }

  const Content = post.content as React.ComponentType;

  return (
    <>
      {/* SEO Meta Tags */}
      {post && (
        <SEOHead
          title={post.title}
          description={post.excerpt}
          url={`/${post.slug}`}
          image={post.featureImage || '/og_image.png'}
          type="article"
        />
      )}
      
      <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
      <BlogLayout>
        <ReadingProgress />

        <div className="max-w-4xl mx-auto pt-24">
        <div className="space-y-6">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-zinc-400 hover:text-athletic-court-orange transition-all duration-reaction font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-reaction" />
              Back to all posts
            </button>

            <article className="space-y-6">
              {/* Featured Image Hero */}
              <div className="relative -mx-4 md:-mx-8 lg:mx-0 aspect-[21/9] overflow-hidden rounded-2xl border border-zinc-800">
                <img
                  src={post.featureImage || '/og_image.png'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/og_image.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
              </div>

              <header className="space-y-3 pb-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-3 text-sm">
              {post.category && (
                <span
                  className={`font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${getCategoryColors(post.category).bg} ${getCategoryColors(post.category).border} ${getCategoryColors(post.category).text}`}
                >
                  {post.category}
                </span>
              )}
              {post.source && post.source !== 'ghost' && (
                <SourceBadge
                  source={post.source}
                  externalUrl={post.linkedinUrl || post.externalUrl}
                  size="sm"
                />
              )}
              {post.category && <span className="text-zinc-700">•</span>}
              <time className="text-zinc-500">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post.readTime && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-zinc-400 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-athletic-brand-violet/50 hover:text-athletic-brand-violet transition-all duration-reaction cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

              {/* Gamma Presentation (if present) */}
              {post.gammaId && (
                <div className="mb-8">
                  <GammaEmbed id={post.gammaId} title={post.title} />
                </div>
              )}

              {/* Article Content with Enhanced Typography */}
              <div className="prose max-w-none text-lg">
                <Content />
              </div>

              {/* Social Sharing */}
              <div className="pt-8 pb-8 border-t border-zinc-800/50">
                <SocialShare
                  url={`https://blog.ninochavez.co/${post.slug}`}
                  title={post.title}
                  excerpt={post.excerpt}
                />
              </div>

              {/* Source Attribution Banner (for LinkedIn/external articles) */}
              {post.source && post.source !== 'ghost' && (post.linkedinUrl || post.externalUrl) && (
                <div className="mt-8 p-6 rounded-xl border border-[#0A66C2]/20 bg-[#0A66C2]/5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#0A66C2] mb-1">
                        Originally Published on LinkedIn
                      </h3>
                      <p className="text-sm text-zinc-400 mb-3">
                        This article was first published on my LinkedIn profile. Click below to view the original post and join the conversation.
                      </p>
                      <a
                        href={post.linkedinUrl || post.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#004182] transition-colors"
                      >
                        View on LinkedIn
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Posts */}
              <RelatedPosts
                currentSlug={post.slug}
                category={post.category}
                tags={post.tags}
                onSelectPost={(slug) => navigate(`/${slug}`)}
              />
            </article>
        </div>
      </div>
    </BlogLayout>
    </>
  );
}
