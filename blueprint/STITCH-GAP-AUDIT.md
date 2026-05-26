---
stage: 3-supplement
captured_on: 2026-05-25
inputs:
  - blueprint/01-research.md
  - blueprint/02-design-principles.md
  - blueprint/03-prototype-plan.md
  - blueprint/DECISIONS-NEEDED.md
  - ~/Downloads/stitch_signal_dispatch_studio/  (4 Cyanotype-style surfaces + DESIGN.md)
  - blueprint/stitch-reference-archive/pages/  (older Material-style surfaces from the prior Stitch run)
disposition: Stitch surfaces moved to blueprint/stitch-reference-archive/ as preserved comparison reference. blueprint/pages/ restored to handcoded baseline pending forge-pipeline run. Forge-derived v2 surfaces will replace handcoded baseline once the kit lands.
---

> ## ⚠️ Methodology bypass acknowledged (added 2026-05-25, late session)
>
> This audit was conducted against the **wrong primary**. Stitch is a designer tool that produces aesthetically-coherent mockups from text prompts — it is NOT the canonical Blueprint Stage 3 generator.
>
> The correct generator chain per global CLAUDE.md + forge-site README:
>
> ```
> blueprint research → forge-brand (AI-derived kit, review-gated)
>                    → forge-brand export bridges (tailwind + signal-forge + image-gen)
>                    → forge-signal (voice-scored copy)
>                    → gen-images (per-surface media)
>                    → forge-site archetype (composition playbook)
>                    → prototype surfaces consume tokens + copy + images deterministically
> ```
>
> I bypassed the entire forge toolchain and used Stitch as a substitute. Same methodology failure as the v3 site session (recap: "I conflated Blueprint with the full delivery pipeline. Blueprint hands off to forge-brand for design system generation, to forge-signal for voice-consistent copy, to gen-images for media, to forge-site's archetype playbook for composition. I treated Blueprint as end-to-end and skipped the entire deterministic-generation layer.").
>
> **Methodology gap surfaced**: `forge-site/archetypes/` has portfolio-brand, digital-content, event-organizer, service-business. No `publication` archetype. Publication-specific surface set (post-detail / series-detail / library / counterpoint) isn't in any existing archetype's sitemap. Per Blueprint's First Principle ("Agent Struggle Is a Missing Capability"), this gap gets filled before the forge pipeline depends on it. New archetype lives at `forge-site/archetypes/publication.md`.
>
> **What the audit findings below remain useful for**: a critique of Stitch's specific design choices — what Stitch got wrong about persona priority, rule alignment, decision-respect. The Stitch surfaces (now archived to `blueprint/stitch-reference-archive/`) are preserved as one of three comparison references when the three-way compare ships (handcoded baseline | Stitch | forge-derived).
>
> **What this audit does NOT do**: validate the right-pipeline output. That requires a re-audit against the forge-derived surfaces, which haven't been generated yet.

# Stitch coverage vs Blueprint research — gap audit

After standing up Stitch's full design as a candidate v2 prototype, this audit cross-references what Stitch actually delivered against the research findings, the codified design principles, the 8-surface prototype plan, and the open D-decisions. Three lists below: **MISSING** (research says we need it, Stitch didn't produce it), **REMOVE** (Stitch produced it but research says it shouldn't ship), **ADD** (Stitch produced something but it's incomplete or off-spec versus research).

## Coverage matrix

| v2 surface (per 03-prototype-plan.md) | Stitch source | Design system | Status |
|---|---|---|---|
| `home` | Downloads/home_signal_dispatch_studio | **Cyanotype Studio** | OK |
| `post-detail` | pages/stitch/article.html | Material UI ⚠️ | Wrong design system |
| `whitepaper-detail` | pages/stitch/whitepapers.html | Material UI ⚠️ | Wrong design system |
| `series-detail` | pages/stitch/series.html | Material UI ⚠️ | Wrong design system |
| `counterpoint-detail` | — | — | **MISSING** |
| `library` | — | — | **MISSING** |
| `about-colophon` | Downloads/colophon_methodology_stack | **Cyanotype Studio** | OK |
| `subscribe-follow` | — | — | **MISSING** |
| `dispatch-current` (NEW) | Downloads/now_weekly_state | **Cyanotype Studio** | Conditional on D1=Thesis B |
| `speaking` (NEW) | Downloads/speaking_booking_assets | **Cyanotype Studio** | Out of v2 publication scope |

**Top-line finding**: of the 8 planned surfaces, Stitch covered 5 with HTML and 2 with the wrong design system; 3 critical surfaces have no Stitch counterpart at all. Stitch also produced 2 surfaces (`dispatch-current`, `speaking`) the v2 plan didn't ask for.

