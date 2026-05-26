---
canonical: true
stage: 1
status: seeded
captured: 2026-05-26
sources:
  - Live production site: ninochavez.co/blog
  - Production source: astro-build/src/pages/
  - Component library: astro-build/src/components/
  - Content collections: astro-build/src/content/
---

# Signal Dispatch — Live Surface Audit

A designer's inventory of every production surface, captured against the live deployed site at ninochavez.co/blog and cross-referenced with the source repo. This artifact grounds the design-system definition that follows in Stage 2.

**Reason this audit exists**: prior sessions tried to define a design system by deriving from principles (Rule 1-5) + personas. That fails when the surface set is wider than the dictionary assumes. The blog has 15+ distinct page types and 25+ components in production; my earlier dictionary listed 8 layouts and ~15 components. This audit closes that gap by cataloguing what's there before defining what should be.

---

## 1 · Routes inventory (24 production routes)

### Public reader surfaces

| Route | Type | Live observations | Auth |
|---|---|---|---|
| `/about` | About | Parent-domain page; NOT blog-scoped. Different chrome. Photography gallery + things-i-run + connect. **Gap: blog has no scoped about page.** | Public |
| `/blog/` | Home | Featured (1) + Latest essays grid (6) + "All 228 →" + right-rail (Currently Serializing / Essay Series / Also Here) + footer. 5+ discovery affordances above the fold (Rule 4 violation in current state). | Public |
| `/blog/[slug]` | Post detail | Image hero + category badge + date + read-time + H1 + deck + tag chips + author block + counterpoint-binding banner (when challenged) + disclosure TOC + body + share buttons + "More in [category]" (3 related) | Public |
| `/blog/archive` | Archive | Full chronological listing of all 228 essays | Public |
| `/blog/whitepapers/` | Whitepapers index | Imaged cards listing with NEW/LATEST badges, format pill, date + read-time, title, excerpt. 12 whitepapers. | Public |
| `/blog/whitepapers/[slug]` | Whitepaper detail | Long-form technical document, table-heavy, often 13-29 min reads. Similar to post-detail but format-badge = WHITEPAPER. | Public |
| `/blog/series/` | Series index | Listing of series with titles + part counts | Public |
| `/blog/series/[slug]` | Series detail | Ordered parts list with read-state (per F7-positive), series intro, links to each part | Public |
| `/blog/counterpoints/` | Counterpoints index | Listing of self/external red-team pieces | Public |
| `/blog/counterpoints/[slug]` | Counterpoint detail | Body + parent-post binding banner naming the post being challenged | Public |
| `/blog/fiction/` | Fiction index | Listing of narrative serials with chapter counts | Public |
| `/blog/fiction/[slug]` | Fiction detail | Chapter view with intra-series nav (e.g., NOVELLA · 7 OF 7 CHAPTERS) | Public |
| `/blog/presentations/` | Presentations index | Listing of presentation decks | Public |
| `/blog/presentations/[slug]` | Presentation detail | **SLIDE VIEWER**: prev/next nav + slide-jump buttons (10 jumps) + fullscreen toggle + keyboard nav (←/→/space). Completely distinct UX. | Public |
| `/blog/tutorials/` | Tutorials index | Listing of interactive learning pieces | Public |
| `/blog/tutorials/[slug]` | Tutorial detail | Interactive learning UX with Checkpoint / Exercise components | Public |
| `/blog/tags/` | Tags index | Tag taxonomy browse | Public |
| `/blog/tags/[tag]` | Tag detail | All pieces matching a tag | Public |
| `/research/` | Research notes index | Working documents and methodology | Public |
| `/research/[slug]` | Research note detail | Research artifact detail | Public |

### Authenticated / token-gated surfaces

| Route | Type | Purpose | Auth |
|---|---|---|---|
| `/blog/drafts/` | Drafts index | Unpublished pieces, editor-only | Authenticated |
| `/blog/draft/[slug]` | Draft view | Pre-publish review with `DraftBanner` visible | Authenticated |
| `/blog/drafts/logout` | Auth flow | Session termination | Authenticated |
| `/blog/private/[token]/[slug]` | Private share | Token-secret pre-publish reader link (no auth, token-gated) | Token-secret |

