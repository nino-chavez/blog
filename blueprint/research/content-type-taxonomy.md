---
canonical: true
stage: 1
status: seeded
captured: 2026-05-26
sources:
  - astro-build/src/content.config.ts (Zod schema definitions)
  - astro-build/src/content/* (actual content files)
---

# Content-type taxonomy

Eight content collections power Signal Dispatch. Each has a distinct frontmatter schema, distinct cross-collection bindings, and a distinct rendering contract. Without this taxonomy named, surface composers ship UI that mishandles content-type-specific affordances.

## The eight collections

| Collection | Purpose | URL | Production count | Status enum |
|---|---|---|---|---|
| `blog` | Long-form essays + reflections | `/blog/[slug]` | 228 | `published / draft / unlisted` |
| `whitepapers` | Formal technical analyses | `/blog/whitepapers/[slug]` | 12 | (no status field — all published) |
| `presentations` | Slide-deck content | `/blog/presentations/[slug]` | varies | (no status field) |
| `tutorials` | Interactive learning | `/blog/tutorials/[slug]` | varies | (no status field) |
| `fiction` | Narrative serials + standalones | `/blog/fiction/[slug]` | varies | `published / draft` |
| `counterpoints` | Self/external red-team responses | `/blog/counterpoints/[slug]` | 4 | (no status field) |
| `series` | Series-collection metadata (not chapters) | `/blog/series/[slug]` | 6 | `active / completed` |
| `research-notes` | Working research artifacts | `/research/[slug]` | varies | `visibility: internal / published` |

---

## Per-collection schema details

### `blog` (essays)
**Frontmatter fields**:
- `title` (required)
- `slug` (optional — falls back to filename)
- `publishedAt` / `updatedAt`
- `author` (defaults "Nino Chavez")
- `status: published / draft / unlisted` — controls visibility
- `privateToken` (optional) — enables `/blog/private/[token]/[slug]` access
- `excerpt`, `tags[]`, `category`, `featured` (boolean)
- `featureImage` — hero image path
- `source`, `linkedinUrl`, `externalUrl`, `gammaId` — origin/cross-reference
- `seo.metaTitle`, `seo.metaDescription`
- **`series` binding**: `{ slug, position: int }` — links post to a series collection
- **`supportedBy[]`**: array of `{ slug, relationship: 'based-on' | 'informed-by' | 'responds-to' | 'extends' }` — backlinks to research notes

**Rendering contract**:
- Image hero (when `featureImage` present)
- Meta strip: category • date • read-time
- H1 title
- Deck (excerpt as italic subtitle)
- Tag chips (linked to `/blog/tags/[tag]`)
- Author block
- **Counterpoint-binding banner** (when a counterpoint with `challengesPost.slug === this.slug` exists)
- Disclosure TOC (when piece has H2 headings)
- Body
- Share buttons row
- "More in [category]" related-content carousel (3 items, same `category`)

---

### `whitepapers`
**Frontmatter fields**:
- Standard (title, slug, dates, author, excerpt, category, featureImage, tags)
- **`companionOf`**: `{ type: 'post', slug }` — links to companion blog post
- `supportedBy[]` (same as blog)

**Rendering contract**:
- Image hero
- Meta strip: WHITEPAPER badge + date + read-time
- H1 title
- Deck
- Long-form body (typically 13-29 min reads)
- Persistent TOC rail on desktop
- Companion-post link (when `companionOf` is set, render bidirectional "Read the companion post / Read the companion whitepaper")
- Share row
- Related: other whitepapers + the companion post

---

### `presentations`
**Frontmatter fields**:
- Standard
- **Presentation-specific**: `duration`, `audience`, `mode: 'executive-advisory' | 'technical-deep-dive' | 'workshop'`
- **`companionOf`**: `{ type: 'blog' | 'whitepaper', slug }`
- `supportedBy[]`

**Rendering contract**:
- **Distinct UX — slide viewer**, not article-page chrome
- `PresentationNavigation` component: prev/next buttons, slide-jump (1..N), fullscreen toggle, keyboard nav (← → space)
- Each slide is a `<Slide>` component containing one or more of: `Card`, `DataCard`, `CodeBlock`, `ComparisonCard`, `FeatureList`, `StepList`, `TitleBadge`, `SectionLabel`, `PlatformHeader`, `Callout`
- "Back to presentations" breadcrumb
- Mode badge ("Executive Advisory" / "Technical Deep Dive" / "Workshop")
- Companion link when set

---

### `tutorials`
**Frontmatter fields**:
- Standard
- **Tutorial-specific**: `duration`, `difficulty: 'beginner' | 'intermediate' | 'advanced'`, `prerequisites[]`, `objectives[]`
- **`companionOf`**: `{ type: 'blog' | 'whitepaper' | 'presentation', slug }`
- `supportedBy[]`

**Rendering contract**:
- Article-page chrome
- Meta strip + difficulty badge + duration
- **Pre-body section**: Prerequisites list + Objectives list (callout-style)
- Body uses MDX prose components + tutorial-specific: `Checkpoint` (knowledge-check pause), `Exercise` (practice block), `Template` (scaffolded starter)
- Companion link

---

### `fiction`
**Frontmatter fields**:
- Standard (title, dates, author, status, excerpt, tags, featureImage)
- **Fiction-specific**: `form: 'flash' | 'short-story' | 'novelette' | 'novella'`, `genre[]`, `contentWarnings[]`
- **`series` binding**: `{ slug, title, position: int, totalChapters?: int }` — for serialized novellas/novels

**Rendering contract**:
- Article-page chrome but typographically tuned for narrative reading (different measure, different line-height)
- Form badge ("FLASH" / "NOVELLA · 7 OF 7 CHAPTERS")
- Content warnings (when present, before body)
- Body in narrative-prose style (no TOC, no callouts, fewer headings)
- Intra-series navigation (when `series` set): prev chapter / next chapter / "Start from the beginning"
- Series-collection link ("Read this series")

---

### `counterpoints`
**Frontmatter fields**:
- Standard (title, dates, author, excerpt, category, featureImage, tags)
- **`challengesPost`** (required): `{ slug }` — binds to the parent blog post
- **`challengeSource`** (required): `{ name, type: 'ai-analysis' | 'external-contributor' | 'self-critique' | 'external-validation', url? }`
- `supportedBy[]`

**Rendering contract**:
- Article-page chrome
- **Parent-post banner at top** ("Counterpoint to: [parent title] — Read the original argument")
- Challenge-source meta strip ("by Self Red Team" / "by [external contributor name]")
- Body in argumentative-essay style
- Single nav affordance: "↩ Return to original argument"
- No related-content carousel (counterpoint is bound to one post)

---

### `series` (collection metadata, NOT chapters)
**Frontmatter fields**:
- `title` (required)
- `description` (required)
- `publishedAt` / `updatedAt`
- `featureImage`
- `status: 'active' | 'completed'`
- `tags[]`

**Important**: this collection's documents are NOT individual chapters. They are the *series indices*. Chapters live in `blog` or `fiction` and reference back via their own `series.slug`.

**Rendering contract**:
- Series-index page (`/blog/series/[slug]`)
- Hero: image + title + description + status badge (Active / Completed)
- Ordered parts list (queried from `blog` and `fiction` where `series.slug === this.slug`, sorted by `series.position`)
- Read-state per part (client-side localStorage; F7-positive carry-forward per existing design)
- Each part row: position number + title + excerpt + read/unread indicator + link

---

### `research-notes`
**Frontmatter fields**:
- Standard (title, slug, dates, author, excerpt, tags)
- **`noteType`** (required): `'red-team-analysis' | 'research-synthesis' | 'literature-review' | 'methodology' | 'data-analysis' | 'interview-notes' | 'market-research'`
- **`origin`**: `'internal' | 'external' | 'collaborative'`
- **`externalSource`** (when external): `{ name, organization?, url?, receivedAt? }`
- **`visibility`**: `'internal' | 'published'` — gates public access at `/research/[slug]`
- **`supportsContent[]`**: array of `{ type: 'blog' | 'whitepaper' | 'presentation' | 'tutorial', slug }` — reverse-bind to consuming content

**Rendering contract**:
- Internal notes (`visibility: 'internal'`) are NOT rendered publicly — used by author for reference only
- Published notes (`visibility: 'published'`) render at `/research/[slug]` with research-page chrome
- Meta strip: `noteType` badge + `origin` badge + date
- External-source attribution when applicable ("Provided by [name] / [organization]")
- "Supports" cross-link section: lists every blog/whitepaper/presentation/tutorial that links back via `supportedBy`
- Body in working-document style (denser, more tables, more citations)

---

## Cross-collection bindings (UI primitives, not just metadata)

Eight binding patterns generate concrete UI affordances. The design system must name these as primitives:

| Binding | Source → Target | UI primitive |
|---|---|---|
| `blog.series` → `series` | Blog post → series index | Intra-series next/prev links + series-index back-link |
| `fiction.series` → `series` | Fiction chapter → series index | Chapter-of-N badge + intra-series nav |
| `whitepapers.companionOf` → `blog` | Whitepaper → companion post | Bidirectional "Read companion" links |
| `presentations.companionOf` → `blog` or `whitepaper` | Presentation → companion | Bidirectional "Read companion" links |
| `tutorials.companionOf` → `blog` / `whitepaper` / `presentation` | Tutorial → companion | Bidirectional "Read companion" links |
| `counterpoints.challengesPost` → `blog` | Counterpoint → parent post | Parent-post banner on counterpoint; "Has been challenged" banner on post |
| `*.supportedBy[]` → `research-notes` | Any content → supporting research | "Research notes that support this" section + reverse "Supports" links on research notes |
| `*.tags[]` → `blog/tags/[tag]` | Any content → taxonomy | Tag chips + tag-detail browse |

**Methodology implication**: cross-collection bindings drive a meaningful chunk of the UI's information architecture. The design system must treat each binding as a named primitive with a defined rendering contract — not as ad-hoc conditional rendering in each surface file.

---

## Visibility / status state machine

Three independent state dimensions across collections:

**Lifecycle status** (blog, fiction):
- `published` — public on the public route
- `draft` — visible only to authenticated editor + via private-token URL
- `unlisted` (blog only) — accessible via direct URL but not in indexes/RSS/sitemap

**Series status** (series collection only):
- `active` — series is in progress (more parts expected)
- `completed` — series is finished

**Research visibility** (research-notes only):
- `internal` — author's reference only, not rendered publicly
- `published` — public at `/research/[slug]`

**Implication**: the design system needs vocabulary for status indicators — a "draft" piece needs `DraftBanner`, an "unlisted" piece needs a "this is unlisted" cue, an "active" series needs an "in progress" pill, a `red-team-analysis` note needs distinct treatment from a `methodology` note.

---

## Rendering contract gaps in current production

Observations from the live audit (`surface-audit-live.md`):

1. **`companionOf` is asymmetric in some pairs.** A whitepaper might have `companionOf.type: 'post'` pointing at a blog post; the blog post's frontmatter doesn't carry the reverse pointer. UI has to query both directions at build time. Design system needs a "companion pair" rendering primitive that handles either direction.

2. **`series` is dual-collection.** A series can have BOTH blog posts AND fiction chapters as parts. The series-index page must merge sources at render time. Design system needs a "series parts collator" treatment.

3. **`supportedBy` reverse-lookup isn't currently rendered.** Research notes' `supportsContent[]` exists in the schema but isn't surfaced on the rendered research-note page. Gap to close.

4. **`status: 'unlisted'`** — schema supports it but I haven't observed UI for it in the live audit. Need to check whether unlisted posts have any visual distinction or whether they're indistinguishable from published once accessed.

5. **`research-notes.externalSource`** — when external research is published, the attribution rendering isn't documented. Need a "external research attribution" primitive.