---

## MISSING — research says we need it, Stitch didn't produce it

### 1. `counterpoint-detail` (high priority)

- **Why it matters**: per `02-design-principles.md` Rule 4 and the Hiring Evaluator persona (P2), counterpoint is architecturally load-bearing — it signals intellectual honesty. The brownfield diagnose flagged counterpoints as "underused but important." The cold-arrival-hiring-evaluator flow in `_meta/index.json` walks: post → counterpoint → post → about. Without counterpoint-detail, that flow has nothing to walk through.
- **Action**: re-generate via Stitch. Prompt seed: a Stitch counterpoint surface needs (a) a banner naming the parent post being challenged, (b) the challenge argument as primary read, (c) a "by the same author" line that owns the self-red-team posture, (d) per Rule 4, one secondary affordance — return to the parent post. D8 still owns the reader-facing label ("the case against this" vs "counterpoint" vs "stress-test").

### 2. `library` (high priority)

- **Why it matters**: per the prototype plan, library is the discovery surface for older + topical material. Under Thesis A, it's a chronological feed with tag filtering. Under Thesis B, it's a "back-issue archive" — the secondary discovery axis once `dispatch-current` is primary. The cold-arrival-peer-architect and warm-return-rss flows both land here. Without it, deep-link discovery has nowhere to go.
- **Action**: re-generate via Stitch. Prompt depends on D1.

### 3. `subscribe-follow` (medium priority)

- **Why it matters**: small surface but research-load-bearing. The persona research says **no email capture** (P2 hiring evaluator drops at marketing tells). Per `02-design-principles.md`, v2 preserves v1's "RSS-and-LinkedIn-only" posture. Stitch hasn't tested whether it'll respect that or default to an email-capture pattern.
- **Action**: re-generate via Stitch with explicit no-email constraint in the prompt. Probably a single-screen surface with two affordances.

---

## REMOVE — Stitch produced it but it shouldn't ship

### 4. `speaking` (Cyanotype, from Downloads/speaking_booking_assets)

- **Why remove**: not in v2 publication scope. The `03-prototype-plan.md` surface set is publication-only: 8 surfaces, all about reading the work. A speaker booking page belongs on `ninochavez.co` (the main identity site), not on the publication subdomain. Bringing it in expands scope and conflates two distinct properties.
- **Counter-argument**: identity-cluster framing (publication + speaker + colophon as one site) is defensible. But that's a meta-decision the brownfield diagnose didn't surface and the variant correction didn't authorize.
- **Recommended disposition**: keep file in repo as a Stitch-generated reference, but **remove from `_meta/index.json` `pages` list** so it doesn't render on the portal. Treat as "available if scope expands."

### 5. Home page editorial concept — "I direct agents to ship commerce"

- **Why remove**: violates Rule 3 ("lead with the work, not the author or the brand"). Stitch opens the home with a first-person pull quote — that's author-first, exactly the personal-brand framing the hiring-evaluator persona drops at. Rule 3 was specifically calibrated against this default.
- **Counter-argument**: it's a *candidate D2 answer*. If D1=Thesis A and D2 lands as "v2 is a personal practice publication," this opening might be defensible. But it's not a decision Stitch can make.
- **Recommended disposition**: keep the surface, **replace the opening section with a placeholder** until D2 lands. Flag in the surface's `_meta/home.json`.

---

## ADD — Stitch produced it but it's incomplete or off-spec

### 6. `post-detail`, `whitepaper-detail`, `series-detail` — wrong design system

- **The issue**: these three came from the older `pages/stitch/` run that used Material UI tokens (Inter font, Source Sans, rounded corners, Material color palette). The canonical design is Cyanotype Studio (Bree Serif + Crimson Pro + JetBrains Mono, ivory + architectural ink + blueprint cyan, 0px radii, 1px borders only).
- **Impact**: Rule 1 violation ("v2 only uses brand expressions consistent with the v2 brand register"). A reader landing on the home page (Cyanotype) and clicking through to a post (Material) would experience two different publications.
- **Action**: re-generate all three via Stitch using `_design/cyanotype-studio.md` as the explicit design system input. Until then, the three surfaces are *placeholder Material visualizations of the right content shape* — usable for flow walkthroughs, not for design review.

### 7. `home` — six sections compete

