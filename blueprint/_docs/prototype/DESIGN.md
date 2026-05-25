---
stage: 2
companion: blueprint/02-design-principles.md
scope: engineering rules for the v2 prototype shell
---

# Prototype DESIGN.md — Engineering rules

Per methodology, this doc sits in `prototype/` alongside the prototype itself so engineering choices are codified before any page gets built. The editorial rules live in [[../02-design-principles.md]]; this is the engineering layer they pair with.

## Stack

- **Shell**: static HTML + Cloudflare Pages Functions (template/portal canonical default)
- **Build**: zero — files served as-is from `blueprint/` root
- **Functions**: `functions/api/chat.js` (OpenRouter-backed chat; corpus = `_docs/` populated by `scripts/prep-deploy.sh`)
- **Deploy**: Cloudflare Pages (`wrangler pages deploy . --project-name signal-dispatch-v2-blueprint`)

## Testing baseline (per methodology Stage 2)

| Category | Setup | Why |
|---|---|---|
| Linting | None for static HTML; if Pages Functions grow, add eslint to `functions/` only | Don't fight zero-build by adding a TS toolchain we don't need |
| Unit | None | Prototype is HTML + thin JS; nothing meaningful to unit-test |
| E2E | Playwright smoke per top-level surface (`@smoke` tag) — uses the same browse-tool primitive as captures | Catches "the strategy panel toggle broke" without manual click-through |
| Performance | Lighthouse-CI on Cloudflare Pages preview URLs | Stakeholders judge polish by load speed; cheap to wire |
| Security | Gitleaks GH Action; Dependabot if any package.json appears | Prevents leaked OpenRouter key in `.env` from reaching the prototype |

Skip: Vitest, Snyk/CodeQL, mutation testing, coverage gates. Prototype scope doesn't justify them.

## Sensor

`browse-tool` per methodology Stage 0. Profile must be initiative-scoped:

```bash
browse-start --profile-name signal-dispatch-v2-blueprint
```

The default profile (`blueprint`, derived from cwd basename) would collide across initiatives.

Escalate to Chrome DevTools MCP only when DOM access is insufficient (network capture, console event stream, Lighthouse audit, ARIA tree). Default to browse-tool.

## Capture scripts

`blueprint/scripts/capture-current-state.mjs` and `capture-competitive.mjs` predate the browse-tool methodology default — they use Playwright directly. Two paths:

1. **Replatform to browse-tool** when capture work resumes for v2. Estimated <1 hour; small.
2. **Document the deviation here** and keep Playwright. Rationale: scripts run headless in CI eventually; browse-tool's profile model is single-user.

Default: keep Playwright in capture scripts (option 2). Reason: the scripts are batch tooling, not interactive sensor work — the methodology's "browse-tool default" is about the latter. Mark with a header comment in each capture script.

## Brand tokens (token shell only; values land with D7)

`shared.css` already exposes CSS variables for `--bg`, `--card`, `--font-display`, `--space-*`, etc. The token *shape* is correct; the *values* are inherited from the template defaults. When D7 (v2 name + brand) lands, the value pass is a single-file edit in `shared.css` plus a font swap in `index.html`'s preconnect.

Until then: shell uses template defaults; prototype is recognizably "blueprint scaffolding" not "the v2 product." That's correct — premature brand work is its own ghost-design risk per Rule 1.

## File ownership

These files are owned by the v2 prototype work; don't drift to ad-hoc edits without updating this doc:

- `shared.css` — design tokens, layout primitives, component styles
- `proto-nav.js` — footer nav, drawers, comparison toggle, flow mode
- `proto-annotate.js` — opt-in annotation overlay
- `chat-widget.js` — chat FAB + window
- `_portal-shell.js` — shared header/footer JS
- `_meta/index.json` — portal manifest
- `_meta/<page>.json` — per-page metadata (one file per surface)
- `pages/<page>.html` — per-page HTML (one file per surface; canonical template at `pages/example.html` survives but is `noindex`)

Sub-template `template/portal/proto-annotate.OWNER-SPEC.md`, `template/portal/proto-nav.OWNER-SPEC.md`, `template/portal/functions/api/chat.OWNER-SPEC.md` exist in this directory — they document the owner contract for those files. Read before editing.

## What we do NOT engineer for

- React, BigDesign, any build pipeline — explicitly rejected by the portal/ template choice
- Multi-tenant or multi-user state — the prototype is stakeholder-facing read-only with optional client-side annotations
- Server-side rendering beyond what Pages Functions provide
- Authentication — `_headers` rules + cloudflare access if private viewing needed
