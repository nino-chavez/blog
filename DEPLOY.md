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

## Content workflow (local-only as of 2026-06-11)
1. Draft post as `status: "draft"` in `astro-build/src/content/blog/`
2. Feature image: `cd astro-build && OPENROUTER_API_KEY=... node scripts/generate-illustration-images.js --dir blog "<slug>.mdx"` (retries + QA gate built in; naming a file always regenerates it)
3. Proofread at `/blog/draft/<slug>` via `npm run dev` (no token gate)
4. Flip `status: "published"`, update `publishedAt`, build, commit, push

The remote draft-publish path (publish-draft.yml, generate-image.yml, the `/blog/api/` trigger routes) was removed 2026-06-11 — it was unauthenticated after the token-gate removal. `publish-blog-post.yml` (issue-driven) is the only remaining workflow.

## Environment variables
- `astro-build/.env` — `OPENROUTER_API_KEY` (local image generation)
- GH Actions secrets — used by `publish-blog-post.yml`
- `DRAFT_PREVIEW_TOKEN` — dead config since the gate removal; removable from `.env.local` and host env

## Preflight checks
- `cd astro-build && npm run build` succeeds locally
- `git status` clean

## Verify after deploy
- `curl -sI https://ninochavez.co/blog/<new-slug>` returns 200 (allow a minute or two for the Pages build)

## Authority limits
- Cannot trigger GH Actions on a different repo
