import { useEffect, useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { getAllPosts } from '../utils/mdx-loader';
import type { BlogPost } from '../utils/mdx-loader';

interface RelatedPostsProps {
  currentSlug: string;
  category?: string;
  tags?: string[];
  onSelectPost: (slug: string) => void;
}

export default function RelatedPosts({ currentSlug, category, tags = [], onSelectPost }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function loadRelatedPosts() {
      const allPosts = await getAllPosts();

      // Calculate relevance score for each post
      const scoredPosts = allPosts
        .filter((post) => post.slug !== currentSlug) // Exclude current post
        .map((post) => {
          let score = 0;

          // Same category: +3 points
          if (category && post.category === category) {
            score += 3;
          }

          // Shared tags: +1 point per tag
          if (post.tags && tags.length > 0) {
            const sharedTags = post.tags.filter((tag) => tags.includes(tag));
            score += sharedTags.length;
          }

          return { post, score };
        })
        .filter((item) => item.score > 0) // Only posts with some relevance
        .sort((a, b) => {
          // Sort by score, then by publish date
          if (b.score !== a.score) return b.score - a.score;
          return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
        })
        .slice(0, 3) // Top 3 most relevant
        .map((item) => item.post);

      setRelatedPosts(scoredPosts);
    }

    loadRelatedPosts();
  }, [currentSlug, category, tags]);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-20 pt-12 border-t border-zinc-800/50">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-gradient-to-r from-athletic-brand-violet to-athletic-court-orange rounded-full" />
          <h2 className="text-2xl font-bold text-white">Related Articles</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {relatedPosts.map((post) => (
            <article
              key={post.slug}
              onClick={() => onSelectPost(post.slug)}
              className="group cursor-pointer relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 hover:border-athletic-court-orange/50 transition-all duration-reaction hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  {post.category && (
                    <span className="font-semibold text-athletic-brand-violet uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-athletic-court-orange transition-colors duration-reaction leading-tight line-clamp-2">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-athletic-brand-violet group-hover:text-athletic-court-orange transition-colors duration-reaction font-medium pt-2">
                  Read article
                  <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform duration-reaction" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
