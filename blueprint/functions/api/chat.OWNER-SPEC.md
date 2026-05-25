---
tool: functions/api/chat.js
last_attested: 2026-05-23
max_unattested_days: 60
couples_with:
  - prototype/chat-widget.js (frontend caller)
  - prototype/_docs/*.md (system context corpus)
  - prototype/scripts/prep-deploy.sh (populates _docs/ at deploy time)
  - prototype/_headers (sets text/markdown content-type on _docs/)
  - wrangler.toml (compatibility_flags = ["nodejs_compat"])
convention_version: 1
---

# Owner-spec: functions/api/chat.js

## Purpose

Cloudflare Pages Function that proxies stakeholder questions to Claude (via OpenRouter) with the full blueprint documentation corpus loaded as system context. Lets reviewers ask grounded questions about any decision in the blueprint without leaving the portal.

The chat is the "Ask the substrate" affordance — borrowed from bc-subscriptions' subs-portal pattern.

## Why this shape

**Alternatives considered + rejected:**

- **Direct Anthropic API** (what v1 used). Rejected after all three 1Password Anthropic items returned `invalid x-api-key`. Switched to OpenRouter which gives us a single `blueprint-global` key that fans out to any model (Claude, GPT, etc.) without per-app key management.
- **Inline doc content as JS string constants in the function** (no runtime fetch). Rejected because docs change frequently and bundling them into the function means redeploying the function on every doc edit. Runtime fetch via ASSETS binding lets `prep-deploy.sh` update docs without function changes.
- **Vector search / RAG over docs** (instead of full-corpus stuffing). Rejected for v1. Our entire corpus is ~60KB — well under Haiku's context window. Stuffing the full corpus into the system prompt gives the model perfect recall and avoids the embedding-pipeline overhead. Revisit if corpus exceeds ~500KB.
- **Streaming responses** (instead of single-shot). Rejected for v1. Single-shot is simpler, latency is acceptable (~3s for Haiku), and the chat widget's UI is sized for single replies. Streaming would require server-sent events + widget rewrite.
- **Per-page filtered context** (only ship the relevant doc subset per page). Rejected — model would lose cross-cutting context. The page id IS included as a hint at the end of the system prompt so the model knows the user's current view.

## Inputs/outputs

**Reads at runtime:**
- `env.OPENROUTER_API_KEY` — required. Stored as Pages secret. Source: 1Password `blueprint-global` item (Developer Secrets vault).
- `env.ASSETS.fetch()` — Pages Functions binding to the static assets. Used to read `/_docs/*.md` files at runtime.
- Request body (POST JSON): `{ messages: [{role, content}], page?: string, pageTitle?: string }`.

**Writes/returns:**
- HTTP 200 with `{ reply: string }` on success.
- HTTP 400 with `{ error }` for missing API key or malformed body.
- HTTP 502 with `{ error, detail }` for upstream Anthropic/OpenRouter errors.

**Side effects:**
- Calls `https://openrouter.ai/api/v1/chat/completions` with `Authorization: Bearer ${OPENROUTER_API_KEY}`, `HTTP-Referer: https://blueprint.rallyhq.app`, `X-Title: Rally HQ Blueprint`.
- Caches the assembled system context in module-scope `SYSTEM_CONTEXT` variable (per Worker instance — survives across requests on the same warm instance).

## Model + cost

- **Model:** `anthropic/claude-haiku-4.5` via OpenRouter.
- **Max tokens:** 800 (single-shot response, no streaming).
- **System context size:** ~60KB of markdown (8 docs from `_docs/`).
- **Typical request cost:** ~$0.0008 per call at Haiku pricing (~30K input + 200 output tokens average).
- **Cold start:** ~500ms (Workers runtime + manifest assembly).
- **Warm response:** ~3s end-to-end (cached system context).

## Failure modes seen

1. **`Expired API Key` from OpenRouter** — all 3 Anthropic direct keys in 1Password returned this. Symptom: 502 with `Anthropic API error: 401`. Fix: rotate key at openrouter.ai and `wrangler pages secret put OPENROUTER_API_KEY`.
2. **Asset fetch returns 404** — if `prep-deploy.sh` wasn't run before `wrangler pages deploy`, the `_docs/*.md` files won't exist. Function silently produces a partial system context. Symptom: chat answers say "I don't have information on X" for topics that ARE in the source docs. Fix: always run `prep-deploy.sh` before deploy.
3. **Rate limit from OpenRouter** — at high concurrency. We've never hit it but the function returns the upstream 429 with detail message intact.
4. **Wrong working directory at cold start** — earlier version used `process.cwd()` for fs reads (Node-style). Failed on Workers. Fixed by switching to `env.ASSETS.fetch()` which is the Workers-native way to access deploy assets.
5. **CORS** — function returns `Content-Type: application/json` but no explicit CORS headers. Works because it's called from the same origin (blueprint.rallyhq.app). Would need CORS headers if called cross-origin.

## Coupling

- **Coupled with `chat-widget.js`** — the widget POSTs to `/api/chat` with a specific body shape. Schema changes must update both files.
- **Coupled with `prep-deploy.sh`** — the script copies blueprint docs into `_docs/` with specific filenames (`research-synthesis.md`, `cx-strategy.md`, etc.). The `DOCS` constant in this file references those exact filenames. Renaming a doc requires updating both.
- **Coupled with `_headers`** — the `/_docs/*` rule sets `Content-Type: text/markdown` which the function's `await res.text()` works with regardless. But if the rule is removed, browsers might choke on direct doc URLs.
- **Coupled with `wrangler.toml`** — must have `compatibility_flags = ["nodejs_compat"]` and the function file must be at `functions/api/chat.js` (Pages Functions convention).

## Maintainer playbook

**Rotate the API key:**

1. Generate new key at `openrouter.ai/keys`.
2. Update the 1Password `blueprint-global` item with the new value.
3. Push to Cloudflare:
   ```bash
   op item get "blueprint-global" --vault "Developer Secrets" --fields credential --reveal | \
     wrangler pages secret put OPENROUTER_API_KEY --project-name rally-hq-blueprint
   ```
4. Test by hitting the live chat from the portal.

**Add a new doc to the chat context:**

1. Add the source doc path → output filename mapping to `scripts/prep-deploy.sh`.
2. Add the `[slug, '/_docs/<filename>.md']` pair to the `DOCS` array in `chat.js`.
3. Run `./scripts/prep-deploy.sh` and redeploy.

**Switch model (e.g., to Sonnet for harder questions):**

1. Change the `model` value in the fetch body. Use OpenRouter's namespaced format: `anthropic/claude-sonnet-4.5`.
2. Cost goes up ~10× for Sonnet. Adjust `max_tokens` if needed.

**Debug a wrong answer:**

1. Check that the relevant doc IS in `_docs/` on the deployed site: `curl https://blueprint.rallyhq.app/_docs/<slug>.md`.
2. If not, run `prep-deploy.sh` and redeploy.
3. If the doc IS there, the model's response is grounded in what it sees — review the doc to fix the source.

**Danger zones:**

- **Don't read API keys from anywhere but `env`.** Hardcoding will leak to the bundle.
- **Don't increase `max_tokens` beyond 1500 without testing.** Pages Function execution-time limits + OpenRouter rate limits both come into play.
- **Don't add streaming without updating the widget.** Widget expects single-shot JSON.
- **Don't change the system prompt's voice instructions casually.** They were tuned to match Nino's voice (no hedging, no cheerleading, no emoji). Changes affect every answer.

## Known limits

- **No conversation history persistence** — each browser session is independent. The widget passes message history within a session but server doesn't store it.
- **No rate limiting** — function has no per-IP or per-session limit. OpenRouter's account-level limits are the only ceiling.
- **No content moderation** — function returns whatever Claude returns. Acceptable for an internal-noindexed stakeholder tool; would need a moderation pass for public use.
- **Cold-start cost** — first request after function idle reads all `_docs/*` from ASSETS (~50ms). Subsequent requests use cached `SYSTEM_CONTEXT`. Acceptable.
- **No streaming** — bigger answers feel slow because there's no progressive render. Defer until pain felt.
- **No tool use / function calling** — Haiku could in principle look up live data (e.g., current deployment state) via tools, but the blueprint is a static study. Adding tools is out of scope.
