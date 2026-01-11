# Signal Dispatch Presentation Design System

Extracted from Signal Forge reference implementation. This document codifies the visual design patterns for all Signal Dispatch presentations.

---

## Design Tokens

### Colors

```css
/* Brand Colors */
--brand-violet: #6366f1;      /* Primary accent, CTAs, highlights */
--brand-navy: #1e1b4b;        /* Deep background gradient end */
--brand-slate: #0f172a;       /* Primary background */

/* Accent Colors */
--accent-cyan: #06b6d4;       /* Code, tech highlights, "After" states */
--accent-emerald: #10b981;    /* Success, positive outcomes, checkmarks */
--accent-amber: #f59e0b;      /* Warnings, tension points, emphasis */

/* Platform-Specific Colors */
--windows-blue: #0078D4;
--ubuntu-orange: #E95420;
--apple-gray: gradient from gray-700 to gray-900;

/* Opacity Scale */
--white-90: rgba(255, 255, 255, 0.9);
--white-80: rgba(255, 255, 255, 0.8);
--white-70: rgba(255, 255, 255, 0.7);
--white-60: rgba(255, 255, 255, 0.6);
--white-50: rgba(255, 255, 255, 0.5);
--white-40: rgba(255, 255, 255, 0.4);
--white-30: rgba(255, 255, 255, 0.3);
--white-20: rgba(255, 255, 255, 0.2);
--white-10: rgba(255, 255, 255, 0.1);
--white-05: rgba(255, 255, 255, 0.05);
```

### Typography

```css
/* Font Families */
--font-display: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Heading Sizes */
--text-6xl: 3.75rem;  /* Title slide main heading */
--text-4xl: 2.25rem;  /* Slide headings (H2) */
--text-3xl: 1.875rem; /* Large emphasis text */
--text-2xl: 1.5rem;   /* Subtitles */
--text-xl: 1.25rem;   /* Lead paragraphs, callout text */
--text-lg: 1.125rem;  /* Body text in lists */
--text-base: 1rem;    /* Standard body */
--text-sm: 0.875rem;  /* Secondary text, labels */
--text-xs: 0.75rem;   /* Uppercase labels, meta info */

/* Font Weights */
--font-extrabold: 800;  /* Main titles */
--font-bold: 700;       /* Headings, emphasis */
--font-semibold: 600;   /* Subheadings, labels */
--font-medium: 500;     /* Button text */
--font-normal: 400;     /* Body text */
```

### Spacing

```css
/* Container widths */
--max-w-4xl: 56rem;   /* Standard content width */
--max-w-5xl: 64rem;   /* Wide content (tables, grids) */
--max-w-6xl: 72rem;   /* Full-width grids */

/* Slide padding */
--slide-padding-x: 2rem;
--slide-padding-top: 4rem;  /* Clears navigation */

/* Component spacing */
--space-section: 3rem;      /* Between major sections */
--space-element: 1.5rem;    /* Between elements */
--space-tight: 1rem;        /* Within components */
--space-xs: 0.5rem;         /* Minimal gaps */
```

### Borders & Shadows

```css
/* Border radius */
--radius-2xl: 1rem;     /* Cards, containers */
--radius-xl: 0.75rem;   /* Buttons, code blocks */
--radius-lg: 0.5rem;    /* Small cards, badges */
--radius-full: 9999px;  /* Pills, dots */

/* Borders */
--border-subtle: 1px solid rgba(255, 255, 255, 0.1);
--border-medium: 1px solid rgba(255, 255, 255, 0.2);
--border-accent: 1px solid rgba(99, 102, 241, 0.3);

/* Shadows (glow effects) */
--glow-violet: 0 0 40px rgba(99, 102, 241, 0.3);
--glow-cyan: 0 0 40px rgba(6, 182, 212, 0.3);
```

---

## Component Patterns

### 1. Section Label

Small uppercase label above slide headings indicating the theme/category.

```html
<div class="text-accent-amber text-sm font-semibold uppercase tracking-widest mb-4">
  The Tension
</div>
```

