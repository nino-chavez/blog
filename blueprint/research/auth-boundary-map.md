---
canonical: true
stage: 1
status: seeded
captured: 2026-05-26
sources:
  - astro-build/src/pages/blog/drafts/ (cookie auth pattern)
  - astro-build/src/pages/blog/draft/[slug].astro (token-cookie verification)
  - astro-build/src/pages/blog/private/[token]/[slug].astro (URL-as-credential pattern)
  - astro-build/src/content.config.ts (status enum: published / draft / unlisted)
---

# Auth boundary map

Signal Dispatch has three trust tiers across 24 routes. Each tier has distinct security mechanics, distinct visual cues, and distinct design-system implications. Without this map, the design system can't name the affordances that signal "you are in an editorial / pre-publish / unlisted context."

---

## Three trust tiers

### Tier 1 — Public (20 routes)

Default. SEO-indexed. Edge-cached.

All reader-facing surfaces:
- `/about` (parent domain)
- `/blog/` (home)
- `/blog/[slug]` (post detail — when `status: 'published'`)
- `/blog/archive`
- `/blog/whitepapers/`, `/blog/whitepapers/[slug]`
- `/blog/series/`, `/blog/series/[slug]`
- `/blog/counterpoints/`, `/blog/counterpoints/[slug]`
- `/blog/fiction/`, `/blog/fiction/[slug]`
- `/blog/presentations/`, `/blog/presentations/[slug]`
- `/blog/tutorials/`, `/blog/tutorials/[slug]`
- `/blog/tags/`, `/blog/tags/[tag]`
- `/research/` (only `visibility: 'published'` notes)
- `/research/[slug]` (only `visibility: 'published'` notes)

**Visual cue**: standard publication chrome. No banners.

---

### Tier 2 — Token-secret (`/blog/private/[token]/[slug]`)

**Mechanism**: URL itself is the credential. No auth check beyond the URL params matching a post's frontmatter.

**Schema requirement**: post must have BOTH `status: 'unlisted'` AND a non-empty `privateToken` field in frontmatter.

**Implementation** (`src/pages/blog/private/[token]/[slug].astro`):
```typescript
const { token, slug } = Astro.params;
const post = posts.find(
  (p) =>
    p.id === slug &&
    p.data.status === 'unlisted' &&
    p.data.privateToken === token
);
if (!post) return new Response('Not found', { status: 404 });
```

**Prerendered**: Yes (via `getStaticPaths()`). The token URLs are baked at build time, so only posts with explicit `privateToken` get private routes.

**Use case**: pre-publish sharing with specific reviewers without requiring login. Operator generates a token, sets it in the post's frontmatter, shares the URL with reviewer.

**Visual cue**: not yet documented in the audit. The route renders the published-looking version of the post. Open question: should there be a visual indicator that "this URL is private — do not share"? Currently no `DraftBanner` here (because the piece isn't a draft, it's an unlisted-published).

**Design system implication**: needs an `UnlistedBanner` primitive distinct from `DraftBanner` — communicates "this URL is for a private audience" without implying the content is unfinished.

---

### Tier 3 — Authenticated (4 routes)

**Mechanism**: HTTP-only cookie `draft_token`, value compared against `DRAFT_PREVIEW_TOKEN` env var.

**Routes**:
- `/blog/drafts/` — drafts index (token input form when not authenticated)
- `/blog/draft/[slug]` — single draft view (redirects to `/blog/drafts` if cookie absent or mismatched)
- `/blog/drafts/logout` — clears cookie, redirects back

**Flow**:
1. Unauthenticated visit to `/blog/drafts/` → renders token-input form
2. Form POSTs token → server sets `draft_token` cookie if it matches `DRAFT_PREVIEW_TOKEN`
3. Authenticated requests to `/blog/drafts/` → renders draft list (sorted by `publishedAt` desc)
4. Click into `/blog/draft/[slug]` → cookie revalidated; renders draft post with `DraftBanner` visible
5. `/blog/drafts/logout` → clears cookie, redirects to `/blog/drafts/` (which then shows form again)

