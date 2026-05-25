# Personas

Reader archetypes for Signal Dispatch. Each archetype = one file, named `<slug>.md`. Schema:

```yaml
---
name: "Peer Architect"
priority: 1   # 1 = primary, 2 = secondary, 3 = tertiary
evidence:
  - "RSS subs (147 as of 2026-04, from architects/principals)"
  - "Comment threads on 'scaffolding-the-agent' post — 4 of 6 commenters identified as Staff+/Principal"
---

## Goal
What they came for.

## Read pattern
How they consume (skim TL;DR / read TOC / read top-to-bottom / RSS-only / single-tab dwell).

## Drop reasons
Where they bounce.

## What the redesign owes them
The specific surface/affordance the audit should prescribe for this archetype.
```

Evidence must be cite-able (analytics row, RSS-stat snapshot, named-commenter quote). No inference-only archetypes — per the no-fabrication rule in workspace CLAUDE.md.