**Variants by color:**
- `text-accent-amber` - Tension, problems, friction
- `text-accent-cyan` - Patterns, technical, comparisons
- `text-accent-emerald` - Solutions, hardware, strategies
- `text-brand-violet` - Key concepts, distinctions
- `text-red-400` - Security, warnings, crises
- `text-white/40` - Neutral, discussion

### 2. Content Card

Semi-transparent container for grouped content.

```html
<div class="bg-white/5 border border-white/10 rounded-2xl p-8">
  <!-- Content -->
</div>
```

**Variants:**
- **Standard**: `bg-white/5 border-white/10`
- **Highlighted**: `bg-gradient-to-br from-brand-violet/20 to-accent-cyan/10 border-brand-violet/30`
- **Code/Terminal**: `bg-black/40 border-white/10`
- **Warning**: `bg-red-500/10 border-red-500/20`
- **Success**: `bg-accent-emerald/10 border-accent-emerald/20`

### 3. Callout Block

Left-bordered block for key insights at bottom of slides.

```html
<div class="bg-gradient-to-r from-accent-amber/10 to-transparent border-l-4 border-accent-amber p-6 rounded-r-xl">
  <p class="text-xl text-white/90">
    <span class="font-bold text-accent-amber">Label:</span> Content text here.
  </p>
</div>
```

**Color variants:**
- `border-accent-amber` + `text-accent-amber` - Warnings, uncomfortable truths
- `border-brand-violet` + `text-brand-violet` - Key insights, principles
- `border-accent-cyan` + `text-accent-cyan` - Technical notes
- `border-[#0078D4]` + `text-white` - Windows-specific
- `border-accent-emerald` + `text-accent-emerald` - Solutions

### 4. Numbered Step

Steps in a workflow or process.

```html
<div class="flex items-start gap-4">
  <span class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-violet/20 text-brand-violet flex items-center justify-center font-bold">1</span>
  <p class="text-lg text-white/80">Step description here</p>
</div>
```

**Variants:**
- Standard: `bg-brand-violet/20 text-brand-violet`
- Warning step: `bg-accent-amber/20 text-accent-amber`
- Larger (discussion cards): `w-10 h-10 rounded-lg` instead of `w-8 h-8 rounded-full`

### 5. Data Card (Metrics)

Cards displaying key metrics with icons.

```html
<div class="bg-white/5 border border-white/10 rounded-xl p-6">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
      <!-- Icon SVG -->
    </div>
    <div>
      <div class="font-bold">Apple M4</div>
      <div class="text-sm text-white/50">Neural Engine</div>
    </div>
  </div>
  <div class="text-3xl font-bold text-accent-cyan mb-2">38 TOPS</div>
  <p class="text-sm text-white/60">On-device LLM inference without lag</p>
</div>
```

### 6. Comparison Grid Card

Three-column era/epoch cards with visual footer.

```html
<div class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
  <div class="text-white/40 text-sm mb-2">1960s–1980s</div>
  <h3 class="text-xl font-bold mb-3">Punch cards → CLI</h3>
  <p class="text-white/60">Text replaces physical media</p>
  <div class="mt-6 pt-4 border-t border-white/10">
    <!-- Visual element: code snippet, icons, etc. -->
    <div class="mono text-accent-emerald text-sm">$ _</div>
  </div>
</div>
```

**Highlighted variant (current/future):**
```html
<div class="bg-gradient-to-br from-brand-violet/20 to-accent-cyan/10 border border-brand-violet/30 rounded-2xl p-6 glow-violet">
  <div class="text-brand-violet text-sm font-semibold mb-2">2025–2027</div>
  <!-- ... -->
</div>
```

### 7. Platform Header

Icon + platform name for OS-specific slides.

```html
<div class="flex items-center gap-3 mb-4">
  <div class="w-8 h-8 rounded bg-[#0078D4] flex items-center justify-center">
    <!-- Platform icon -->
  </div>
  <span class="text-[#0078D4] text-sm font-semibold uppercase tracking-widest">Windows</span>
</div>
```

