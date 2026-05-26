---
canonical: true
stage: 2
status: seeded
captured: 2026-05-26
grounded_in:
  - research/surface-audit-live.md
  - research/content-type-taxonomy.md
  - research/auth-boundary-map.md
  - research/component-audit.md
supersedes:
  - 02-design-principles.md (principles remain valid; this document adds the system that applies them)
---

# Signal Dispatch — Design System

This document synthesizes the four Stage 1 audits into a complete design system. Every claim here grounds in an inventoried surface, content type, auth tier, or component — not derivation from theory.

**Why this document exists**: prior sessions tried to define a design system by deriving from principles + personas without inventorying what already exists. That produced partial systems missing entire content types. This document inverts the dependency — the design system is now a deterministic application to a fully-named set of surfaces, content types, auth tiers, and components.

**What this document is NOT**: a style guide. The five design principles (Rule 1–5) remain in `02-design-principles.md` and are not duplicated here. This document names *what* the system provides; the principles say *how* to apply it.

---

## 1 · Design language (vocabulary)

The conceptual identity that this system expresses. Eight words / five rejections.

**IS**:
1. **Editorial** — publication, not blog. Each piece earns its place. Reference register: Stratechery / lethain / Pragmatic Engineer.
2. **Architectural** — drafted, structured, deliberate. The visual posture of an architecture firm's case-study book.
3. **Practitioner** — working notes from someone doing the work, not pronouncements from someone selling the work.
4. **Format-honest** — a whitepaper looks like a whitepaper, a counterpoint looks like a counterpoint, a slide deck looks like a slide deck. Format provenance is load-bearing, not decorative.
5. **Density-variant** — different content types accommodate different reading densities. Long-form essay ≠ technical whitepaper ≠ 3-min post ≠ slide ≠ narrative chapter.
6. **Bind-aware** — cross-collection bindings (companionOf, challengesPost, supportedBy, series) are visible affordances, not invisible metadata.
7. **Tier-aware** — public reader, token-share recipient, and authenticated editor are three different contexts with distinct chrome treatments.
8. **No-marketing-tells** — no email capture, no popup, no subscriber-count display, no "Join 12,000 readers." The hiring-evaluator persona drops at any of those.

