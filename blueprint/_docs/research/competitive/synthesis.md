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
