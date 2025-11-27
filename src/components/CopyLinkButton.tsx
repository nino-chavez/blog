import { Link, Check } from '@phosphor-icons/react';
import { useState } from 'react';

interface CopyLinkButtonProps {
  url: string;
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      // Ensure we have a full URL
      const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopyLink}
      className="group flex items-center gap-1.5 text-zinc-500 hover:text-athletic-brand-violet transition-colors"
      title="Copy link"
      aria-label="Copy link"
    >
      {copied ? (
        <>
          <Check size={14} weight="bold" className="text-green-500" />
          <span className="text-green-500 text-sm">Copied</span>
        </>
      ) : (
        <>
          <Link size={14} weight="bold" />
          <span className="text-sm group-hover:underline decoration-athletic-brand-violet/30 underline-offset-4">Copy Link</span>
        </>
      )}
    </button>
  );
}
