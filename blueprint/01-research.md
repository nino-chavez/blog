---
stage: 1
variant: greenfield
captured_on: 2026-05-25
v1_baseline: blueprint/v1-baseline/
v1_research_inputs:
  - blueprint/research/personas/       # 3 archetypes + gaps
  - blueprint/research/competitive/    # 5 peers + synthesis
  - blueprint/research/funnel/         # stages + evidence + gaps
  - astro-build/src/content/           # 276 items across 8 collections
  - docs/signal-dispatch-voice-guide.md  # v1.1, 913 lines, distilled from 156 posts
---

# Stage 1 — Research (v2 direction)

Greenfield Stage 1 synthesis for **Signal Dispatch v2** — a re-conception of the publication currently at `ninochavez.co/blog` (276 content items, 8 collections, ~RSS subscribers unknown, 2026-05-25 baseline).

The brownfield work salvaged into `blueprint/research/` (personas, competitors, funnel) carries forward unchanged as v2 inputs — the *audience* and the *peer set* don't change just because the variant flipped. What changes is the question: not "what does v1 need fixed" but "what is v2 *for*, and how does it differ from v1."

## The load-bearing tension this stage has to surface

The prior brownfield diagnose (`v1-baseline/01-diagnose.md`) concluded:

> The blog's reading experience is in good shape... Nothing in the captures suggests the blog needs visual rebranding. The brand kit and the existing post template are doing their job. The redesign target is information architecture, not surface treatment.

The variant correction (re-conception → new name, new voice, new identity) contradicts that read at the brand layer. **Both can be true** — and v2's whole reason for existing depends on resolving which "true" is load-bearing.

The two coherent v2 theses are:

### Thesis A — v1 is structurally sound; v2 is a positioning realignment

- v1's voice, reading experience, and content are working (per the diagnose).
- What's mis-fit is the *container*: "Signal Dispatch" the name doesn't carry the positioning frame ("architect-who-directs-agents, not engineer-who-types-code") that the corpus now embodies.
- v2 is a re-brand + IA refresh layered on a corpus that mostly survives the cutover.
- **Implication**: heavy lift is name + identity + IA; voice carries forward with light editorial pass; most content migrates.

### Thesis B — v1's positioning has outgrown its surface; v2 is a different publication

- v1's content composition reflects its origin (general engineering reflection, broad surface) more than its current center of gravity (agent-assisted production work, governance, architecture for directors).
- The voice register that worked for 156 posts of "show your work" is right for the new center but the *format mix* (one-post-at-a-time blog with occasional whitepapers and underused trios) under-uses the rigorous artifacts that distinguish the work.
- v2 is a different *kind* of publication — closer to Stratechery's deliberate "Dispatch #N" framing, or Pragmatic Engineer's serialized depth, than to the open-ended blog.
- **Implication**: heavy lift is format reinvention + brand + content re-curation; v1 corpus becomes a tagged archive accessible from v2 but not the primary surface.

**Stage 2 cannot codify design principles without picking a thesis.** The thesis becomes the load-bearing constraint that every Stage 2-3 decision checks against.

## What v1 actually is (inventory)

Source of truth: `astro-build/src/content/` directories on disk, 2026-05-25.

