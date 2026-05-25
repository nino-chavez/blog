# v1 Baseline (reference, not active artifacts)

These files were produced under the prior **brownfield** framing (committed in `c382c3d`, 2026-05-25) before the variant was corrected to **greenfield** later the same day. They are preserved here as **v1 reference material** for the Signal Dispatch v2 re-conception — not as active Blueprint stage artifacts.

## Why they moved here

The prior session reasoned "v1 exists → brownfield" and produced a diagnose / prescribe / preserve-v1-brand chain. That framing answers the wrong question for re-conception work: v2 is a new publication (new name, voice, identity), not an enhancement of v1. The brownfield chain's central assumption ("preserve what works in v1") is the opposite of greenfield posture.

The files weren't reverted because the work *inside* them — funnel evidence, persona analysis, competitive baselines — survives the variant flip as v1 reference data. The framing wrapper around them does not.

## What's here

| File | Original purpose | How v2 should use it |
|---|---|---|
| `00-inventory.md` | Pre-Stage-1 survey, brownfield pipeline reminder | Skip. Greenfield doesn't need this; the inventory it maps is brownfield-pipeline-shaped. |
| `01-diagnose.md` | 11 findings about v1 (audit) | Treat as v1 baseline measurements. Useful when v2 wants to claim "v2 fixes X" — points to what X was. Not a prescription for v2. |
| `02-prescription.yml` | 9 impact-ordered fixes to v1 | Discard as v2 input. These prescribe v1 patches; v2 is built from a clean slate. (Exception: anything classified as infrastructure rather than design — e.g., the `/llms.txt` route shipped in `628d93f` — was correctly v1-applicable.) |
| `03-design-brief.md` | Visual + IA brief that explicitly preserved v1's brand kit | Discard as v2 input. The preserve-v1-brand premise is the explicit opposite of v2 re-conception. |
| `strategy-summary.md` | One-page cover for stakeholder share-out of the v1 audit | Discard. v2 will produce its own strategy summary at greenfield Stage 5/6. |

## What's NOT here (intentionally left in `blueprint/`)

These directories stay in their original location because they are **research inputs**, not brownfield-framed deliverables — they carry forward to greenfield Stage 1 as-is:

- `blueprint/research/personas/` — audience archetypes. Validate against v2's target audience; the overlap is high.
- `blueprint/research/competitive/` — five peer publications + synthesis. Greenfield Stage 1 will extend this, not replace it.
- `blueprint/research/funnel/` — v1 funnel evidence and analytics gaps. Useful as v2 baseline for measuring impact.
- `blueprint/scripts/` — capture-current-state and capture-competitive scripts. Reusable for v2's research captures.

## What also survives v1 → v2

- `/llms.txt` route in v1 (commit `628d93f`) — infrastructure useful to v1 regardless of v2's shape. Not a sunk cost.
- The portal scaffold itself (`blueprint/index.html`, `blueprint/prototype/`, `blueprint/pages/`, `blueprint/_meta/`, `blueprint/CONVENTIONS.md`, etc.) — Tier 1 / Pattern B portal shape is reusable regardless of variant. What changes is the *content* of the comparison ("v2 proposed" instead of "v1 with fixes").
