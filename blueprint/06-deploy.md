---
stage: 6
variant: greenfield
status: skeletal — describes the deploy shape; runs after Stages 3-5 stabilize
input: blueprint/03-prototype-plan.md, blueprint/05-documents.md
---

# Stage 6 — Deploy

Per methodology, Stage 6 deploys the prototype + documents as a stakeholder-shareable URL. For Tier 1 / Pattern B, the deploy target is Cloudflare Pages — the template's canonical default and the production reference (`blueprint.rallyhq.app`).

## Deploy target

- **Project**: `signal-dispatch-v2-blueprint` (Cloudflare Pages)
- **Branch**: `main` for the production prototype; preview deploys per PR
- **Domain**: `blueprint.ninochavez.co` or `v2-blueprint.ninochavez.co` (DNS decision; default to whichever fits the existing `ninochavez.co` subdomain ladder)
- **Index posture**: `_headers` already includes `noindex, nofollow` — preserve. The v2 prototype is not a public surface; it's a stakeholder review.

## Deploy plumbing (already in place from template/portal)

- `wrangler.toml` — Pages project config (rename `PROJECT_SLUG` placeholder if it survives)
- `scripts/prep-deploy.sh` — copies blueprint docs into `_docs/` so the docs viewer serves them
- `functions/api/chat.js` — Pages Function for the chat widget; needs `OPENROUTER_API_KEY` set as a Pages secret
- `_headers` — Pages cache + noindex rules

## First-deploy checklist (deferred until Stages 3-4 stabilize)

```bash
# from blueprint/ root
./scripts/prep-deploy.sh

wrangler pages project create signal-dispatch-v2-blueprint \
  --production-branch main \
  --compatibility-flags nodejs_compat

echo "$OPENROUTER_KEY" | wrangler pages secret put OPENROUTER_API_KEY \
  --project-name signal-dispatch-v2-blueprint

wrangler pages deploy . \
  --project-name signal-dispatch-v2-blueprint \
  --branch main \
  --commit-dirty=true
```

(Replace `$OPENROUTER_KEY` with the actual key from 1Password.)

## Pre-deploy gates

These have to pass before any external share:

1. Stage 4 fact-check is run (no unverified claims live)
2. D1 + D2 + D7 are decided (no placeholder `<v2-name>` in prototype copy)
3. At least the home page + 2-3 other surfaces have shipped HTML (not just `_meta/` stubs)
4. Lighthouse-CI passes on preview URL
5. `_headers` `noindex` rules verified live (curl + check headers)

## What does NOT deploy in Stage 6

- Production blog v2 (the live `ninochavez.co/blog` cutover) — that's a separate downstream initiative, not a blueprint stage. Blueprint ships the prototype; cutover is what happens after stakeholder review approves the design.
- Any chat-widget responses sourcing from v1-baseline/ — chat corpus needs to be v2 docs only post-Stage 5, or readers may get confused signal.

## When this stage runs

After Stages 1-5 stabilize. Preview deploys can run earlier and often (Cloudflare Pages auto-deploys per push to non-main branches), but the "Stage 6 ship" is the first stable production deploy that an external stakeholder gets a URL to.

## Skeletal until Stages 3-5 produce buildable surfaces

The mechanics are clear (canonical template/portal recipe); the work is gated on having something worth deploying. This doc captures intent and the recipe; the actual deploy run happens after upstream stabilizes.
