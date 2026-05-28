# Blueprint Decision Gate — blog redesign pilot

Lopopolo-pattern pilot: knowledge IN this repo, map not manual, invariants enforced in code. Scope is the Blueprint methodology layer only. The project's own `AGENTS.md` at root remains the Astro/project map.

## Where to look (map)

- **Active decisions**: `blueprint/prescription.yml` — `provisional:` array (D1, D2, D3, D4, D5, D7, D8). Each gets an optional `status: provisional | accepted | rejected | modified` field. Absence = provisional.
- **Active bets / prescription items**: `blueprint/prescription.yml` — `prescription:` array (PR-01 to PR-17). Same status convention applies as decisions land.
- **Stage stopping conditions**: this file, below.
- **Lints**: `.blueprint/lints/` — run via pre-commit hook OR `node .blueprint/lints/<name>.mjs` manually.
- **Methodology source (pinned)**: canonical at `~/Workspace/dev/tools/blueprint/`. This pilot does not yet copy methodology into the repo; that's the next pilot phase if this one succeeds.

## Stage stopping conditions (signal-dispatch-v2)

- **Stage 1 (Research) complete when**: every persona/funnel/evidence stub exists in `blueprint/research/`
- **Stage 2 (Design principles) complete when**: principles enumerated in `blueprint/02-design-principles.md` and traced to research
- **Stage 2.5 (Decision Gate) complete when**: every entry in `provisional:` has a non-provisional `status` field
- **Stage 3 (Prototype + forge pipeline) complete when**: every accepted decision can be evaluated against a prototype surface OR forge output
- **Stage 4 (Fact-check) complete when**: prototype surfaces fail-loud against `falsifies_if` criteria when violated
- **Stage 5-6**: per canonical methodology

Stopping condition for Stage 3 is enforced by `prescription-acceptance.lint.mjs` at commit time. Stage 3+ files staged with provisional decisions fail the commit with remediation injection.

## What the lints enforce

- **`prescription-acceptance.lint.mjs`** — Stage 3+ commits blocked when any decision in `blueprint/prescription.yml` has `status: provisional` (or no status field). Remediation injected: update each decision's status to `accepted`, `rejected`, or `modified`.

## What "Stage 3+" means for this lint

Files outside `blueprint/`, `.blueprint/`, `decisions/`, `docs/`, `research/` are Stage 3+. That includes:
- `src/` (Astro pages, components, layouts)
- `_design/forge-output/`
- Brand kit JSON files at root
- Any other prototype / production artifact

Pure decision-layer work (editing `blueprint/prescription.yml` itself, adding research, writing methodology amendments) is Stage 1-2 and not gated.

## What this pilot is testing

That executable enforcement (Lopopolo-pattern lint with remediation injection) actually stops the "compose more surfaces" drift observed in this initiative on 2026-05-25 — not by adding more methodology prose, but by making the constraint mechanical at commit boundary.

Success criteria, in priority order:
1. Lint fires on the next Stage 3 commit attempt with provisional decisions
2. Agent reads the remediation injection and self-corrects (updates decision status OR removes Stage 3 work)
3. No workaround emerges (agent doesn't reorder commits to land legal pieces while drifting; operator doesn't disable the hook)
4. Time-to-correction shorter than the operator-yell loop

If the lint fails to catch the next drift or a new drift mode emerges that the lint doesn't address, the proposal needs structural revision before broader rollout. Log failure in this directory as `failure-<date>.md`.

## Pilot scope — what's NOT here

- Design-anchor lint (taste invariants for forge-brand output) — separate pilot once `design_anchor:` schema lands in `blueprint.yml`
- Doc-gardening agent — independent item, separate validation
- Template-purity lint — methodology-side, blocked by L8 freeze
- Full methodology-in-repo copy — pilot only pins lint + AGENTS.md scope

## How the hook fires

Native git pre-commit hook at `.git/hooks/pre-commit` invokes the lint on every `git commit`. To bypass for emergency (NOT recommended; defeats the pilot): `git commit --no-verify`. If you use `--no-verify`, log why in a `bypass-<date>.md` here — that IS the data the pilot needs.
