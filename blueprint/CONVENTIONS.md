# Blueprint Portal Conventions

**Version 2 (2026-05-23).** Canonical convention set for blueprint **portal-mode** projects (static HTML + Cloudflare Pages Functions). For React/BigDesign projects, use `template/prototype/` instead.

---

## The Core Rule

**The product UI must be visually indistinguishable from what would actually ship. Anything that exists only because this is a prototype lives in the harness chrome, never in the page body.**

Reviewers should be able to look at any page and answer "yes, this is what we'd ship" without mentally subtracting prototype scaffolding. The harness chrome — top brand bar, slice header, slice sidebar, proposed/compare/shipped toggle, flow breadcrumb, annotation FAB, AI chat FAB — are all fixed-position overlays. None live inside `.proposed-view` or `.shipped-view`.

---

## The shell, top-down

Every prototype page (not the front door / studio catalog) renders with this chrome:

1. **Top brand bar** (36px, dark) — fixed at top. Always-visible portal nav (Front door / Prototype / Docs). Cross-page identity.
2. **Slice header bar** (44px, light) — fixed at top: 36px. Per-slice breadcrumb (`Prototype › <Slice> › <Page>`), production-surface code reference, compact `PROPOSED / COMPARE / SHIPPED` pill, finding/principle trace badges.
3. **Page's own header** — whatever the page renders inside `.proposed-view`. Production-indistinguishable.
4. **Page body** — the proposed surface.
5. **Slice sidebar** (240px, light) — fixed at left, visible ≥1080px. Pages-in-slice list with active highlight + flows-through-slice with start-flow buttons.
6. **Drawer triggers** — Strategy and Shipped drawers open from buttons in the slice header.
7. **AI chat FAB** — bottom-right, always available.
8. **Annotation FAB** — bottom-left, opt-in (`localStorage.setItem('rally-anno-enabled','true')`).

This stack is built by `proto-nav.js` + `proto-annotate.js` + `chat-widget.js`. Pages don't render any of it directly.

---

## Slice schema

Slices group related pages under one persona / audience / surface. A slice can have 1 page (single-page slice) or many.

`_meta/slices/<slice-id>.json`:

```json
{
  "id": "<slice-id>",
  "label": "Human-readable label",
  "color": "brand|accent|neutral",
  "summary": "One-paragraph description. Kept under ~200 chars.",
  "production_surface": "src/routes/.../*.svelte — comma- or path-list of the production files",
  "primary_persona": "P1 Persona Name (S<n> Stage Name)",
  "findings_cited": ["Finding #1", "Finding #2"],
  "principles_cited": ["R1", "R2"],
  "phase": "MVP|Phase 1|Phase 2|Phase 3",
  "pages": ["page-id-1", "page-id-2"],
  "flows_touching_this_slice": ["flow-id"]
}
```

Listed in `_meta/index.json` under the top-level `slices` array.

---

## Page schema

`_meta/<page-id>.json`:

```json
{
  "id": "<page-id>",
  "title": "Human-Readable Title",
  "group": "<group-id>",
  "slice": "<slice-id>",
  "surface": "<production-surface-this-maps-to>",
  "phase": "MVP|Phase 1|Phase 2|Phase 3",
  "route": "/pages/<page-id>.html",
  "summary": "One-sentence description used on the studio catalog card.",
  "strategy": {
    "decision": "What design choice does this page make?",
    "why": "Which finding/rule does it implement? Inline markdown allowed.",
    "shipped": "How does the shipped product render this surface today?",
    "gap": "Proposed vs shipped in one row.",
    "question": "What needs primary-research validation?"
  },
  "currentState": {
    "route": "/path/in/shipped/app",
    "summary": "What exists today.",
    "sourceFiles": ["src/routes/.../+page.svelte"],
    "annotation": "How does the proposed differ?"
  }
}
```

The `slice` field links the page to a slice (which renders the per-slice sidebar). Pages declare only `window.PROTO_PAGE = { id: '<page-id>' };` in the HTML — everything else loads from the JSON.

---

## Page HTML contract

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>{Page Title} — PROJECT_NAME Blueprint</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/shared.css">
</head>
<body data-compare-root data-view="proposed">
  <section class="proposed-view">
    <!-- What we'd ship. Production-indistinguishable. -->
  </section>
  <section class="shipped-view">
    <!-- Mock or screenshot of what exists today. -->
  </section>
  <script>
    window.PROTO_PAGE = { id: '<page-id>' };
  </script>
  <script src="/proto-nav.js"></script>
  <script src="/chat-widget.js" defer></script>
  <script src="/proto-annotate.js" defer></script>
