# Deploy — blog (Signal Dispatch)

Verified 2026-06-11 by observing a live deploy (post pushed to main, served in production with no manual step).

## Host
- **Platform**: Cloudflare Pages — project `ninochavez-blog` (`wrangler.toml`, build output `astro-build/dist`)
- **Production URL**: `https://ninochavez.co/blog/...` (responses show `server: cloudflare` + `cf-ray`, no Vercel headers)
- **`blog.ninochavez.co`**: 301s into `ninochavez.co/blog/...`
- **Apex routing**: `ninochavez.co` is the `ninochavez-router` Worker (`~/Workspace/dev/apps/router/`) proxying a hardcoded prefix list (`/blog`, `/_astro`, `/pagefind`, ...) to `ninochavez-blog.pages.dev`. A new top-level path in `dist/` 404s on the apex until added to `blogPrefixes` + manual `npm run deploy` there — blog deploys alone can't fix apex 404s (this is how production search broke 2026-06-03 → 2026-06-11).
- **`vercel.json`**: legacy/redirect duty only (root → `ninochavez.co/blog`). NOT the canonical host. Safe to ignore for deploys.

## Deploy trigger
- **Canonical**: push to `main` → Cloudflare Pages git integration builds and deploys automatically.
- **Manual fallback**: `cd astro-build && npm run build && cd .. && wrangler pages deploy astro-build/dist --project-name=ninochavez-blog`

## Database
- None (static Astro + Pages Functions). Content lives in `astro-build/src/content/`.

## Content publishing workflow

1. Draft the post as `status: "draft"` in `astro-build/src/content/blog/`; finish voice and clarity review before recording.
2. Generate and inspect its feature image through the existing illustration command.
3. Prepare and generate its read-aloud recording with the selected British narrator. Read-aloud is standard for new blog posts; follow [the Listen procedure](docs/listen.md). Prepare it from the final draft so the article and actual recording can be reviewed together. Obtain Nino's approval of the actual audio before public promotion. Only an explicit direction from Nino skips narration.
4. For a private article preview, use the unlisted/token route described in `.claude/CLAUDE.md`. A draft has no public route; there is no `/blog/draft/<slug>` page.
5. Promote only the approved MP3 and matching source/audio hashes, set `status: "published"`, update `publishedAt`, and run `npm run test:listen` and `npm run build` from `astro-build/`.
6. Commit, push and merge through review and required checks. The Pages git integration deploys `main`.

This is the canonical local authoring route. The legacy issue-driven job is not a substitute for the recording-review and approval steps; do not use it to bypass this workflow.

The remote draft-publish path (publish-draft.yml, generate-image.yml, the `/blog/api/` trigger routes) was removed 2026-06-11 — it was unauthenticated after the token-gate removal. `publish-blog-post.yml` (issue-driven) is the only remaining workflow.

## Environment variables
- `astro-build/.env` — `OPENROUTER_API_KEY` (local image generation)
- GH Actions secrets — used by `publish-blog-post.yml`
- `DRAFT_PREVIEW_TOKEN` — dead config since the gate removal; removable from `.env.local` and host env

## Preflight checks
- `cd astro-build && npm run build` succeeds locally
- `git status` clean

## Verify after deploy
- Confirm the deployed article returns HTTP 200 and displays one Listen player with the selected narrator disclosure.
- From `astro-build/`, run `npm run listen:check-live` for exact approved bytes, HEAD and range delivery.
- In a dedicated headless browser, verify actual play, pause, seek and resumed playback, then leave the player paused. A hidden shared tab can defer media loading; a timeout there alone does not establish a delivery failure.
- Retain the live verification receipt with the article's review evidence.

## Authority limits
- Cannot trigger GH Actions on a different repo
