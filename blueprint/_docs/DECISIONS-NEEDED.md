# Decisions needed (from greenfield Stages 1-3)

This is the aggregate decision packet — every Nino-call surfaced across `01-research.md`, `02-design-principles.md`, and `03-prototype-plan.md`, in one place. Stage 3 page builds and Stage 4-6 downstream work are blocked on these.

Each entry: what's being decided, why it matters, what's blocked on it, the option space (no fabricated recommendations — these are scaffolding for the conversation, not picks).

---

## D1 — Thesis: positioning realignment or different publication

**The single most load-bearing decision in this packet.** Every other D-decision below either depends on D1 or sharpens after D1 lands.

**Options**:
- **A — Positioning realignment**: v1's content and reading experience are working (per brownfield diagnose); the *container* (name, IA chrome, brand) is mis-fit. v2 keeps the corpus shape and does a re-brand + IA refresh.
- **B — Different publication**: v1's open-ended blog shape doesn't carry the positioning. v2 is a deliberate publication (Stratechery-adjacent framing — Dispatch #N, current/recent/archive shape), with v1 corpus becoming a tagged archive accessible from v2 but not the primary surface.

**Blocks**: Stage 3 home page, Stage 3 Library, Stage 2 IA primary-axis pick, Stage 5 editorial charter.

**Source**: `01-research.md` "load-bearing tension this stage has to surface."

---

## D2 — Editorial single-sentence

The 12-words-or-less answer to "v2 is a publication about ___." Becomes the editorial constraint every Stage 2 design rule checks against and the line that opens the v2 home and About surfaces.

**Options**: not enumerable — depends on D1 + Nino's editorial taste. v1's implicit sentence: "a working architect's notes on AI-era engineering, leadership, and craft." v2's may narrow, may pivot, may stay close.

**Blocks**: Stage 3 home page copy, Stage 3 About page copy, Stage 5 editorial charter, brand-criteria readback (D7 candidate names need this sentence to test against).

**Source**: `01-research.md` "editorial concept" section + `02-design-principles.md` Rule 1.

---

## D3 — Format mix specifics

Which of v1's 8 content collections survive in v2, and as what?

**Default proposed in Stage 2** (override or confirm):

| Collection | v2 disposition |
|---|---|
| `blog/` (229) | KEEP — primary |
| `whitepapers/` (12) | KEEP — secondary primary |
| `series/` (8) | KEEP — promoted to primary nav |
| `counterpoints/` (4) | KEEP — under-used, architecturally important |
| `presentations/` (9) | ARCHIVE — dormant in 2026, drop from primary nav |
| `fiction/` (10) | **DECIDE** — keep as v2 surface, spin to separate site, or archive |
| `tutorials/` (3) | ARCHIVE — dormant |
| `research-notes/` (1) | ARCHIVE or absorb into blog |

**The non-default call**: `fiction/`. Has its own audience (different from architect-audience), has its own voice (per memory `user_fiction_voice_and_context`), and was being actively developed. Keep in v2 / spin to separate / archive — none is obviously wrong; depends on whether v2's editorial concept (D2) has room for it.

**Blocks**: Stage 3 Library page, Stage 5 migration plan, content-collection cleanup in `astro-build/`.

**Source**: `01-research.md` v1 inventory + `02-design-principles.md` format mix section.

---

## D4 — Cadence promise

What does v2 promise to publish on what schedule?

**Options**:
- **None** (inherit v1) — published-when-ready
- **Monthly** — Stratechery-adjacent
- **Weekly** — Pragmatic Engineer-adjacent
- **"Dispatch #N drops when it drops"** — explicit no-cadence promise that still frames each piece as a publication event

**Why it matters**: drives the Subscribe-Follow page copy (what readers are signing up for), shapes the home page (current Dispatch makes more sense at any real cadence), and constrains Nino's editorial obligation post-launch.

**Blocks**: Stage 3 Subscribe-Follow copy, Stage 3 home (especially Thesis B), Stage 5 editorial charter.

**Source**: `01-research.md` "editorial concept" + `02-design-principles.md` voice register.

---

## D5 — Voice register delta from v1

How much does the v2 voice differ from the v1 voice guide?

**Options** (the Stage 2 recommendation is one of these; pick or override):
- **No delta** — v2 voice = v1 voice. Voice guide remains authoritative. (Thesis A natural fit.)
- **Tightened delta** — voice register evolves toward publication-shaped framing: slightly more deliberate, less open-diary, more "Dispatch #N: the X argument is wrong, here's why." Codify the delta as a supplement to v1 voice guide, not a replacement. (Thesis B natural fit.)
- **Restart** — codify v2 voice from scratch. **Rejected in Stage 2** because (a) the corpus's voice consistency is a positive finding the audit explicitly identified, (b) the hiring-evaluator persona checks for consistency across posts, (c) discarding 156 posts of voice signal trades known for unknown. Listed here for completeness; pick this only with an explicit override-rationale.

**Blocks**: Stage 3 post-detail copy, Stage 3 About copy, Stage 5 editorial charter.

**Source**: `01-research.md` editorial concept + `02-design-principles.md` voice register section.

---

## D6 — Cross-industry competitive set

Extend `blueprint/research/competitive/` with 3-4 new captures from outside the architect-blog peer set?

**Stage 1 surfaced** the four adjacent spaces (director-tier letters, practice journals, author-as-house, follow-not-subscribe newsletters). Stage 2 didn't depend on these — the existing 5 peers were sufficient for Rule 3/4/5 derivations.

**Options**:
- **Skip** — existing 5 peers carry the synthesis enough
- **Add 3-4 from the four spaces above** — extends competitive synthesis; useful inputs for D2 (single-sentence) and D7 (name)
- **Defer to Stage 4** — handle as part of fact-check if the existing competitive synthesis needs cross-industry support

**Blocks**: Nothing directly. Affects depth-of-evidence in Stage 5 documents.

**Source**: `01-research.md` cross-industry section.

---

## D7 — v2 name

The biggest brand decision. Stage 2 codified criteria the name needs to satisfy; the name itself is owned by Nino.

**Criteria** (`02-design-principles.md`):
1. Carries the architect-who-directs-agents positioning (pointable-to, not necessarily literal)
2. Survives the hiring-evaluator screen — no AI-themed cleverness, no obvious personal-brand framing
3. Pairs with author identity ("by Nino Chavez") without one swallowing the other
4. Defensible URL — short, no creative spellings, .com or path on `ninochavez.co`
5. One-sentence "what is this" answer in ≤12 words (which is D2)

**Option shapes surfaced as scaffolding** (NOT recommendations — these are conversation starters; "Atelier" is excluded because it's already a Nino project):
- Direct-positioning shape (e.g., "Architect's Notes", "From the Studio")
- Tier-flag shape (e.g., "Director Mode", "Practitioner Brief", "Field Architect")
- Object/space metaphor (e.g., "The Workbench", "The Lathe")
- Citation framing (e.g., "Working Notes", "Field Notes from...")
- Author-as-house (e.g., "Chavez.dispatch", "Workshop NC") — risk of personal-brand pattern-match

**Blocks**: Stage 3 home, About, Subscribe-Follow, prototype shell branding pass.

**Source**: `02-design-principles.md` brand register criteria section.

---

## D8 — Reader-facing label terminology

The methodology term "counterpoint" is the schema field name (`challengesPost`); the reader-facing label is a design decision per Rule 2 ("use reader's terminology").

**Options**:
- **Keep "Counterpoint"** — what v1 uses, what the URL path uses, what readers may already know
- **"The case against"** — reader-language, more inviting
- **"Stress-test"** — practice-language, signals rigor
- **Other** — Nino picks

**Blocks**: Stage 3 counterpoint-detail copy, Library labeling, any post-footer "next-step" copy that points at a counterpoint.

**Source**: `02-design-principles.md` Rule 2 + counterpoint-detail page meta.

---

## D9 — Whether to extend `research/competitive/` cross-industry (same as D6 with a do/don't framing)

Already covered as D6. Listed here as the actionable yes/no for the calendar: "do we spend 60-90 min capturing 3-4 cross-industry publications before Stage 5 docs?"

---

## Decision-load ordering

If working through these sequentially, the order that minimizes wasted Stage 3 work:

1. **D1** (thesis) — unblocks everything else
2. **D2** (editorial sentence) — unblocks home, About, name criteria
3. **D7** (name) — unblocks all prototype copy
4. **D5** (voice delta) — unblocks post-detail and About copy
5. **D3** (format mix) — unblocks Library and migration plan
6. **D4** (cadence) — unblocks Subscribe-Follow copy
7. **D8** (counterpoint label) — local to counterpoint-detail
8. **D6/D9** (cross-industry competitive) — affects Stage 5 depth; doesn't block Stage 3

D1+D2+D7 together unblock the home-page build. Those three are the critical-path triple.

---

## What is NOT a decision in this packet

To make the list above scannable, these were intentionally left out:

- v1 sitemap routing bug (Cloudflare reverse-proxy) — infrastructure work, applies to v1 regardless of v2. Stage 5 migration plan addresses.
- RSS feed continuity across v1 → v2 — engineering work, downstream of D3.
- Domain (DNS) for the prototype deploy — handled in Stage 6 deploy doc.
- Whether to keep v1 alive in parallel post-v2-launch — out of blueprint scope; that's an ops decision.
