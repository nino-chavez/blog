---
stage: 1
variant: brownfield
captured_on: 2026-05-25
production_url: https://ninochavez.co/blog
evidence:
  captures: blueprint/research/current-state/   # 56 PNGs across 14 surfaces × 4 breakpoints
  prior_reports:
    - docs/TAG_IMPLEMENTATION_REPORT.md
    - docs/SEO-AEO-STRATEGY.md
  tag_config: astro-build/src/config/tags.ts
---

# 01 — Diagnose

Brownfield Stage 1 synthesis for Signal Dispatch (`ninochavez.co/blog`, **228 posts** per `/api/posts.json` as of 2026-05-25). Findings ground in `blueprint/research/current-state/` captures and `blueprint/research/funnel/evidence.md` HTTP probes unless cited otherwise.

The five required brownfield research legs are populated:
- `current-state/` — 56 captures (gitignored; regenerated via `blueprint/scripts/capture-current-state.mjs`)
- `personas/` — 3 reader archetypes (`peer-architect`, `hiring-evaluator`, `ai-curious-ic`) + `gaps.md`
- `funnel/` — `stages.md` + `evidence.md` (public HTTP probes) + `gaps.md` (4 analytics gaps)
- `competitive/` — 5 peer publications + `synthesis.md` (cross-pattern reading)
- This file — synthesis of the above

Stage 2 (`02-prescription.yml`) reads the findings + the open questions and orders the prescription.

## Executive summary

The blog's **reading experience** is in good shape — post detail (`post-detail--{1440,375}.png`) reflows cleanly, the narrow column reads well, and the cross-content-type secondary surfaces (counterpoints index, series detail) are the most coherent IA on the site. The redesign work is concentrated in **discovery and wayfinding**: tag-detail pages don't scale past ~20 posts, the canonical-tag system has drifted across three documents that don't agree, and the long-form whitepaper format has no within-page navigation despite running 20k+ pixels tall at desktop.

Nothing in the captures suggests the blog needs visual rebranding. The brand kit (`DESIGN.md`) and the existing post template are doing their job. The redesign target is information architecture, not surface treatment.

## High-severity findings

### F1. Tag-detail pages don't scale (HIGH)

**Evidence**: `current-state/tag-detail--375.png` is **44,171 px tall** for `/blog/tags/architecture` (44 posts). Same surface at 1440 width is comparably tall — the page stacks one card per post with no pagination, no temporal grouping, no anchor jumps, and no visible filter chrome.

**Compounds with**: `archive-tags--1440.png` shows post counts of `ai-development: 134`, `architecture: 44`, `reflection: 40`, `leadership: 40`, `consulting: 32` — at least 5 tag pages are this bad or worse, and the largest is ~3× the captured one.

**Implication for Stage 2**: The largest discovery surface on the site is functionally a 44k-pixel scroll on mobile. Prescription needs to introduce chunking (year? series? "popular vs. recent"?) and a content density floor.

### F2. Tag taxonomy drift across three sources (HIGH)

Three documents claim to be authoritative about the canonical tag set; none of them agree.

| Source | Claimed count | Notable contents |
|---|---|---|
| `docs/TAG_IMPLEMENTATION_REPORT.md` (Oct 2025) | **7** | `ai-workflows`, `leadership`, `commerce-strategy`, `personal-growth`, `systems-thinking`, `consulting-practice`, `craft` |
| `.claude/CLAUDE.md` | **18** | — (count only, no enumeration) |
| `astro-build/src/config/tags.ts` (current code) | **25** | `ai-development` (not `ai-workflows`), `architecture` (not `systems-thinking`), `reflection` (not `personal-growth`), `consulting` (not `consulting-practice`), plus `Operating Systems`, `Gen Z`, `Insights` — non-kebab-case orphans with no `description` |
| Production `archive-tags--1440.png` (live) | **12 popular + 3 growing + N "explore"** | `ai-development`, `architecture`, `reflection`, `leadership`, `consulting`, `agentic-systems`, `engineering`, `career`, `commerce`, `field-notes`, `signal-dispatch`, `ai-governance` |

The rename from the Oct 2025 report's terms to the current `tags.ts` terms (`ai-workflows → ai-development`, `systems-thinking → architecture`, `personal-growth → reflection`, `consulting-practice → consulting`) is a deliberate change but was never documented. `tags.ts` itself contains three orphans (`Operating Systems`, `Gen Z`, `Insights`) that look like incomplete migration leftovers.

**Implication for Stage 2**: The taxonomy is the IA's backbone — drift here propagates into navigation, RSS categories, related-post computation, and tag-page scaling (F1). Before any IA prescription lands, the canonical-tag question needs a single source of truth and a deprecation table.

### F3. SEO/AEO doc inverted vs production (HIGH — already flagged)

`docs/SEO-AEO-STRATEGY.md` opens with a status banner declaring the canonical URL has flipped (`ninochavez.co/blog` is now canonical; `blog.ninochavez.co` redirects in). The body of the doc still reasons from the inverted premise. Stage 1 captures confirm production matches the banner, not the body. A full rewrite is owed.