- **The issue**: Stitch home contains opening prose + Product Receipts + Methodology + Surfaces / Cultural Surfaces + Recent Essays + right-rail Live Signal/Blueprint State. That's at least six discrete affordances above the fold. Rule 4 ("one thing per surface") explicitly calls this out as the v1 home page failure mode.
- **Action**: Stitch home needs a Rule 4 prune pass. The right shape (per the prototype plan sketch): one primary discovery affordance, others subordinated below the fold or to a clearly secondary rail. Probably: drop "Product Receipts" (that's a portfolio, not a publication concern), drop "Cultural Surfaces" (lifestyle products — unclear what these are for the publication), keep "Recent Essays" as primary, demote the right rail to subordinate.

### 8. `home` — labels are internal jargon

- **The issue**: "Product Receipts // Shipped Artifacts," "Live Signal," "Studio Load," "Signal Clarity," "Active Threads" — these are evocative but they're not the language any of the three personas use. Rule 2 ("use the reader's terminology, not internal") is violated.
- **Action**: D8 (reader-facing labels) needs to land before Stitch home can ship. Until then, each block should carry a `[label TBD per D8]` flag.

### 9. `about-colophon` — "Predecessors" + "What changed from v2" need fact-check

- **Issue 1**: lists Brian Lovin, Ryan Lopopolo, Geoffrey Litt, Will Larson as "Predecessors" who shaped the design. Per the global rule against fabricating Nino's interior state (`feedback_no_first_person_fabrication.md` in project memory), these attributions are inventions unless Nino has actually cited these influences. Three of four are real practitioners with public sites, but the *claim that they shaped this design* is fabrication.
- **Issue 2**: the "What changed from v2 (LEGACY → CURRENT)" table presents past-tense decisions ("REBRAND", "100% INCR.") as if they've already been made. They haven't — D1, D2, D7 are still open.
- **Action**: both tables need to be flagged with placeholder text or removed until they can be grounded.

### 10. `dispatch-current` — only fits if D1=Thesis B

- **The issue**: Stitch produced a "Now: What's actually happening this week" surface that is Stratechery/Pragmatic-Engineer adjacent — exactly the Thesis B shape. If D1 lands on Thesis A (positioning realignment, not different publication), this surface is out of scope and should be removed.
- **Action**: don't decide yet. Land on the portal as a conditional surface; remove if D1=A; promote to canonical home if D1=B.

---

## D-decision impact

Stitch implicitly made calls that should still be Nino's:

| D-decision | What Stitch assumed | What it should have been |
|---|---|---|
| D1 (thesis) | Mixed — home is Thesis-A-ish, dispatch-current is Thesis-B-aligned | Pick one and re-skin |
| D2 (editorial sentence) | "I direct agents to ship commerce. I write the harness..." | Open decision; first-person framing conflicts with Rule 3 |
| D3 (format mix) | Implies "Product Receipts," "Methodology and Assets," "Cultural Surfaces" — not the v1 collections | Should map to blog / whitepapers / series / counterpoints, not invent new buckets |
| D5 (voice delta) | Author-quotation-first, dense practitioner voice | Conflicts with Rule 1 (carry v1 voice) unless this IS the explicit delta |
| D7 (v2 name) | Hard-coded "Signal Dispatch" everywhere | Whatever Nino picks; needs to be parametric in the templates |
| D8 (reader labels) | "Product Receipts," "Live Signal," etc. — internal jargon | Reader-facing labels per Rule 2 |

---

## Recommended next moves (in order)

1. **Pick D1**. Until D1 lands, dispatch-current vs home is a contradiction we're shipping side-by-side.
2. **Re-generate post-detail / whitepaper-detail / series-detail in Cyanotype** via Stitch with `_design/cyanotype-studio.md` as the explicit input. This is the highest-leverage gap — three of the four reading surfaces are currently in the wrong design system.
3. **Re-generate counterpoint-detail, library, subscribe-follow** via Stitch with explicit research constraints in the prompt (no email capture, hiring-evaluator-safe, etc.).
4. **Strip fabricated content** from about-colophon — the Predecessors table and the "What changed" table both ground in claims Nino hasn't made.
5. **Park speaking.html** — remove from portal index, keep in repo as future-scope reference.
6. **Decide whether the harness chrome** (proto-nav.js dark top-bar) belongs on Stitch pages at all, or whether the lightweight `_blueprint-banner.js` we just wired in is the right ceiling.

Roughly: Stitch did 50% of the v2 prototype work in Cyanotype, 35% in the wrong design system, and missed 3 surfaces entirely — but the 50% it nailed is dramatically better than the handcoded versions it replaced. The right move is to **lean into Stitch as the generator** and feed it the gaps with explicit design-system + research constraints.