**Methodology gap**: my earlier dictionary covered 8 page types. Production has **20 distinct page types** plus auth states. Missed in prior sessions: fiction, presentations (slide viewer is a unique UX), tutorials (interactive learning), research notes, tag taxonomy, archive, and the entire authenticated/token-gated surface set.

---

## 2 · Component library (25+ production primitives)

### Chrome (4)
- `BaseLayout` — SEO meta, analytics, global CSS, JSON-LD schema
- `SiteHeader` — top nav (Signal Dispatch wordmark + Blog / Series / Fiction / More-disclosure / RSS / Portfolio)
- `SiteFooter` — copyright + About + RSS Feed + Full RSS + API + llms.txt + ninochavez.co
- `DraftBanner` — visible marker on draft/private surfaces

### Reading aids (2)
- `TableOfContents` — disclosure-style TOC for long-form pieces; uses anchor links to H2 headings
- `SeriesNav` — next/prev links across parts of a series

### MDX prose primitives (9) — `src/components/mdx/`
- `Callout` — info/warning/note blocks within prose
- `PullQuote` — visual quote treatment with attribution
- `Figure` — image + caption + optional source link
- `Mermaid` — diagram rendering (technical illustration)
- `BeforeAfter` — split comparison (often A/B / current/proposed)
- `ResearchCitation` — academic-style cite reference with footnote-style ID
- `ResonanceCard` — domain-specific (Nino's framework — surface what this actually represents)
- `SourcesSection` — references block at end of long pieces

### Presentation primitives (12) — `src/components/presentations/`
- `Slide` — full-slide container with layout variants
- `Card` — content card with title + body
- `DataCard` — metrics display (number + label)
- `CodeBlock` — syntax-highlighted code
- `ComparisonCard` — A/B side-by-side
- `FeatureList` — bullet feature list
- `StepList` — numbered step list
- `TitleBadge` — slide title chip
- `SectionLabel` — section divider
- `PlatformHeader` — platform/context bar at top
- `PresentationNavigation` — prev/next + jump + fullscreen (the chrome around slides)
- `Callout` — same shape as MDX Callout but slide-tuned (**duplicate primitive → consolidation candidate**)

### Tutorial primitives (4) — `src/components/tutorials/`
- `Checkpoint` — knowledge-check pause point
- `Exercise` — interactive practice block
- `Template` — scaffolded starter
- (Tutorials also reuse some MDX primitives for prose)

### Site-level (mentioned but not enumerated above)
- Counterpoint-binding banner (on post-detail when post has been challenged) — a real component, not yet extracted as a named primitive in `src/components/`
- Tag chip — appears on post-detail; not yet a named primitive
- Author block — "NC" avatar + name + title; not yet a named primitive

---

## 3 · Content-type taxonomy

Eight content collections under `src/content/`. Each has a distinct frontmatter shape + rendering contract.

| Collection | Count | Typical read-time | Distinct frontmatter fields | Rendering surface |
|---|---|---|---|---|
| `blog` | 228 essays | 5-15 min | `category`, `featureImage`, `tags`, `challengedByPosts`, `companionOf` | `/blog/[slug]` |
| `whitepapers` | 12 | 13-29 min | `featureImage`, `companionOf` (links to parent blog post sometimes) | `/blog/whitepapers/[slug]` |
| `series` | 6 | varies | `parts[]`, `order`, `description` | `/blog/series/[slug]` |
| `counterpoints` | 4 | varies | `challengesPost` (binds to parent), `attribution` (self / external) | `/blog/counterpoints/[slug]` |
| `fiction` | varies | varies | `series` (slug + title + chapter), `order`, `chapterTitle` | `/blog/fiction/[slug]` |
| `presentations` | varies | varies | `slideCount`, `presentedAt`, slide-specific component refs | `/blog/presentations/[slug]` |
| `tutorials` | varies | varies | `prerequisites`, `checkpoints[]`, `exercises[]` | `/blog/tutorials/[slug]` |
| `research-notes` | varies | varies | `status` (active / archived), `topic`, working-doc shape | `/research/[slug]` |

**Cross-collection bindings**:
- `companionOf` — whitepaper ↔ blog post pair
- `challengesPost` — counterpoint → parent post (renders the auto-link banner on the parent)
- `series.slug` — fiction chapters + essay series parts

These bindings matter for the design system: a post with a counterpoint binding renders the "This post has been challenged" banner; a whitepaper companion link surfaces in both directions; series parts auto-link to next/prev. The design system must name these binding components as primitives, not treat them as one-off conditional logic.

---

## 4 · Auth boundary map

Three trust tiers in production:

**Tier 1 — Public** (20 routes)
Default. All reader-facing surfaces. SEO-indexed. Cached at edge.

**Tier 2 — Token-secret** (1 route)
`/blog/private/[token]/[slug]` — pre-publish sharing without auth. Token in URL is the secret; security model is "URL is the credential." Used to share drafts with specific reviewers before publication. Renders the published piece but with `DraftBanner` visible.

**Tier 3 — Authenticated** (3 routes)
`/blog/drafts/`, `/blog/draft/[slug]`, `/blog/drafts/logout`. Session-based auth (Astro middleware presumably). Editor-only. `DraftBanner` visible. Hidden from public navigation entirely.

**Implication for design system**: the auth boundary is a load-bearing affordance — `DraftBanner` is the visual cue that the operator is in an unpublished context. The banner needs to be a named, prominent primitive in the design system, not a marginal note. Similarly, the logout flow needs an auth-page layout (currently `/blog/drafts/logout` exists but its design-system shape isn't documented).

---

## 5 · Cross-surface patterns (what to extract as primitives)

Patterns that appear on ≥2 surfaces, candidates for the design system's component dictionary:

| Pattern | Appears on | Already a primitive? |
|---|---|---|
| Featured-piece card with hero image + category + date + read-time | Home featured, listings (whitepapers index, archive, etc.) | No — partial implementation across pages |
| Meta strip: category • date • read-time | Post detail, whitepaper detail, counterpoint detail, listing rows | No — repeated inline |
| Tag chips | Post detail, tag detail | No — inline |
| Counterpoint-binding banner | Post detail (when challenged), counterpoint detail (showing parent) | No — embedded conditional |
| Author block | Post detail | No — inline |
| Disclosure TOC | Post detail (long pieces), whitepaper detail, tutorial detail | Yes — `TableOfContents` |
| Right-rail aggregator | Home only currently | No — page-specific |
| Listing-row with image card | Whitepapers index, archive, fiction index | No — repeated layout |
| Share buttons row (Twitter / LinkedIn / Copy) | Post detail, whitepaper detail | No — inline |
| Related-content carousel ("More in X") | Post detail bottom | No — inline |
| Series intra-series nav (NOVELLA · 7 OF 7 CHAPTERS) | Fiction detail, series detail | Partial — `SeriesNav` exists |
| Slide viewer chrome | Presentation detail | Yes — `PresentationNavigation` |
| Format pill / badge | Whitepapers index (WHITEPAPER), listings | No — inline styling |
| NEW / LATEST badges | Whitepapers index, possibly others | No — inline |

**Patterns that should be primitives but aren't yet**: meta strip, tag chips, author block, counterpoint-binding banner, share buttons, related-content carousel, listing row, format pill. Eight new candidate primitives that the design system should name.

---

## 6 · Gaps + observations (designer's notes)

**Surface gaps**:
1. **No blog-scoped About page.** `/about` is on the parent domain with different chrome. A reader who lands on a blog post and clicks "About" leaves the publication context entirely. Recommend: blog-scoped about page at `/blog/about` (or rename to `/blog/colophon`) using the publication's chrome.
2. **No `/blog/subscribe` or `/blog/follow` surface.** RSS link is present in footer + nav-icon but there's no dedicated affordance for explaining the follow path (RSS vs LinkedIn vs etc.). Recommend: add a follow surface.
3. **No formal `/blog/library` surface.** `/blog/archive` exists but is chronological-only. A reader who wants to browse by format ("show me only whitepapers and series") has to use category-specific index pages. Recommend: library surface with format-filter chips.

**Chrome inconsistencies**:
1. Top nav shows "Blog / Series / Fiction" but Whitepapers / Presentations / Tutorials / Counterpoints / Research are only reachable via the home page's right-rail or the "More" disclosure. Reader navigation cost is asymmetric across content types. Recommend: flatten the "More" dropdown OR replace the right-rail aggregator with a more discoverable surface.
2. Footer differs from blog footer (parent-domain `/about` has its own footer with social links; blog footer has RSS / Full RSS / API / llms.txt). Two different footer shapes within one operator's properties.

**Component duplicates** (consolidation candidates):
1. `Callout` exists in BOTH `mdx/Callout.tsx` and `presentations/Callout.tsx`. Same name, different files. Probably different implementations. Consolidate or rename.
2. Tag-style chips appear inline on post-detail AND on tag-detail browse, but not as a named primitive. Extract.
3. Meta-strip (category • date • read-time) repeats inline across detail pages. Extract.

**Visual register inconsistencies** (from observation):
1. Whitepapers index uses image-led cards. Archive listing likely doesn't. Different visual hierarchy for similar primitives.
2. Slide viewer has its own chrome; doesn't share the site header. Intentional for fullscreen but the transition between "in the publication" and "in a presentation" is abrupt.

**Authoring / editor workflow gaps**:
1. `/blog/drafts/` exists but design isn't documented. What does it look like? Card grid? List? Workflow status indicators?
2. `/blog/private/[token]/[slug]` exists but the token UX (how the operator generates and shares the token) isn't surfaced in the audit. Worth documenting as part of the auth-boundary map.

---

## 7 · Implications for the design system definition

Given this audit, the design system needs to provide:

1. **A page-layout dictionary covering 20 distinct page types** (not 8). New entries: fiction, presentations, tutorials, research notes, tag taxonomy, archive, drafts, private-share, logout.

2. **A component dictionary of ~33 primitives** (existing 25 + 8 newly-extractable cross-surface patterns).

3. **A content-type rendering contract** — each of 8 content collections has a rendering shape the design system must name (frontmatter → display contract).

4. **A cross-surface binding shape** — counterpoint binding, companion binding, series parts binding. These are content-relationship primitives that drive UI primitives.

5. **An auth-state design vocabulary** — DraftBanner is one piece; logout layout, token-share affordance, "you-are-in-an-unpublished-context" cue across the editor surfaces is broader.

6. **A consolidation plan** — Callout duplicate, extracted primitives for inline patterns, footer/chrome consistency between parent domain and blog.

**Methodology amendment for blueprint-redesign**: Stage 1's current artifacts (persona research, funnel research, evidence catalog, current-state diagnose) do not include surface inventory, component inventory, content-type taxonomy, or auth boundary map. The agent has no anchor for "what does this design system need to cover" → fills the void with template defaults → produces a partial system that misses entire content types and surfaces (as happened in every prior session of this initiative).

Closes with required Stage 1 artifacts:
- `research/surface-audit.md` (this file's shape, generalized) — every route + purpose + auth state
- `research/component-audit.md` — every UI primitive in use + category + composition rules
- `research/content-type-taxonomy.md` — every content collection + frontmatter + rendering contract
- `research/auth-boundary-map.md` — public / token-gated / authenticated surfaces + the design treatment for each tier

Stage 2 design-system definition becomes a deterministic application to a fully-named set of surfaces + content types + components, not a derivation from principles alone. Candidate Gap 13 for the redesign's gap inventory.

---

## 8 · Next steps

This audit is the Stage 1 work that should have happened first. With it in hand, the Stage 2 design-system definition can be:

1. **Tokens** — color, typography, spacing, layout grid (derived from accepted prescription decisions + audit observations)
2. **Layout dictionary** — 20 named page templates mapped to the inventoried routes
3. **Component dictionary** — 33 primitives (25 existing + 8 newly-extracted) with composition rules
4. **Content-type rendering contracts** — 8 contracts, one per collection
5. **Auth-state design vocabulary** — DraftBanner + auth-page layouts + token-share affordances

Then Stage 3 implementation rebuilds the prototype surfaces consuming the design system, replacing the current handcoded baselines + Stitch-archive surfaces with production-quality finished surfaces that exercise the system across all content types.