</body>
</html>
```

**Use absolute paths (`/shared.css`, `/proto-nav.js`)** — relative paths break when Cloudflare Pages serves the file from a different URL than expected.

---

## Tokens & typography

All visual tokens come from `shared.css`. Never hardcode hex colors or px values in a page's `<style>` block.

**Default fonts** in the template: Inter (display + body) + JetBrains Mono (data). For projects that need a hero display font (sport, editorial, etc.), add `--font-hero` and reserve it for h1 / hero moments — never for body or small headings.

---

## Comparison toggle

Pages with a meaningful "different from shipped" story include both `.proposed-view` and `.shipped-view` sections inside `<body data-compare-root data-view="proposed">`. `proto-nav.js` auto-injects the toggle into the slice header. Pages with no shipped equivalent can omit `.shipped-view` and the toggle won't render.

---

## Flow definitions

Multi-page journeys live in `_meta/index.json` under `flows`:

```json
{
  "id": "main-journey",
  "label": "Main journey",
  "summary": "How a primary persona moves through the product.",
  "pages": ["page-a", "page-b", "page-c"]
}
```

Append `?flow=<flow-id>` to any prototype URL and `proto-nav.js` renders a top-of-page breadcrumb with prev/next page links.

Flows declared in `flows_touching_this_slice` on a slice get listed in that slice's sidebar with "Start flow →" deep-links to the flow's first page.

---

## Anti-patterns (reject any PR that does these)

| Anti-pattern | Why it fails |
|---|---|
| Inline `font-family: var(--font-hero)` on body text | Display fonts are unreadable at small sizes. Never. |
| Hardcoded hex colors | Tokens in `shared.css` exist for a reason. |
| "This is a mock" framing inside `.proposed-view` | Product UI must look like production. Put framing in the strategy panel via per-page JSON. |
| Page-level `@media (prefers-color-scheme: dark)` blocks | Theme handling belongs in tokens. |
| Full PROTO_PAGE data inline | Whole point of `_meta/*.json` is centralization. |
| Hard-coded path arrays in nav code | `proto-nav.js` derives nav from `_meta/index.json`. Don't reinvent. |
| Relative paths to shell assets (`./shared.css`, `../proto-nav.js`) | Pages serves the same file at multiple URLs; relative paths break. Absolute only. |
| Heavy JS deps (React, Vue) | Portal is plain HTML / CSS / vanilla JS. Adding a framework requires explicit conversation. |
| Real customer data anywhere | Synthetic personas only. No real PII even in placeholders. |
| Direct edits to `_docs/` | `_docs/` is auto-copied by `scripts/prep-deploy.sh`. Edit canonical source. |
| Editing page chrome (footer nav, slice header) per-page | All harness chrome is built by proto-nav.js. Pages don't render it directly. |

---

## Stage 7 (Iterate) — annotation overlay

Stakeholders enable per-browser annotation mode via:

```js
localStorage.setItem('rally-anno-enabled', 'true')
location.reload()
```

A 💬 FAB appears bottom-left. Toggle "Annotating" then click any element on the page to drop a note. Notes persist in localStorage keyed by page id. Console helpers: `window.rallyAnno.export()`, `window.rallyAnno.clear()`.

Notes are per-browser. Cross-stakeholder sync is a Phase-2 task — would add a Pages Function backed by Cloudflare KV.

---

## OWNER-SPEC docs

Three OWNER-SPEC.md files ship with the shell — `proto-nav.OWNER-SPEC.md`, `proto-annotate.OWNER-SPEC.md`, `functions/api/chat.OWNER-SPEC.md`. They document each tool's purpose, alternatives considered, failure modes seen, coupling, and maintainer playbook. Don't modify them unless you're modifying the underlying tool — the `last_attested` date in the frontmatter is mechanically lint-checked.

For project-specific tools added on top of the shell, follow the same pattern: `tools/<tool-name>/OWNER-SPEC.md` per the upstream blueprint `owner-spec-pattern.md`.

---

## Deploy

```bash
# From your project's blueprint/ root:
./portal/scripts/prep-deploy.sh
cd portal
wrangler pages deploy . --project-name <PROJECT_SLUG>-blueprint --branch main --commit-dirty=true
```

The `wrangler.toml` at `portal/` root is required so wrangler detects `functions/` and compiles them as Pages Functions.

### Required env vars on the Pages project

- `OPENROUTER_API_KEY` — powers the chat function. Stored as Pages secret. Source: 1Password `blueprint-global` item (or rotate per-project).

### Optional: custom subdomain

```bash
# Attach <PROJECT_SLUG>-blueprint.<your-domain> as custom domain in the
# Cloudflare Pages dashboard, or via the Pages API + DNS API.
# See the rally-hq blueprint commits for a worked example.
```

---

## Versioning

**v2 (2026-05-23)** — slice architecture: slice-aware per-page metadata, slice sidebar, slice header bar, top brand bar, retired the v1 footer nav. Multi-page slices (one slice can have many pages) are first-class.

**v1 (earlier 2026-05-23)** — initial portal shell with `_meta/*.json` page metadata, footer nav, comparison toggle, annotation overlay, chat widget.

Material changes (renaming tokens, changing required metadata fields, breaking the page HTML contract) bump the major version and require updating all existing pages in the same PR.
