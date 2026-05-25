---
stage: 3
variant: brownfield
authored_on: 2026-05-25
inputs:
  - blueprint/02-prescription.yml
  - blueprint/01-diagnose.md
  - blueprint/research/
  - DESIGN.md   # brand kit, brand-forge schema v1.0.0
  - astro-build/src/content/ (collection structure for IA decisions)
applies_to: live blog at astro-build/   # NOT the blueprint portal shell
---

# 03 — Design Brief

Visual + IA direction for the four prescription items that need design (P3, P4, P5, P6). Stage 4 prototype (optional per brownfield variant) or direct Astro implementation reads this brief.

## Scope

**This brief covers four prescription items:**

| Item | What needs design |
|---|---|
| P3 | Tag-detail pagination chrome + related-tags sidebar + (optional) per-tag intro slot |
| P4 | Primary nav restructure + author anchor on home above the fold |
| P5 | Whitepaper TOC sidebar + scroll-progress affordance |
| P6 | `RelationshipCard` component + home-page right-rail rework using it |

**This brief does NOT cover** (per `02-prescription.yml`):

- P1 (sitemap + `/llms.txt`) — build-time / routing only
- P2 (taxonomy resolution) — config + frontmatter only
- P7 (counterpoint format) — doc + build check only
- P8 (SEO/AEO doc rewrite) — doc only
- P9 (Dispatch numbering) — pilot, single label, no design work

## What we inherit (no redesign)

| Asset | Source | Why preserved |
|---|---|---|
| Color tokens | `DESIGN.md` brand-forge export — Signal Coral `{colors.primary}` `#e86c5d`, Signal Cyan `{colors.secondary}` `#00ced1`, dark surfaces `{colors.surfaces.background}` `#0a0a0b` / `card` `#1a1a1d` | F8 captures confirm reading surface works. No brand drift signal. |
| Typography stack | Rival Sans (display) / Inter (body) / JetBrains Mono | Same — `post-detail--{1440,375}.png` shows the type system serves the voice well |
| Spacing scale | `{spacing.*}` token ramp from brand kit | Component-level spacing in this brief references these tokens, not raw rem |
| Hero / post-detail layout | `post-detail--1440.png` rendering | F8-positive in diagnose; no change |
| Counterpoints index card layout | `counterpoints-index--1440.png` rendering | F6-positive; P6 extracts the pattern, doesn't redesign it |
| Series detail numbered-card layout | `series-detail--1440.png` rendering | F7-positive; reused as a pattern in P3 |

The brief introduces **no new color, no new font, no new spacing primitives.** Every design decision below resolves to existing tokens.

---

## P3 — Tag-detail page (pagination + related-tags sidebar + optional intro)

### IA decisions

1. **Page size**: 30 posts per page. Matches Simon Willison's proven pattern at 40× scale (`competitive/simonwillison.md`). Smaller (10/page) inflates pagination chrome; larger (50/page) defeats the chunking benefit on mobile.
2. **Sort order**: reverse chronological by default. No "sort by popularity" toggle in v1 — the data to support "popular" is in funnel/gaps.md G3 (engagement depth) and doesn't exist yet.
3. **Related-tags sidebar source**: top 6-8 tags by co-occurrence count across posts tagged T. Computed at build time from `astro-build/src/content/` frontmatter. Cap at 8 to prevent the sidebar from becoming its own scroll problem.
4. **Per-tag intro essay slot**: optional `astro-build/src/content/tag-intros/<tag>.mdx`. If present, renders above the post list. If absent, the page opens directly into the post list. Pilot on 5 highest-traffic tags first (`ai-development`, `architecture`, `reflection`, `leadership`, `consulting`).

### Layout — desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Header (nav)                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────┐  ┌────────────────────────┐    │
│  │  ← Back to Topics                       │  │  Related Topics         │    │
│  │                                         │  │                         │    │
│  │  # Architecture                         │  │  • agentic-systems (24) │    │
│  │  44 posts · Page 1 of 2                 │  │  • engineering (22)     │    │
│  │                                         │  │  • ai-governance (8)    │    │
│  │  [Optional intro essay if authored]     │  │  • ai-development (15*) │    │
│  │                                         │  │  • leadership (6*)      │    │
│  │  ─────────────────────────────────────  │  │  • consulting (5*)      │    │
│  │                                         │  │                         │    │
│  │  ▢ Post Title — Excerpt line 1...       │  │  *co-occur in this tag │    │
│  │  date · author · 8 min read             │  └────────────────────────┘    │
│  │                                         │                                │
│  │  ▢ Post Title — Excerpt line 1...       │  ┌────────────────────────┐    │
│  │  date · author · 12 min read            │  │  All Topics →           │    │
│  │                                         │  │  (link to /blog/tags)   │    │
│  │  ... (30 posts)                         │  └────────────────────────┘    │
│  │                                         │                                │
│  │  ─────────────────────────────────────  │                                │
│  │                                         │                                │
│  │       ← Newer    Page 1 of 2    Older → │                                │
│  └─────────────────────────────────────────┘                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Main column**: ~720px max-width, left-aligned, matches existing post-detail column width
- **Sidebar**: 280px fixed, starts at title row, sticky to top minus header offset
- **Gap**: `{spacing.12}` between main and sidebar
- **Container**: `{layout.containerPadding}` on outer