**SSR mode**: drafts pages are NOT prerendered (per `export const prerender = false` implicit). Cookie check runs per-request.

**Config error state**: if `DRAFT_PREVIEW_TOKEN` env var is unset, `/blog/drafts/` renders a "Configuration Error" card — the auth form doesn't appear at all. Design-system primitive: `ConfigErrorCard`.

**Visual cues in current production** (from `drafts/index.astro` source):
- **Token input form**: dark card (`bg-zinc-900`), lock icon, password-type input, "Enter Preview Token" header, "Access restricted to authorized users" subhead
- **Config error card**: red-tinted card (`bg-red-900/20 border-red-500/30`), warning icon, "Configuration Error" heading, env-var instructions
- **Draft list view** (when authenticated): "Draft Posts" h1, "Preview and manage unpublished content" subhead, list of drafts with `categoryColors` mapping
- **`DraftBanner`**: visible at top of every authenticated draft view, signals "this is an unpublished piece"

**Design system implication**: this tier introduces a *different visual register* — darker, more utilitarian, less editorial. The auth surfaces aren't meant for readers; they're meant for the editor mid-workflow. The design system needs separate vocabulary for:
- `AuthForm` (token input + helper text)
- `DraftBanner` (top-of-page unfinished marker)
- `ConfigErrorCard` (env-misconfiguration explainer)
- `DraftListItem` (workflow-status indicator row)
- `LogoutAffordance` (visible signout option for the authenticated session)

---

## State machine — content `status` × URL access

| Content `status` | Public route works? | Private-token route works? | Draft route works? | Indexed in RSS / sitemap? |
|---|---|---|---|---|
| `published` | ✓ | n/a | n/a | ✓ |
| `unlisted` (+ `privateToken`) | ✗ (404) | ✓ (when `/[token]/` matches) | ✗ | ✗ |
| `unlisted` (no `privateToken`) | ✗ (404) | n/a | ✗ | ✗ |
| `draft` | ✗ | n/a | ✓ (with cookie auth) | ✗ |

**Observation**: an `unlisted` post WITHOUT a `privateToken` is effectively orphaned — no URL renders it. This is a possible schema-validity gap worth flagging.

---

## Design-system implications

The auth boundary map produces five design-system requirements that prior sessions missed entirely:

1. **`DraftBanner`** (Tier 3) — high-contrast top-of-page marker on every authenticated draft view. Must be visually unmissable so the editor can't mistake a draft for a published piece.

2. **`UnlistedBanner`** (Tier 2) — softer cue distinguishing "this URL is private but the content is finished" from "this is a draft." Different visual language than DraftBanner.

3. **`AuthForm`** (Tier 3 entry) — token input form with `password` field, helper text, error states for invalid token + missing env config. Lives at `/blog/drafts/` for unauthenticated visitors.

4. **`ConfigErrorCard`** (Tier 3 fallback) — explicit env-misconfiguration explainer with remediation instructions. Critical for operator-facing error states.

5. **`AuthBoundaryChrome`** (Tier 3 navigation) — the editor surfaces (`/blog/drafts/`, `/blog/draft/[slug]`) need access to a logout affordance + a clear cue that they're in a workflow context, not a reader context. Currently they share `SiteHeader` with the public chrome, which may be too subtle.

**Methodology implication**: persona research (peer architect, hiring evaluator, AI-curious IC) covers READERS. It does not cover the operator-as-editor. Stage 1 needs a fourth persona — *the editor mid-workflow* — whose JTBDs include: "review my draft before publishing," "share an unlisted piece with a specific reviewer," "land back in the drafts list after logging in," "logout securely." Without that persona, the design treatment of Tier 2 + Tier 3 surfaces gets neglected. Candidate addition to `research/personas/`.
