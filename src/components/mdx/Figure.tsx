/**
 * Figure component for Signal Dispatch blog posts
 * Provides styled image containers with captions
 */

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  type?: 'diagram' | 'screenshot' | 'illustration' | 'photo';
}

export function Figure({ src, alt, caption, type = 'illustration' }: FigureProps) {
  const typeStyles = {
    diagram: 'bg-zinc-900 p-4 border border-zinc-800',
    screenshot: 'shadow-2xl shadow-black/50',
    illustration: '',
    photo: 'shadow-xl shadow-black/30',
  };

  return (
    <figure className="my-8 mx-0 md:-mx-4">
      <div
        className={`rounded-xl overflow-hidden ${typeStyles[type]}`}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-zinc-500 italic px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default Figure;