### Layout — tablet (768–1023px)

- Sidebar collapses to a horizontal "Related Topics" chip row above the post list
- Pagination chrome unchanged

### Layout — mobile (<768px)

- Single-column. "Related Topics" renders as a horizontally scrollable chip strip at the bottom of the post list, above pagination
- Pagination chips full-width, `{spacing.4}` tap targets (44px minimum)

### Pagination chrome anatomy

- Prev/Next as text + arrow chips (`← Newer` / `Older →`), each ~120px target
- Centered "Page N of M" label
- No numbered page list (1 / 2 / 3 / …) — Simon Willison's pattern proves it's unnecessary at 60-post-page-sets; reader either reads sequentially or uses related-tags to narrow

### Post-row anatomy (in the list)

```
▢  Feature image thumb 64×64 (rounded {radius.md})
   ────────────────────────────────────────────
   POST TITLE                              ← {typography.h3}, primary text
   Excerpt — single line, truncate at 120 chars
   2026-05-25 · 8 min read · architecture, ai-development
```

Tag chips beneath excerpt use `{colors.muted}` background — distinguishes from primary content tags rendered on post-detail.

### Tokens used

`{colors.primary}` (page title accent), `{colors.muted}` (chip background), `{colors.border}` (separator lines), `{spacing.4/6/8/12}` (rhythm), `{typography.h2/h3/body}`, `{radius.md}`.

### Resolves
- **F1** — 44k-px scroll → 30-post-page + sidebar narrowing
- **F2** — related-tags sidebar requires settled taxonomy (P2 dependency holds)

---

## P4 — Primary nav restructure + author anchor on home

### IA decisions

