import { useState } from 'react';

interface GammaEmbedProps {
  id: string;
  height?: string;
  title?: string;
}

/**
 * Embeds a Gamma presentation in the blog post
 *
 * @param id - Gamma presentation ID (from the share URL)
 * @param height - Optional custom height (default: responsive 16:9 aspect ratio)
 * @param title - Optional title for accessibility
 *
 * Usage:
 * <GammaEmbed id="YOUR-PRESENTATION-ID" />
 */
export default function GammaEmbed({ id, height, title = 'Gamma Presentation' }: GammaEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="my-8 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
      {/* Loading State */}
      {isLoading && (
        <div
          className="bg-zinc-900/50 animate-pulse flex items-center justify-center"
          style={{ height: height || '600px' }}
        >
          <div className="text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-athletic-brand-violet border-r-transparent" />
            <p className="text-zinc-400 text-sm">Loading presentation...</p>
          </div>
        </div>
      )}

      {/* Gamma Embed */}
      <div className={isLoading ? 'hidden' : 'block'}>
        {height ? (
          // Custom height mode
          <iframe
            src={`https://gamma.app/embed/${id}`}
            width="100%"
            height={height}
            frameBorder="0"
            allowFullScreen
            title={title}
            className="w-full"
            onLoad={() => setIsLoading(false)}
            loading="lazy"
          />
        ) : (
          // Responsive 16:9 aspect ratio mode
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://gamma.app/embed/${id}`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={title}
              onLoad={() => setIsLoading(false)}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
