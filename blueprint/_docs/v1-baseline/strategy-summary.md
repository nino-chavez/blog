---
stage: 6
variant: brownfield
authored_on: 2026-05-25
audience: project owner; future audit readers
companion_to:
  - blueprint/01-diagnose.md
  - blueprint/02-prescription.yml
  - blueprint/03-design-brief.md
---

# Signal Dispatch — Audit Strategy Summary

**Takeaway**: The reading surface works; discovery and infrastructure do not. The redesign is information architecture and AEO plumbing, not visual rebranding. Two infrastructure fixes (broken sitemap, broken /llms.txt) are higher-impact than any visual change and can ship first because they don't depend on design decisions.

## What the audit found

11 findings across the 228-post production site. Distribution:

| Severity | Count | Where they land |
|---|---|---|
| HIGH | 5 | Infrastructure (sitemap, /llms.txt), taxonomy drift, tag-detail at scale, doc inversion |
| MEDIUM | 2 | Whitepaper navigation, primary nav density |
| POSITIVE | 3 | Post detail, series detail, counterpoints index — preserve and extend |
| RESOLVED | 1 | Counterpoint format codification (closed during prescription drafting) |

Full findings live in `01-diagnose.md`.

The three HIGH findings most worth knowing:

1. **Sitemap enumerates 9 URLs and includes zero of the 228 posts.** This is the upstream cause of any "blog content doesn't rank in search" symptom. Pure build-time fix.
2. **`/llms.txt` 404s despite being advertised in three places** (primary nav, posts.json endpoints field, AEO strategy doc). The AEO posture documented in `docs/SEO-AEO-STRATEGY.md` does not actually exist in production.
3. **Tag-detail pages scale catastrophically.** `/blog/tags/architecture` renders as a 44,000-pixel mobile scroll for 44 posts; the `ai-development` tag at 134 posts is roughly 3× worse. Direct fix exists — Simon Willison's pagination + related-tags sidebar pattern proven at 1,764 posts in a single tag.

## What the prescription does

Nine items in `02-prescription.yml`, ordered by impact × evidence × reversibility. The first four carry the bulk of the value:

| # | Move | Resolves | Blast radius |
|---|---|---|---|
| P1 | Sitemap enumeration + /llms.txt route | F10, F11 | Build-time only |
| P2 | Canonical-tag resolution (single source of truth + deprecation table) | F2 | Frontmatter + config |
| P3 | Tag-detail pagination + related-tags sidebar | F1 | One route + new sidebar component |
| P4 | Primary nav restructure + author anchor on home | F5 | Header + home above-fold |

Items P5–P9 cover whitepaper TOC, relationship-card refactor, counterpoint format codification, SEO doc rewrite, and a Dispatch-numbering pilot proposal. All are smaller-blast-radius than P1–P4.

**Dependencies**: P3 waits on P2 (settled taxonomy); P8 waits on P1 (rewrite reflects post-P1 surfaces). Everything else lands in parallel.

## What the design brief specifies

`03-design-brief.md` covers visual + IA direction for the four prescription items that need design (P3, P4, P5, P6). Six new components total (~410 LOC + tests), all consuming existing brand-kit tokens. **No new colors, fonts, or spacing primitives.** The brand kit (`DESIGN.md`) carries forward unchanged — the F8 positive finding confirms the reading surface works and doesn't need redesign.

Brief recommends **skipping Stage 4 prototype** — the redesign is component-level surgery against the existing Astro codebase. Building a parallel portal preview adds work without adding clarity. Cloudflare Pages branch deploys serve the same review function.

## What the audit did NOT recommend

- **Visual rebranding** — brand kit intact, reading experience works (F8)
- **Email subscribe capture** — the [[personas/hiring-evaluator]] constraint ("no marketing tells") + the intentional thin return-path
- **Site-internal search** — not surfaced as a finding; readers arrive via Google or RSS
- **Comment system** — not surfaced; preserve the no-comments posture

## What needs Nino's input before Stage 7

