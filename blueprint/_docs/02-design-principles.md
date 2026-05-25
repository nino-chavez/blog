---
stage: 2
variant: greenfield
input: blueprint/01-research.md
companion: blueprint/prototype/DESIGN.md  # engineering rules + per-prototype DESIGN.md per methodology
---

# Stage 2 — Design Principles (v2)

Per the canonical Blueprint methodology, Stage 2 codifies the rules **before** any prototype page gets built — so every Stage 3 decision is checkable against an explicit constraint instead of being made ad-hoc page-by-page. This document is the principles layer (editorial, brand, IA). The engineering layer (testing baseline, sensor setup, lint/type gates) lives in [[prototype/DESIGN.md]] per methodology Stage 2's "engineering rules and visual rules are codified together" guidance.

## Stage-gate dependency (read first)

Several principles in this doc are written as **conditional defaults** — they read "if Thesis A, principle X; if Thesis B, principle X′." That's intentional. Stage 1 (`01-research.md`) surfaced the A-vs-B thesis tension as unresolved. **Stage 3 cannot ship until D1 (thesis pick) is made** — every conditional below collapses to a single statement once the thesis lands.

Where a principle is the same under both theses, no conditional. Where the conditional matters, it's marked `[Thesis A]` / `[Thesis B]`.

## The five rules (greenfield methodology), adapted for v2

Methodology's canonical five (from `METHODOLOGY.md` Stage 2) were written for a software product prototype. Adapted for a publication re-conception:

### Rule 1 — Match the (intended) brand register

For a software prototype, this rule says "only use components that exist in the production product." For a publication re-conception, the equivalent: **v2 only uses brand expressions consistent with the v2 brand register codified in this document.** Any visual or editorial element brought over from v1 unchanged must be either (a) explicitly inherited per a decision logged here, or (b) flagged as `INHERITED-V1` in the prototype so reviewers can challenge it.

This rule exists because re-conception is the variant most vulnerable to "v1 ghost-design" — half-conscious carry-overs that drag v2 back toward v1's gravity. v1's brand is loud and consistent; resisting it requires the rule.

### Rule 2 — Use the reader's terminology (not internal)

v1 voice guide already enforces this for prose. v2 extends to surface labels. The reader-facing language for content types, sections, and affordances is what the personas use, not what the CMS or the methodology uses.

Example: the methodology calls it a "counterpoint" (a `challengesPost` binding); the reader-facing surface might call it "the case against this" or "a stress-test of the above." The label is a design decision, not a CMS reality.

**Stage 2 input list**: every persona-readable label needs a v2 pass. Logged in [[DECISIONS-NEEDED.md]] D8 (taxonomy + labeling).

### Rule 3 — Lead with the work (not the author or the brand)

Adapted from "lead with the positive." For a publication:

- A reader arriving cold on any v2 surface should see *content* first. Author identity is second. Brand identity is third.
- Per competitive synthesis: 5/5 peer publications surface author identity above the fold. v1 leads with publication name. The reverse-order rule says **v2 surfaces work first, author second, brand third** — neither v1's "brand-first" nor the peer set's "author-first" defaults.
- The reason: the hiring-evaluator persona is looking for proof the work is real. Author-first reads as personal-brand performance; brand-first reads as publication-as-product. Work-first reads as practice.

### Rule 4 — One thing per surface

v1 home page surfaces 3 right-rail panels ("Currently Surfacing," "Recent Series," "Also Here"), a featured hero, and a post grid. That's at least five competing affordances above the fold. The methodology rule "one action per page" adapts for publications as:

- **Home page**: one primary discovery affordance, secondary affordances below the fold or in a clearly subordinated rail.
- **Post detail**: one primary read, one optional next-step (related, series-continue, or counterpoint), and a *passive* footer (RSS link, byline). No mid-post CTAs.
- **Archive/index surfaces**: one primary axis of organization (chronological, topical, format), one secondary filter — not three competing taxonomies.

### Rule 5 — Progressive disclosure on long-form

Whitepapers and counterpoints in v1 run 20k+ pixels tall with no TOC ([[v1-baseline/01-diagnose.md]] F4). v2 long-form surfaces inherit a **summary-first rule**: every long-form opens with a self-contained Executive Summary that reads as a complete artifact, with the rest as progressive disclosure (TOC + anchor links + section progress).

This rule has direct competitive support — Stratechery's "Article Body" structure under "Daily Update" headers, Pragmatic Engineer's deep-dive TOCs, charity.wtf's section-anchor links all do this. v1's whitepapers don't.

