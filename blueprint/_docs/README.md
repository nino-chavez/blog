# Blueprint Portal Template (Static HTML)

The canonical blueprint portal shell as of 2026-05-23. Static HTML + Cloudflare Pages Functions. Replaces the React/BigDesign prototype model for non-BC projects.

## When to use this

- New blueprint initiative that isn't BC/BigDesign-bound
- Stakeholder communication tool — interactive prototype + strategy docs + AI chat
- Cloudflare-first infrastructure (Pages + Workers + R2)

## When NOT to use this

- Project already on BigDesign / React 18.3 (use `template/prototype/` — the legacy Vite + React shell)
- Need server-side state beyond what Pages Functions can do (use a real Workers project)
- Need a build pipeline (this is intentionally zero-build)

## What's in here

```
portal/
├── _meta/
│   ├── index.json              ← portal manifest: groups, pages, flows
│   ├── example.json            ← per-page metadata template
│   └── <page-id>.json          ← one per page (see CONVENTIONS.md)
├── pages/
│   └── example.html            ← per-page HTML template
├── functions/
│   └── api/
│       └── chat.js             ← Pages Function: OpenRouter-backed chat
├── docs/
│   └── index.html              ← markdown viewer for blueprint docs
├── _docs/                      ← populated by scripts/prep-deploy.sh
├── scripts/
│   └── prep-deploy.sh          ← copies blueprint docs into _docs/
├── _headers                    ← Pages cache + noindex rules
├── wrangler.toml               ← Pages project config (REPLACE PROJECT_SLUG)
├── index.html                  ← portal entry (auto-renders cards from manifest)
├── shared.css                  ← tokens + layout primitives + components
├── proto-nav.js                ← footer nav + drawers + comparison toggle + flow mode
├── proto-annotate.js           ← annotation overlay (opt-in stakeholder notes)
├── chat-widget.js              ← chat FAB + window (calls functions/api/chat.js)
├── CONVENTIONS.md              ← MUST READ before adding a page
└── README.md                   ← this file
```

## Quick start for a new project

1. Copy `template/portal/` → `your-project/blueprint/portal/`.
2. Replace `PROJECT_SLUG` / `PROJECT_NAME` placeholders in:
   - `wrangler.toml`
   - `_meta/index.json`
   - `index.html`
   - `pages/example.html`
3. Customize tokens at the top of `shared.css` for your brand.
4. Write your first page:
   - `_meta/<page-id>.json` (copy `example.json`, fill in)
   - `pages/<page-id>.html` (copy `example.html`, fill in)
   - Add `<page-id>` to `_meta/index.json` `pages` array
5. Customize `scripts/prep-deploy.sh` if your blueprint docs live elsewhere.
6. Deploy:
   ```bash
   ./scripts/prep-deploy.sh
   wrangler pages project create <PROJECT_SLUG>-blueprint --production-branch main --compatibility-flags nodejs_compat
   echo "$OPENROUTER_KEY" | wrangler pages secret put OPENROUTER_API_KEY --project-name <PROJECT_SLUG>-blueprint
   wrangler pages deploy . --project-name <PROJECT_SLUG>-blueprint --branch main --commit-dirty=true
   ```

## Production reference

The Rally HQ blueprint at `apps/rally-hq/blueprint/portal/` is the worked example this template was extracted from. See `https://blueprint.rallyhq.app/` for the live deployment.

## See also

- `template/portal/CONVENTIONS.md` — the contract for every page
- `wip/blueprint/METHODOLOGY.md` — the 7-stage pipeline this fits into
- Rally HQ blueprint commit history under `apps/rally-hq/` for end-to-end examples
