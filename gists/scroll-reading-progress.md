# Scroll Reading Progress Bar

A smooth, gradient progress bar that tracks reading progress as users scroll through an article.

![Progress bar animation](https://placehold.co/600x40/1a1a1a/gradient?text=Reading+Progress+Bar)

## React Version (with Tailwind CSS)

```tsx
import { useState, useEffect } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const articleRect = article.getBoundingClientRect();
      const articleTop = articleRect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Calculate how far we've scrolled through the article
      const start = articleTop - windowHeight * 0.1;
      const end = articleTop + articleHeight - windowHeight * 0.5;
      const current = scrollY - start;
      const total = end - start;

      const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
      setProgress(percentage);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-zinc-900/50">
      <div
        className="h-full bg-gradient-to-r from-violet-500 to-orange-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

### Usage in your page:

```tsx
import ReadingProgress from './components/ReadingProgress';

export default function BlogPost() {
  return (
    <>
      <ReadingProgress />
      <article>
        {/* Your article content */}
      </article>
    </>
  );
}
```

---

## Vanilla JavaScript Version

```html
<!-- Add this to your HTML -->
<div id="reading-progress" class="reading-progress-container">
  <div id="reading-progress-bar" class="reading-progress-bar"></div>
</div>

<style>
  .reading-progress-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(24, 24, 27, 0.5);
    z-index: 100;
  }

  .reading-progress-bar {
    height: 100%;
    background: linear-gradient(to right, #8b5cf6, #f97316);
    width: 0%;
    transition: width 150ms ease-out;
  }
</style>

<script>
  (function() {
    const progressBar = document.getElementById('reading-progress-bar');

    function updateProgress() {
      const article = document.querySelector('article');
      if (!article || !progressBar) return;

      const articleRect = article.getBoundingClientRect();
      const articleTop = articleRect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Calculate how far we've scrolled through the article
      const start = articleTop - windowHeight * 0.1;
      const end = articleTop + articleHeight - windowHeight * 0.5;
      const current = scrollY - start;
      const total = end - start;

      const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
      progressBar.style.width = percentage + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  })();
</script>
```

---

## How It Works

1. **Article Detection**: Finds the `<article>` element on the page
2. **Progress Calculation**:
   - Starts tracking at 10% before the article enters viewport
   - Completes at 50% before reaching the article end (feels natural)
3. **Smooth Animation**: Uses CSS transitions for buttery-smooth updates
4. **Performance**: Uses `passive: true` on scroll listener for 60fps scrolling

## Customization

### Change the gradient colors:

**Tailwind:**
```tsx
className="bg-gradient-to-r from-blue-500 to-purple-500"
```

**CSS:**
```css
background: linear-gradient(to right, #3b82f6, #a855f7);
```

### Adjust the bar height:

```tsx
// Tailwind: change h-1 to h-2 for thicker bar
className="h-2"
```

```css
/* CSS */
height: 6px;
```

### Track entire page instead of article:

```js
// Replace the article-specific logic with:
const scrollY = window.scrollY;
const docHeight = document.documentElement.scrollHeight - window.innerHeight;
const percentage = Math.min(Math.max((scrollY / docHeight) * 100, 0), 100);
```

---

## License

MIT - Use it however you like!
