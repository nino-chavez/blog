# Signal Dispatch Blog - Project Instructions

Astro-based blog with three content types: blog posts (MDX), whitepapers (plain markdown), presentations (MDX with `<Slide>` components).

**All commands run from `astro-build/` directory.**

## Non-Obvious Rules

- **Voice guide enforcement:** All blog content follows `/docs/signal-dispatch-voice-guide.md`. Open with tension, show the work, self-interrogate, end provisionally.
- **Whitepapers use NO MDX components** -- plain markdown only, tables liberally. Escape `<` in tables ("Under 50ms" not "<50ms").
- **Canonical tags only:** Must use approved tags from `astro-build/src/config/tags.ts` (18 total). 1-3 per post. No new tags without updating `tags.ts`.
- **Feature images are generated:** `node scripts/generate-illustration-images.js --dir {blog|whitepapers|presentations} {filename}.mdx` (requires `OPENROUTER_API_KEY`).
- **Presentations export to standalone HTML:** `node scripts/export-presentation-html.js {slug}` -> `public/presentations/export/{slug}.html`.

## Content Locations

- Blog: `astro-build/src/content/blog/*.mdx`
- Whitepapers: `astro-build/src/content/whitepapers/*.mdx`
- Presentations: `astro-build/src/content/presentations/*.mdx`
- Generated images: `astro-build/public/images/generated/`

## Frontmatter Template (All Types)

```yaml
---
title: "Title"
publishedAt: "YYYY-MM-DDTHH:MM:SS.000Z"
author: "Nino Chavez"
excerpt: "Brief description"
category: "Category Name"
tags: ["tag1", "tag2"]
featured: false        # blog posts only
duration: "15 min"     # presentations only
audience: "Target"     # presentations only
---
```

## MDX Components (Blog Posts Only)

```mdx
import { Callout } from '@/components/mdx/Callout';
import { PullQuote } from '@/components/mdx/PullQuote';

<PullQuote>Key quote (max 1 per post)</PullQuote>
<Callout type="signal" title="Title">Content</Callout>
<!-- Types: signal, noise, insight, warning -->
```

## Slide Layouts (Presentations Only)

`default`, `title`, `split`, `table`, `image`, `quote`. Use `<Slide layout="...">` component. One concept per slide.

## Workflow (All Content Types)

1. Create file in appropriate content directory
2. Generate feature image: `node scripts/generate-illustration-images.js --dir {type} {filename}.mdx`
3. For presentations: export HTML with `node scripts/export-presentation-html.js {slug}`
4. Verify: `npm run build`
5. Publish (if requested): commit and push

## Commands

```bash
cd astro-build
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview build
```

## Off-Limits

- `.env*` files
- `astro.config.mjs`
