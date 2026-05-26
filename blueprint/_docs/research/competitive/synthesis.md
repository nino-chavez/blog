# Competitive synthesis — what the peer set tells the prescription

Five publications captured on 2026-05-25. Cross-reading what they each chose, the consistent signal is:

## Convergent patterns (all 5 do this)

- **5-item primary nav, no dropdowns.** Lethain, Pragmatic Engineer, Stratechery, Simon Willison's top-strip filter chips, charity.wtf's hamburger menu (when expanded). None hide content types behind a "More" menu. **Direct input to [[F5]].**
- **Author identity surfaced above the fold.** Lethain ("Hey folks, I'm Will Larson"), Pragmatic Engineer ("Hi 👋, I'm Gergely"), Stratechery ("By Ben Thompson"), charity.wtf (centered name as title), Simon Willison (name IS the brand). Signal Dispatch is the only one in the set that leads with the publication name, not the author. **Net-new affordance candidate.**

## Divergent patterns (the prescription picks one)

| Question | Lethain | Simon Willison | Pragmatic Engineer | Stratechery | charity.wtf |
|---|---|---|---|---|---|
| **Tag-page scaling** | A-Z grouped list (small tags) | **30/page pagination + related-tags sidebar** | (newsletter, no tags) | Topic taxonomy | Inline tag chips per post |
| **Home discovery surface** | Title-only list | Multi-stream dense feed | Subscribe CTA | Featured post + right-rail | Single-column blog roll |
| **Post-detail metadata** | Top of post | Bottom of post | (newsletter) | Inline with date | **Left-rail margin** |
| **Conversion affordance** | Sidebar (subtle) | Sidebar (subtle) | **Center-screen CTA** | Right-rail panel | None visible |

## What the prescription should adopt

| Source | Pattern | Resolves |
|---|---|---|
| [[simonwillison]] | 30/page tag pagination + related-tags sidebar | [[F1]] tag-detail unscalable |
| [[lethain]] | 5-item nav, no "More" dropdown, "Popular" or "Start Here" as lead non-content item | [[F5]] nav density |
| [[pragmaticengineer]] | Author anchor block on home above post grid | New affordance — supports [[hiring-evaluator]] persona |
| [[stratechery]] | Two-tier nav (content destinations vs. reach-out) | Subordinate to [[F5]] |
| [[charity-wtf]] | Tag chips in left-rail margin of post detail | Subordinate to F8-positive (preserves clean reading column) |

## What the prescription should NOT adopt

| Source | Anti-pattern | Why not |
|---|---|---|
| [[pragmaticengineer]] | Center-screen Subscribe CTA on home | Violates [[hiring-evaluator]] "no marketing tells" rule |
| [[lethain]] | A-Z flat-list tags page | Doesn't scale past ~5 posts/tag; would break worse than current state |
| [[stratechery]] | Paywall infrastructure | No business model fit |
| [[charity-wtf]] | No primary nav (hamburger only) | Fails [[ai-curious-ic]] cold-arrival wayfinding |
| [[simonwillison]] | High-density multi-stream home page | Cadence mismatch — Signal Dispatch posts weekly, not daily |

## Open question (for Nino, Stage 2 input)

- **Dispatch-numbering**: Stratechery's `2026.21: The Data Center Veto` convention frames the corpus as a deliberate publication. Worth piloting on Signal Dispatch (e.g., `Dispatch #156: ...`) or does it feel contrived at a weekly cadence? Stage 2 prescription will pick a side; flagging here so the input lands before the call.

---

# Cross-industry adjacencies (v2 greenfield extension)

Added 2026-05-25 per [[01-research.md]] D6/D9. Extends the 5-publication peer-architect-blog set above with 4 publications from adjacent spaces, addressing the v2 question Stage 1 surfaced: what do publications *outside* the architect-blog category do that v2 could absorb?

| Capture | Adjacency | Sharpens v2 decision |
|---|---|---|
| [[daringfireball]] | Director-tier independent (ad-supported, no paywall) | D7 brand register (long-run independent identity); confirms no-email-capture posture at 20+ year scale |
| [[maggieappleton]] | Author-as-house with deliberate format taxonomy | D3 format mix (named-format definitions in nav); D8 reader-facing labels |
| [[robinsloan]] | Author-as-catalog (creative + editorial coexistence) | D1 (supports Thesis A — author-as-catalog home shape); D4 cadence-as-voice signal |
| [[lennysnewsletter]] | Follow-not-subscribe at scale (anti-pattern reference) | D2 audience-proposition test; reaffirms no-marketing-tells rule via concrete contrast |

## What the cross-industry set adds that the peer-architect set didn't

- **Long-run brand patience as a proof point** ([[daringfireball]]) — Gruber hasn't re-branded in 20+ years. The peer-architect set (Lethain, Pragmatic Engineer, etc.) is younger and re-brands occasionally. For D7, v2's brand should be designed for the same patience — not a "v2 will redesign in 18 months" temporary frame.
- **Format taxonomy as a nav-level affordance** ([[maggieappleton]]) — none of the peer-architect set exposes 6+ named formats in primary nav. Appleton's pattern is a viable shape for D3 IF v2 commits to active curation across the kept formats; absent that commitment, prune-then-justify is the safer default.
- **Cadence-as-voice signal** ([[robinsloan]]) — Sloan's "every 29 ½ days" is the cleanest example in the captured set of cadence as a *character statement*, not just a schedule. v2's D4 answer should pass the test "does this signal something about how this publication thinks."
- **Concrete no-marketing-tells anti-pattern** ([[lennysnewsletter]]) — the peer-architect set is uniformly low-CTA. Without a high-CTA contrast, the no-marketing-tells rule reads as "what everyone does" rather than as a specific design choice. Lenny's modal-driven, social-proof-driven home is the contrast that makes the v2 rule legible.

## Implications across the cross-industry set

- **Thesis A (positioning realignment) has stronger cross-industry references than Thesis B.** Daring Fireball, Maggie Appleton, and Robin Sloan are all author-as-house / catalog shapes — Thesis A's natural fit. Thesis B (deliberate publication, Dispatch-shape) leans on Stratechery (already in v1 peer set) and is less represented in the cross-industry adjacencies. This is *evidence* about the available shape space, not an argument for the thesis pick — but worth surfacing as Stage 1 closes.
- **Email capture is consistently rejected by the v2-shape publications.** Appleton, Sloan, Gruber — all RSS + social + nothing else. Lenny's is the deliberate exception that proves the rule (different audience, different model). The v1 no-email-capture posture is reinforced as the correct v2 inheritance.
- **Author identity above the publication brand is the dominant convergent pattern.** v1 leads with publication name; 8 of 9 captures (peer-architect + cross-industry) lead with author identity. The Rule 3 work-first ordering remains correct, but Stage 2's "author identity is second" framing may need to flex — the cross-industry set suggests author *is* the publication for most of these, and v2 has to pick whether to follow that convention.
