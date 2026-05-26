---
stage: 2-supplement
variant: greenfield
input: blueprint/02-design-principles.md, blueprint/research/design-alternates/stitch-DESIGN.md
purpose: Score Stitch's parallel-track design against Stage 2 principles, personas, and the D-decision criteria. Output a comparison matrix that sharpens D1/D2/D5/D7 without picking them.
---

# Stage 2 supplement — Stitch alternate evaluation

Stitch (Google's AI UI tool) generated 4 high-fidelity v2 surfaces from the same Stage 1-2 constraints (see `pages/stitch/{home,article,series,whitepapers}.html` and `research/design-alternates/stitch-DESIGN.md`). This doc scores each Stitch design call against the Stage 2 Rules, the personas, and the D-decision criteria — without picking for Nino. The goal: when Nino reads this, the D-decisions get easier because the candidate space is laid out on the same axes.

## Scoring legend

For each Stitch call:

- **Aligns** — matches a Stage 2 Rule or persona requirement
- **Differs** — independent choice, not a conflict; just a v1→v2 design move
- **Conflicts** — directly violates a Stage 2 Rule or a persona requirement
- **Decides** — Stitch implicitly resolves a D-decision Nino was holding

## Matrix

| # | Stitch call | Stage 2 anchor | Verdict | Notes |
|---|---|---|---|---|
| 1 | **Author identity above the fold** ("by Nino Chavez" in masthead + author card in footer) | Rule 3 (lead with the work / author second / brand third) | **Aligns** | Stitch's "Nino Chavez" sits next to the publication mark in the header. Matches Rule 3's author-second ordering. |
| 2 | **5-item flat nav** (Dispatches / Series / Whitepapers / Presentations / About) | Rule 4 (one thing per surface) + competitive synthesis (5/5 peers use 5 items, no dropdown) | **Aligns** | Same shape as Lethain, Stratechery, Pragmatic Engineer. Drops fiction, counterpoints, tutorials, research-notes from primary nav — implies D3 default = "prune dormant collections from nav" (which the Stage 2 default already proposed). |
| 3 | **Dispatch #N serialization** in monospace prefix | n/a (Stage 2 left this open; competitive synthesis flagged as Open Question) | **Decides D1** | This is the visible commitment to Thesis B (deliberate publication). Every list item in Stitch carries `Dispatch #128`-style framing. Thesis A wouldn't number; would lead with title only or featured-hero only. Stitch picked B by visual default. |
| 4 | **Source Serif 4 body type** (serif throughout reading column) | n/a (Stage 2 left typography open) | **Decides D7 register** | This is the biggest visual D7 commitment. v1 uses Inter (sans-serif) body. Source Serif 4 is the Stratechery/NYT-editorial register. Reads as professional publication; commits to a specific brand temperature. |
| 5 | **Slate Blue (#2C3E50) singular accent** for links + active states + Series taxonomy | n/a | **Decides D7 palette** | Restraint matters here. One accent color, used functionally only. Aligns with Rule 1 (intended brand register — no decorative accents). |
| 6 | **Paper (#F9F8F6) warm off-white background** | n/a | **Decides D7 surface** | Warm-paper base reduces flicker, supports long-read sessions. Different posture from v1's clean-white background. Aligns implicitly with hiring-evaluator's "feels like a publication, not a personal-brand surface" requirement. |
| 7 | **Sharp 0px border-radii** on all components | n/a | **Decides D7 shape language** | Rejects the Tailwind/shadcn rounded-corner default that flags "vibe-coded site." Aligns with hiring-evaluator's no-marketing-tells (rounded buttons read as marketing-CTAs). |
| 8 | **No shadows; tonal layering + 1px rules for hierarchy** | n/a | **Decides D7 elevation** | Same rationale as sharp edges — strips decorative depth, content carries the weight. Aligns with the "feels like a deliberate publication" target. |
| 9 | **Source Serif 4 + Inter + JetBrains Mono — three-font system** | prototype/DESIGN.md (engineering rules already include Inter + JetBrains Mono) | **Aligns + extends** | Adds the serif. The existing token system in shared.css already exposes `--font-display: Inter` and `--font-mono: JetBrains Mono` — a v2 adoption needs a new `--font-serif` token. Manageable scope. |
| 10 | **720px max content width** (single-column centered article) | inherits v1's narrow column (per v1-baseline F8-positive: reading experience intact) | **Aligns** | Same width as v1's post detail. Maintains line-length-for-comprehension. |
| 11 | **TOC sidebar with auto-scroll-spy** on long-form article | Rule 5 (progressive disclosure on long-form) | **Aligns** | Stitch's TOC is a left-rail in `pages/stitch/article.html`; existing v2 `whitepaper-detail.html` puts TOC at top + section-progress on right-rail. Different placements, same principle. Both satisfy Rule 5. |
| 12 | **Counterpoint blocks** with monospace label + structural rule | Rule 1 (intended brand register) + counterpoint architectural importance per hiring-evaluator persona | **Aligns** | Stitch surfaces counterpoints as in-article callouts (different placement than v2's `counterpoint-detail.html` which makes counterpoint a separate page). Stitch's inline approach trades discoverability (you only see counterpoints if you're reading the parent) for context (you see the stress-test where it lives). Different design call; both defensible. |
| 13 | **Series Index with progress tracking** ("33% completed; currently reading Paxos vs Raft (Part 3)") | Rule 3 + competitive (v1 series-detail is gold-standard per F7-positive) | **Aligns + extends** | Adds active-progress UI to v1's strong numbered-card pattern. The existing `series-detail.html` has progress markers; Stitch's surfaces the SAME pattern from the Library/index level. Adoptable on either thesis. |
| 14 | **Whitepapers shown as searchable index** with status + reading time + filter | 02-design-principles `library` surface plan | **Aligns + sharpens** | Stitch's `whitepapers.html` is functionally what the Library surface should be for the whitepaper format. Adoptable as a starting point for the eventual Library build. |
| 15 | **"Signal Direct" email signup widget** on homepage | Hiring-evaluator persona (no marketing tells) + Rule 4 (one thing per surface) | **Conflicts** | Direct violation of v2's intentional no-email-capture rule (per `personas/hiring-evaluator.md` and Stage 2 voice register). If Stitch's design is adopted otherwise, this widget must be stripped. Already flagged in disclaimer strip. |
| 16 | **"Now Reading" sidebar widget** (live-reading status?) | Hiring-evaluator persona (no personal-brand performance) | **Conflicts (mild)** | "Now reading" is a personal-brand-leaning affordance — common in social-feed-shaped sites (Goodreads-share). For the hiring-evaluator persona arriving to test work-rigor, this reads as Twitter-bio energy. Soft conflict; could be repurposed (e.g., "Currently studying" for what Nino's researching for the next Dispatch). |
| 17 | **Editorial sentence** ("A weekly inquiry into the structural integrity of modern systems, the economics of developer velocity, and the future of human agency in an automated stack") | D2 (editorial single-sentence) | **Decides D2** | At ~36 words, exceeds the ≤12-word target from `02-design-principles` D2 criteria. The shape is right (audience + topic + posture); the length isn't. Candidate input for D2 — Nino can tighten if adopted, or write a different sentence in the same shape. |
| 18 | **"Working Architect's notes on AI-era engineering and leadership"** (H1 on homepage) | D2 candidate | **Decides D2 (subhead)** | At 9 words, this passes the ≤12-word test. Reads as both audience-naming and topic-scoping. Strong D2 candidate independent of the longer lede above. |
| 19 | **Sidebar "LATEST DISPATCHES" with `Dispatch #N` + tag chip + read-time** | Rule 4 (one primary affordance) + Rule 5 (per-card metadata for scannability) | **Aligns** | Discovery surface is restrained — title + 2-line excerpt + format/tag/time strip. Matches Stage 2's "format badge per card" call from `_meta/home.json`. |
| 20 | **Fixed-width 12-col grid on index, single-column on article** | Engineering layer (prototype/DESIGN.md) — methodology default | **Aligns** | Standard editorial grid; no new architectural commitment. |

## What Stitch decides (whether Nino picks them or not)

If Nino adopts Stitch's design wholesale, these D-decisions land:

| D-decision | Stitch's pick | Notes |
|---|---|---|
| **D1** (thesis) | **Thesis B** (deliberate publication, Dispatch #N serialization) | Built into every surface |
| **D2** (editorial sentence) | Long version: "A weekly inquiry into..." (~36 words, exceeds criteria). Short version: "Working Architect's notes on AI-era engineering and leadership" (9 words, passes ≤12-word test) | Short version is the cleaner D2 candidate |
| **D3** (format mix) | 4 primary formats: Dispatches, Series, Whitepapers, Presentations. Drops counterpoints from primary nav (inlined into articles instead), drops fiction, tutorials, research-notes | Implicit prune-then-justify call; matches Stage 2 default for dormant collections |
| **D4** (cadence) | "Weekly inquiry" (from the lede) | Weekly cadence promise — heavier than v1's published-when-ready. Nino's call whether the obligation is welcome |
| **D5** (voice delta) | Implied: editorial-formal register (Stratechery-adjacent) | Serif body + restrained color + structural ruleline visual = the voice is going to read more deliberate than v1. Stitch doesn't write the voice delta in text, but the design forces it |
| **D7** (name) | Defaulted to "Signal Dispatch v2" | Not a decision; placeholder per Nino's pick during integration |
| **D8** (counterpoint label) | Keeps "Counterpoint" terminology (with monospace-label structural-rule treatment) | Doesn't rename; treats the term as load-bearing |

## What Stitch does NOT decide

- **D6** (cross-industry competitive set) — already extended this session
- **D9** (operational: do the cross-industry captures get prioritized) — handled

## Conflicts that must be resolved before any wholesale adoption

If Nino picks "adopt Stitch as the v2 visual direction," these need explicit handling:

1. **Strip the email-signup widget** from the homepage (item 15). The hiring-evaluator persona is non-negotiable on this.
2. **Reconsider "Now Reading" sidebar** (item 16). Either repurpose to "Currently researching" (Garden-shape, less personal-brand) or strip.
3. **Reword the editorial lede** (item 17). 36 words is too long for the D2 criteria; the H1 (item 18) is the better starting point.
4. **Adopt without Tailwind dependency** (engineering-layer concern). Port the design tokens into `shared.css` via a new `--font-serif` token and slate-blue palette. Re-implement layouts in vanilla CSS using the existing portal shell. Keep CONVENTIONS.md compliance.
5. **Pick the actual name** (D7). Stitch defaulted to "Signal Dispatch v2"; adoption requires picking. If the v2 name turns out to be "Signal Dispatch" (no v2 suffix in user copy), the existing v1 name survives the re-conception — which is itself a thesis statement (Thesis A leaning).

## Reading recommendation for Nino

The fastest decision path:

1. **Decide D1 first** — does Stitch's Thesis B framing (Dispatch #N, weekly, deliberate publication) fit the v2 you want, or does Thesis A (positioning realignment, less serialized) fit better? The cross-industry adjacencies suggest Thesis A has the most references (Daring Fireball, Maggie Appleton, Robin Sloan all author-as-catalog), but Stitch's design is unambiguously Thesis B-shaped.
2. **If Thesis B**: adopt Stitch's design as direction, run the 5 conflicts above, port without Tailwind, ship.
3. **If Thesis A**: Stitch's typography + palette + sharp edges + structural-rule depth are still adoptable as a v2 brand register independent of the Dispatch framing. Strip Dispatch numbering, restructure home from "latest Dispatches list" to "featured-piece + recent stream," keep the typography work.
4. **Either way**: items 1, 2, 7-13, 20 are adoptable as-is. Items 15-17 need handling regardless. Item 4 (Source Serif 4) and item 3 (Dispatch numbering) are the load-bearing thesis-pick markers.

## What this doc does NOT do

- It doesn't pick the thesis (D1) for Nino.
- It doesn't write the D2 single-sentence or pick the D7 name.
- It doesn't claim Stitch's design is "better" or "worse" than the existing prototype work. Different designs for the same constraints; both defensible.
- It doesn't propose a hybrid (a "best of both" merge). Hybrids without a thesis pick produce design-by-compromise, which is the failure mode Stage 1 already surfaced in the brownfield-vs-greenfield round.