**Implication for Stage 2**: Not visual redesign; documentation hygiene. But the strategy doc is what stakeholders read to understand AEO posture, so a stale body undermines confidence in the prescription's other claims. Schedule the rewrite into the Stage 2 → Stage 3 transition.

### F10. Sitemap routing leaks blog posts to the wrong path (HIGH — REVISED 2026-05-25)

**Original framing was directionally right but mechanically wrong.** Initial probes against `https://ninochavez.co/sitemap.xml` returned 9 URLs with zero blog posts, which I read as "the sitemap doesn't enumerate posts." Deeper investigation during PR-1 prep revealed a different bug.

**Actual state** (verified 2026-05-25):

| URL | Status | Content |
|---|---|---|
| `ninochavez.co/sitemap.xml` | 200 (1,950 B) | Portfolio project's sitemap — 9 URLs, no blog posts referenced (no `<sitemap>` ref to blog's sitemap either) |
| `ninochavez.co/sitemap-index.xml` | 200 (227 B) | Blog project's sitemap-index — **leaked to root path** instead of `/blog/sitemap-index.xml` |
| `ninochavez.co/sitemap-0.xml` | 200 (55,722 B) | Blog project's sitemap with **228+ post URLs** — exists and works |
| `ninochavez.co/blog/sitemap.xml` | **404** | URL referenced in `robots.txt` — broken |
| `ninochavez.co/blog/sitemap-index.xml` | **404** | Canonical location — broken |
| `ninochavez.co/gallery/sitemap.xml` | **404** | Same bug pattern for photography project |
| `ninochavez.co/robots.txt` | 200 | Points crawlers at the two **broken** URLs above |

The blog has a working sitemap with 228+ entries. Three bugs prevent crawlers from finding it:

1. **Path leak**: the Cloudflare reverse-proxy serves the blog project's static files at the root path (`/sitemap-index.xml`) instead of the `/blog/` prefix (`/blog/sitemap-index.xml`). The blog content is served at `/blog/*` but the project metadata (sitemap, possibly `/llms.txt`) leaks one level up.
2. **robots.txt vs reality**: `robots.txt` directs crawlers at `/blog/sitemap.xml` and `/gallery/sitemap.xml` — both 404. Crawlers that follow robots.txt fail discovery; crawlers that probe root might find the leaked sitemap at `/sitemap-index.xml`, but Google's crawler generally doesn't.
3. **Portfolio sitemap doesn't reference blog**: the portfolio's `sitemap.xml` (the 9-URL one) lists `/blog` as a destination but doesn't reference the blog's sitemap-index. A crawler entering at `ninochavez.co/sitemap.xml` has no machine-readable path to discover the blog's 228 posts.

**Implication for Stage 2**: This is reverse-proxy routing + robots.txt fix, not "build a sitemap." The data exists; the discovery path is broken. P1 prescription moves are revised accordingly.

### F11. `/llms.txt` 404s despite being advertised in 3 places (HIGH — discovered via funnel probes)

**Evidence**: `research/funnel/evidence.md` confirms `https://ninochavez.co/llms.txt` returns HTTP 404 (the SvelteKit 404 shell). The URL is advertised in:
1. Primary nav footer link list (`home--1440.png` capture shows it)
2. `/api/posts.json` response: `meta.endpoints.llmsContext: "/llms.txt"`
3. The AEO/GEO posture in `docs/SEO-AEO-STRATEGY.md`

A reader or AI agent following any of these three paths to find the AI-readable summary surface gets a 404.

**Compounds with F10**: Together, F10 + F11 mean the AEO/GEO infrastructure documented in `SEO-AEO-STRATEGY.md` does not actually exist in production. The doc describes a posture; production serves a 404 for the central artifact of that posture.

**Implication for Stage 2**: Same as F10 — infrastructure fix, build-time. Fix should land before any visual redesign so the prescription's claims about AEO surface area are accurate at the time of stakeholder review.

## Medium-severity findings

### F4. Long-form whitepaper format has no within-page navigation (MEDIUM)

**Evidence**: `whitepaper-detail--1440.png` for `/blog/whitepapers/big-blueprint-methodology` runs ~20k px tall at desktop. Visible section headings (`Part 1: The High Bar`, `Part 2: ...`, `Part 3: ...`, etc.) have no inline anchor links and no progress affordance. Same is true at 768 and 375.

The whitepaper format is positioned as the formal companion to blog posts (per `project_blog_publication_trio_pattern.md` memory) — the kind of thing a peer-architect reader opens in a new tab and references back to. The current rendering treats it the same as a 1.5k-word essay.

**Implication for Stage 2**: TOC, anchor links, or scrollspy progress; consider mirroring the counterpoint detail's numbered-section pattern (F7).

### F5. Primary nav hides 5 of 7 content types behind "More" (MEDIUM)

**Evidence**: `home--1440.png` shows the top nav as `Blog / Series / Fiction / More`. The "More" dropdown contains Whitepapers, Presentations, Tutorials, Counterpoints, and Tags. Three of those five (whitepapers, presentations, counterpoints) are the most rigorous content the blog produces — the ones a peer-architect reader is most likely to want.

