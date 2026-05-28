---
stage: 3
variant: greenfield
input: blueprint/02-design-principles.md
blocked_on: D1 (thesis pick), D2 (editorial sentence), D7 (v2 name)
---

# Stage 3 — Prototype Plan (v2)

Per methodology, Stage 3 is where the design principles get tested by being built. The portal shell + Pages Function + Cloudflare deploy are already scaffolded in this directory (inherited from the template, used through the brownfield pass and the variant correction). What changes for v2 is the **page set, the strategy panels, and the manifest** — the shell itself is variant-agnostic per `template/portal/CONVENTIONS.md`.

This document is the plan; the build is incremental and depends on which decisions land first.

## What's already built (carries forward unchanged)

- **Portal shell** — `index.html` (auto-renders cards from manifest), `shared.css` (tokens + components), `proto-nav.js` (footer nav + drawers + comparison toggle + flow mode), `proto-annotate.js` (opt-in annotations), `chat-widget.js` (FAB + OpenRouter-backed assistant)
- **Pages Function** — `functions/api/chat.js` (chat backend; corpus = blueprint docs)
- **Capture tooling** — `scripts/capture-current-state.mjs`, `scripts/capture-competitive.mjs` (Playwright)
- **Deploy plumbing** — `wrangler.toml`, `scripts/prep-deploy.sh`, `_headers`, `_redirects`
- **Docs viewer** — `docs/index.html` (markdown viewer for `_docs/`)
- **Conventions** — `CONVENTIONS.md` (portal page-writing contract, template-canonical)

None of these need rebuilding. The brownfield work surfaced no issues with the shell.

## v2 page set (depends on D1)

The eight Stage-2 surfaces. Each is a portal page (`pages/<id>.html` + `_meta/<id>.json`); each carries a strategy panel explaining the v1→v2 decision. Stub _meta files land in this commit so the portal index renders cards; HTML pages ship as D1+D2+D7 land.

| Page id | Surface | Build order | Blocked on |
|---|---|---|---|
| `home` | v2 home — work-first discovery | 1 | D1, D2, D7 |
| `post-detail` | Single post read | 2 | D5 (voice delta) |
| `whitepaper-detail` | Long-form with progressive disclosure | 3 | None (carries v1 reading shape + Rule 5) |
| `series-detail` | Threaded read | 4 | None (v1 pattern is gold-standard) |
| `counterpoint-detail` | Stress-test surface | 5 | D8 (reader-facing label) |
| `library` | Archive + topical | 6 | D1 (Thesis A keeps tags primary; Thesis B subordinates) |
| `about-colophon` | Author + publication concept | 7 | D2, D7 |
| `subscribe-follow` | RSS + LinkedIn link, no email | 8 | None — preserves v1 posture |

**Build sequencing rule**: pages 3, 4 (whitepaper, series) can ship first because they're least decision-blocked. Building them first surfaces brand register questions earlier than the home page would — i.e., what does typography, header structure, footer signature look like before the name + thesis is locked. That's intentional discovery, not procrastination.

## Strategy panel contract (per page)

Each `_meta/<id>.json` carries:

