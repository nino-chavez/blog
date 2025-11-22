import { Link2, Check } from 'lucide-react';
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
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-500 text-sm">Copied</span>
        </>
      ) : (
        <>
          <Link2 className="w-3.5 h-3.5" />
          <span className="text-sm group-hover:underline decoration-athletic-brand-violet/30 underline-offset-4">Copy Link</span>
        </>
      )}
    </button>
  );
}
