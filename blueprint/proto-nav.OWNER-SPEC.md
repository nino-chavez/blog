---
tool: proto-nav.js
last_attested: 2026-05-23
max_unattested_days: 90
couples_with:
  - prototype/_meta/index.json
  - prototype/_meta/*.json
  - prototype/shared.css (CSS selectors .strategy-panel, .current-state-panel, .proto-footer-nav, .proto-flow-breadcrumb, .compare-toggle)
  - prototype/CONVENTIONS.md (page HTML contract)
convention_version: 1
---

# Owner-spec: proto-nav.js

## Purpose

`proto-nav.js` is the portal shell's navigation + chrome renderer. On every prototype page load it:

1. Fetches `/_meta/index.json` (the portal manifest).
2. Pre-loads every per-page `_meta/<id>.json` into a title cache.
3. Renders the sticky footer nav with a grouped page dropdown.
4. Renders the right "Strategy" drawer from the current page's `strategy` field.
5. Renders the left "Shipped state" drawer from the current page's `currentState` field.
6. Renders the proposed/split/shipped comparison toggle when the page has both `.proposed-view` and `.shipped-view` sections.
7. Renders a flow breadcrumb at the top of page when `?flow=<flow-id>` is in the URL.

It's the load-bearing piece that makes 12 separate HTML pages feel like one cohesive prototype studio.

## Why this shape

**Alternatives considered + rejected:**

- **React SPA with React Router** (the bc-subscriptions `prototype/` model). Rejected because Rally HQ has no React requirement and the static-HTML model is faster to read + zero build tax. The proto-nav.js IIFE achieves equivalent UX with ~300 lines of vanilla JS.
- **Auto-discovery via `import.meta.glob`** (bc-subs pattern). Rejected because we're not on Vite. Replaced with a `_meta/index.json` manifest + explicit page list. Trade-off: adding a page requires updating the manifest, but it's one JSON edit and prevents silent slice rot.
- **Hard-coded PAGES array in JS** (what we had pre-2026-05-23). Rejected because every nav change required editing JS. Manifest-driven is more authorable.
- **Inline strategy/currentState data in each HTML page** (what we had pre-refactor). Rejected because it duplicated content across the HTML and was hard to query — the chat function couldn't easily ingest per-page strategy. The `_meta/*.json` split makes the data machine-readable.

## Inputs/outputs

**Reads at runtime:**
- `/_meta/index.json` — manifest: `name`, `tagline`, `groups`, `pages` (array of ids), `flows` (array of `{id, label, summary, pages}`).
- `/_meta/<page-id>.json` for each page in the manifest — schema documented in `CONVENTIONS.md`.
- The DOM: looks for `window.PROTO_PAGE.id` on each page to identify which metadata file to load.
- `window.location.search` for `?flow=<flow-id>` parameter.

**Reads from index.html OR pages/*.html (per-page):**
- Optional `[data-compare-root]` element to attach the comparison toggle's data-view state to.
- Optional `[data-compare-toggle-mount]` element to anchor the toggle (otherwise auto-injects above `.proposed-view`).

**Writes to DOM:**
- Appends `.proto-footer-nav` to `<body>` (always).
- Appends `.strategy-panel` to `<body>` if the page has `strategy` metadata.
- Appends `.current-state-panel` to `<body>` if the page has `currentState` metadata.
- Appends `.proto-flow-breadcrumb` to `<body>` if `?flow=<id>` matches a flow whose pages include the current page id.
- Injects `.compare-toggle` into the page's compare-toggle mount point (or above the first `.proposed-view`).

**Side effects:**
- Mutates `window.PROTO_PAGE` to merge in the loaded metadata (so chat-widget.js can read the full context).
- Adds/removes `.open` class on panel elements when their toggle buttons are clicked.
- Sets `data-view` attribute on the compare-root element when the toggle is clicked.

## Failure modes seen

1. **Manifest load fails (404 or JSON parse error)** — proto-nav logs a warning and proceeds with an empty manifest. Footer nav still renders with just an Index option. **Symptom:** Footer dropdown only shows "Portal Index", no page list.
2. **Per-page metadata file missing** — proto-nav logs `meta load failed for <id>` and that page renders without strategy/current-state drawers. Footer dropdown still works but won't list the page. **Cause:** Page added to `_meta/index.json` but the corresponding `_meta/<id>.json` file wasn't created.
3. **Flow breadcrumb pushes content under top bar** — proto-nav assumes any page using a flow has CSS handling for `body:has(.proto-flow-breadcrumb)` which adds top padding. If a page sets `padding-top: 0` explicitly, the breadcrumb overlaps content. **Workaround:** That page CSS should respect the `:has()` selector or add its own top margin to top-level elements.
4. **Multiple `<body data-compare-root>` elements** — should never happen but if it does, only the first is used for compare toggle state. Subsequent ones get no toggle behavior.

## Coupling

- **Coupled with `CONVENTIONS.md` v1** — if the page HTML contract changes (e.g., renaming `data-compare-root` or `[data-compare-toggle-mount]`), update the constants in this file in lockstep.
- **Coupled with `shared.css`** — class names `.proto-footer-nav`, `.strategy-panel`, `.current-state-panel`, `.compare-toggle`, `.proto-flow-breadcrumb`, `.flow-nav-btn` are referenced in JS string templates. CSS renames must update JS.
- **Coupled with `_meta/*.json` schema** — the `strategy.{decision,why,shipped,gap,question}` and `currentState.{route,summary,sourceFiles,annotation}` keys are accessed directly. Schema changes require updating both the JSON files and this file.
- **Used by** `chat-widget.js` — chat-widget reads `window.PROTO_PAGE` after proto-nav has merged the metadata. If chat-widget loads before proto-nav, it sees only `{ id }`.

## Maintainer playbook

**Add a new page:**

1. Create `_meta/<new-id>.json` per the schema in `CONVENTIONS.md`.
2. Add `<new-id>` to the `pages` array in `_meta/index.json`.
3. Create `pages/<new-id>.html` with `window.PROTO_PAGE = { id: '<new-id>' };` and the standard script imports.
4. The page automatically appears in the footer dropdown grouped under its `group` field.

**Add a new flow:**

1. Add an entry to the `flows` array in `_meta/index.json`: `{ id, label, summary, pages: [...] }`.
2. Each page in the flow's `pages` array must exist in the `pages` array.
3. The flow becomes accessible via `?flow=<flow-id>` on any of its pages.

**Add a new audience group:**

1. Add an entry to the `groups` array in `_meta/index.json`.
2. Reference the new `group` id in per-page metadata.
3. The footer dropdown auto-groups; no further code change.

**Danger zones:**

- **Don't change the `init()` function's load order.** Manifest must load before per-page metadata before any DOM rendering.
- **Don't read `_meta/<id>.json` synchronously.** All loads are async; the title cache assumes this.
- **Don't reorder the drawer attachment** — strategy/current-state panels assume they're appended after the page body, before the footer nav. Reordering breaks z-index expectations.

## Known limits

- **No support for nested manifests** (e.g., manifest-of-manifests). If we ever split into sub-portals, the schema needs a `subPortals` field.
- **No client-side route changes** — every page navigation is a full page load. Acceptable for our scale (12 pages); would need React Router-equivalent for >100 pages.
- **Title cache is per-page-load** — every page fetches the full manifest + all per-page metadata. For 12 pages this is ~30KB of JSON, fast on Cloudflare's CDN. At >50 pages we'd want a lazy-load model.
- **No A/B variant rendering** — if a future need is "show version A vs version B" of a page, proto-nav has no concept of variants. Compare toggle handles proposed-vs-shipped only.
- **Annotation overlay is a separate file (`proto-annotate.js`)** — not coupled to proto-nav. Both expect `window.PROTO_PAGE.id` to be set before they init.
