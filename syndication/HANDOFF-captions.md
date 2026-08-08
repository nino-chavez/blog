# Handoff: LinkedIn captions

Paste the block below into a fresh session started in `~/Workspace/dev/apps/blog`.

Everything it needs is on disk. Nothing about the pipeline needs re-deriving —
if something here disagrees with `README.md`, the README wins.

---

Write LinkedIn captions for the Signal Dispatch syndication queue.

**Load `docs/signal-dispatch-voice-guide.md` before drafting anything.** This is
prose for a human reader, not terminal output. The terminal/CLI voice stack does
not cover it, and drafting from that alone produces generic thoughtful-LinkedIn
cadence. Mode is Thought Leadership: composed, evidence-aware, and provisional
only where the source remains uncertain.

**What to write**

```bash
node syndication/build-queue.mjs --due --days 45
```

Anything flagged `[needs caption]` needs one. Work down in date order, four to
six per batch. `queue.json` carries each piece's title, URL, collection, and for
demos a `pitch` field holding the copy the piece already uses to sell itself.

**Read the source before writing.** The caption has to carry the actual argument
and the actual numbers. `astro-build/src/content/<collection>/<slug>.mdx` for
blog, whitepapers, tutorials, counterpoints; `~/Workspace/dev/apps/nc-demos/`
for demos and applied companions (those are `meta.json` plus a rendered
`deck.html`, with no markdown body).

**Where they go**

`syndication/captions/linkedin/<collection>--<slug>.md` — one file per piece,
body only, no frontmatter. `build-queue.mjs` picks the path up automatically on
the next run; nothing needs registering.

**Modes differ.** `teaser` leads into the piece and ends on the link. `native`
has to stand alone in the feed — a reader who never clicks should still get a
complete thought. Check the mode in `queue.json`.

**Two rules that matter more than the rest**

Never invent a person, conversation, event, or internal admission. Self-
interrogation is central to the voice, and ungrounded self-interrogation is
decoration that fails its own test. If a caption reflects on experience, pull it
from what the piece actually says. The test: could Nino answer "which client?"
without inventing one.

Gloss any coined term the first time — project names, in-house artifact names,
personal shorthand. A reader outside the work must be able to picture every
concrete thing named. Three coined terms in a row with no gloss is the failure
shape.

Also: no phrases from the guide's retired list, no corporate jargon, no
prescriptive "you should" framing, no humble-bragging. Give the standalone
reader the point before any open ending. Do not add a question, self-correction,
or apparent POV change unless the source contains the evidence for it.

**Check before finishing**

Four captions already exist in that directory. Read them for register, not for
phrasing to reuse. They run 245–310 words at roughly 11-word average sentences,
which matches the corpus fingerprint. Scan new ones mechanically against the
guide's retired-phrase list rather than by eye.

**Repo state**

`apps/blog` is a git repo on `main` and `syndication/` is currently untracked.
Do not commit unless asked. If a session is still open elsewhere against this
repo, work in a worktree — `~/.claude/hooks/worktree-guard.py` enforces it.

**Do not** post anything, build a LinkedIn runner, or touch `build-queue.mjs` or
`post-devto.mjs`. This is a writing task.