1. **Dispatch-numbering pilot (P9)** — does the `Dispatch #156:` convention feel contrived at weekly cadence? Pilot on new posts only for 4-6 weeks, then decide. No urgency.
2. **Per-tag intro essay scope (P3 sub-decision)** — start with the 5 highest-traffic tags or smaller? Decide after first authored intro lands.
3. **Stage 7 deploy authorization** — implementing the prescription means actual code changes to `astro-build/`. Suggested first PR: P1 (sitemap + /llms.txt) — smallest blast radius, biggest impact, no design dependency. Ask before opening.

## What needs measurement (Stage 7+)

Four analytics gaps documented in `research/funnel/gaps.md`. None block the prescription, but they sharpen Stage 7 iteration:

| Gap | Cheapest path to closure | Sharpens |
|---|---|---|
| G1 — RSS subscriber mix | Cloudflare Pages analytics for /blog/rss.xml requests | Persona priority confidence |
| G2 — Referrer / acquisition channel mix | Cloudflare Web Analytics + Google Search Console | P4 nav rework — confirms or shifts priority |
| G3 — Engagement depth by content type | Scroll-depth events into Cloudflare Analytics Engine | P5 whitepaper TOC — confirms or shifts toward Executive Summary improvement |
| G4 — AI-agent / LLM citation rate | 5-minute manual sampling across ChatGPT / Claude / Perplexity / Google AI | Validates P1 + P8 actually moved the needle |

G4 is the cheapest to close (5 minutes after P1 ships). G1 and G2 require Nino's authenticated access. G3 requires a small one-time implementation.

## How to read the artifact set

| File | Purpose | Audience |
|---|---|---|
| `strategy-summary.md` | This file. 1-page cover. | Anyone — start here |
| `01-diagnose.md` | All 11 findings with evidence cites + ordered prescription seeds | Project owner; reviewer agents |
| `02-prescription.yml` | 9 prescription items with evidence + moves + dependencies | Implementer (the future agent or Nino) |
| `03-design-brief.md` | Visual + IA direction for the 4 design-needing items | Implementer; Stage 4 prototype skipper |
| `research/personas/` | 3 reader archetypes + measurement gaps | Anyone questioning prescription weight |
| `research/funnel/` | Reader-journey stages + public-probe evidence + 4 analytics gaps | SEO/AEO follow-up; Stage 7 iteration |
| `research/competitive/` | 5 peer publications + synthesis of convergent vs divergent patterns | Anyone questioning prescription pattern choice |
| `research/current-state/` | 56 production captures (regeneratable via `scripts/capture-current-state.mjs`) | Visual reference for any finding |
| `scripts/` | `capture-current-state.mjs` + `capture-competitive.mjs` — deterministic re-capture | Re-verification |

Stage 4 (prototype) was deliberately skipped — the redesign is component-level surgery, not new-product scaffolding.

## Next move

Stage 7 (deploy) is the first move that touches the live blog. P1 is the smallest, highest-impact opening commit. Suggested sequence:

1. **PR 1**: P1 (sitemap + /llms.txt) — build-time only, ships fast, fixes the most-impactful finding
2. **PR 2**: P2 (taxonomy resolution) — config + frontmatter; unblocks P3
3. **PR 3**: P7 + P8 (counterpoint format doc + SEO doc rewrite) — doc-only, no risk
4. **PR 4**: P3 + P6 (tag detail + RelationshipCard) — first real visual change, has prerequisites in PR 2
5. **PR 5**: P4 (nav + author anchor) — visible above-fold change; consider funnel G2 evidence before merging
6. **PR 6**: P5 (whitepaper TOC + progress) — independent; ship when ready
7. **PR 7**: P9 (Dispatch-numbering pilot) — new posts only, no retrofit

PRs 1–3 can ship in any order or in parallel. PRs 4–6 have soft dependencies on earlier work. PR 7 is independent of all.

Stop here pending Nino's review of the strategy + authorization to open the first PR.
