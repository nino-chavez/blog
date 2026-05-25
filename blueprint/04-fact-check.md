---
stage: 4
variant: greenfield
status: skeletal — fills out as Stage 3 produces page HTML and copy
input: blueprint/03-prototype-plan.md
---

# Stage 4 — Fact-Check

Per methodology, Stage 4 verifies every external claim, statistic, citation, and reference in the prototype + Stage 1-2 artifacts. The work is mechanical (each claim → source → verified/revised/cut) but high-leverage — unverified claims undermine the hiring-evaluator persona's whole reason for arrival.

## What this stage will check (once Stage 3 produces copy)

| Source | Claim types | Verification path |
|---|---|---|
| `01-research.md` (this commit) | Persona count percentages, peer-publication patterns, v1 collection counts, funnel evidence numbers | Re-probe `/api/posts.json`, file-count via `ls`, re-screenshot peer surfaces if older than 30 days |
| `02-design-principles.md` (this commit) | Cross-industry publication examples (Stratechery, Maggie Appleton, etc.), competitive synthesis citations | Confirm each named publication exists at the claimed URL; remove if the framing-by-example doesn't hold |
| `03-prototype-plan.md` (this commit) | File paths in `astro-build/src/pages/`, `astro-build/src/content/`, current-state route URLs | Verify paths exist; verify URLs return 200 |
| `_meta/<page>.json` (8 files this commit) | Per-page `currentState.sourceFiles` arrays, `currentState.route` URLs | Verify each source file exists; verify each route returns 200 |
| v2 prototype page HTML (Stage 3 deferred) | All quoted text from competitors, all cited statistics, all attributed quotes | Per-claim verification; quote text must match source verbatim |

## What this stage will NOT check

- v1 voice register fidelity — that's a Stage 2 input, not a fact-check item (the voice guide is the source of truth for v1; v2's voice delta is the design decision, not a claim to verify)
- Subjective design calls (e.g., "Rule 3 reverses both v1 and the peer-set default") — those are design choices to defend, not facts to verify

## Process

1. Generate a fact-check checklist by scanning all Stage 1-3 artifacts for claim-shape language (numbers, named entities, file paths, URLs, "research shows", "5 of 5 peers", etc.)
2. Run each claim through verification. Three outcomes: VERIFIED (cite the source), REVISED (correct the claim, log the change), CUT (claim doesn't survive verification, remove it).
3. Update Stage 1-3 artifacts in-place; log the cut/revise items in `04-fact-check-log.md` so reviewers can see what changed.
4. Re-publish stake-affected docs to the portal corpus via `scripts/prep-deploy.sh` so the chat assistant doesn't quote stale facts.

## When this stage runs

- After D1+D2+D7 land and Stage 3 pages have copy
- Before any external stakeholder share-out (the prototype is OK to share earlier as in-progress; Stage 4 gates the "this is the v2 design" external read-out)
- Re-run any time a Stage 1-3 artifact gets a substantive edit

## Open items already known to need verification

These were inferred or imprecise in Stage 1-2; they get fact-checked when Stage 4 actually runs:

- "RSS subscriber base mix" — persona priority ordering presumes peer-architect dominance; persona gap G1 flags this as unmeasured. v2's claims about audience need to caveat or measure.
- "v1's 156-post voice guide distillation" — verify the voice guide's footer or commit history confirms 156 (not just memory claim).
- "5/5 peers surface author identity above the fold" — re-verify against fresh captures if older than 30 days from this commit.
- "44k px tall tag-detail page" — re-verify against current production if v1 has shipped any IA changes since 2026-05-25.
- "i-dont-write-any-code" blog post exists at the cited path — verify.
- Cross-industry examples (Stratechery dispatch numbering, Maggie Appleton author-as-house, etc.) — verify each named example at its current URL.

## Deferred until Stage 3 produces copy

The full fact-check checklist generation is mechanical but only meaningful once there are sentences to check. Skeletal placeholder for now; this doc gets a working checklist appended once the first prototype pages ship.
