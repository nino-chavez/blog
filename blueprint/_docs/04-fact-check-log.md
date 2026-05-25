---
stage: 4
variant: greenfield
run_date: 2026-05-25
artifacts_checked:
  - blueprint/01-research.md
  - blueprint/02-design-principles.md
  - blueprint/03-prototype-plan.md
  - blueprint/_meta/*.json (8 files)
---

# Stage 4 — Fact-check log (run #1)

First Stage 4 pass against the greenfield Stage 1-3 artifacts (commit `663ab05`). Sample-based, focused on high-claim assertions: counts, file paths, citations, URLs.

Per [[04-fact-check.md]] process: each claim → VERIFIED / REVISED / CUT. Revisions patched in-place; this log captures what changed.

## Verified (no changes)

| Claim | Source | Verification |
|---|---|---|
| v1 collection counts: blog 229, whitepapers 12, fiction 10, presentations 9, series 8, counterpoints 4, tutorials 3, research-notes 1 (276 total) | 01-research.md inventory table, multiple references | `find astro-build/src/content/*/` per-collection — exact match |
| `i-dont-write-any-code` blog post exists at cited path | hiring-evaluator persona evidence | `ls astro-build/src/content/blog/i-dont-write-any-code.mdx` — exists |
| Voice guide distilled from 156 posts | 01-research.md, 02-design-principles.md | `grep "Total Posts Analyzed" docs/signal-dispatch-voice-guide.md` — line 934 confirms 156 |
| 5 peer publication URLs (lethain.com, pragmaticengineer.com, stratechery.com, simonwillison.net, charity.wtf) | 01-research.md competitive-baseline section | curl HEAD against each — all return HTTP 200 |
| `[slug].astro` has the `challengesPost` auto-link banner lookup | counterpoint-detail.json, project_blog_publication_trio_pattern memory | `grep -n "challengesPost" astro-build/src/pages/blog/[slug].astro` — found at line 69 within the lookup block (lines 66-70) |

## Revised (patched in-place)

| Claim | Said | Actual | Patched in |
|---|---|---|---|
| Voice guide line count | "913 lines" (3 occurrences) | 961 lines | 01-research.md frontmatter; 01-research.md body; 02-design-principles.md voice register section |
| `[slug].astro` auto-link banner line range | "lines ~67-69" | lines 66-70 (the `const counterpoints` block opens at 67 with `await getCollection`; the `.find` callback matching `c.data.challengesPost.slug === post.id` is line 69; the block closes at 70) | counterpoint-detail.json sourceFiles + shipped fields |

The voice-guide drift (913 → 961) likely reflects the guide growing since the global CLAUDE.md memory was written. The memory itself wasn't patched (lives in user's global CLAUDE.md, owner-scope), but the blueprint artifacts are now accurate.

## Cut (no claims removed in this pass)

No claims failed verification badly enough to warrant removal. Both revisions are precision-tightenings, not retractions.

## Not yet checked (deferred to next Stage 4 pass)

These need verification but were out-of-scope for this fresh-context pass:

| Claim | Why deferred |
|---|---|
| "RSS subscriber count, persona-mix percentages" | Persona files explicitly flag as inference per gaps.md G1; correctly hedged in artifacts, not making unverified claims |
| Cross-industry adjacent-space examples in 01-research.md (Stratechery, Maggie Appleton, Robin Sloan, Paul Ford, Lenny's, etc.) | Each named publication exists; depth-of-fit-to-claim is editorial judgment, not Stage 4 fact-check material |
| v1-baseline/01-diagnose.md original brownfield findings (F1-F11) | Pre-existing artifacts moved to v1-baseline/; not re-verifying — they were verified when originally written. Re-verify if any are recited in v2 artifacts as currently-true |
| Source file paths in `_meta/<page>.json` `sourceFiles` arrays beyond `[slug].astro` (RightRail.astro, Footer.astro, rss.xml.ts, etc.) | Cited paths likely correct from prior session; sample-verify in next Stage 4 pass before any external share-out |
| `/api/posts.json` HTTP 200 + 228-item count (currently cited as evidence in 01-research.md) | Public probe; can be re-verified anytime. Skipped this pass; do before Stage 5 |

## Process notes for future Stage 4 passes

- The voice-guide line-count error came from trusting the memory file (913) instead of probing the file. Memory files are point-in-time snapshots — verify file metrics against the file, not memory.
- The line-range imprecision in `_meta/counterpoint-detail.json` came from carrying over the memory's "67-69" range without checking. When citing line numbers, always run `sed -n` or `grep -n` for the exact range.
- Both errors fall under the same root cause: trusting memory artifacts as authoritative on current state. The memory is for *direction* (positioning, conventions, past decisions) not for *measurements* (counts, line numbers, file metrics).