**IS NOT**:
- Personal-brand newsletter (no author-first lead; no name-first navigation; no clap counter)
- SaaS-startup landing page (no gradient hero, no testimonial wall, no pricing card)
- Generic Medium-style blog (no algorithmic recirculation, no follow-CTA mid-read)
- Cyberpunk / sport-poster (Bebas Neue + neon was a register that didn't fit this domain)
- Tech-consultancy template (Inter throughout + muted accent — v3 failure pattern)

---

## 2 · Tokens

### 2.1 · Color

White-background editorial register. Coral as primary (Rule 4 emphasis), cyan as secondary (cross-binding signals).

```
--bg:           #fbf9f9   /* page background — slightly warm off-white */
--bg-card:      #ffffff   /* paper / card */
--bg-muted:     #f5f3f3   /* secondary surface (rails, table headers, callouts) */
--bg-inverse:   #1b1c1c   /* dark band (code blocks, slide chrome, footer accents) */

--fg:           #1b1c1c   /* primary text — "architectural ink" */
--fg-muted:     #444748   /* secondary text */
--fg-dim:       #747878   /* tertiary / metadata / mono dates */
--fg-inverse:   #f5f1e8   /* on dark surfaces */

--border:       #c4c7c7   /* default border */
--border-strong: #1b1c1c  /* emphasized border (counterpoint banner edge, featured-card edge) */

--coral:        #c14e3f   /* primary accent — CTAs, accent words in headlines, key emphasis */
--coral-tint:   #f3e0db   /* coral surface tint (selection bg, hover state) */
--cyan:         #0a8a8d   /* secondary — metadata, format badges, binding links, URL labels */
--cyan-tint:    #d4eeef
```

**Coral rules**:
- ONE coral emphasis per surface. The "agents" word in the editorial sentence IS the coral; nothing else on the home page should compete.
- Primary CTAs use coral as left-edge bar (3px) on cards, NOT as button background. The button itself stays neutral (`bg-inverse`).
- Coral chips for format pills only when the format is the primary content type for that surface (Whitepaper coral on /whitepapers/, Counterpoint coral on /counterpoints/).

**Cyan rules**:
- Cross-collection binding signals are cyan: companionOf links, challengesPost banners, supportedBy back-links, series next-prev, tag chips.
- Metadata that's "technical context" (URLs, dates in mono, format names) is cyan.
- Cyan is the "this signals a relationship" color; coral is the "this is the primary affordance" color.

**Format color taxonomy** (per content type, for badges/chips/format-tags):

| Format | Color token | Why |
|---|---|---|
| Whitepaper | `--coral` | Substantive technical pieces; primary content type |
| Post | `--fg-muted` | Default essay format; neutral |
| Series | `--coral` | Substantive argument-arcs; deserves emphasis |
| Counterpoint | `--cyan` | Cross-binding (binds to parent post); signal-color |
| Fiction | `--fg-dim` | Distinct content lane; muted to avoid competing with non-fiction |
| Presentation | `--cyan` | Distinct format with distinct UI; signal-color |
| Tutorial | `--fg-muted` | Educational; neutral |
| Research Note | `--fg-dim` | Working artifact; muted |

### 2.2 · Typography

Three families, deterministic role per family.

```
--font-display: 'Source Serif 4', Georgia, serif         /* headlines, titles, editorial sentence */
--font-body:    'Source Serif 4', Georgia, serif         /* long-form reading */
--font-ui:      'Inter', system-ui, sans-serif           /* labels, nav, metadata-non-code, buttons */
--font-mono:    'JetBrains Mono', Menlo, monospace       /* dates, technical metadata, code, URL labels */
```

**Why Source Serif 4 for both display and body**: editorial publications historically use serif for body (long-form reading), and a stronger weight of the same family for display. Mixing display-serif + body-sans (the Bebas + Inter hybrid I tried earlier) reads sports-brand. Mixing display-serif + body-serif reads editorial. The Material UI Stitch post-detail confirmed this — it's the only Stitch surface that reads as "real publication."

**Type scale** (clamp-based responsive):

| Token | Min | Mid (1440px viewport) | Max | Used for |
|---|---|---|---|---|
| `--text-display-hero` | 2rem | 3.5rem | 4.5rem | Editorial sentence on home + about |
| `--text-display-article` | 2rem | 2.75rem | 3.25rem | Article H1 on post/whitepaper/counterpoint/tutorial |
| `--text-display-card` | 1.5rem | 2rem | 2.25rem | Featured-piece title, stream-item titles in card mode |
| `--text-h2` | 1.5rem | 1.75rem | 2rem | Prose H2 within article body |
| `--text-h3` | 1.25rem | 1.375rem | 1.5rem | Prose H3 |
| `--text-body-lg` | 1.0625rem | 1.125rem | 1.25rem | Article body |
| `--text-body` | 1rem | 1.0625rem | 1.125rem | Default body, stream excerpts |
| `--text-ui` | 0.8125rem | 0.875rem | 0.875rem | Inter UI labels, nav |
| `--text-meta` | 0.75rem | 0.75rem | 0.8125rem | Mono dates, format pills, byline strip |
| `--text-micro` | 0.6875rem | 0.6875rem | 0.75rem | Tag chips, smallest UI labels |

**Line-height rules**:
- Display (article/hero titles): 1.1–1.15
- Body prose: 1.65 (Source Serif 4 reads tight; needs leading)
- UI / metadata: 1.4–1.5
- Mono: 1.5

**Letter-spacing rules**:
- Display headlines: -0.02em (tighter for editorial gravity)
- Body: default (Source Serif 4's native spacing)
- UI uppercase labels: +0.08em–0.12em (open up for legibility at small sizes)

### 2.3 · Spacing

8px-base rhythm. No off-grid values.

```
--sp-1: 0.25rem  /* 4px */
--sp-2: 0.5rem   /* 8px */
--sp-3: 0.75rem  /* 12px */
--sp-4: 1rem     /* 16px */
--sp-6: 1.5rem   /* 24px */
--sp-8: 2rem     /* 32px */
--sp-12: 3rem    /* 48px */
--sp-16: 4rem    /* 64px */
--sp-24: 6rem    /* 96px */
```

**Vertical rhythm rules**:
- Paragraph margin: `--sp-6` (24px)
- Section spacing (between H2 sections): `--sp-12` (48px)
- Surface-level spacing (between major page sections): `--sp-16` (64px)
- Component padding (cards, callouts): `--sp-6` to `--sp-8`

### 2.4 · Layout grid

```
--max-content: 1200px    /* page width (home, listing, library) */
--max-narrow:  720px     /* narrow page width (about, follow) */
--max-prose:   680px     /* article body measure */
--rail-width:  280px     /* TOC sidebar (post/whitepaper/tutorial) */
--gutter:      1.5rem    /* mobile */
--gutter-md:   3rem      /* desktop */
```

**Grid rules**:
- Prose measure is 680px max (lethain-standard, P1 hiring-evaluator-friendly)
- Listing rows use the page-width grid (1200px), not prose-width
- TOC rail at 280px desktop only; hidden on mobile (collapses to disclosure-toc above content)
- All article-page surfaces use the `680px prose + 280px rail = ~960px` two-column layout on desktop

---

## 3 · Layout dictionary (20 page types)

Twenty named layouts, one per inventoried route. Each declares: purpose, primary affordance, body container, ancillary elements, auth tier.

### Reader surfaces (16)

| Layout name | Routes | Primary affordance | Body | Ancillary | Auth tier |
|---|---|---|---|---|---|
| `LayoutHome` | `/blog/` | Featured piece (single) | Editorial sentence above; chronological stream below | "Also here" surface-type aggregator below stream | Public |
| `LayoutArticle` | `/blog/[slug]`, `/blog/draft/[slug]`, `/blog/private/[token]/[slug]` | Article body (680px prose) | Header → Body → Footer-nav | TOC rail (desktop); ReadingProgress; counterpoint-binding banner (when relevant); related-content carousel | Public / Tier 2 / Tier 3 |
| `LayoutWhitepaper` | `/blog/whitepapers/[slug]` | Long-form technical body | Header → Executive summary → Body → Sources | Persistent TOC rail; companion-post link | Public |
| `LayoutCounterpoint` | `/blog/counterpoints/[slug]` | Counter-argument body | Parent-post banner → Header → Body | Single return-to-parent link; NO related carousel | Public |
| `LayoutFiction` | `/blog/fiction/[slug]` | Narrative body (tuned for reading) | Form-badge + Header → Body | Intra-series next-prev; series-collection link | Public |
| `LayoutPresentation` | `/blog/presentations/[slug]` | Slide viewer | `<Slide>` collection | `PresentationNavigation` chrome (prev/next/jump/fullscreen); NO site header | Public |
| `LayoutTutorial` | `/blog/tutorials/[slug]` | Lesson body | Pre-body (prerequisites + objectives) → Body → Post-body (checkpoints) | TOC rail; companion link; difficulty pill | Public |
| `LayoutResearchNote` | `/research/[slug]` | Research artifact body | Header → Body → Reverse-links ("Supports") | NoteType + Origin badges; external-source attribution | Public (only when `visibility: 'published'`) |
| `LayoutListingDetail` | `/blog/[index].*` (whitepapers index, series index, counterpoints index, fiction index, presentations index, tutorials index, research index) | Listing rows or cards | Surface header → Filter chips (when relevant) → List | Per-format card or row variant | Public |
| `LayoutSeriesDetail` | `/blog/series/[slug]` | Ordered parts list | Series intro → Parts list | Each part: position + title + excerpt + read-state | Public |
| `LayoutTagDetail` | `/blog/tags/[tag]` | All pieces matching tag | Tag name → Listing rows | Tag-cluster suggestions (related tags) | Public |
| `LayoutTagIndex` | `/blog/tags/` | Tag taxonomy browse | Alphabetical tag list with counts | Most-used tags surfaced | Public |
| `LayoutArchive` | `/blog/archive` | Full chronological corpus | Grouped-by-year listing | Year navigation jump-links | Public |
| `LayoutAbout` | `/blog/about` (new; not in current production) | Editorial sentence + format conventions | Sections: What this is / Author / Cadence / Formats / Colophon | None | Public |
| `LayoutFollow` | `/blog/follow` or `/blog/subscribe` (new) | RSS + LinkedIn affordances | Feed cards | "Why no email" colophon | Public |
| `LayoutLibrary` | `/blog/library` (new — supersedes archive's role) | Chronological corpus + format filter | Filter chips → Listing rows | Format counts per chip | Public |

### Editorial / auth surfaces (4)

| Layout name | Routes | Primary affordance | Body | Auth tier |
|---|---|---|---|---|
| `LayoutAuthGate` | `/blog/drafts/` (unauthenticated state) | Token input form | Form (password input) + helper text + error states | Public (entry to Tier 3) |
| `LayoutDraftsIndex` | `/blog/drafts/` (authenticated state) | Drafts list | List of drafts with workflow status | Tier 3 (authenticated) |
| `LayoutAuthError` | `/blog/drafts/` (config error state) | `ConfigErrorCard` | Env-misconfiguration explainer | Public |
| `LayoutAuthFlow` | `/blog/drafts/logout` | Brief redirect with confirmation | "Logging out…" or instant redirect | Tier 3 → Public |

**Two new layouts required** that don't exist in current production:
- `LayoutAbout` — blog-scoped about (currently `/about` is parent-domain; gap)
- `LayoutFollow` — dedicated follow surface (currently RSS is only in footer + nav-icon; gap)
- `LayoutLibrary` — chronological + format-filter (currently `/blog/archive` is chronological-only; gap)

Each new layout closes a surface gap identified in `surface-audit-live.md`.

---

## 4 · Component dictionary (43 primitives)

Three categories: **existing** (30 in production), **extract** (8 inline patterns to promote), **new** (5 auth-tier primitives to build).

### 4.1 · Chrome (4 existing)

| Primitive | Status | Spec reference |
|---|---|---|
| `BaseLayout` | Existing | Wraps all prerendered pages. Slot-based composition. |
| `SiteHeader` | Existing | Top nav. Active-state on current page. |
| `SiteFooter` | Existing | Bottom links: About / RSS / API / llms.txt / portfolio. |
| `DraftBanner` | Existing | High-contrast top-of-page marker. Tier 3 + Tier 2 surfaces. |

### 4.2 · Reading aids (3 existing)

| Primitive | Status | Spec reference |
|---|---|---|
| `TableOfContents` | Existing | Disclosure-style TOC from H2 headings. Used on long-form. |
| `SeriesNav` | Existing | Prev/next across series parts. |
| `ReadingProgress` | Existing | Scroll-progress indicator. React (needs client state). |

### 4.3 · MDX prose primitives (8 existing)

All used within MDX body content (blog, whitepapers, counterpoints, fiction, tutorials, research notes).

| Primitive | Status | Notes |
|---|---|---|
| `mdx/Callout` | Existing | Info/warning/note blocks. **Duplicate of presentations/Callout — consolidate.** |
| `mdx/PullQuote` | Existing | Visual quote treatment. |
| `mdx/Figure` | Existing | Image + caption + optional credit/link. |
| `mdx/Mermaid` | Existing | Diagram rendering. |
| `mdx/BeforeAfter` | Existing | Split A/B comparison. |
| `mdx/ResearchCitation` | Existing | Academic-style cite. |
| `mdx/ResonanceCard` | Existing | Domain-specific (Nino's framework). |
| `mdx/SourcesSection` | Existing | References block. |

### 4.4 · Presentation primitives (12 existing)

Used exclusively in presentation content.

| Primitive | Status | Notes |
|---|---|---|
| `presentations/Slide` | Existing | Atomic slide container. |
| `presentations/Card` | Existing | Slide-level content card. |
| `presentations/DataCard` | Existing | Metric display. |
| `presentations/CodeBlock` | Existing | Syntax-highlighted code. |
| `presentations/ComparisonCard` | Existing | A/B side-by-side. |
| `presentations/FeatureList` | Existing | Bullet list. |
| `presentations/StepList` | Existing | Numbered list. |
| `presentations/TitleBadge` | Existing | Slide title chip. |
| `presentations/SectionLabel` | Existing | Section divider. |
| `presentations/PlatformHeader` | Existing | Platform/context bar. |
| `presentations/PresentationNavigation` | Existing | Slide-viewer chrome. |
| `presentations/Callout` | Existing | **Duplicate of mdx/Callout — consolidate.** |

### 4.5 · Tutorial primitives (3 existing)

| Primitive | Status | Notes |
|---|---|---|
| `tutorials/Checkpoint` | Existing | Knowledge-check pause. |
| `tutorials/Exercise` | Existing | Practice block. |
| `tutorials/Template` | Existing | Scaffolded starter. |

### 4.6 · Listing primitive (1 existing)

| Primitive | Status | Notes |
|---|---|---|
| `BlogList` | Existing | Listing component (current shape unclear; audit). |

### 4.7 · Extracted cross-surface primitives (8 new — to build)

These exist as inline markup currently and need extraction.

| Primitive | Used on | Composition rule |
|---|---|---|
| `MetaStrip` | All article-detail layouts + listing rows | `category` + `date` + `readTime` + optional `format` badge. Variant: `detail` (large) or `list` (compact). |
| `TagChip` | post-detail, tag-detail | Linked tag rendering. Hover state = coral underline. |
| `AuthorBlock` | post-detail | Avatar + name + role. Variants: `full` / `compact`. |
| `CounterpointBindingBanner` | post-detail (when challenged), counterpoint-detail | Directional: `from-post` (post → counterpoint) or `from-counterpoint` (counterpoint → parent). |
| `ShareButtonsRow` | post-detail, whitepaper-detail | Twitter + LinkedIn + Copy. |
| `RelatedContentCarousel` | post-detail | 3 same-category items. Excludes current post. |
| `ListingRow` | archive, tag-detail, library, listing-detail layouts | date column + format-tag + title + excerpt grid. |
| `FormatBadge` | Featured cards, listings, headers | Single source of truth for color-per-format mapping (see § 2.1). Sizes: `sm` / `lg`. |

### 4.8 · Auth-tier primitives (5 new — to build)

Required for Tier 2 + Tier 3 surfaces; do not currently exist as components.

| Primitive | Used on | Composition rule |
|---|---|---|
| `AuthForm` | `LayoutAuthGate` (`/blog/drafts/` unauth state) | Token input (password) + submit + helper text + error states (invalid token, missing env). |
| `ConfigErrorCard` | `LayoutAuthError` (env misconfigured) | Warning icon + headline + body explaining `DRAFT_PREVIEW_TOKEN` requirement + remediation steps. |
| `DraftListItem` | `LayoutDraftsIndex` | Row showing draft title + last-edited + workflow status indicator + link to draft view. |
| `UnlistedBanner` | `LayoutArticle` when accessed via private-token route | Distinct from `DraftBanner`: communicates "this URL is for private audience" without implying unfinished. |
| `LogoutAffordance` | Tier 3 layouts | Visible signout link in header or footer when authenticated. |

### 4.9 · Composition rules

**File organization** (proposed re-org):
- `src/components/chrome/` — BaseLayout, SiteHeader, SiteFooter, DraftBanner, UnlistedBanner, LogoutAffordance
- `src/components/shared/` — MetaStrip, TagChip, AuthorBlock, FormatBadge, ListingRow, ShareButtonsRow, RelatedContentCarousel, CounterpointBindingBanner, Callout (unified), ReadingProgress
- `src/components/reading-aids/` — TableOfContents, SeriesNav
- `src/components/auth/` — AuthForm, ConfigErrorCard, DraftListItem
- `src/components/presentations/` — all 12 presentation primitives (cross-cutting Callout removed)
- `src/components/tutorials/` — Checkpoint, Exercise, Template
- `src/components/mdx/` — PullQuote, Figure, Mermaid, BeforeAfter, ResearchCitation, ResonanceCard, SourcesSection (Callout moved to shared)

**Astro vs React rule**:
- `.astro` — non-interactive composition, server-rendered, no client state
- `.tsx` — components that need client-side state (scroll handling, keyboard events, slide state, form submission)

---

## 5 · Content-type rendering contracts (8)

One contract per content collection, defined in detail in `research/content-type-taxonomy.md`. Summary here:

| Collection | Layout | Key primitives |
|---|---|---|
| `blog` | `LayoutArticle` | MetaStrip, AuthorBlock, TableOfContents (when H2s present), CounterpointBindingBanner (when challenged), ShareButtonsRow, RelatedContentCarousel, SeriesNav (when in series), ReadingProgress |
| `whitepapers` | `LayoutWhitepaper` | MetaStrip, TableOfContents (persistent rail), MDX prose primitives, SourcesSection, ShareButtonsRow, companion-link |
| `presentations` | `LayoutPresentation` | PresentationNavigation, Slide composition (12 presentation primitives) |
| `tutorials` | `LayoutTutorial` | MetaStrip, Pre-body objectives/prerequisites, TableOfContents, Tutorial primitives (Checkpoint, Exercise, Template), companion-link |
| `fiction` | `LayoutFiction` | Form badge (FLASH/NOVELLA), SeriesNav (intra-chapter), narrative-prose-tuned typography |
| `counterpoints` | `LayoutCounterpoint` | CounterpointBindingBanner (from-counterpoint direction), MetaStrip with challenge-source attribution, single return-to-parent link |
| `series` | `LayoutSeriesDetail` | Ordered parts list, read-state per part, dual-collection collator (blog + fiction parts) |
| `research-notes` | `LayoutResearchNote` | NoteType + Origin badges, external-source attribution (when applicable), "Supports" reverse-links section |

---

## 6 · Auth-state design vocabulary

Three trust tiers, three visual languages.

### Tier 1 — Public
Standard publication chrome. No banners. SEO-indexed. Edge-cached.

### Tier 2 — Token-secret (`/blog/private/[token]/[slug]`)
- `UnlistedBanner` at top of page
- Same article-layout otherwise (NOT a draft, the content is finished)
- "Unlisted: this URL is private. Do not share publicly." — softer than DraftBanner
- No `LogoutAffordance` (URL is the credential; no session to log out of)

### Tier 3 — Authenticated (drafts)
- `DraftBanner` at top of every draft view (high-contrast, unmissable)
- `LogoutAffordance` visible in chrome
- Distinct visual register for drafts list: workflow-status-oriented, not editorial-publication-oriented
- `AuthForm` is the entry — dark card, lock icon, password input, helper text
- `ConfigErrorCard` is the env-misconfigured fallback

**Implication**: Tier 3 has a quieter, more utilitarian register than Tier 1. The transition is deliberate — the editor is not in a reading context, they're in a workflow context.

---

## 7 · Implementation roadmap

In order of dependency + leverage:

1. **Tokens** — write `signal-dispatch.css` (or Tailwind config) with all tokens from § 2. Single source of truth. Existing `astro-build/src/styles/global.css` is the place. *(~1 hour)*

2. **Extract 8 inline cross-surface patterns** (§ 4.7) — promote inline markup to named primitives. Tag each PR with the route it was extracted from to maintain traceability. *(~6 hours)*

3. **Consolidate Callout** — unify `mdx/Callout.tsx` and `presentations/Callout.tsx` into `shared/Callout.tsx` with `context: 'prose' | 'slide'` prop. *(~2 hours)*

4. **Build 5 auth-tier primitives** (§ 4.8) — required for Tier 2 / Tier 3 surfaces. *(~6 hours)*

5. **Add 3 new layouts** — `LayoutAbout` (blog-scoped), `LayoutFollow` (RSS/LinkedIn), `LayoutLibrary` (format-filter). *(~4 hours each, 12 hours total)*

6. **Reorganize component folders** per § 4.9. *(~2 hours)*

7. **Update each existing page** to use named primitives instead of inline markup. *(~30 min × 20 routes = 10 hours)*

**Total**: ~40 hours of focused engineering work to ship the unified design system across all 20 production routes. Spread over a working week.

---

## 8 · What this design system does NOT decide

These remain operator-driven judgment calls outside the design-system scope:

- **Specific tag taxonomy** — what tags exist, when to add new ones (editorial decision, not design)
- **Editorial calendar / cadence** — D4 accepted as "published when ready"; design system doesn't impose schedule
- **Voice register details** — covered by voice guide (`signal-dispatch-voice-guide.md`), not duplicated here
- **Content-decision categorization** — what's a Counterpoint vs a Post vs a Whitepaper is the operator's call per piece
- **Cross-domain branding** — relationship with parent ninochavez.co + Flickday + Let's Pepper is a portfolio-level decision

---

## 9 · Methodology contribution

This design system definition is what Stage 2 of Blueprint should produce when the consumer initiative ships a designed surface. Producing it required:
1. Stage 1 surface audit (`research/surface-audit-live.md`)
2. Stage 1 content-type taxonomy (`research/content-type-taxonomy.md`)
3. Stage 1 auth boundary map (`research/auth-boundary-map.md`)
4. Stage 1 component audit (`research/component-audit.md`)

**Candidate Gap 13** for blueprint-redesign: Stage 1 currently produces persona/funnel/evidence research without surface/component/content-type/auth-boundary audits. Without those, Stage 2 design-system definitions are derivations from theory rather than deterministic applications to inventoried reality. Closes with required Stage 1 artifacts (the four above) + a Stage 2 `02-design-system.md` shape (this document's shape, generalized).