### 8. Feature List with Arrows

```html
<ul class="space-y-3 text-white/70">
  <li class="flex items-start gap-2">
    <span class="text-brand-violet mt-1">→</span>
    Feature description text here
  </li>
</ul>
```

### 9. Check List

```html
<div class="space-y-4">
  <div class="flex items-center gap-3">
    <span class="text-accent-emerald">✓</span>
    <span class="text-white/70">Zero setup, no API keys</span>
  </div>
</div>
```

### 10. Table Card

Tables wrapped in card containers with proper styling.

```html
<div class="overflow-hidden rounded-2xl border border-white/10">
  <table class="w-full">
    <thead>
      <tr class="bg-white/5">
        <th class="text-left p-4 font-semibold text-white/60 text-sm uppercase tracking-wider">Column</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-white/5">
      <tr class="hover:bg-white/5 transition-colors">
        <td class="p-4 font-medium">Row content</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Cell color variants:**
- Positive outcomes: `text-accent-emerald`
- Negative/old: `text-white/60`
- Platform-specific: `text-[#0078D4]` (Windows), `text-[#E95420]` (Linux)
- Timeline: `text-accent-amber font-medium`

### 11. Timeline

Vertical timeline with dot markers.

```html
<div class="relative pl-8">
  <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 via-brand-violet to-accent-cyan"></div>

  <div class="space-y-8">
    <div class="relative timeline-dot">
      <div class="bg-white/5 border border-white/10 rounded-xl p-6 ml-4">
        <!-- Content -->
      </div>
    </div>
  </div>
</div>
```

CSS for timeline dot:
```css
.timeline-dot::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}
```

### 12. Code Block

```html
<code class="block bg-black/40 px-4 py-3 rounded-lg text-accent-cyan text-sm">
  find . -mtime -7 -name "*.mp4" -size +100M -exec ffmpeg...
</code>
```

### 13. Title Slide Badge

```html
<div class="inline-flex items-center gap-2 px-4 py-2 bg-brand-violet/20 border border-brand-violet/30 rounded-full text-brand-violet text-sm font-medium mb-8">
  <span class="w-2 h-2 rounded-full bg-brand-violet animate-pulse"></span>
  Strategic Research Brief • 2025–2027
</div>
```

---

## Slide Layouts

### Title Slide
- Centered content
- Badge at top
- Gradient text for main heading
- Stacked subtitle elements

### Content Slide (Standard)
- Section label (colored, uppercase)
- H2 heading
- Content cards with visual hierarchy
- Callout block at bottom

### Grid Slide
- Section label + H2
- 2 or 3 column grid of cards
- Optional callout at bottom

### Table Slide
- Section label + H2
- Table in card container
- Optional callout at bottom

### Comparison Slide
- Section label + H2
- Two-column Before/After cards
- Summary or callout below

### Discussion Slide
- Section label + H2
- Stacked question cards with numbered badges

---

## Animation

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide.active { animation: fadeIn 0.4s ease-out; }

/* Slow pulse for status indicators */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
```

---

## Implementation Notes

1. **Left-aligned by default**: Unlike centered presentations, Signal Forge uses left-aligned content with clear visual hierarchy.

2. **Card-based layout**: Almost all content is contained within cards for visual separation.

3. **Section labels are required**: Every content slide should have a colored section label above the heading.

4. **Callouts anchor insights**: Key takeaways go in bordered callout blocks at the bottom of slides.

5. **Color coding**: Colors have semantic meaning:
   - Amber = tension, problems, warnings
   - Cyan = technical, comparisons, code
   - Emerald = solutions, positive outcomes
   - Violet = key concepts, primary actions
   - Red = security concerns, crises

6. **Visual elements in cards**: Data cards should include visual elements (icons, metrics, code snippets) to break up text.

7. **Hover states**: Cards should have `hover:border-white/20` or similar for interactivity.

8. **Consistent spacing**: Use the defined spacing scale for predictable layouts.
