---
canonical: true
stage: 1
status: seeded
captured: 2026-05-26
sources:
  - astro-build/src/components/ (30 production component files)
  - astro-build/src/pages/ (inline patterns visible in routes)
---

# Component audit

Thirty production components organized into seven categories, plus eight extractable cross-surface patterns currently inlined in page files. This audit names every UI primitive in use so the design-system definition has a complete vocabulary to work from, not a derivation from theory.

---

## Inventory summary

| Category | Count | Files |
|---|---|---|
| Chrome | 4 | `BaseLayout`, `SiteHeader`, `SiteFooter`, `DraftBanner` |
| Reading aids | 3 | `TableOfContents`, `SeriesNav`, `ReadingProgress` |
| Listing | 1 | `BlogList` |
| MDX prose primitives | 8 | `mdx/Callout`, `mdx/PullQuote`, `mdx/Figure`, `mdx/Mermaid`, `mdx/BeforeAfter`, `mdx/ResearchCitation`, `mdx/ResonanceCard`, `mdx/SourcesSection` |
| Presentation primitives | 12 | `presentations/*` (full list below) |
| Tutorial primitives | 3 | `tutorials/Checkpoint`, `tutorials/Exercise`, `tutorials/Template` |
| **Total existing** | **30** | |
| Extractable cross-surface patterns (inline in pages) | 8 | listed below |
| **Total after extraction** | **38** | |

---

## 1 · Chrome (4)

### `BaseLayout.astro`
Wrapping shell for every prerendered page. Handles SEO meta tags, analytics, global CSS, JSON-LD schema injection.

**Props** (observed from BaseLayout.astro):
- `title`, `description?`, `image?`, `type?: 'website' | 'article'`
- `publishedTime?`, `modifiedTime?`, `author?`, `tags?[]`
- `canonicalUrl?`, `jsonLd?`, `noIndex?`

**Renders**: `<html>` + `<head>` (meta, og, twitter cards, JSON-LD) + `<body>` with slot.

### `SiteHeader.astro`
Top navigation. Signal Dispatch wordmark left, Blog/Series/Fiction + More-disclosure right, RSS icon + Portfolio link far right.

**Props**: `currentPage?` (controls active-state on nav items).

**Renders**: Sticky header with logo + primary nav + disclosure dropdown ("More" → Whitepapers / Presentations / Tutorials / Counterpoints / Research / Archive / About).

### `SiteFooter.astro`
Page footer. Copyright + About link + RSS Feed + Full RSS + API + llms.txt + ninochavez.co.

**Props**: none observed.

### `DraftBanner.astro`
Top-of-page marker on authenticated draft views. High-visibility cue that the piece is unpublished.

**Used on**: `/blog/draft/[slug]` (Tier 3 auth), possibly `/blog/private/[token]/[slug]` (Tier 2 unlisted).

---

## 2 · Reading aids (3)

### `TableOfContents.astro`
Disclosure-style TOC for long-form pieces. Reads H2/H3 headings from MDX `render()` output and renders anchor links.

**Used on**: post detail, whitepaper detail, tutorial detail.

**State**: expanded by default, can collapse (`<DisclosureTriangle>`).

### `SeriesNav.astro`
Next/prev nav across parts of a series. Reads `series.slug` + `series.position` to find adjacent parts in `blog` or `fiction` collections.

**Used on**: blog posts with `series` set, fiction chapters with `series` set.

### `ReadingProgress.tsx` (React)
Scroll-progress indicator that fills as the reader scrolls through an article. (Component name self-explanatory; React because of scroll-event handling.)

**Used on**: post detail, whitepaper detail, draft detail, private detail. NOT used on home / listing pages.

---

## 3 · Listing (1)

### `BlogList.tsx`
Generic listing component. Renders an array of posts as cards. Likely the unified primitive for archive + tag-detail + category listings.

**Open question**: does BlogList differ structurally from whitepaper-index card listing (which uses image-led cards with NEW/LATEST badges)? If yes, candidate for consolidation into a single `ContentList` primitive with format-aware rendering. If no, BlogList should be promoted to a chrome-level primitive.

---

## 4 · MDX prose primitives (8) — `src/components/mdx/`

Used within MDX bodies of blog posts, whitepapers, counterpoints, fiction, research notes.