1. **Nav item set**: 5 items, no dropdown. **Final candidate set**: `Blog · Whitepapers · Counterpoints · Series · About`. Rationale:
   - Promotes Whitepapers and Counterpoints from "More" dropdown to primary (peer-architect persona's highest-rigor content)
   - Demotes Fiction, Presentations, Tutorials, Tags to footer (lower-traffic and/or cross-linked from home right-rail)
   - About is the standing 5th item per [[lethain]] / [[stratechery]] / [[charity-wtf]] convention
2. **Tags placement**: footer + in-post tag chips (F8 already shows this works) + a single `Tags` link in the nav-adjacent secondary strip
3. **Author anchor on home**: small block above the post grid; persona-targeted at [[hiring-evaluator]] who needs to know whose voice this is in 5 seconds
4. **Two-tier nav** (per [[stratechery]] pattern): primary strip = content destinations; secondary strip below or in footer = reach-out (`RSS · llms.txt · Contact · GitHub`). Decision deferred to implementation — primary 5-item is the load-bearing change

### Layout — desktop nav (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Signal Dispatch       Blog  Whitepapers  Counterpoints  Series  About  🔍  │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Wordmark left-aligned, `{typography.display}` 1.25rem
- Nav items right-aligned, `{typography.body}` 0.9375rem, `{spacing.6}` between items
- Search/RSS icon optional 5th slot far right — defer

### Layout — mobile nav (<768px)

- Hamburger toggle (no compromise — 5 items don't fit on iPhone Mini)
- Drawer overlay (full-width, dark `{colors.surfaces.background}` opacity 0.96)
- Same 5 items, stacked, `{spacing.8}` vertical rhythm
- Footer reach-out section visible in drawer too — single place to find RSS / About

### Author anchor anatomy — home page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Header (nav)                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          Signal Dispatch                          ← display │
│              Architecture, commerce, and the signals that matter ← tagline  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  [Photo]   Nino Chavez — Staff Product Architect                   │    │
│  │   80×80    I direct agents that ship director-scope work.          │    │
│  │           Read the long-form whitepapers; skim the counterpoints. │    │
│  │           → About                                                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  FEATURED                                  CURRENTLY SURFACING               │
│  [Existing hero card + secondary]          [Existing right-rail]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Anchor block: `{colors.surfaces.card}` background, `{spacing.6}` padding, `{spacing.10}` margin-bottom
- Photo: 80×80, circular `{radius.full}`, `{colors.border}` 2px ring
- Name + role: `{typography.h3}`, body weight 700
- Two short sentences max — body weight 400, `{colors.foreground}`
- "→ About" link: `{colors.primary}` (Signal Coral), inline with the sentences
- **Position**: between site tagline and the Featured/Currently Surfacing grid
- **Mobile**: photo collapses to 60×60, text below not beside

### Position cited
- `project_positioning_reframe.md` provides the "architect-who-directs-agents" framing. The exact sentence used in the anchor block is a Stage 4 voice-check decision per [[review-voice]] skill, not predetermined here.
- Per `feedback_all_content_is_agent_generated`: the anchor block content is itself agent-generated and Nino-approved; the brief just specifies the shape (block placement, dimensions, content slots), not the prose.

### Tokens used

`{colors.primary}` (link accent), `{colors.surfaces.card}` (anchor bg), `{colors.foreground}` / `{mutedForeground}` (text), `{colors.border}` (photo ring), `{spacing.6/8/10}`, `{typography.display/h3/body}`, `{radius.full/lg}`.

### Resolves
- **F5** — 5-of-7 content types hidden behind "More" → 5 surfaced, 4 demoted
- New affordance — author anchor serves [[hiring-evaluator]] persona's 5-second "whose voice" question

---

## P5 — Whitepaper TOC sidebar + scroll-progress affordance

### IA decisions

1. **TOC source**: auto-generated from `h2` and `h3` headings in the whitepaper MDX body. No manual TOC authoring — drift risk too high
2. **TOC nesting**: 2 levels max (`h2` items, `h3` indented). `h4+` ignored in TOC, kept in body
3. **Smooth-scroll on click**: yes. Update URL hash on click + on scroll-stop (so direct-link sharing of a section works)
4. **Active section highlight**: IntersectionObserver-based; the heading closest to the top of the viewport is the active item
5. **Progress bar**: thin horizontal strip at the top of the viewport (under the header), reflects scroll position through the article body (not full page)

### Layout — desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Header (nav)                                                                │
│  ▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱  ← progress │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐    ┌──────────────────────────────────────┐    │
│  │  CONTENTS              │    │   [Hero image]                        │    │
│  │                        │    │                                       │    │
│  │  → Executive Summary   │    │   # Big Blueprint: A Production Line │    │
│  │  → Part 1: The High Bar│    │     for Agent-Assisted Product Work  │    │
│  │     · 1.1 Definition   │    │                                       │    │
│  │     · 1.2 Test         │    │   [author byline + meta]              │    │
│  │  → Part 2: Outcomes    │    │                                       │    │
│  │     · 2.1 The lift     │    │   Executive Summary                   │    │
│  │     · 2.2 The risk     │    │   [body paragraphs ...]               │    │
│  │  → Part 3: Method      │    │                                       │    │
│  │     · 3.1 Pipeline     │    │   Part 1: The High Bar                │    │
│  │  → Part 4: Failures    │    │   [body paragraphs ...]               │    │
│  │                        │    │                                       │    │
│  │  [sticky to top]       │    │                                       │    │
│  └────────────────────────┘    └──────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **TOC sidebar**: 240px fixed, left of body, sticky from the top with offset for header + progress bar
- **Body column**: ~720px max-width (matches post-detail)
- **Progress bar**: 3px height, `{colors.primary}` fill on `{colors.border}` track, position `fixed; top: <header-height>px;`
- **Active TOC item**: `{colors.primary}` text + 2px left-border in `{colors.primary}`; inactive items `{colors.mutedForeground}`

### Layout — tablet (768–1023px)

- TOC collapses to a collapsible top-of-body block ("Contents" header + expand/collapse chevron)
- Progress bar unchanged

### Layout — mobile (<768px)

- TOC collapsed by default. Opening it reveals the full nested list as a drawer from the top
- Progress bar unchanged — narrower viewport makes it more useful, not less

### Apply to counterpoint detail too?

Per P5 open question — yes. Same TOC component, same progress bar. Counterpoints are 5-10k px (shorter than whitepapers but still long enough to benefit). The numbered-section convention codified in P7 maps cleanly to the TOC's `h2`-driven structure (`1. ...`, `2. ...` etc. are h2 in the body).

### Tokens used

`{colors.primary}` (active state + progress fill), `{colors.border}` (progress track), `{colors.mutedForeground}` (inactive TOC items), `{spacing.4/6}`, `{typography.body}` (TOC items at 0.8125rem).

### Resolves
- **F4** — 20k-px whitepapers with no within-page navigation → TOC + progress + per-section anchors
- Subordinate fix — counterpoint detail gets same affordance for free

---

## P6 — `RelationshipCard` component + home right-rail rework

### Component anatomy

```
┌──────────────────────────────────────────────────────────┐
│  [thumb 80×80]   COUNTERPOINT   NEW            ← chip row│
│                  ────────────────────────────             │
│                  Challenges: parent-post-title ← link    │
│                  Title of This Post                       │
│                  Author · 2026-05-25 · 8 min read         │
│                  Excerpt — one or two lines max.          │
│                  Read counterpoint →                      │
└──────────────────────────────────────────────────────────┘
```

### Slot system

```ts
type RelationshipCardProps = {
  thumb?: string;            // optional feature image (80×80 desktop, 64×64 mobile)
  relationType: string;      // "COUNTERPOINT" | "SERIES" | "COMPANION" | "RELATED"
  relationModifier?: string; // "NEW" | "LATEST" | "PART 3 OF 7" | undefined
  parentLink?: { label: string; href: string };  // "Challenges: ..." or "Part of: ..."
  title: string;
  href: string;
  author?: string;
  publishedAt: string;
  readTime?: string;
  excerpt?: string;
  cta: string;               // "Read counterpoint →" / "Read part 3 →" etc.
};
```

### Where it's used

| Surface | Relation type | Notes |
|---|---|---|
| Counterpoints index (`/blog/counterpoints`) | `COUNTERPOINT` | Already F6-positive; refactor to component, don't redesign |
| Series detail "Reading Order" cards | `SERIES` with `PART N OF M` modifier | Refactor F7-positive to component |
| Home page right-rail "Currently Surfacing" | depends on featured item (whitepaper / counterpoint / series) | Replaces current "Currently Surfacing" / "Recent Series" / "Also Here" mixed list |
| Post-detail "More in [Tag]" related-posts footer | `RELATED` with no modifier | Subtle visual treatment — smaller thumb, no excerpt |

### Home right-rail rework

Current right-rail (per `home--1440.png`): three discrete blocks ("Currently Surfacing", "Recent Series", "Also Here") with mixed visual treatments. Rework as a single vertical stream of 4-6 `RelationshipCard`s.

Card mix on home right-rail:
- 1× latest counterpoint (relationType: COUNTERPOINT)
- 1× latest whitepaper (relationType: COMPANION if it has a parent post, otherwise RELATED)
- 1× active series (relationType: SERIES, modifier "PART 1 OF N")
- 1-2× recent posts not yet covered above (relationType: RELATED)
- 1× fiction or presentation deep-link (relationType: RELATED) — preserves the "Also Here" cross-content-type discovery from the original right-rail

### Tokens used

Inherits all from existing counterpoints-index card pattern:
`{colors.surfaces.card}` (bg), `{colors.border}` (separator), `{colors.primary}` (CTA link + chips), `{colors.mutedForeground}` (meta), `{spacing.4/6}` (interior rhythm), `{radius.lg}` (card outer).

### Resolves
- **F6 + F7** — codifies the two strongest IA patterns on the site into a reusable component
- **F5** sub-input — home right-rail becomes a single-pattern surface, reducing visual noise so the (P4) nav demotion of Fiction/Presentations doesn't lose discovery for those content types

---

## Cross-cutting

### Accessibility floor

- All interactive elements: 44×44 minimum tap target on mobile
- TOC active-state: in addition to color, change weight (700 active vs 400 inactive) so colorblind readers can distinguish
- Pagination prev/next chips: include `rel="prev"` / `rel="next"` on anchors for screen reader + search-engine semantics
- Author-anchor photo `alt` text: required (auto-generated descriptor: "Nino Chavez, Staff Product Architect")
- Progress bar: `role="progressbar"` with `aria-valuenow` updated on scroll-stop

### Responsive breakpoint table

| Breakpoint | Tag detail | Nav | Whitepaper | Right-rail |
|---|---|---|---|---|
| <768 | single col, related-tags chip strip bottom | hamburger drawer | collapsible TOC, body-first | stacks below main content |
| 768–1023 | sidebar collapses to horizontal chip row | full nav (may need 4-item compromise) | collapsible TOC block above body | right-rail keeps but narrower |
| ≥1024 | two-col, sticky sidebar 280px | full 5-item nav | left TOC 240px sticky + body 720px | right-rail 320px sticky |
| ≥1440 | unchanged from 1024 | unchanged | unchanged | unchanged |

### Components introduced

| New component | Used in | LOC estimate |
|---|---|---|
| `PaginationChips.astro` | P3 tag detail | ~50 |
| `RelatedTagsSidebar.astro` | P3 tag detail | ~80 (incl. co-occurrence build helper) |
| `AuthorAnchor.astro` | P4 home | ~40 |
| `ArticleTOC.astro` (with `useActiveSection.client.ts`) | P5 whitepaper + counterpoint | ~120 |
| `ScrollProgress.astro` | P5 whitepaper + counterpoint | ~30 |
| `RelationshipCard.astro` | P6 (4 surfaces) | ~90 |

Total ~410 LOC + tests. All consume existing tokens; no new design primitives.

### Components retired or refactored

- Existing counterpoints-index card markup → migrate to `RelationshipCard`
- Existing series-detail "Reading Order" card markup → migrate to `RelationshipCard`
- Existing home right-rail "Currently Surfacing" / "Recent Series" / "Also Here" blocks → consolidate to a single `RelationshipCard` vertical stream
- Existing nav "More" dropdown → delete; promoted items go inline, demoted items go to footer

---

## Open design decisions (handoff to Stage 4)

1. **Per-tag intro essay pilot scope** — start with the 5 highest-traffic tags (`ai-development`, `architecture`, `reflection`, `leadership`, `consulting`), or smaller initial subset? Decide after seeing first authored intro's length and tone.
2. **Author anchor copy** — exact two-sentence framing. Voice-check via [[review-voice]] skill at the moment of implementation. Brief specifies block shape, not prose.
3. **Nav order: Blog · Whitepapers · Counterpoints · Series · About** — is the rigor-first order correct, or should it be cadence-first (Blog · Series · Counterpoints · Whitepapers · About)? Subtle; defer to first-pass implementation feel.
4. **Two-tier vs single-tier nav** — primary 5-item is committed; the secondary reach-out strip (RSS / About / Contact) is currently in footer. If [[hiring-evaluator]] research surfaces "users want a Contact CTA visible in header," promote. Otherwise leave.
5. **Progress bar visibility threshold** — show progress bar only when scroll position is beyond the hero block, or always? Always is simpler; hero-threshold is more polish.
6. **Tag chips on post detail position** — move to left-rail margin per [[charity-wtf]] precedent, or keep inline after author byline? Defer to Stage 4 prototype — A/B both visually, pick on feel.

## What this brief does NOT specify

- Specific font sizes in pixels — all defer to `{typography}` scale in DESIGN.md. Brief uses semantic names (`h2`, `body`).
- Specific spacing values in pixels — same; defers to `{spacing}` ramp.
- Animation curves — out of scope; Stage 4 can introduce per-component micro-interactions if they earn the LOC
- Loading states — no design specified; reuse Astro's default + any existing site loading treatment
- Empty states — no design specified; the populated paths are the load-bearing redesign

## Stage 4 entry conditions (CORRECTED 2026-05-25)

Earlier framing in this section recommended "skip Stage 4 prototype." That was wrong — it conflated skipping with deferring, and it dropped the project below the brownfield Tier 1 default tier where the Pattern B portal exists.

**Right framing**: Stage 4 portal lands in **parallel** with Stage 7 implementation. The branch-deploy carries the proposed state, but it doesn't keep the current-state side-by-side, doesn't carry the per-page strategy panel, and doesn't survive as the audit's review artifact after merge. The Pattern B portal does all three. Skipping it discards the contract the brownfield variant ships by default.

**Sequencing**:

1. PR 1 (P1 infrastructure) — no portal page needed; infrastructure has no visible surface
2. **In parallel** with PRs 2+ — populate the Pattern B portal at `blueprint/`:
   - `_meta/p3-tag-detail.json` + `pages/p3-tag-detail.html` — current-state drawer cites `research/current-state/tag-detail--375.png` + strategy drawer cites `02-prescription.yml` P3
   - `_meta/p4-home.json` + `pages/p4-home.html` — current-state vs proposed nav + author anchor
   - `_meta/p5-whitepaper.json` + `pages/p5-whitepaper.html` — current-state without TOC vs proposed-state with TOC
   - `_meta/p6-relationship-card.json` + `pages/p6-relationship-card.html` — RelationshipCard pattern with the four use cases
3. As each PR merges, flip the corresponding portal page's `data-view` to include `SHIPPED` so the COMPARE toggle works across all three states

The portal scaffold from commit 818e122 already has all the Pattern B primitives wired (`_portal-shell.js`, `shared.css`, chat widget, drawers). The remaining work is per-page content + manifest entries.