## Voice register (v2 starting point)

Per [[01-research.md]] D5, v2's voice register starts from the v1 voice guide (`docs/signal-dispatch-voice-guide.md`, 961 lines distilled from 156 posts) and documents its delta. Restart-from-scratch is rejected here because (a) the hiring-evaluator persona checks for voice consistency across posts, and (b) the v1 voice has measured market signal — discarding it for a clean slate trades known signal for unknown.

### Inherits from v1 voice guide

- Open with tension (not throat-clearing)
- Show the work (concrete artifacts, specific files, named decisions; never abstract claim without grounding)
- Self-interrogate (questions Nino is actually wrestling with, not rhetorical setups)
- End provisionally (not with conclusion-bow)
- No fabricated interior state (never invent specific people, conversations, internal admissions without grounding evidence)

### Likely v2 deltas (codify in Stage 2 pass after D1)

- **[Thesis A]**: voice carries forward unchanged; v2 register = v1 register. Doc the delta as "no delta" and link to v1 voice guide as authoritative.
- **[Thesis B]**: voice tightens toward the publication-shaped register — slightly more deliberate, less open-diary. Less "today I noticed X"; more "Dispatch #N: the X argument is wrong, here's why." Codify the delta in a new v2 voice supplement that augments (not replaces) the v1 guide.

## Brand register criteria (decision still owned by Nino)

This section gives v2 brand criteria, not the brand answer. The answer is D7 (name) and the downstream visual identity choices.

### Criteria the name + identity have to satisfy

1. **Carries the positioning** — the architect-who-directs-agents frame should be supportable in the name (not necessarily literal, but pointable-to). "Signal Dispatch" was named pre-reframe; it works for the corpus but doesn't carry the positioning.
2. **Survives the hiring-evaluator screen** — no jargon-cluster, no AI-themed cleverness ("Prompted!", "Vibes Engineering Weekly"), no obvious personal-brand framing. Reads as a publication, not as a side-project blog or a newsletter funnel.
3. **Pairs with author identity** — the name should sit comfortably next to "by Nino Chavez" without one swallowing the other.
4. **Has a defensible URL** — short, no creative spellings, available at .com or as path on `ninochavez.co`.
5. **Has a one-sentence "what is this" answer** — if Nino can't finish the sentence "X is a publication about ___" in 12 words or less, the name is doing work the editorial concept should be doing.

### Name candidates (Nino picks; these are scaffolding, not recommendations)

The voice rule against fabricating interior state extends to brand decisions. These are not recommendations — they are option *shapes* to discuss against the criteria above. Nino picks, rejects all, or generates the actual candidates.

| Shape | Example | Carries positioning | Hiring-evaluator screen | Notes |
|---|---|---|---|---|
| Direct-positioning | "Directing Agents," "Architect's Notes," "From the Studio" | Strong | Mid (risk of on-the-nose) | "The Studio" pattern has author-as-house precedent (Maggie Appleton, Robin Sloan) |
| Tier-flag | "Director Mode," "Practitioner Brief," "Field Architect" | Strong | Strong | "Brief" framing carries Stratechery-adjacent gravity |
| Object/space metaphor | "The Workbench," "The Atelier," "The Lathe" | Indirect | Strong | Survives mis-translation; pattern matches with photography-camera frame on `ninochavez.co` |
| Citation framing | "Working Notes," "The Worklog," "Field Notes from..." | Mid | Strong | Reads as practice, signals open work |
| Author-as-house | "Chavez.dispatch," "NC Quarterly," "Workshop NC" | Strong | Risk: personal-brand pattern-match | Hiring-evaluator persona may bounce |

Note: "Atelier" is one of Nino's other in-flight projects (`wip/atelier`) — not an option without naming collision.

**Decision logged as D7. Stage 3 cannot ship a homepage prototype until D7 lands.** Until then, prototype copy uses placeholder `<v2-name>`.

## Information architecture principles

Per Rule 4 (one thing per surface), v2 IA picks one primary discovery axis and subordinates the others.

### v2's primary discovery axis (conditional on D1)

- **[Thesis A — positioning realignment]**: primary axis is the v1 axis (chronological feed with topical secondary nav), refined for tag-detail scaling. Series and counterpoints stay as deep-link destinations, not primary nav.
- **[Thesis B — different publication]**: primary axis is "the current Dispatch" + "recent Dispatches" + "the archive." Topical tag system becomes a secondary archive navigation, not a primary discovery surface. Whitepapers and presentations move to a Library surface.