### `Callout.tsx`
Info / warning / note / success blocks within prose. Standard editorial callout pattern.

**Variants** (likely props): `type: 'info' | 'warning' | 'note' | 'success'`, `title?`, children.

### `PullQuote.tsx`
Visual quote treatment with attribution. Larger type, distinct styling from blockquote.

**Likely props**: `quote`, `attribution?`, `cite?`.

### `Figure.tsx`
Image with caption + optional source link. Replaces bare `<img>` in MDX.

**Likely props**: `src`, `alt`, `caption?`, `credit?`, `link?`.

### `Mermaid.tsx`
Diagram rendering via Mermaid.js. Used for technical illustrations (architecture diagrams, flow charts, sequence diagrams).

**Likely props**: `code` (Mermaid source), `theme?`.

### `BeforeAfter.tsx`
Split comparison (often A/B, current/proposed, before/after).

**Likely props**: `before`, `after`, optional labels.

### `ResearchCitation.tsx`
Academic-style cite reference with footnote-style ID. Used in pieces grounded in research notes.

**Likely props**: `id`, `source`, `link?`.

### `ResonanceCard.tsx`
Domain-specific component — Nino's framework. Likely surfaces a concept-with-meaning callout (worth reading the source to confirm exact purpose for the design system definition).

### `SourcesSection.tsx`
References block at end of long pieces. Lists all `ResearchCitation` references collected from the body.

---

## 5 · Presentation primitives (12) — `src/components/presentations/`

Used exclusively in presentation MDX content.

| Component | Purpose |
|---|---|
| `Slide.tsx` | Full slide container with layout variants. The atomic unit of a presentation. |
| `Card.tsx` | Content card with title + body, used within a slide |
| `DataCard.tsx` | Metric display (large number + label + optional change-from-baseline) |
| `CodeBlock.tsx` | Syntax-highlighted code (different from MDX inline code) |
| `ComparisonCard.tsx` | A/B side-by-side card |
| `FeatureList.tsx` | Bullet feature list |
| `StepList.tsx` | Numbered step list |
| `TitleBadge.tsx` | Slide title chip (typically top of a slide) |
| `SectionLabel.tsx` | Section divider within a presentation |
| `PlatformHeader.tsx` | Platform/context bar (e.g., "Signal Dispatch · March 2026") |
| `PresentationNavigation.tsx` | The slide-viewer chrome: prev/next buttons, slide-jump (1..N), fullscreen toggle, keyboard nav |
| `Callout.tsx` | Slide-tuned info/warning callout |

**Consolidation candidate**: `presentations/Callout.tsx` vs `mdx/Callout.tsx` — same name, separate implementations. The design system should either unify them (single Callout primitive with `context: 'mdx' | 'presentation'` prop) or rename one. Current divergence creates maintenance burden + risk of visual drift.

---

## 6 · Tutorial primitives (3) — `src/components/tutorials/`

Used exclusively in tutorial MDX content.

### `Checkpoint.tsx`
Knowledge-check pause point. Likely a quiz-like box that asks the reader to confirm understanding before proceeding.

### `Exercise.tsx`
Interactive practice block. Includes problem statement + optional starter code + (likely) reveal-answer affordance.

### `Template.tsx`
Scaffolded starter — code or workflow template the reader copies to follow along.

---

## 7 · Cross-surface patterns currently inlined (8 extraction candidates)

These appear on ≥2 surfaces but exist as inline markup in page files rather than as named primitives. Each is a candidate for extraction into a shared component.

### `MetaStrip` — extract
Category badge + bullet + date + bullet + read-time. Appears on post-detail, whitepaper-detail, counterpoint-detail, fiction-detail, listing rows.

**Current state**: inline in each page file. Inconsistent styling between detail pages and list rows.

**Proposed shape**:
```tsx
<MetaStrip
  category="Reflection"
  date="May 24, 2026"
  readTime="9 min read"
  format="POST"
  size="detail" // or "list"
/>
```

### `TagChip` — extract
Tag-as-link rendered with consistent chip styling. Linked to `/blog/tags/[tag]`.

**Current state**: inline `<a>` styled via Tailwind on post-detail and tag-detail browse pages.

### `AuthorBlock` — extract
Avatar (initials "NC") + name + role ("Product Architect at commerce.com"). Currently inline on post-detail.