- `decision` — the single v1→v2 design call this page makes (one sentence)
- `why` — which Stage 1/2 finding it implements (cited by ID — e.g., F5, Rule 4, persona priority)
- `inheritsFromV1` — what carries over from v1 unchanged (vs `INHERITED-V1` flagged per Rule 1)
- `breaksFromV1` — what's new vs v1 (with v1 baseline cite for comparison)
- `decisionDependencies` — which D-decisions this page is blocked on (so reviewers can see what's TBD)
- `currentState` — link to the v1 surface this page replaces (live URL + path in `astro-build/src/pages/`)

This contract is a superset of `template/portal/_meta/example.json` (which carried `decision/why/shipped/gap/question`). The v2 superset adds explicit inheritance/break framing because re-conception specifically needs to track v1-ghost-design (per Rule 1).

## Sample build: `home` (proposed shape, depends on D1)

The home page is the highest-leverage surface and the most decision-blocked. Sketched here so the build can start the moment D1+D2+D7 land.

### [Thesis A — positioning realignment]

```
┌─────────────────────────────────────────────────────────┐
│ <v2-name>                          [About] [Library] [⌕]│  ← 3-item primary nav per Rule 4
├─────────────────────────────────────────────────────────┤
│ <one-sentence editorial concept from D2>                │  ← Rule 3: work-first context
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Featured: latest substantive piece]                   │  ← One thing per surface (Rule 4)
│  Title, 1-line excerpt, read-time, format-badge         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Recent (5 items, mixed format with badges)             │  ← Subordinate to featured
│  • Post · Aug 12 — Title                                │
│  • Whitepaper · Aug 5 — Title                           │
│  • Counterpoint · Jul 28 — Title                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ by Nino Chavez · architect-who-directs-agents · RSS     │  ← Author identity 2nd, brand 3rd
└─────────────────────────────────────────────────────────┘
```

### [Thesis B — different publication]

```
┌─────────────────────────────────────────────────────────┐
│ <v2-name>                       [Archive] [About] [⌕]   │
├─────────────────────────────────────────────────────────┤
│ <one-sentence editorial concept from D2>                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Dispatch #N — Title                                    │  ← The current Dispatch is THE page
│  Date · format-badge · read-time                        │
│                                                         │
│  [Full piece below or excerpt + read-link]              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Recent Dispatches                                      │
│  Dispatch #N-1 · Title                                  │
│  Dispatch #N-2 · Title                                  │
│  [→ all Dispatches]                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Library                                                │  ← Whitepapers, series, archive
│  Whitepapers (12) · Series (8) · Archive (276)          │
└─────────────────────────────────────────────────────────┘
```

Both shapes satisfy Rules 3 (work-first) and 4 (one thing per surface). They differ in what "the work" is: in Thesis A, it's the latest substantive piece (similar to v1 but cleaner); in Thesis B, it's *the current Dispatch* (the publication framing).

## Comparison surface (Tier 1 / Pattern B requirement)

Per `portal-and-tier-ladder.md`, Pattern B (audit/redesign comparison) requires every prototype page to show a current-state-vs-proposed toggle. The portal shell's `proto-nav.js` already provides this toggle.

For v2 each page wires:

- `currentState.route` — production URL on `ninochavez.co/blog` for the v1 equivalent
- `currentState.summary` — what v1 does (1-2 sentences)
- `currentState.sourceFiles` — paths in `astro-build/src/pages/` and `astro-build/src/content/`
- `currentState.annotation` — what changes in v2 (1-2 sentences referencing this page's `decision`)

The reader of the prototype gets the v1 surface, the v2 surface, and the rationale connecting them. The strategy panel (right drawer) explains the *why*; the current-state panel (left drawer) shows the *baseline*.

## Browser sensor setup (Stage 0 escalation, deferred per methodology)

Greenfield methodology defers Stage 0 (Application Legibility) to Stage 3 — there's nothing to drive until the prototype shell has surfaces. For v2:

```bash
export PATH="$HOME/Workspace/dev/tools/browse-tool/bin:$PATH"
# per-initiative profile per methodology
browse-start --profile-name signal-dispatch-v2-blueprint
```

The capture scripts in `blueprint/scripts/` already use Playwright (not browse-tool) — they predate the methodology's browse-tool default. Either replatform when capture work resumes for v2 or document the deviation in `prototype/DESIGN.md`.

## What does NOT ship in this Stage 3 commit

- Page HTML for any of the 8 surfaces (blocked on D1+D7 minimum)
- Updated `index.html` portal entry copy (currently brownfield-framed)
- Brand-register visual tokens (D7 + brand criteria pass)
- Updated `chat-widget.js` corpus (right now it answers from the brownfield docs; v2 needs `_docs/` repopulated via `prep-deploy.sh` after Stage 2 docs are stable)

What DOES ship:

- This plan
- `prototype/DESIGN.md` (engineering rules)
- `_meta/index.json` updated to greenfield framing
- 8 `_meta/<page>.json` stubs so the portal index renders v2's intended shape
- Open decisions surfaced in [[DECISIONS-NEEDED.md]]

---

## JTBD coverage matrix (added 2026-05-25, wave-7 methodology amendment)

> Per the meta-agent's JTBD-discontinuity diagnosis: every surface must serve ≥1 measurable JTBD. Surfaces with no JTBD = out of scope. JTBDs with no surface = gap. JTBD IDs reference `blueprint/prescription.yml § jtbds`.

### Surface → JTBDs served

| v2 Surface | JTBDs served | Status |
|---|---|---|
| `home` | P1-disc-search (entry), P2-disc-linkedin (entry — landing), P3-disc-search (entry) | COVERED — primary entry surface for all three personas |
| `post-detail` | P1-firstread-postdetail, P2-disc-linkedin, P2-firstread-postdetail, P3-disc-search, P3-firstread-mobile, P3-end-of-post-RSS, P3-no-second-look | COVERED — the most-load-bearing surface; serves 7 JTBDs |
| `whitepaper-detail` | P1-firstread-whitepaper | COVERED — single high-value JTBD (P1 only) |
| `series-detail` | P1-secondlook-series | COVERED — single high-value JTBD (P1 only); F7-positive |
| `counterpoint-detail` | P2-secondlook-counterpoint | COVERED — single high-value JTBD (P2 only); intellectual-honesty signal |
| `library` | P1-secondlook-library, P2-secondlook-sampling | COVERED — both P1 and P2 secondary-discovery needs |
| `about-colophon` | P2-secondlook-about | COVERED — single P2 JTBD; positioning-proof surface |
| `subscribe-follow` | P3-end-of-post-RSS, P2-return | COVERED — preserves the no-marketing-tells posture |

### Build sequencing — re-derived from JTBD load

Original sequencing in `03-prototype-plan.md` was "whitepaper + series first because least decision-blocked." Re-derive from JTBD load (how many JTBDs the surface serves, weighted by persona priority):

| Surface | JTBD load | Persona priority weight | Effective load | New build order |
|---|---|---|---|---|
| `post-detail` | 7 | P1+P2+P3 = highest | 21 | 1st |
| `library` | 2 | P1+P2 = high | 6 | 2nd |
| `home` | 3 | P1+P2+P3 = highest | 9 | 3rd (but blocked on D1+D2+D7) |
| `whitepaper-detail` | 1 | P1 only | 3 | 4th |
| `series-detail` | 1 | P1 only | 3 | 5th |
| `about-colophon` | 1 | P2 only | 2 | 6th (but blocked on D2+D7) |
| `counterpoint-detail` | 1 | P2 only | 2 | 7th (blocked on D8) |
| `subscribe-follow` | 2 | P2+P3 minor | 2 | 8th |

**Build-order rule revised**: build by JTBD load (highest first), break ties by least-decision-blocked. The original ordering accidentally optimized for decision-availability instead of value-delivery.

### JTBDs with no surface (gaps)

None. All 17 JTBDs in `prescription.yml` have at least one surface covering them.

### Surfaces with no JTBD (out of scope candidates)

The two Stitch-added surfaces from the previous (now-archived) prototype run:

| Surface | JTBDs served | Disposition |
|---|---|---|
| `dispatch-current` (Stitch) | None — only valid if D1 = Thesis B; under Thesis A default, this surface has no JTBD | ARCHIVED in `stitch-reference-archive/`. Re-evaluate if D1 flips. |
| `speaking` (Stitch) | None — not a publication surface; belongs on identity site, not publication subdomain | ARCHIVED in `stitch-reference-archive/`. Out of scope. |

### Strategy panel contract → JTBD trace

Per the original `03-prototype-plan.md`, each `_meta/<id>.json` carries `decision / why / inheritsFromV1 / breaksFromV1 / decisionDependencies / currentState`. The wave-7 amendment adds a required field: `serves_jtbds`. Every `_meta/<id>.json` MUST list the JTBD IDs the surface serves. Surfaces with no `serves_jtbds` are out of scope by definition.

---

## Methodology note

This JTBD-coverage section + the build-order revision are the consumer-side fix for the wave-7 methodology gap surfaced 2026-05-25. The canonical fix is `prototype-forge-provenance-reviewer` that runs as Stage 3 completion gate and checks both forge-pipeline evidence AND JTBD-coverage per surface. Until that reviewer lands, the coverage is maintained by hand here.
