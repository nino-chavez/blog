---
stage: 5
variant: greenfield
status: skeletal — fills out as Stage 3 produces buildable surfaces and Stage 4 verifies claims
input: blueprint/03-prototype-plan.md, blueprint/04-fact-check.md
---

# Stage 5 — Documents

Per methodology, Stage 5 produces the strategic documents that sit beside the prototype — the one-pagers, briefs, and reference artifacts that travel without the prototype URL. The prototype is the experience; documents are the portable evidence.

## Documents this stage will produce

| Document | Audience | Source material |
|---|---|---|
| `v2-strategy-summary.md` | Internal — Nino as decision-maker; future selves reviewing the call | Stages 1-3 synthesized to one page |
| `v2-design-brief.md` | External — collaborators, contractors, the v1 → v2 cutover engineer | Stage 2 design principles + Stage 3 page set + brand register (post-D7) |
| `v2-editorial-charter.md` | Internal + reference — codifies the editorial concept (D2), cadence promise (D4), voice delta (D5) so v2 has a writeable rule-set for future posts | Stage 2 voice register section + D2/D4/D5 decisions |
| `v1-to-v2-migration-plan.md` | Internal — the engineer doing the v1 → v2 content migration | v1 inventory + D3 format-mix decisions + URL preservation strategy |
| `v1-baseline-reference.md` | Internal — anyone wanting "what was v1 like" without browsing v1-baseline/ | v1-baseline/01-diagnose + v1-baseline/strategy-summary, distilled |

## Why each document earns its slot

- **Strategy summary** — Future-self review of "did we get this right?" needs a single page that says what v2 chose and why. Prevents context-loss in the gap between Stage 6 deploy and Stage 7 iteration.
- **Design brief** — When the next person touches the prototype (or a designer Nino brings in), they read this, not the 4 Stage docs. Pure utility.
- **Editorial charter** — Once v2 ships, writing posts inside v2 needs a rule-set (the editorial sentence, the cadence promise, the voice delta). Without this, v2 drifts back toward v1 by the third post.
- **Migration plan** — The v1 corpus is 276 items. Cutover is non-trivial. Plan owns: URL preservation, redirect rules, sitemap updates, RSS feed continuity, slug remapping (if v2 changes URL shape), content-type mapping (per D3 format-mix call).
- **v1 baseline reference** — Sometimes the v2 conversation needs "what was v1 doing about X" without re-opening the v1-baseline/ directory. One-page distill.

## What this stage will NOT produce

- Blog post drafts in the new v2 voice — that's editorial work, not blueprint work
- A press release or launch comms — out of scope; if v2 needs comms, that's a separate initiative
- Investor / pitch materials — Signal Dispatch (and v2) is a personal practice surface, not a fundraising object

## Process

1. Land Stages 1-4 (Stage 4 verifies before Stage 5 cites)
2. Draft each document; cross-link to Stage 1-3 source artifacts
3. Run through reviewer agents per `template/.claude/agents/blueprint/reviewers/` (if any are wired for stage-5-class artifacts in the canonical methodology — check before assuming)
4. Land in `blueprint/documents/` directory; reference from `_meta/index.json` `documents` array if the portal renders a documents tab
5. Run `scripts/prep-deploy.sh` to populate `_docs/` so the portal's docs viewer surfaces them

## When this stage runs

After Stage 4 verifies. Sequencing matters — citing unverified facts in a "design brief" external read-out is exactly the failure mode Stage 4 prevents.

## Skeletal until Stages 3-4 produce inputs

Documents in this stage are *distillations* of upstream stages. Until Stages 3 and 4 stabilize, premature drafting reads like the brownfield strategy-summary did — confident framing on shifting underlying decisions. Defer until upstream is stable; document the intent here so Stage 5 isn't forgotten.
