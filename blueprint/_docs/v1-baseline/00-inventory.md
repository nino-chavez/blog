# 00 — Existing Artifact Inventory

> Pre-Stage-1 survey. Maps artifacts that already exist in this repo to the Blueprint
> brownfield pipeline (per `docs/variant-selection.md`) so Stage 1 (Diagnose) references
> them instead of recreating. Numbered to fit the brownfield `01-` / `02-` / `03-`
> convention (variant-selection.md line 95).

## Pipeline reminder (brownfield)

```
Stage 0 (Application Legibility) → Stage 1 (Diagnose) → Stage 2 (Prescription) →
Stage 3 (Design Brief) → Stage 4 Prototype (optional) → Stage 5 Fact-Check →
Stage 6 Documents → Stage 7 Deploy + Iterate
```

## 2026-05-25 cleanup

72 untracked screenshot PNGs at the repo root (from prior unrelated audit / iteration
sessions: `audit-*`, `header-*`, `home-v2/v3*`, `nav-v3/v4*`, `post-*`, `revised-*`,
`fiction-*`, `tutorial-*`, `chapter4-the-cup`, `mobile-chips-*`, `archive-page`) were
deleted. None were committed; they were working-directory clutter, not evidence. Stage 1
captures a fresh current-state baseline directly into `blueprint/research/current-state/`
with proper naming.

## Inventory by stage

### Stage 0 — Application Legibility (sensor wiring)

| Artifact | Path | Reuse |
|---|---|---|
| Browser-MCP setup notes | `docs/MCP_CHROME_DEVTOOLS_SETUP.md` | Cross-reference when wiring `browse-tool` per `~/Workspace/dev/wip/blueprint/docs/browser-legibility.md`. The default sensor is `browse-tool`, not Chrome DevTools MCP — but the chrome-setup notes may carry profile/auth tips worth porting. |

### Stage 1 — Diagnose (current-state evidence)

No pre-captured screenshots survive — Stage 1 captures fresh baselines into
`blueprint/research/current-state/`. Naming convention: `<surface>--<breakpoint>.png`
(e.g., `home--1440.png`, `post-detail--375.png`, `archive--1024.png`).

Capture against the canonical production URL: **`https://ninochavez.co/blog`** (Cloudflare
worker routes the path to the blog project; `blog.ninochavez.co` legacy subdomain redirects
in). See `docs/SEO-AEO-STRATEGY.md` status banner — the prior subdomain-canonical claim is
inverted in production.

| Doc | Path | Reuse |
|---|---|---|
| Tag taxonomy as it exists today | `docs/TAG_IMPLEMENTATION_REPORT.md` (Oct 2025) | Pre-existing report on the 7 canonical tag categories across 120 posts. Direct current-state input. |
| SEO/AEO posture + Cloudflare routing | `docs/SEO-AEO-STRATEGY.md` | Read with the status banner — canonical URL has flipped since the doc was written. Robots.txt and AI-crawler policy mechanics still apply. |

### Stage 2 — Prescription

No surviving artifacts (prior iteration screenshots deleted; they were exploration
debris, not committed prescription evidence). Stage 2 starts clean from Stage-1 findings.

### Stage 3 — Design Brief (visual + IA direction)

| Artifact | Path | Reuse |
|---|---|---|
| Brand kit (canonical tokens) | `DESIGN.md` (brand-forge schema v1.0.0 export) | Authoritative source for colors, typography, voice tagline. The Pattern B `shared.css` token block at the top of `blueprint/shared.css` should reconcile with this. Brand-forge marks the file `DO NOT EDIT`; the design brief layers on top, doesn't replace. |
| Visual direction (existing roadmap) | `docs/VISUAL_ENHANCEMENT_ROADMAP.md` | Pre-existing "elevate to visually distinctive publication" doc with animation/icon/motion inventory. Useful Stage-3 input; verify currency against the live blog before citing. |

### Cross-cutting canonical references (load on demand, don't recopy)

| Reference | Path | When to load |
|---|---|---|
| Voice guide (prose) | `docs/signal-dispatch-voice-guide.md` | Any Stage-3 design-brief copy or Stage-6 document drafting. |
| Project CLAUDE.md (split: content authoring vs blueprint) | `.claude/CLAUDE.md` | Already restructured to map between blog content authoring and Blueprint scopes. |

### Out of Blueprint scope (operations / distribution, not redesign material)

Reference only if a Stage-1 finding ties back to one of them.

- `docs/ASTRO_MIGRATION_PLAN.md` (completed migration)
- `docs/BLOG_AUTOMATION_STRATEGY.md`, `docs/BLOG_AUTOMATION_USAGE.md`
- `docs/LINKEDIN_INTEGRATION_STRATEGY.md`, `docs/LINKEDIN_INTEGRATION_COMPLETE.md`, `docs/LINKEDIN_ATTRIBUTION.md`
- `docs/DEEP_LINKING_STRATEGY.md`
- `docs/PORTFOLIO-WEBHOOK.md`
- `docs/REACT_ROUTER_IMPLEMENTATION.md`
- `docs/creating-gamma-posts.md`
- `_drafts/*` (in-flight content)

## Next moves for Stage 1

1. Wire `browse-tool` per `~/Workspace/dev/wip/blueprint/docs/browser-legibility.md` with `--profile-name signal-dispatch-blueprint`.
2. Capture fresh current-state baselines against `https://ninochavez.co/blog` into `blueprint/research/current-state/`, by surface and breakpoint (375 / 768 / 1024 / 1440 minimum).
3. Synthesize `blueprint/01-diagnose.md` from the captures + the existing `TAG_IMPLEMENTATION_REPORT.md` + the corrected SEO/routing posture.
4. The `research-completeness-reviewer` gate (per variant-selection.md: brownfield requires 5 legs — `current-state/`, `personas/`, `funnel/`, `competitive/`, plus `01-diagnose.md` synthesis) blocks Stage 2 until all five are populated.
