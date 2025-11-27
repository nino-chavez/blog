import { Link } from '@phosphor-icons/react';
import { useState } from 'react';
import { SuccessAnimation } from './ui/SuccessAnimation';

interface SocialShareProps {
  url: string;
  title: string;
  excerpt?: string;
}

export default function SocialShare({ url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <p className="text-zinc-500 text-sm font-medium">
        Share this article
      </p>

      <button
        onClick={handleCopyLink}
        className="group flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-athletic-brand-violet/50 hover:bg-zinc-900/80 transition-all duration-300"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <div className="p-1 rounded-full bg-green-500/10">
              <SuccessAnimation
                show={copied}
                size="sm"
                autoHideAfter={2000}
                onComplete={() => setCopied(false)}
              />
            </div>
            <span className="text-green-500 font-medium">Link Copied!</span>
          </>
        ) : (
          <>
            <div className="p-1 rounded-full bg-zinc-800 group-hover:bg-athletic-brand-violet/20 transition-colors">
              <Link size={16} weight="bold" className="text-zinc-400 group-hover:text-athletic-brand-violet transition-colors" />
            </div>
            <span className="text-zinc-300 group-hover:text-white font-medium transition-colors">Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
