# Signal Dispatch Blog - Project Instructions

This repo has two concerns. They share a directory and otherwise do not overlap.

| Concern | Lives at | Source of truth |
|---|---|---|
| **Blog content authoring** (writing posts, whitepapers, presentations against the live blog at ninochavez.co/blog) | `astro-build/` | This file, below |
| **Blueprint methodology** (brownfield redesign review: diagnose → prescribe → prototype proposed state) | `blueprint/` + `blueprint.yml` at repo root | `~/Workspace/dev/tools/blueprint/template/CLAUDE.md` (canonical map) — do not inline its rules here; load on demand |

When the task is content authoring (a new post, a voice review, a whitepaper edit), the rules below apply. When the task is shaping the redesign (audit current state, write a prescription, build a portal page, run a reviewer agent), `blueprint.yml` declares the variant / tier / pattern, and the canonical Blueprint repo is the source of truth — including the SessionStart hook that injects `METHODOLOGY.md` + `docs/variant-selection.md` + `docs/portal-and-tier-ladder.md` at the top of every Blueprint session.

---

## Blog content authoring (astro-build/)

Astro-based blog with **eight content collections** (defined in `astro-build/src/content.config.ts` — that file is the source of truth, not this list). The three most common: blog posts (MDX), whitepapers (plain markdown), presentations (MDX with `<Slide>` components). The other five are easy to miss and have caused mis-filing — see Content Locations below. Before authoring a tutorial, fiction piece, counterpoint, series entry, or research note, read its schema in `content.config.ts` and match the existing pattern; do **not** approximate one collection with another (e.g. a tutorial is not a blog post with a `tutorial` tag).

**All commands run from `astro-build/` directory.**

## Non-Obvious Rules

- **Voice guide enforcement:** All blog content follows `/docs/signal-dispatch-voice-guide.md`. Open with tension, show the work, self-interrogate, end provisionally.
- **Whitepapers use NO MDX components** -- plain markdown only, tables liberally. Escape `<` in tables ("Under 50ms" not "<50ms").
- **Canonical tags only:** Must use approved tags from `astro-build/src/config/tags.ts` (18 total). 1-3 per post. No new tags without updating `tags.ts`.
- **Feature images are generated:** `node scripts/generate-illustration-images.js --dir {blog|whitepapers|presentations} {filename}.mdx` (requires `OPENROUTER_API_KEY` from `astro-build/.env` — source it with `export $(grep OPENROUTER_API_KEY .env)` before running).
- **Presentations export to standalone HTML:** `node scripts/export-presentation-html.js {slug}` -> `public/presentations/export/{slug}.html`.

## Content Locations

All collections live under `astro-build/src/content/<collection>/*.mdx`. Schemas + the registered collection list are in `astro-build/src/content.config.ts`.

| Collection | Path | Route | Distinguishing frontmatter / notes |
|---|---|---|---|
| `blog` | `content/blog/` | `/blog/{slug}` | The default. `status` (published/draft/unlisted), `series`, `featured`. MDX components: Callout, PullQuote, Figure, Mermaid. |
| `whitepapers` | `content/whitepapers/` | `/blog/whitepapers/{slug}` | Plain markdown, NO MDX components. `companionOf`. |
| `presentations` | `content/presentations/` | `/blog/presentations/{slug}` | `<Slide>` components. `duration`, `audience`, `mode`, `companionOf`. Export via `export-presentation-html.js`. |
| `tutorials` | `content/tutorials/` | `/blog/tutorials/{slug}` | Hands-on **workshop** format, not a runbook. `duration`, `difficulty`, `prerequisites[]`, `objectives[]`, `companionOf`. Imports `<Exercise>`/`<Template>`/`<Checkpoint>` from `@/components/tutorials/`; rhythm is `# H1` → numbered Exercises (`## Why this matters → ## The structure → ## Your turn → <Checkpoint>`) → `## What Comes Next`. |
| `fiction` | `content/fiction/` | `/blog/fiction/{slug}` | `status`, `form` (flash/short-story/novelette/novella), `genre[]`, `series`. Load fiction-voice memories first. |
| `counterpoints` | `content/counterpoints/` | `/blog/counterpoints/{slug}` | Self-red-team of a post. `challengesPost` + source `type`. Banner auto-renders on the parent post. |
| `series` | `content/series/` | `/blog/series/{slug}` | Registry, one per series: `title`, `description`, `status`. Posts join via `series.slug` + `position`. A series with no registry entry silently renders no nav. |
| `research-notes` | `content/research-notes/` | `/research/{slug}` | Supporting working docs. `noteType`, `origin`. Linked from content via `supportedBy`. |

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

## Post Status: Published, Draft, Unlisted

Blog posts have a `status` field with three values (default `"published"`):

- **`published`** — normal. Appears in indexes, RSS, tags, sitemap, and search. Accessible at `/blog/{slug}`.
- **`draft`** — work-in-progress. Filtered out of all public surfaces. Previewable at `/blog/draft/{slug}`.
- **`unlisted`** — shareable privately. Filtered out of all public surfaces AND the sitemap. Carries `noindex, nofollow` meta. Accessible only at `/blog/private/{privateToken}/{slug}`.

### Unlisted post workflow (for private sharing)

When sharing a post via link without wanting it found via search or public browsing:

1. Add to frontmatter:
   ```yaml
   status: "unlisted"
   privateToken: "41fb78245d2b3f19"  # generate with: openssl rand -hex 8
   ```
2. Share the URL: `https://ninochavez.co/blog/private/{privateToken}/{slug}`
3. To publish for real: remove `privateToken`, flip `status` to `"published"`

The private route renders the post with a visible amber "unlisted" banner so the private view is never confused with the public one. All public filters use `status === 'published'` (not `!== 'draft'`) so unlisted posts are also excluded from RSS, tags, index, archive, series, related-posts, and the sitemap.

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