### Format mix (conditional on D3)

Default to **prune-then-justify**: any v1 collection that isn't actively producing in 2026 gets justification-or-archive treatment.

| Collection | 2026 production | Default treatment | Override threshold |
|---|---|---|---|
| `blog/` | active (229) | KEEP — primary | n/a |
| `whitepapers/` | active (12) | KEEP — secondary primary | n/a |
| `series/` | active (8, strongest IA) | KEEP — promote to primary nav | n/a |
| `counterpoints/` | trickle (4) | KEEP — under-used but architecturally load-bearing for hiring-evaluator persona | n/a |
| `presentations/` | dormant in 2026 | ARCHIVE — keep accessible, drop from primary nav | If Nino plans to resume publishing |
| `fiction/` | active (10) | DECIDE — keep as v2 surface, spin to separate site, or archive | Editorial-concept call (D2) |
| `tutorials/` | dormant (3) | ARCHIVE | If editorial concept includes instructional layer |
| `research-notes/` | dormant (1) | ARCHIVE or absorb into blog | Default archive |

### Surface set (the page list Stage 3 builds against)

These are the v2 surfaces. Decisions in parentheses point to which D-decision the surface depends on.

| Surface | Purpose | Persona served | Depends on |
|---|---|---|---|
| **Home** | Discovery — "what is this, what's new, what's the deepest piece" | All three; ordered by D2 single-sentence | D1, D2, D7 |
| **Post detail** | The read | All three; voice-consistency check for hiring-evaluator | D5 (voice delta) |
| **Whitepaper detail** | The receipts | Peer architect primarily | None new — inherits v1 reading shape with Rule 5 progressive disclosure |
| **Series detail** | Threaded reading | Peer architect; AI-curious IC | None — v1 pattern is gold-standard, carry forward |
| **Counterpoint detail** | Stress-test | Hiring evaluator (signals intellectual honesty) | D5 label terminology |
| **Library / Archive** | Discovery of older or topical material | Peer architect (cite-worthy); hiring evaluator (sampling for consistency) | D1, D3 |
| **About / Colophon** | Author identity + publication concept | Hiring evaluator (positioning proof) | D2, D7 |
| **Subscribe / Follow** | RSS, LinkedIn link, no email | All three; no marketing tells (hiring-evaluator) | None — preserve v1 posture |

Tag-detail and archive-tags surfaces from v1 are **not in the v2 set by default** under either thesis. v1 tagging carries forward as a backend-only filter for the Library/Archive surface — the tag-as-primary-discovery shape v1 had is rejected per F1 (44k px scrolls) and competitive evidence (none of the 5 peers lead with tag detail).

## What lands in `prototype/DESIGN.md` (engineering layer, not editorial)

Per methodology, the prototype's engineering decisions get codified alongside editorial decisions:

- **Linting / typing**: eslint + strict `tsc --noEmit` as CI gate (Astro is TS-ready).
- **Unit tests**: Vitest only for non-trivial logic (most v2 is content; not a unit-test target).
- **E2E**: Playwright happy-path per top-level surface, `@smoke` tag.
- **Performance**: Lighthouse-CI on preview URLs (Cloudflare Pages).
- **Security**: Gitleaks GH Action + Dependabot.
- **Sensor**: `browse-tool` per methodology Stage 0, `--profile-name signal-dispatch-v2-blueprint` to avoid collision.

The `prototype/DESIGN.md` write-out happens in Stage 3 (it lives in the prototype directory by convention) — this section flags what it'll contain so the engineering layer isn't forgotten.

## Open decisions surfaced (forwarded to `DECISIONS-NEEDED.md`)

This stage surfaces decisions but does not answer them where they require Nino's editorial taste:

- **D1** (from Stage 1) — Thesis A or B. **Blocks Stage 3.**
- **D2** (from Stage 1) — Editorial single-sentence. **Blocks Stage 3 home page.**
- **D3** (from Stage 1) — Format mix specifics (default: prune-then-justify above). Confirm or override.
- **D5** (from Stage 1) — Voice delta. **Blocks Stage 3 sample-post pages.**
- **D7** (from Stage 1) — v2 name. **Blocks Stage 3 home, About, and prototype shell copy.**
- **D8** (new) — Reader-facing label terminology (e.g., "counterpoint" vs reader-label). Per Rule 2.
- **D9** (new) — Whether to extend `research/competitive/` with cross-industry captures (per Stage 1 D6 split into a do/don't call).
