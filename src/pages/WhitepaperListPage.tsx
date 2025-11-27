import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from '@phosphor-icons/react';
import BlogLayout from '../components/BlogLayout';
import HeaderNav from '../components/HeaderNav';
import SEOHead from '../components/SEOHead';
import FadeIn from '../components/FadeIn';
import whitepaperData from '../data/whitepaper-manifest.json';

interface Whitepaper {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  author: string;
  readTime: string;
  featureImage?: string;
  downloadUrl?: string;
  tags?: string[];
}

export default function WhitepaperListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [whitepapers, setWhitepapers] = useState<Whitepaper[]>([]);

  useEffect(() => {
    // In a real app, this might be an API call, but here we import JSON directly
    setWhitepapers(whitepaperData.whitepapers);
  }, []);

  const filteredWhitepapers = whitepapers.filter((paper) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      paper.title.toLowerCase().includes(query) ||
      paper.excerpt.toLowerCase().includes(query) ||
      paper.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const handleSelectWhitepaper = (slug: string) => {
    navigate(`/whitepapers/${slug}`);
  };

  return (
    <>
      <SEOHead
        title="Whitepapers | Signal Dispatch"
        description="Deep research and long-form analysis on AI, commerce, and systems thinking."
        url="/whitepapers"
      />

      <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />

      <BlogLayout>
        <div className="relative space-y-12">
          {/* Header Section */}
          <div className="relative py-12">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-athletic-brand-violet to-transparent" />
            <div className="pl-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Research & Whitepapers
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
                Deep dives into the mechanics of the future. Most papers are driven by my thinking but assisted by and generated from GenAI deep research.
              </p>
            </div>
          </div>

          {/* List Section */}
          <div className="grid gap-8">
            {filteredWhitepapers.map((paper, index) => (
              <FadeIn key={paper.slug} delay={index * 100}>
                <article
                  onClick={() => handleSelectWhitepaper(paper.slug)}
                  className="group cursor-pointer relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all duration-500 hover:border-zinc-700"
                >
                  <div className="grid md:grid-cols-[300px_1fr] gap-6 md:gap-8">
                    {/* Image Section */}
                    <div className="relative h-48 md:h-full min-h-[200px] overflow-hidden">
                      <img
                        src={paper.featureImage}
                        alt={paper.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors duration-500" />
                      
                      {/* Type Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/90 backdrop-blur border border-zinc-800 text-xs font-medium text-zinc-300">
                          <FileText size={14} weight="duotone" className="text-athletic-brand-violet" />
                          Whitepaper
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 md:py-8 md:pr-8 flex flex-col justify-center space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <time dateTime={paper.publishedAt}>
                            {new Date(paper.publishedAt).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </time>
                          <span>•</span>
                          <span>{paper.readTime}</span>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-athletic-brand-violet transition-colors duration-300 leading-tight">
                          {paper.title}
                        </h2>
                      </div>

                      <p className="text-zinc-400 leading-relaxed line-clamp-3">
                        {paper.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                        <div className="flex flex-wrap gap-2">
                          {paper.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <span className="flex items-center gap-2 text-sm font-medium text-white group-hover:translate-x-1 transition-transform duration-300">
                          Read Paper
                          <ArrowRight size={16} weight="bold" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}

            {filteredWhitepapers.length === 0 && (
              <div className="text-center py-20">
                <p className="text-zinc-400 text-xl">No whitepapers found.</p>
              </div>
            )}
          </div>
        </div>
      </BlogLayout>
    </>
  );
}