| Collection | Items | What it is | v2 disposition |
|---|---|---|---|
| `blog/` | 229 | Long-form reflection essays, technical pieces, opinion. The flagship surface. | **Open** — depends on thesis |
| `whitepapers/` | 12 | Formal, table-heavy, plain-markdown long-form. Companion to specific posts. | **Likely keep** (signals rigor) |
| `presentations/` | 9 | Slide-based with `<Slide>` component; some have exported HTML | **Likely keep** if v2 keeps multi-format identity |
| `counterpoints/` | 4 | Self-red-team or external-critic responses with `challengesPost` binding | **Likely keep** — underused but architecturally important |
| `series/` | 8 | Numbered, ordered post sequences | **Keep + promote** (per competitive synthesis, this is v1's strongest IA) |
| `fiction/` | 10 | Short fiction, novella seeds | **Open** — Thesis A keeps; Thesis B may prune to a separate surface |
| `tutorials/` | 3 | Step-by-step instructional content | **Open** — underused; either commit or prune |
| `research-notes/` | 1 | Unclear; one-item collection | **Likely prune or absorb** |

**Implication**: v1's eclecticism (especially fiction + research-notes inside the same shell as architecture essays) is either an editorial feature (range signals breadth of mind) or an editorial accident (the eight collections grew organically). v2 has to pick.

## What carries forward unchanged from v1 research

These are NOT re-litigated in v2 — the research already done answers the v2 question.

### Personas — `blueprint/research/personas/`

The three v1 archetypes ground in positioning intent + content composition. Audience for v2 is the same population. Priority ordering may shift (see thesis tension).

- **Peer Architect** (P1) — looking for working patterns, reference architectures, peer reads on industry arguments. Reads on desktop, RSS-first. Drops at long-form without TOC. ([[blueprint/research/personas/peer-architect.md]])
- **Hiring Evaluator** (P2) — looking for proof the positioning is real. Reads top-to-bottom, samples for voice consistency. Drops at marketing tells, personal-brand framing, "thought leader" formatting. ([[blueprint/research/personas/hiring-evaluator.md]])
- **AI-Curious IC** (P3) — search-driven, mobile-heavy, single-post visit. Drops at posts that assume context. ([[blueprint/research/personas/ai-curious-ic.md]])

**v2 input**: persona-priority shift is one Stage 2 decision (does the hiring evaluator move up under the new positioning frame? does the AI-curious IC drop off as the positioning narrows?).

### Competitive baseline — `blueprint/research/competitive/`

Five peers (Lethain, Pragmatic Engineer, Stratechery, Simon Willison, charity.wtf) captured 2026-05-25. The convergent patterns are direct inputs:

- **All five surface the author identity above the fold.** v1 leads with the publication name. (See competitive synthesis "Net-new affordance candidate.")
- **All five use 5-item nav, no dropdowns.** v1 hides content types behind "More."
- **None paywall except Stratechery; none aggressively capture email.** Aligns with the v1 hiring-evaluator persona's "no marketing tells" rule.

Divergent patterns the prior synthesis flagged (tag-page scaling, home discovery, post-detail metadata placement, conversion affordance) become v2 design-principle choices, not audit findings.

**Open competitive question still load-bearing**: dispatch-numbering. Does v2 frame the corpus as `Dispatch #N` (Stratechery convention) or as untitled reflections (Simon Willison convention)? Numbering signals deliberate publication; absence signals ongoing diary.

### Funnel — `blueprint/research/funnel/`

Public evidence (no authenticated analytics):

- 228 posts in `/api/posts.json`, 228 in `/blog/rss.xml`, 50 in `/blog/full-content-rss.xml` — feeds work.
- Sitemap **leaked to root** — `/sitemap-index.xml` exposes the blog's 228+ URLs but `/blog/sitemap.xml` (advertised in robots.txt) 404s. Cloudflare reverse-proxy routing bug. v1 infrastructure debt that v2 inherits unless fixed before launch.
- `/llms.txt` — **fixed in `628d93f`** (no longer a v2 inheritance).
- No email capture (intentional per hiring-evaluator persona; preserve in v2).

Four measurement gaps remain ([[blueprint/research/funnel/gaps.md]]): subscriber-base mix, referrer mix, engagement depth by content type, AI-agent citation rate. None block v2 design; all constrain confidence on Stage 2 priority ordering.

## What v2 still needs that v1 research doesn't cover

Salvaged research answers "what audience does v1 serve" and "what do peer publications do." It does NOT answer the greenfield questions:

### Cross-industry publication patterns (new research leg)

The v1 brownfield research's competitive set was five peer architect/engineer publications. For a re-conception, the relevant comparison broadens — what are publications outside the architect-blog space doing that v2 could absorb?

| Adjacent space | Examples | What v2 might learn |
|---|---|---|
| **Director-tier industry letters** | Stratechery, Sinocism, Matt Levine's Money Stuff | How to frame a corpus as a deliberate publication (numbering, cadence, voice consistency under a brand) without paywall infrastructure |
| **Practice-of-the-craft journals** | Are.na blog, BJP, Field Notes | How publication design signals editorial point-of-view without saying it explicitly |
| **Author-as-house publications** | Maggie Appleton, Robin Sloan, Paul Ford | How a single author can run a publication-shaped surface (rather than a blog-shaped one) with multiple format types |
| **Director/architect newsletters** | Lenny's, Lethain (already in v1 set), AcademicAdjacent | Subscribe-or-follow paths that don't violate the no-marketing-tells rule |

**Action for Stage 1 follow-up** (if needed): pick 3-4 of these and add captures to `blueprint/research/competitive/` alongside the existing five. Mark them as "v2 competitive set" to distinguish from the v1 audit baseline.

### Editorial concept — the question Stage 1 hands to Stage 2

The thesis question above (A vs B) plus these sub-questions are what Stage 2 has to codify into design principles:

1. **What is the single sentence v2 is *about*?** v1's implicit sentence is something like "a working architect's notes on AI-era engineering, leadership, and craft." Is v2's the same sentence with a new container, a narrowed sentence (just agent-assisted production work), or a different sentence entirely?
2. **What's the format mix?** Keep the 8-collection eclecticism, prune to 3-4 core formats, or restructure entirely (e.g., one weekly Dispatch + occasional whitepapers)?
3. **What cadence does v2 promise?** v1 is published-when-ready. Does v2 promise weekly, monthly, "Dispatch #N drops when it drops"?
4. **What's load-bearing about v1's voice register?** The voice guide (`docs/signal-dispatch-voice-guide.md`) was distilled from 156 v1 posts. The Stage 2 question is whether v2 inherits the register, evolves it, or restarts. Restart is harder than it sounds — voice consistency is what the hiring-evaluator persona checks for.

These four sub-questions are the input set for [[02-design-principles.md]].

## Cross-industry research summary (preliminary, Stage 1 closes here)

Stage 1 doesn't pick the thesis. It bounds the option space and flags what Stage 2 owes.

**Recommendations to Stage 2**:

1. Open Stage 2 with the thesis-pick decision (A or B). Without it, design principles drift.
2. Codify a single editorial sentence before any design rule. The sentence is the constraint every design rule checks against.
3. Inherit the v1 voice guide as the *starting* register and document the delta v2 introduces (rather than starting from scratch — the corpus's voice consistency is one of the audit's positive findings, not a thing to discard).
4. Codify the format mix early — many subsequent IA decisions depend on whether v2 keeps 8 collections or prunes.
5. The competitive synthesis's open question about dispatch-numbering should be answered as part of the thesis pick; A-thesis tends toward no-numbering (continuity), B-thesis tends toward numbering (deliberate publication).

## Open decisions surfaced (full set in `DECISIONS-NEEDED.md`)

Stage 1 surfaces but does not answer:

- **D1**: Thesis A or B (positioning realignment vs different publication)
- **D2**: Editorial single-sentence for v2
- **D3**: Format mix (which of 8 collections survive; do new ones emerge)
- **D4**: Cadence promise (none / weekly / monthly / "drops when it drops")
- **D5**: Voice evolution delta (inherit guide as-is, evolve with documented changes, restart)
- **D6**: Cross-industry competitive set — extend `research/competitive/` with 3-4 new captures from director-tier letters, practice journals, author-as-house, or follow-not-subscribe newsletters?
- **D7**: Working name(s) or "TBD — surface in Stage 2 brand-criteria pass"
