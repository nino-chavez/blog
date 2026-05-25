# v1-baseline: 02-prescription.yml (rendered)

> The v1 brownfield prescription, kept here for reference. Discarded for v2 input per [[v1-baseline/README]].

```yaml
# =============================================================================
# 02 — Prescription
# =============================================================================
#
# Brownfield Stage 2 output. Per the brownfield variant gate
# (~/Workspace/dev/wip/blueprint/docs/variant-selection.md), this file is YAML
# with impact-ordered changes and an evidence cite per item. The
# prescription-evidence-reviewer enforces both.
#
# Ordering rationale (impact × evidence-strength × reversibility):
#   1. Infrastructure (P1) — touches every search + AEO interaction; build-time
#      change, zero IA dependency. Lands first.
#   2. Taxonomy (P2) — backbones discovery; lands second because P3 depends on
#      a settled taxonomy.
#   3. Tag-detail chunking (P3) — highest visible IA impact; requires P2.
#   4. Nav + author anchor (P4) — convergent peer pattern; independent of others.
#   5. Whitepaper navigation (P5) — high-leverage but blocked on engagement
#      measurement (G3 in funnel/gaps.md).
#   6. Codify cross-post relationship pattern (P6) — preserves positive findings.
#   7. Counterpoint format codification (P7) — closes F-INVESTIGATE.
#   8. SEO/AEO doc rewrite (P8) — pure doc hygiene; sequences last.
#   9. Dispatch-numbering pilot (P9) — flagged proposal, not committed.
#
# Items 1, 2, 4, 6, 7, 8 are independent and could land in parallel.
# Items 3 and 5 sequence after their dependencies.

stage: 2
variant: brownfield
authored_on: 2026-05-25
production_url: https://ninochavez.co/blog
inputs:
  - blueprint/01-diagnose.md
  - blueprint/research/personas/
  - blueprint/research/funnel/
  - blueprint/research/competitive/synthesis.md

resolutions_from_diagnose:
  F-INVESTIGATE: |
    Reframed (not cleanly resolved). Original framing — "intentional voice
    register vs. accidental template inheritance" — assumed an authoring chain
    that does not apply: all Signal Dispatch content is agent-generated;
    Nino reviews and selects, he does not type the prose. The two counterpoint
    posts both render Executive Summary + numbered formal sections, AND the
    challengeSource.type frontmatter field cleanly distinguishes sub-modes
    ("self-critique" and "external-validation"), so the format is consistent
    across both posts. BUT a search across .claude/commands/*.md,
    .claude/skills/, docs/signal-dispatch-voice-guide.md, and the forge-signal
    skills directory found no codification of the counterpoint format
    anywhere. The format is convergent agent output, not enforced.

    Implication: the convergence held across the first two counterpoints
    because the generating session probably inferred the format from the
    parent-post reasoning style or from prior turn context. The next
    counterpoint authored in a fresh session — or by a different agent
    configuration — will not necessarily reproduce it. This is exactly the
    "missing capability" pattern Blueprint's own first principle calls out:
    consistency-without-encoding is a single drift away from regression.

    P7 codifies the convention so it survives session boundaries. The
    rendering doesn't change.

prescription:

  # -------------------------------------------------------------------------
  - id: P1
    title: "Fix sitemap routing + /llms.txt route + robots.txt reconciliation"
    resolves: [F10, F11]
    impact: high
    blast_radius: low   # routing config + one new route; data already exists
    reversibility: high
    blocks: [P8]
    blocked_by: []

    evidence:
      - source: blueprint/01-diagnose.md
        section: "F10 (REVISED 2026-05-25)"
        claim: |
          Blog sitemap-0.xml exists at /sitemap-0.xml with 228+ post URLs.
          Path leaked to root via Cloudflare reverse-proxy routing.
          robots.txt directs crawlers at /blog/sitemap.xml (404).
          Portfolio sitemap.xml does not reference the blog's sitemap.
          /llms.txt 404s despite three places advertising it.

    moves:
      # Sitemap routing
      - "Investigate the Cloudflare reverse-proxy config for the blog project to determine why root-path static files (/sitemap-index.xml, /sitemap-0.xml) are served at /sitemap-* instead of /blog/sitemap-*. The fix lands in the worker / proxy rule, not in Astro's sitemap integration."
      - "Confirm the integration's emitted sitemap URLs (`https://ninochavez.co/blog/<slug>`) match the resolved post URLs after the routing fix. If misaligned, configure @astrojs/sitemap with `customPages` or move the build output to the `/blog/` prefix."
      - "Update the portfolio project's sitemap.xml to include `<sitemap><loc>https://ninochavez.co/blog/sitemap-index.xml</loc></sitemap>` as a sub-sitemap reference — provides discovery entry from the canonical root."
      - "Apply the same fix pattern to the photography project (/gallery/sitemap.xml currently 404s; same bug)."

      # robots.txt
      - "Update robots.txt to reflect the post-fix paths. Currently advertises /blog/sitemap.xml + /gallery/sitemap.xml; should be /blog/sitemap-index.xml + /gallery/sitemap-index.xml after routing fix."

      # /llms.txt
      - "Implement /llms.txt route in astro-build/src/pages/llms.txt.ts per the llms.txt convention: human-readable summary of the site's purpose + curated links to canonical posts + per-content-type indexes + structured API endpoints. Sized for an LLM's first-pass context."
      - "Configure the same reverse-proxy fix so /llms.txt resolves at ninochavez.co/llms.txt (the advertised path) — not /blog/llms.txt."

      # Regression guard
      - "Add a smoke test in the build CI that fetches the deployed sitemap-index.xml + /llms.txt against the preview URL and fails if either is non-200 or missing the post enumeration."

    rationale: |
      The original P1 framing assumed missing data; investigation showed the
      data exists, the discovery path is broken. Three bugs combine to prevent
      any crawler — search engine or AI — from finding the blog's 228 posts via
      the canonical entry points. Fix is routing + one new route, not
      site-architecture surgery.

      Why this still leads the prescription: every search interaction with the
      blog passes through these three discovery surfaces. Until they work, no
      downstream IA improvement reaches an organic audience.

    open_questions:
      - "The Cloudflare reverse-proxy config lives in the portfolio repo (or a shared Worker), not in this blog repo. Investigation in PR 1 may need to span repos; flag in the PR description if so."
      - "Should the blog's sitemap include tag pages? Default: yes, all tags. Revisit if crawl budget becomes a measurable issue."

  # -------------------------------------------------------------------------
  - id: P2
    title: "Resolve canonical-tag drift; ship deprecation table"
    resolves: [F2]
    impact: high
    blast_radius: medium  # affects every post's frontmatter + RSS + related-posts
    reversibility: medium
    blocks: [P3]
    blocked_by: []

    evidence:
      - source: blueprint/01-diagnose.md
        claim: |
          Three sources disagree: docs/TAG_IMPLEMENTATION_REPORT.md (7 tags,
          ai-workflows/personal-growth/systems-thinking/consulting-practice),
          .claude/CLAUDE.md (says 18), astro-build/src/config/tags.ts
          (25 entries including non-kebab orphans Operating Systems / Gen Z /
          Insights). Production renders ai-development / architecture /
          reflection / consulting — the tags.ts terms, not the Oct 2025
          report's terms. Rename was undocumented.

    moves:
      - "Designate astro-build/src/config/tags.ts as the single source of truth. Update .claude/CLAUDE.md tag count to match (currently says 18, actual is 25)."
      - "Audit tags.ts for orphans (Operating Systems / Gen Z / Insights have no `description` field and are non-kebab). Either complete the migration or remove."
      - "Archive docs/TAG_IMPLEMENTATION_REPORT.md to docs/_archive/ with a status banner pointing at tags.ts. The Oct 2025 report described a previous taxonomy; rewriting it would imply the old terms are still in scope."
      - "Author a deprecation table in tags.ts itself (or in a sibling docs/tag-deprecations.md) documenting the rename: ai-workflows → ai-development, systems-thinking → architecture, personal-growth → reflection, consulting-practice → consulting. Build-time enforcement already exists per the file header comment."

    rationale: |
      Taxonomy is the IA's backbone. Drift here propagates into nav, RSS
      categories, related-post computation, and the tag-detail surfaces P3
      fixes. P3 cannot land cleanly on a contested taxonomy — the related-tags
      sidebar pattern (simonwillison) requires confidence in which tags co-occur,
      which requires confidence in which tags exist.

    open_questions:
      - "The 25 tags in tags.ts include the 6 'core domains' + 4 'content types' + 15 other entries. Is 25 the right number, or should the taxonomy compress to a smaller core (closer to the Oct 2025 report's 7)? Decision affects P3 sidebar density."

  # -------------------------------------------------------------------------
  - id: P3
    title: "Tag-detail pagination + related-tags sidebar"
    resolves: [F1]
    impact: high
    blast_radius: low  # one route + one component, all other pages unchanged
    reversibility: high
    blocks: []
    blocked_by: [P2]

    evidence:
      - source: blueprint/research/current-state/tag-detail--375.png
        claim: |
          /blog/tags/architecture renders as a 44,171-pixel scroll on mobile
          (44 posts, no chunking). At least 5 tag pages are this bad or worse
          per archive-tags--1440.png: ai-development 134, reflection 40,
          leadership 40, consulting 32.
      - source: blueprint/research/competitive/simonwillison.md
        claim: |
          Simon Willison's /tags/llms/ at 1,764 posts is navigable via two
          design moves: 30/page pagination (1-30 + N older chips) and a
          related-tags sidebar listing co-occurring tags (openai, claude,
          coding-agents, etc.) that lets readers narrow without leaving the
          page. Direct port to Signal Dispatch's scale.

    moves:
      - "Paginate tag-detail at 30 posts/page with prev/next chips and a 'N older' indicator."
      - "Add a related-tags sidebar derived from tags.ts: for tag T, show the top 6-8 tags by co-occurrence count across posts tagged T."
      - "Optional: per-tag intro essay (2-3 sentences) authored in a sibling MDX (e.g., src/content/tag-intros/architecture.mdx) and rendered above the post list. Pilot on the 5 highest-traffic tags first; expand if it earns the maintenance cost."

    rationale: |
      The single most damaging IA finding is on the discovery surface readers
      use most. The fix is a canonical pattern proven at 40× Signal Dispatch's
      tag scale. Direct port; no new design needed.

    open_questions:
      - "30/page is Simon Willison's choice; an 'infinite scroll with load-more button' is an alternative that some peer pubs use. Default to pagination (better for search-engine crawl budget, accessibility, and direct-link sharing); revisit if RSS/share patterns argue otherwise."

  # -------------------------------------------------------------------------
  - id: P4
    title: "Primary nav rework + author anchor on home"
    resolves: [F5]
    impact: medium
    blast_radius: medium  # touches every page header + home page above-fold
    reversibility: high
    blocks: []
    blocked_by: []

    evidence:
      - source: blueprint/research/current-state/home--1440.png
        claim: |
          Primary nav at desktop reads Blog / Series / Fiction / More. The
          'More' dropdown contains Whitepapers, Presentations, Tutorials,
          Counterpoints, Tags — 5 of 7 content types hidden behind a
          dropdown. No author anchor above the fold.
      - source: blueprint/research/competitive/synthesis.md
        claim: |
          All 5 peer publications (lethain, simonwillison, pragmaticengineer,
          stratechery, charity.wtf) use a 5-item primary nav with no
          dropdowns AND surface author identity above the fold. Signal
          Dispatch is the only one in the set that hides content types and
          omits the author anchor.

    moves:
      - "Restructure primary nav to 5 items, no dropdown. Candidate set: Blog | Whitepapers | Counterpoints | Series | About. (Fiction, Presentations, Tutorials, Tags move to footer; the home page right-rail already cross-links Fiction + Presentations.)"
      - "Add author anchor block on home page above the post grid: photo (or avatar) + 'I'm Nino — architect-who-directs-agents' (or current public framing per project_positioning_reframe.md) + 1-sentence frame + link to About."
      - "Consider splitting nav into two tiers per the stratechery pattern: content destinations (top), reach-out destinations (RSS, About, Contact) in a secondary footer-strip. Subordinate decision — make in implementation."

    rationale: |
      Convergent peer signal across 5 publications + the captured outlier
      status of Signal Dispatch + the [[hiring-evaluator]] persona's need
      to know whose voice this is in 5 seconds. The current 'More' dropdown
      buries the highest-rigor content (whitepapers, counterpoints) that
      the peer-architect persona is most likely to want.

    open_questions:
      - "Funnel G2 (referrer mix, in funnel/gaps.md) would sharpen this — if 80% of traffic lands on post-detail from search and never sees nav, the prescription weight shifts to in-post related-content surfacing instead. Worth a 2-day Cloudflare Analytics check before committing the visual change."
      - "Where does 'Tags' belong if not in primary nav? Footer + in-post-detail tag-chips (per F8) likely suffice; confirm in Stage 4 prototype."

  # -------------------------------------------------------------------------
  - id: P5
    title: "Whitepaper TOC + scroll progress affordance"
    resolves: [F4]
    impact: medium
    blast_radius: low  # one route layout
    reversibility: high
    blocks: []
    blocked_by: []   # NOT blocked by G3 — the move is small enough to ship and measure

    evidence:
      - source: blueprint/research/current-state/whitepaper-detail--1440.png
        claim: |
          /blog/whitepapers/big-blueprint-methodology renders ~20k pixels
          tall at desktop. Visible section headings (Part 1 / Part 2 /
          Part 3 / Part 4) have no inline anchor links and no progress
          affordance. Same at 768 and 375.

    moves:
      - "Add a sticky-left-rail TOC component to /blog/whitepapers/[slug] that auto-generates from h2/h3 headings in the MDX body. Smooth-scroll on click; highlight active section via IntersectionObserver."
      - "Add a thin horizontal progress bar at the top of the viewport showing read progress through the body. (Cheap; common pattern; doesn't carry the 'cheesy widget' connotation that engagement-bar variants do.)"
      - "Optional: borrow the numbered-section convention from counterpoint posts (per F-INVESTIGATE resolution → P7) so whitepaper sections read as ordered moves through an argument."

    rationale: |
      Whitepaper format serves the peer-architect persona who opens the doc
      in a new tab and may return later to a specific section. Current
      surface forces them to scroll-hunt. TOC is the canonical fix; progress
      bar is the cheap supplement. Both can land without waiting on the G3
      engagement measurement (per funnel/gaps.md) — if the data later shows
      readers bouncing at Executive Summary, that's a separate prescription
      (about Executive Summary content), not about navigation.

    open_questions:
      - "Does TOC belong on counterpoint detail too? Counterpoints are shorter (~5-10k px per F-INVESTIGATE captures) but use the same numbered-section pattern. Default: yes; uses the same component."

  # -------------------------------------------------------------------------
  - id: P6
    title: "Codify cross-post relationship affordances (positive-finding preservation)"
    resolves: [F6, F7, F8]
    impact: medium
    blast_radius: low
    reversibility: high
    blocks: []
    blocked_by: []

    evidence:
      - source: blueprint/research/current-state/counterpoints-index--1440.png
        claim: |
          Counterpoints index renders adversarial-relationship per card:
          COUNTERPOINT chip + relation type (NEW, LATEST), 'Challenges:
          parent post' link, author, date, read-time, title, excerpt,
          'Read counterpoint →' CTA. Strongest IA on the site.
      - source: blueprint/research/current-state/series-detail--1440.png
        claim: |
          /blog/series/agentic-workflows-in-practice renders an explicit
          'Reading Order' with numbered cards. Strongest wayfinding for
          'what should I read next?' on the site.

    moves:
      - "Extract the card pattern used on counterpoints-index into a reusable RelationshipCard component (relation-type chip + parent-link + author + meta + CTA). Document in DESIGN.md per Pattern B conventions."
      - "Use RelationshipCard on the home-page right rail in place of the current 'Recent Series' / 'Also Here' lists — keeps the affordance but unifies the visual treatment."
      - "Reuse the numbered-card 'Reading Order' pattern from series-detail when proposing chunking for P3 tag-detail (year groups, popularity groups, or curated reading orders within a tag)."

    rationale: |
      The two strongest IA surfaces on the site solve the same underlying
      problem in two ways: explicit relationships (counterpoints → parent;
      series → reading order). Codifying these as reusable patterns means
      the prescription preserves what works while extending its reach to
      surfaces that currently lack it (tag-detail, home right-rail).

  # -------------------------------------------------------------------------
  - id: P7
    title: "Codify counterpoint format convention"
    resolves: [F-INVESTIGATE]
    impact: low
    blast_radius: low
    reversibility: high
    blocks: []
    blocked_by: []

    evidence:
      - source: astro-build/src/content/counterpoints/process-beats-inspection.mdx
        claim: |
          Body opens with '# Executive Summary' followed by numbered
          sections (1. The Objection Restated, 2. Industrial Precedent,
          ...). Sibling counterpoint
          five-months-later-the-evidence-showed-up.mdx uses the same
          format. challengeSource.type field distinguishes sub-modes:
          'self-critique' and 'external-validation'.
      - source: blueprint/01-diagnose.md
        section: "F-INVESTIGATE resolution"
        claim: |
          The format is consistent across both counterpoint posts but is
          NOT codified in any skill, command, voice-guide section, or
          forge-signal template searched. Convergent agent output, not
          enforced — at risk of drift on the next counterpoint authored
          in a fresh session.

    moves:
      - "Author a 'Counterpoint Format' section in docs/signal-dispatch-voice-guide.md (or a sibling docs/content-types/counterpoint.md) documenting the convention: Executive Summary opener, numbered sections, formal register, challengeSource.type ∈ {self-critique, external-validation}. The .claude/commands/write-post.md skill can reference it so future counterpoint generation pulls the codified format."
      - "Add a build-time check: warn (not block) on counterpoint posts that lack '# Executive Summary' as the first body heading. Cheap regression guard."
      - "Surface the challengeSource.type as a chip on counterpoint detail rendering — currently visible on counterpoints-index but not on the detail page itself per counterpoint-detail--1440.png."

    rationale: |
      A convergent pattern across two posts is one drift away from a
      regression. Blueprint's own first principle ("Agent Struggle Is a
      Missing Capability") says: when consistency holds without
      infrastructure, encode the infrastructure. This is that move for the
      counterpoint format. Cheap doc-level encoding + a build-time guard
      prevents the next counterpoint from losing the formal register that
      signals 'this is an adversarial argument, not a personal reflection.'

  # -------------------------------------------------------------------------
  - id: P8
    title: "SEO/AEO strategy doc rewrite"
    resolves: [F3]
    impact: low   # doc hygiene; doesn't change production surface
    blast_radius: low
    reversibility: high
    blocks: []
    blocked_by: [P1]   # rewrite reflects post-P1 surfaces

    evidence:
      - source: docs/SEO-AEO-STRATEGY.md
        claim: |
          Status banner at top of file declares the canonical URL has
          flipped. Body still reasons from the inverted (pre-flip) premise.
          Reader has to mentally invert every 'subdomain is canonical'
          claim while reading. Stale.

    moves:
      - "Rewrite the body to match the current canonical posture (ninochavez.co/blog is canonical; blog.ninochavez.co redirects in)."
      - "Document the post-P1 sitemap + /llms.txt surfaces as part of the AEO infrastructure section — the doc's claims about AEO posture should match what production actually serves."
      - "Archive the original to docs/_archive/SEO-AEO-STRATEGY-pre-2026-05-25.md so the historical reasoning is preserved without polluting the current doc."

    rationale: |
      Pure doc hygiene; doesn't change any visible surface. Sequenced after
      P1 so the rewrite reflects the actual AEO infrastructure rather than
      describing future state. Low priority but blocks anyone who needs to
      read the doc to understand the posture.

  # -------------------------------------------------------------------------
  - id: P9
    title: "Dispatch-numbering convention pilot (PROPOSED, not committed)"
    resolves: []   # not a diagnose finding — a forward proposal
    impact: low
    blast_radius: low
    reversibility: high   # easy to roll back after pilot
    blocks: []
    blocked_by: []
    status: PILOT_PROPOSAL   # explicit non-commit flag

    evidence:
      - source: blueprint/research/competitive/stratechery.md
        claim: |
          Stratechery's '2026.21: The Data Center Veto' issue-numbering
          convention frames the corpus as a deliberate publication, not a
          personal blog. Counter-intuitive trust signal: the numbering
          creates the sense of a regular cadence even when the content is
          essayistic.

    moves:
      - "Pilot a 'Dispatch #N' label on new posts only (do NOT retrofit the 228 existing posts) for 4-6 weeks."
      - "Measure: does the label feel contrived at weekly cadence, or does it carry the publication-frame value? Subjective call by Nino at pilot end; no analytics needed."
      - "If pilot lands: backfill numbering by chronological order, document the convention in voice guide. If pilot fails: remove the label, document why in the voice guide's 'rejected patterns' section."

    rationale: |
      Flagged here so the input lands in the prescription record, not as a
      committed move. Stratechery's cadence (4×/week) supports numbering in
      a way Signal Dispatch's weekly cadence may not. Pilot resolves the
      question with cheap evidence rather than asking it abstractly.