**Proposed**: `<AuthorBlock variant="full" />` (with role) vs `<AuthorBlock variant="compact" />` (name only).

### `CounterpointBindingBanner` — extract
"This post has been challenged by [source]. Read the counterpoint." Appears on post-detail when a counterpoint exists with `challengesPost.slug === current post's slug`. Reverse-rendered on counterpoint-detail as "Counterpoint to: [parent title]. Read the original argument."

**Current state**: embedded conditional logic in post-detail / counterpoint-detail page files.

**Proposed**: `<CounterpointBindingBanner direction="from-post" target={counterpoint} />` and `<CounterpointBindingBanner direction="from-counterpoint" target={parentPost} />`.

### `ShareButtonsRow` — extract
Twitter / LinkedIn / Copy-link triad. Currently inline on post-detail.

**Proposed**: `<ShareButtonsRow url={canonicalUrl} title={post.title} />`.

### `RelatedContentCarousel` — extract
"More in [category]" with 3 same-category cards. Currently inline on post-detail.

**Proposed**: `<RelatedContentCarousel category={post.category} excludeSlug={post.slug} limit={3} />`.

### `ListingRow` — extract
The repeating row pattern on archive / tag-detail / library: date column + format-tag + title + excerpt. Different from `BlogList`'s card style.

**Proposed**: `<ListingRow item={post} format={item.collection} />`.

### `FormatPill` / `FormatBadge` — extract
WHITEPAPER / POST / SERIES / COUNTERPOINT / FICTION / PRESENTATION / TUTORIAL pills with color-coded styling. Currently inline.

**Proposed**: `<FormatBadge format="whitepaper" size="lg" />`. Single source of truth for the color-per-format mapping.

---

## 8 · Auth-tier components (newly required, not in current source)

From the auth-boundary-map work, five primitives are needed but don't exist as separate components yet:

1. **`AuthForm`** — token input form, currently inline in `drafts/index.astro`
2. **`ConfigErrorCard`** — env-misconfiguration explainer, currently inline
3. **`DraftListItem`** — workflow-status row in drafts index, currently inline
4. **`UnlistedBanner`** — distinct from `DraftBanner` for `/blog/private/[token]/[slug]` surfaces
5. **`LogoutAffordance`** — explicit signout button for authenticated sessions

---

## Cross-cutting observations

### Duplicate primitives (consolidation needed)
1. `mdx/Callout.tsx` vs `presentations/Callout.tsx` — same name, separate files. **Action**: unify or rename.
2. `BlogList.tsx` may overlap with the inline listing-row patterns. **Action**: audit BlogList's actual usage, decide between extending it or extracting `ListingRow`.

### Missing primitives (gaps)
- No standalone `FormatBadge` despite the format pill appearing in 6+ places
- No standalone `MetaStrip` despite the meta strip appearing in 8+ places
- No standalone `TagChip`, `AuthorBlock`, `ShareButtonsRow`, `RelatedContentCarousel`, `CounterpointBindingBanner`, `ListingRow`
- No auth-tier components (`AuthForm`, `ConfigErrorCard`, `DraftListItem`, `UnlistedBanner`, `LogoutAffordance`)

### Naming inconsistencies
- Tutorial primitives live at `tutorials/` (plural-folder, singular-component)
- Presentation primitives live at `presentations/` (plural-folder, singular-component)
- MDX primitives live at `mdx/` (no plural)
- Standalone primitives live at `src/components/` (no category folder)

The component-category split implies primitives belong to a content-type category. But several primitives are cross-cutting (`Callout` is used in MDX bodies + presentation slides + likely tutorials). The design system should resolve this with a **shared primitives folder** (`src/components/shared/`) for cross-cutting components, and category folders only for content-type-specific primitives (e.g., `Slide` only makes sense for presentations).

### Component-API consistency
React components (`.tsx`) and Astro components (`.astro`) are mixed in the same `src/components/` tree. No clear rule about when to use which. **Suggested rule**: Astro for non-interactive composition; React for components that need client-side state (ReadingProgress's scroll handling, PresentationNavigation's keyboard events, the slide-viewer's slide-state). Document the rule in the design system.

---

## Total post-extraction component count

**38 primitives** when the 8 inline cross-surface patterns and 5 auth-tier components are properly extracted (30 existing + 8 extractable). That's the dictionary the design system needs to name and define composition rules for.