The home page partially compensates via the right-rail "Recent Series" and "Also Here" lists, which surface whitepapers + presentations directly. But the right rail collapses below the fold on mobile (`home--375.png`), making the discovery problem worse on the device where it already costs the most to dig.

**Implication for Stage 2**: Either promote whitepapers/presentations/counterpoints to primary nav, or replace the right-rail discovery affordance with something that survives mobile.

## Low-severity / positive findings

### F6. Counterpoints index is the strongest discovery surface (POSITIVE)

`counterpoints-index--1440.png` renders the adversarial-relationship affordance per card: `COUNTERPOINT` chip + relation type (`NEW`, `LATEST`), `Challenges: <parent post>` link, author, date, read-time, title, excerpt, `Read counterpoint →` CTA. The card communicates the relationship between the counterpoint and its parent post at a glance.

Carry this pattern into Stage 2: when the redesign needs to express relationships between posts (companion whitepapers, series order, counterpoints), this is the precedent on the site that already works. Mobile (`counterpoints-index--375.png`) reflows cleanly.

### F7. Series detail page is the second-strongest IA pattern (POSITIVE)

`series-detail--1440.png` (`/blog/series/agentic-workflows-in-practice`) renders an explicit "Reading Order" with numbered cards (1, 2, 3…), each card showing position number, title, excerpt, read-time, and the relationship to siblings.

This is the strongest wayfinding pattern on the site for "what should I read next?" — useful as a candidate template for chunking large tag pages (F1).

### F8. Standard post detail reads well (POSITIVE)

`post-detail--{1440,375}.png` show the reading experience is in good shape: narrow readable column, hero image, author + tag chips, callout components, pull-quote treatment, related-posts footer, clean mobile reflow. Nothing in the captures argues for redesigning the reading surface itself.

## Resolutions from the other research legs

Findings that emerged after the original draft, now folded back in from the populated legs:

- **From `personas/`** — 3 reader archetypes documented (peer-architect, hiring-evaluator, ai-curious-ic). [[peer-architect]] is the priority-1 reader per positioning intent; [[hiring-evaluator]] sets the "no marketing tells" constraint; [[ai-curious-ic]] is the cold-arrival traffic the discovery surfaces (F1, F5) most need to serve. All persona percentages are inference — see `personas/gaps.md`.
- **From `funnel/evidence.md`** — Production has 228 posts (not the ~275 originally estimated from tag math). RSS surface is healthy (228 items in `/blog/rss.xml`). SEO surface is broken (F10, F11). No measured engagement data — see `funnel/gaps.md` for the 4 analytics gaps.
- **From `competitive/synthesis.md`** — Convergent peer pattern: 5-item nav with no dropdowns, author identity above the fold. Divergent pattern: tag-page scaling, where [[simonwillison]]'s pagination + related-tags sidebar is the canonical move for F1. Stratechery's Dispatch-numbering convention is a Stage-2 pilot candidate.

## Resolved during prescription drafting

### F-INVESTIGATE. Counterpoint format formality (RESOLVED)

`counterpoint-detail--1440.png` renders with `Executive Summary` + numbered formal sections, distinct from the standard blog-post template. Original framing of this question — "intentional voice register vs. accidental template inheritance" — assumed an authoring chain that doesn't apply: all Signal Dispatch content is agent-generated. The right framing is: both counterpoint posts converged on the format AND the `challengeSource.type` frontmatter field distinguishes sub-modes (`self-critique` vs. `external-validation`), but the format is **not codified** in any searchable skill, command, voice-guide section, or generation template. The convergence is real but uninsured against the next session's drift.

**Resolution**: P7 in `02-prescription.yml` codifies the de-facto convention to prevent the regression. No rendering change.

## Stage 2 prescription seeds (impact-ordered)

The findings name the targets; the prescription names the moves. Order below reflects impact × evidence strength × reversibility:

1. **Infrastructure fixes (F10 + F11)** — sitemap enumeration + `/llms.txt` route. Highest impact (touches every search / AEO interaction with the blog), lowest blast radius (pure build-time), no IA design dependency. Land before anything else.
2. **Canonical-tag resolution (F2)** — pick a single source of truth from the 3 conflicting documents; deprecation table for the rename. Backbones F1 and the related-posts logic.
3. **Tag-detail chunking (F1)** — adopt [[simonwillison]]'s pagination + related-tags sidebar. Depends on F2 (taxonomy must be settled first).
4. **Nav rework (F5)** — adopt [[lethain]]'s 5-item structure + author anchor from [[pragmaticengineer]] / [[stratechery]]. Depends on G2 funnel evidence ideally, but the convergent peer pattern justifies moving without it.
5. **Whitepaper TOC + progress (F4)** — depends on G3 engagement evidence (if readers bounce at the Executive Summary, prescription shifts).
6. **SEO/AEO doc rewrite (F3)** — pure doc hygiene; sequence last so the rewrite reflects the post-redesign URLs and the (now-fixed) AEO surfaces.

Items 1 and 2 are independent and could land in parallel. Items 3-5 sequence after 1+2 settle.
