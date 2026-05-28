# Research — Brownfield Stage 1

Five required legs per `~/Workspace/dev/tools/blueprint/docs/variant-selection.md`. The `research-completeness-reviewer` gate blocks Stage 2 until all five are populated.

| Leg | Path | What lives here |
|---|---|---|
| Current state | `current-state/` | Screenshots of live surfaces (`<surface>--<breakpoint>.png`) and per-surface annotation notes. Production URL: `https://ninochavez.co/blog`. |
| Personas | `personas/` | Reader archetypes the blog serves — peer architects, recruiters, hiring directors, AI-curious ICs, RSS subscribers. Evidence cite per archetype. |
| Funnel | `funnel/` | Discovery → first-read → return-read → subscribe paths. Where readers drop and why (analytics if available, inferred-from-surface otherwise). |
| Competitive | `competitive/` | Peer architect/operator blogs (Charity Majors, Will Larson, Lethain, Pragmatic Engineer) and adjacent platforms (Stratechery, Hivemind) — what they get right that informs prescription. |
| Synthesis | `../01-diagnose.md` | Synthesizes the four leg-evidence into the audit narrative. Authored last. |

## Capture conventions (current-state)

- File name: `<surface>--<breakpoint>.png` (e.g., `home--1440.png`, `post-detail--375.png`).
- Breakpoints: `375` / `768` / `1024` / `1440` minimum. Add `1920` if a finding depends on ultra-wide layout.
- Source: production at `https://ninochavez.co/blog` (per the corrected SEO posture, this is canonical; `blog.ninochavez.co` redirects in).
- Per-surface notes: optional `<surface>--notes.md` alongside the captures, only if the screenshot alone won't tell the story.

### Captures are NOT committed

The PNGs are regenerated deterministically from `blueprint/scripts/capture-current-state.mjs`. `current-state/.gitignore` excludes them from version control. To re-verify a finding cited by filename in `01-diagnose.md`:

```bash
# 1. Start browse-tool with the initiative profile
browse-start --profile-name signal-dispatch-blueprint

# 2. Re-capture (idempotent; overwrites)
node blueprint/scripts/capture-current-state.mjs

# 3. Stop the browser
browse-stop
```

The surface × breakpoint matrix lives in the script. Add a surface or breakpoint there, not by stamping files manually.
