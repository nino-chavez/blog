---
tool: proto-annotate.js
last_attested: 2026-05-23
max_unattested_days: 90
couples_with:
  - prototype/shared.css (.anno-* selectors)
  - prototype/CONVENTIONS.md (Stage 7 — Iterate section)
convention_version: 1
---

# Owner-spec: proto-annotate.js

## Purpose

Opt-in stakeholder annotation overlay. Lets a reviewer (or anyone with browser access) click any non-chrome element on a prototype page and leave a note. Notes persist in browser localStorage keyed by page id. Provides the per-page markers, a list-panel viewer, popover edit/delete/resolve flow, and a small console API (`window.rallyAnno`).

This is the Stage 7 (Iterate) load-bearing piece — without it, stakeholder feedback exists only in Slack / docs and never round-trips back to the prototype.

## Why this shape

**Alternatives considered + rejected:**

- **Server-side persistence via Pages KV** — Rejected for v1. Cross-stakeholder sync would be nice but adds a Pages Function + KV namespace + sync logic for a feature that's still being validated. localStorage proves the UX first; KV is a Phase-2 swap.
- **Comment threads instead of single notes** — Rejected for v1. Too much chrome. Single notes with edit/resolve covers the primary use case. Threads added if multiple stakeholders need to converse on one annotation (defer until pain felt).
- **Annotation always-on (not opt-in)** — Rejected. Annotation mode adds visual noise (the FAB, markers, mode cursor) that distracts from prototype review. Opt-in is correct.
- **Pinning to absolute pixel coords** (instead of CSS selector) — Rejected as primary. We DO store pageX/pageY for marker position but the canonical "what was annotated" is the computed CSS selector. Pixel coords are presentational fallback.
- **Using an existing library (e.g., annotorious, hypothesis)** — Rejected for the same reason as the broader portal: zero deps. The annotation feature is ~400 lines of vanilla JS and doesn't justify a third-party dep.

## Inputs/outputs

**Reads at runtime:**
- `window.PROTO_PAGE.id` — to scope notes to the current page.
- `localStorage.getItem('rally-anno-enabled')` — only initializes if this is `'true'`.
- `localStorage.getItem('rally-anno-notes-v1')` — the notes corpus.

**Writes:**
- `localStorage.setItem('rally-anno-notes-v1', ...)` — every CRUD operation persists.
- DOM: appends `.anno-fab`, `.anno-list-panel`, `.anno-marker` (one per note), `.anno-popover` (transient).
- Adds/removes `.anno-mode-active` class on `<body>` while in annotate mode (changes cursor to crosshair).

**Side effects:**
- Captures `document.addEventListener('click', ..., true)` while in annotate mode — capture phase so it intercepts before page click handlers.
- Exposes `window.rallyAnno` global with `{enable, disable, export, clear}` methods.

## Note schema

```ts
interface Note {
  id: string;          // 'n-<timestamp>-<rand>'
  pageId: string;      // matches window.PROTO_PAGE.id
  selector: string;    // computed CSS selector path (max 6 levels deep)
  x: number;           // pageX at click time
  y: number;           // pageY at click time
  body: string;        // the note text
  createdAt: number;   // Date.now()
  resolved: boolean;   // resolved notes are dimmed
}
```

## Failure modes seen

1. **Selector becomes invalid after HTML change** — If page HTML is restructured between annotation and review, the computed selector may no longer match an element. Marker still draws at stored pageX/pageY (so the annotation isn't lost), but `focusNote()` can't scroll to the right place. **Mitigation:** add a "Re-anchor" affordance to the popover (defer until pain felt).
2. **localStorage quota exceeded** — At ~5MB localStorage limit, a project with thousands of long notes would fail silently. `saveNotes()` swallows the error. **Mitigation:** add quota check + warning UI when notes exceed 100 (defer).
3. **Notes are per-browser** — If a reviewer opens the portal in Chrome and another in Firefox, they see different notes. This is the canonical "v1 limit" call-out in `CONVENTIONS.md`. **Path to fix:** Pages Function backed by KV (Phase 2).
4. **Annotation FAB collides with chat FAB** — Both are bottom-corner. Chat is bottom-right (already in shared.css), annotation is bottom-LEFT to avoid collision. If a third FAB is added, plan the corner allocation.
5. **Capture-phase click handler intercepts intended page clicks** — When annotate mode is on, clicking ANY non-chrome element creates a note instead of triggering the page's own click. This is correct behavior but can surprise users. The cursor changes to crosshair as the visual cue.

## Coupling

- **Coupled with `shared.css`** — selectors `.anno-fab`, `.anno-mode-active`, `.anno-marker`, `.anno-marker.resolved`, `.anno-popover`, `.anno-list-panel`, `.anno-list-header`, `.anno-list-body`, `.anno-list-empty`, `.anno-item`, `.anno-actions`, `.btn-primary`, `.btn-secondary` are referenced by class name. CSS renames require JS update.
- **Coupled with `proto-nav.js`** indirectly — both rely on `window.PROTO_PAGE.id`. Order doesn't matter because annotate is deferred and reads PAGE on init.
- **Coupled with `chat-widget.js`** — same FAB-corner convention; both honor `isHarnessChrome()` checks to avoid intercepting each other.

## Maintainer playbook

**Enable annotation mode for a stakeholder demo:**

1. In the stakeholder's browser DevTools console:
   ```js
   localStorage.setItem('rally-anno-enabled', 'true')
   location.reload()
   ```
2. The 💬 FAB appears bottom-left. Walk them through clicking "+ Add" then clicking any element.

**Export notes for sharing:**

```js
window.rallyAnno.export() // returns JSON string of all notes
```

Paste into a doc or commit to the repo for asynchronous review.

**Clear all notes (destructive):**

```js
window.rallyAnno.clear() // wipes localStorage, reloads
```

**Add a new field to the note schema:**

1. Update the `addNote()` function to capture the new field.
2. Update `buildListItem()` and the popover to render/edit it.
3. Bump the localStorage key from `rally-anno-notes-v1` → `rally-anno-notes-v2` AND write a one-time migration that reads the old key on init.
4. **Don't change v1 in place** — existing notes would lose data.

**Danger zones:**

- **Don't bump the schema key without a migration.** Stakeholders' existing notes are valuable — losing them is a trust break.
- **Don't change `isHarnessChrome()` to be more permissive.** Currently excludes FABs, panels, drawers, markers, popovers. Adding to this list is fine; removing requires audit (you might intercept clicks meant for harness).
- **Don't replace the selector computation with something smarter.** The current 6-level cap + class/tag-only is intentionally simple — robust selectors are fragile in their own way. Don't reach for `unique-selector` libs.

## Known limits

- Per-browser only (no cross-stakeholder sync). Phase 2 target.
- No element re-anchoring if HTML changes. Pixel-coord fallback covers most cases.
- No annotation threads / replies. Single-note model.
- No author attribution (multi-user uses sync). Each browser is anonymous.
- No filtering / search across notes. List panel shows all notes for the current page, newest first.
- No export to GitHub Issues / Linear / Slack. Console-export-to-JSON only.
