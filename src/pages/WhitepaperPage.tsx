import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Download, FileText } from 'lucide-react';
import BlogLayout from '../components/BlogLayout';
import HeaderNav from '../components/HeaderNav';
import SEOHead from '../components/SEOHead';
import ReadingProgress from '../components/ReadingProgress';
import SocialShare from '../components/SocialShare';
import CopyLinkButton from '../components/CopyLinkButton';
import { getWhitepaperBySlug } from '../utils/whitepaper-loader';
import type { Whitepaper } from '../utils/whitepaper-loader';

export default function WhitepaperPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Whitepaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadPaper() {
      if (!slug) return;
      
      try {
        const loadedPaper = await getWhitepaperBySlug(slug);
        setPaper(loadedPaper);
      } catch (error) {
        console.error(`Failed to load whitepaper: ${slug}`, error);
      } finally {
        setLoading(false);
      }
    }

    loadPaper();
  }, [slug]);

  if (loading) {
    return (
      <>
        <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
        <BlogLayout>
          <div className="max-w-4xl mx-auto space-y-8 pt-12">
            <div className="text-center py-20">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-athletic-brand-violet border-r-transparent" />
              <p className="text-zinc-400 mt-4">Loading whitepaper...</p>
            </div>
          </div>
        </BlogLayout>
      </>
    );
  }

  if (!paper) {
    return (
      <>
        <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
        <BlogLayout>
          <div className="max-w-4xl mx-auto space-y-8 pt-12">
            <div className="text-center py-20">
              <p className="text-zinc-400 text-xl">Whitepaper not found.</p>
              <button
                onClick={() => navigate('/whitepapers')}
                className="mt-4 text-athletic-brand-violet hover:underline"
              >
                Back to Research
              </button>
            </div>
          </div>
        </BlogLayout>
      </>
    );
  }

  const Content = paper.content as React.ComponentType;

  return (
    <>
      <SEOHead
        title={`${paper.title} | Signal Dispatch`}
        description={paper.excerpt}
        url={`/whitepapers/${paper.slug}`}
        image={paper.featureImage}
        type="article"
      />
      
      <HeaderNav onSearch={setSearchQuery} searchQuery={searchQuery} />
      <BlogLayout>
        <ReadingProgress />

        <div className="max-w-4xl mx-auto pt-12">
          <div className="space-y-8">
            {/* Navigation */}
            <button
              onClick={() => navigate('/whitepapers')}
              className="group flex items-center gap-2 text-zinc-400 hover:text-athletic-court-orange transition-all duration-reaction font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-reaction" />
              Back to Research
            </button>

            <article className="space-y-8">
              {/* Header */}
              <header className="space-y-6 pb-8 border-b border-zinc-800/50">
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-athletic-brand-violet/10 border border-athletic-brand-violet/30 text-athletic-brand-violet font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    Whitepaper
                  </span>
                  <span className="text-zinc-700">•</span>
                  <time className="text-zinc-500">
                    {new Date(paper.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span className="text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {paper.readTime}
                  </span>
                  <span className="text-zinc-700">•</span>
                  <CopyLinkButton url={`/whitepapers/${paper.slug}`} />
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  {paper.title}
                </h1>

                <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl">
                  {paper.excerpt}
                </p>

                {/* Author & Download */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                      {paper.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{paper.author}</div>
                      <div className="text-xs text-zinc-500">Author</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-colors print:hidden"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </header>

              {/* Disclaimer Alert */}
              <div className="p-4 rounded-lg border border-athletic-brand-violet/20 bg-athletic-brand-violet/5">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-athletic-brand-violet" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">GenAI Research</h4>
                    <p className="text-sm text-zinc-400">
                      This whitepaper is driven by human strategic thinking but assisted by and generated from GenAI deep research. It represents a hybrid workflow of human direction and machine execution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Image */}
              {paper.featureImage && (
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800">
                  <img
                    src={paper.featureImage}
                    alt={paper.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-invert max-w-none prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-athletic-brand-violet hover:prose-a:text-athletic-court-orange prose-img:rounded-xl">
                <Content />
              </div>

              {/* Footer Share */}
              <div className="pt-12 border-t border-zinc-800/50">
                <SocialShare
                  url={`https://blog.ninochavez.co/whitepapers/${paper.slug}`}
                  title={paper.title}
                  excerpt={paper.excerpt}
                />
              </div>
            </article>
          </div>
        </div>
      </BlogLayout>
    </>
  );
}