# =============================================================================
# Cross-cutting notes
# =============================================================================

remaining_blockers_for_stage_3:
  - "P4 ideally waits for funnel G2 evidence (referrer mix) before committing the visual nav change. If G2 takes >1 week to land, ship P4 on the convergent-peer-pattern evidence alone — the cost of waiting is higher than the cost of being wrong."
  - "P3's per-tag intro essay sub-move is optional. Decide in Stage 3 prototype based on whether the 5 highest-traffic tags justify the maintenance cost."
  - "Nino's pilot decision on P9 happens after 4-6 weeks of pilot posts — gates downstream voice-guide update, not Stage 3 design brief."

what_this_prescription_does_NOT_include:
  - "Visual rebranding. F8 (positive) confirms the reading surface works; brand kit (DESIGN.md) is intact. The prescription is IA + infrastructure, not surface treatment."
  - "Content strategy. Tag taxonomy resolution (P2) is structural; what to write about with the tags is out of scope."
  - "Email-subscribe capture. [[hiring-evaluator]] persona's 'no marketing tells' rule + intentional thin return-path (per funnel/stages.md) — do not add."
  - "Search-on-site. Not surfaced as a finding; readers arrive via Google or RSS, not via site-internal search."
  - "Comment system. Not surfaced; reaffirm the no-comments posture."

dependencies_graph: |
  P1 ──┬──► P8
       │
  P2 ──┴──► P3

  P4 ──── (parallel)
  P5 ──── (parallel)
  P6 ──── (parallel)
  P7 ──── (parallel)
  P9 ──── (parallel, PROPOSED only)

stage_3_input: |
  Stage 3 (03-design-brief.md) reads this file and produces:
  - Visual direction for P3 (pagination chrome, related-tags sidebar)
  - Visual direction for P4 (nav layout, author anchor block)
  - Visual direction for P5 (TOC sidebar, progress bar)
  - Component-level direction for P6 (RelationshipCard)
  - Information-architecture decisions implicit in P3 (per-tag intro essays?
    Numbered reading orders within tags?) and P4 (Tags placement after nav demotion?)

  Stage 3 does NOT touch P1, P2, P7, P8 — those are infrastructure/codification
  moves that ship without design-brief input.
```
