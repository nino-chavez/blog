---
purpose: Stitch prompts for the 6 outstanding v2 surfaces — paste into stitch.withgoogle.com to generate Cyanotype-aligned HTML.
sources:
  - blueprint/_design/cyanotype-studio.md  (design system tokens — paste this into Stitch first as the design context)
  - blueprint/01-research.md  (personas, baseline)
  - blueprint/02-design-principles.md  (the five rules)
  - blueprint/03-prototype-plan.md  (surface contracts)
  - blueprint/DECISIONS-NEEDED.md  (open D-decisions to leave as placeholders)
generated_at: 2026-05-25
---

# Stitch prompts — outstanding v2 surfaces

Six prompts to fill the gaps surfaced by `STITCH-GAP-AUDIT.md`. Each is self-contained: paste the **Design system context** block first (or upload `_design/cyanotype-studio.md`), then paste one **Surface prompt** per generation.

## How to run

1. New Stitch project (or use the existing "Signal Dispatch v2 Design").
2. Apply or paste the Cyanotype Studio design system (below in §0).
3. For each surface, paste the prompt verbatim. Generate, download `code.html` + `screen.png`, drop into `~/Downloads/stitch_signal_dispatch_studio/<surface_id>/`.
4. Re-run the import: `cp ~/Downloads/stitch_signal_dispatch_studio/<surface_id>/code.html blueprint/pages/<surface_id>.html` then re-inject the `_blueprint-banner.js` script per the pattern in the existing pages.

---

## §0 — Design system context (paste first)

```
Design system: Cyanotype Studio.

Posture: Saturated Editorial. High-density practitioner environment for software architects. Rejects airy low-friction SaaS tropes. Inspired by cyanotype drafting, technical blueprints, 20th-century architectural journals. "Information over decoration."

Colors (use as Tailwind tokens):
- architectural-ink: #001B29 (primary type, structural borders)
- blueprint-cyan: #008B94 (interactive, status, accents)
- aged-paper: #FDFCF0 (warm ivory base, NOT pure white)
- carbon-trace: #111827
- surface: #fbfaee, surface-container-low: #f5f4e8

Typography:
- Headlines: Bree Serif (slab-serif, sturdy, drafted feel)
- Prose: Crimson Pro (literary serif for long-form)
- UI labels: Inter (tight, compact, NO wide letter-spacing)
- Data/receipts/status: JetBrains Mono

Layout: structural drafting. Vertical stacks, persistent 320px right-rail anchor, dense lists over cards, receipt blocks (light-blue tinted background with dashed top+bottom borders), 12-col grid with editorial bleed.

Shapes: 0px corner radius EVERYWHERE. No rounded buttons, no rounded inputs, no rounded cards.

Depth: tonal layering + crisp 1px or 2px borders in architectural-ink or blueprint-cyan. NO backdrop blurs, NO glassmorphism, NO soft ambient shadows. If depth is needed: 2px solid-color hard offset shadows only.

Buttons: solid architectural-ink background, white label-ui text, hover = floods to blueprint-cyan.
Dense list rows: 1px solid bottom border, Crimson Pro primary text, JetBrains Mono secondary metadata.
Active state convention: flood container with blueprint-cyan, knock text out to aged-paper.

Nav header: SIGNAL DISPATCH wordmark left, primary nav center, ACCESS CORPUS button right. Fixed top, 2px architectural-ink bottom border.
```

---

## §1 — `counterpoint-detail`

```
Generate a counterpoint-detail page for Signal Dispatch v2 — a publication for senior software architects.

What this surface is: a "counterpoint" post — a self-red-team or stress-test of an earlier post by the same author. The author publishes both sides under the same byline because publishing only the original argument is dishonest about what they actually believe. This is architecturally load-bearing for the publication's positioning (it signals intellectual honesty to readers who are evaluating the author).

Reader persona priority: hiring evaluator (P2) is who this surface most serves. They sample for intellectual honesty and drop at thought-leader formatting or false certainty.

Required structure, top to bottom:
1. Top banner naming the parent post being challenged. Format: "Counterpoint to: [Title of original post]" with a small back-arrow icon. This is the page's most important affordance — the reader has to know what's being argued against.
2. Format badge "COUNTERPOINT" (mono, blueprint-cyan border, knocked text), followed by date, read-time, "by Nino Chavez" byline.
3. Article title (Bree Serif, large, NOT italic) — the title of the challenge itself.
4. Subtitle / standfirst (Crimson Pro, 18px, no bold) — one sentence framing what's about to be argued against the parent post.
5. Main reading column, max-width 720px, Crimson Pro body, generous line-height. Same reading shape as a normal post — the counterpoint is just a post with one extra binding.
6. Footer, one secondary affordance only: "↩ Return to the original argument" linking back to the parent post. NO related-posts, NO email signup, NO social share.

Constraints:
- Reader-facing label is open (D8). Default to "Counterpoint" but the label may change to "The case against this" or similar. Use a [D8 placeholder] flag on the badge.
- v2 name is open (D7). Use [v2-name] placeholder in the header wordmark.
- No marketing tells (no "subscribe", no "join our community", no email capture, no social proof bars).
- Right-rail anchor (320px, aged-paper background, 2px architectural-ink left border) carries a single "Parent post" reference block with the original post's title, date, and read-time. Optionally a "this counterpoint at a glance" mini-TOC if the counterpoint has section headings.

Use the Cyanotype Studio design system. No Material UI defaults. 0px radii everywhere.
```

---

## §2 — `library`

```
Generate a library / archive page for Signal Dispatch v2 — a publication for senior software architects.

What this surface is: the discovery surface for older or topical material. NOT the home page. NOT the latest-piece-front-and-center experience. This is where a peer architect lands when they want to cite something, sample multiple posts for voice consistency, or find a piece on a specific topic.

Reader persona priority: peer architect (P1) for citation-finding, hiring evaluator (P2) for sampling.

Required structure:
1. Header: "Library" or "Archive" (open per D8 — flag the label as [D8 placeholder]).
2. One-line context underneath: a sentence about what's in the library.
3. ONE primary axis of organization at the top. NOT three competing taxonomies. Default to chronological (newest first), with format-type filter chips as the secondary axis. Format chips: ALL · POST · WHITEPAPER · SERIES · COUNTERPOINT. Use dense chip styling — small caps, blueprint-cyan when active, architectural-ink outline when inactive.
4. Optional tag-as-secondary-filter — but tags must NOT be the primary axis (v1 made them primary and it didn't work — 44k pixel tag-detail scrolls).
5. Dense list format for results. Each row: format badge (mono, color-coded by format), title (Crimson Pro, larger), one-line excerpt (italic, opacity 0.7), date + read-time (JetBrains Mono, right-aligned). 1px architectural-ink bottom border between rows.
6. Pagination at footer — NOT infinite scroll. Numbered pages, prev/next.
7. Right-rail anchor (320px) carries: top tags (top 8 by post count, as a tag cloud with counts), a "browse by year" link list, and a small "this library has N pieces" stat block in receipt-block styling.

Constraints:
- No email capture. No "subscribe for more" CTAs.
- No featured / hero / "editor's pick" treatment — the library is flat, chronological + filterable. Highlighting one piece on the library surface would compete with home's primary discovery.
- Mobile: chips reflow, right-rail collapses to a bottom-anchored Technical Sheet.

Use the Cyanotype Studio design system. 0px radii. JetBrains Mono for metadata, Crimson Pro for titles + excerpts.
```

---

## §3 — `subscribe-follow`

```
Generate a subscribe / follow page for Signal Dispatch v2.

What this surface is: a small, single-screen page with exactly two affordances — RSS subscription instructions and a LinkedIn follow link. That's it. No email capture, no newsletter signup, no "join our community" modals.

Reader persona priority: all three personas, with hiring evaluator (P2) being the hardest to satisfy because P2 drops at any marketing tell.

Why no email capture: v1 deliberately had no email list and the v2 plan preserves this. Reader is sovereign. The author is not chasing inbox real estate. This is a positioning signal as much as a feature absence.

Required structure:
1. Header: "Subscribe" or "Follow" (single word, Bree Serif, large).
2. Standfirst sentence (Crimson Pro, italic, 18px): one line explaining the no-email posture. Something like "Signal Dispatch publishes when it publishes. Two ways to find out when:" — but the exact line is open, leave as [editorial copy TBD].
3. TWO content blocks, side by side on desktop, stacked on mobile:
   a) RSS block. Heading: "RSS". One-line description. The actual feed URL in mono with a copy-to-clipboard button. Optionally a small list of "recommended readers" (NetNewsWire, Feedbin, etc.) in a dense list below. 
   b) LinkedIn block. Heading: "LinkedIn". One line about which account to follow. A single button: "Follow on LinkedIn" (architectural-ink background, aged-paper text, hover floods to blueprint-cyan).
4. Footer: a small italic line confirming what's NOT here ("No email list. No subscribe modal. No follow-up sequence.")

Constraints:
- ZERO email input fields. ZERO email-related microcopy. If Stitch tries to add an email block, remove it.
- ZERO social proof ("join 12,000 readers"). The publication doesn't trade on volume.
- ZERO popup, ZERO interstitial, ZERO overlay. The page is what it is.
- Optional: a small receipt-block at the bottom listing the latest 3 published Dispatches with date + title — for the case where someone arrived via the subscribe link from an old post and wants to sample before subscribing.

Use the Cyanotype Studio design system. Spare, intentionally minimal. Two columns of content, lots of room.
```

---

## §4 — `post-detail` (Cyanotype re-skin)

```
Generate a single-post reading surface for Signal Dispatch v2 — a publication for senior software architects.

What this surface is: the actual reading experience for one blog post. The most important surface in the publication — every persona ends up here.

Reader persona priority: all three. Peer architect (P1) on desktop with RSS. Hiring evaluator (P2) reading top-to-bottom for voice consistency. AI-curious IC (P3) search-driven, mobile-heavy, single-visit.

Required structure:
1. Format badge "POST" (mono, blueprint-cyan border, knocked text).
2. Optional dispatch number marker — flag as [D1 conditional] because Dispatch #N framing only applies under Thesis B. Render as "Dispatch #042" in JetBrains Mono with subdued styling.
3. Byline ("by Nino Chavez") in Crimson Pro, then date (JetBrains Mono), then read-time (JetBrains Mono). Inline, separated by dots.
4. Article title (Bree Serif, large display, NOT italic, NOT all-caps).
5. Subtitle / standfirst (Crimson Pro 18px, italic, no bold, max-width matches body).
6. Optional series-binding block — if this post is part of a series, surface that at the top: "01 · Series: [series title] (the first of N)" in a tinted receipt-block with a dashed border.
7. The reading column. Max-width 720px (CRITICAL — wider becomes unreadable). Crimson Pro 18px body, generous line-height (~1.7), Bree Serif h2/h3.
8. Inline components: callout blocks (4 types — signal / noise / insight / warning, each with a small color swatch + label), pullquotes (Bree Serif italic, max 1 per post, left-bordered in blueprint-cyan), inline code (JetBrains Mono, light tint background).
9. Footer: ONE next-step affordance. Not three. Default order: if part of a series, "Next in series: [title]"; else if has a counterpoint, "Counterpoint: the case against this argument"; else 2-3 related posts. NO email signup, NO social share row, NO comments.
10. Passive footer-footer: byline + RSS link. That's it.

Constraints:
- Reading column must be max 720px wide. Wider columns hurt comprehension per F8 in the brownfield diagnose.
- NO mid-post CTAs. NO "subscribe to read more". NO popups.
- NO sticky social share rail.
- Right-rail (320px) is OPTIONAL on this surface — the reading column is the surface. If a rail is added, it must contain only a mini-TOC (anchor links to post sections) and be invisible on mobile.
- Voice register placeholder — the body copy is delta-dependent on D5. Render a small [D5 placeholder] flag near the top of the body so reviewers know body voice is pending.

Use the Cyanotype Studio design system. Bree Serif headlines, Crimson Pro body, JetBrains Mono metadata only.
```

---

## §5 — `whitepaper-detail` (Cyanotype re-skin)

```
Generate a whitepaper detail / long-form page for Signal Dispatch v2.

What this surface is: long-form technical writing — formal, table-heavy, evidence-dense. Maps to a v1 "whitepaper" content type. These run 20,000+ pixels tall and currently (in v1) ship with no TOC, which is the F4 finding from the brownfield diagnose. v2 must fix that.

Reader persona priority: peer architect (P1) primarily — this is the citation-worthy artifact format.

Required structure:
1. Format badge "WHITEPAPER" (mono, blueprint-cyan border).
2. Byline + date + read-time, same as post-detail.
3. Title (Bree Serif, large, NOT italic). Whitepaper titles tend to be longer than post titles.
4. **Executive Summary block** — REQUIRED. The summary must read as a complete artifact on its own. Reader should be able to read only the summary and walk away with the main argument. Box this in a 2px architectural-ink border, light-blue receipt-block tint, 5-8 dense sentences in Crimson Pro.
5. **Persistent left-rail TOC** — REQUIRED. A sticky table of contents listing every h2 in the document. Each TOC item is small Inter label-ui with section number + title. Active section highlights in blueprint-cyan. Click jumps to anchor. This is the F4 fix.
6. The reading column (same constraints as post-detail — max 720px). Heavy use of tables (Crimson Pro body, JetBrains Mono in numeric cells), inline code blocks, footnotes (numbered, click expands a side annotation).
7. Section progress indicator — small mono "Section 3 of 8" floating subtly in the TOC area.
8. Diagrams / figures — when present, span full content width with a numbered caption in JetBrains Mono ("Fig. 3 — [caption]").
9. Footer: one next-step — usually "Companion post: [title]" linking to the inline-essay version of the same argument. NO email capture, NO download-as-PDF (unless that's a real feature, leave as [D-pending]).

Constraints:
- TOC must persist on scroll (left-rail, sticky). Mobile collapses to a top-anchored expandable.
- Reading column max 720px even for long-form (don't widen for "more content").
- Tables: 1px architectural-ink borders, JetBrains Mono headers in small caps, Crimson Pro data cells. NO zebra striping.
- Footnotes are a primary affordance in whitepapers — render them as inline numbered references that on click expand a small annotation in the margin (or below-screen on mobile).

Use the Cyanotype Studio design system. Density is the feature here — pack the content.
```

---

## §6 — `series-detail` (Cyanotype re-skin)

```
Generate a series detail / threaded reading surface for Signal Dispatch v2.

What this surface is: a numbered, ordered post sequence — typically 4–8 posts under a single thesis (e.g., "From Prompt to Pattern: an eight-part series on..."). Per the competitive synthesis, series is v1's strongest IA pattern; carry it forward and elevate it.

Reader persona priority: peer architect (P1) for follow-the-thread reading; AI-curious IC (P3) for landing on one part and discovering the rest.

Required structure:
1. Top banner / hero: SERIES badge (mono, blueprint-cyan border) + series title (Bree Serif, large). NOT italic.
2. Series standfirst — 2-3 sentences in Crimson Pro 18px, italic, explaining what the series argues across all its parts. Maximum 60 words.
3. Series metadata bar: total parts ("8 parts"), publication span ("Sep 2025 — Mar 2026"), total read-time ("~94 min total"), in JetBrains Mono.
4. **The ordered list of parts**. This is the meat. Each part is a row: part number in big mono ("01"), title (Crimson Pro, bold, larger), one-sentence excerpt (Crimson Pro italic 70% opacity), individual read-time + date (JetBrains Mono, right-aligned). 1px architectural-ink bottom border between rows.
5. Read-state indicators on each row: read = small blueprint-cyan checkmark in left margin; unread = blank; current = blueprint-cyan filled circle. (Read state is OK to mock as a static example; actual persistence is out of scope.)
6. Below the parts list: a "Start reading" affordance — single button, architectural-ink background, aged-paper text, "Start with Part 01" or "Continue with Part 04" depending on read state.
7. Right-rail anchor (320px): series at a glance — a vertical timeline of part numbers connected by a 1px architectural-ink line, with each part as a small label. Acts as a persistent reading-position indicator when scrolling through individual parts.
8. Footer: one next-step — usually "Browse other series: [link]" pointing to Library filtered to series.

Constraints:
- The ordered list of parts is the page. Do not bury it under marketing copy.
- No email capture, no "get notified when next part publishes."
- Mobile: right-rail timeline collapses to a horizontal scrolling chip strip.

Use the Cyanotype Studio design system. The numbered ordering is structural — make the part numbers heavy mono and prominent.
```

---

## Cross-prompt patterns

These constraints apply to ALL six prompts above — Stitch sometimes ignores them, so re-flag in the prompt body if needed:

- **NO email capture, anywhere, on any surface.** Even on subscribe-follow. This is the hardest constraint for Stitch to respect.
- **NO Material UI defaults.** No rounded corners. No Material-style cards with soft shadows. No `border-radius` greater than 0.
- **NO "Join 12,000 readers" / "Featured in TechCrunch" social-proof bars.**
- **NO popup / modal / interstitial.**
- **NO "Schedule a conversation" or "Book a call" affordances** (those are on the speaking page, which is out of scope per the audit).
- **Bree Serif for headlines, Crimson Pro for prose, JetBrains Mono for data — never Inter for body or headlines.** Inter is UI labels only.
- **v2 name is [v2-name] placeholder** (D7 pending). The wordmark in the header may say "Signal Dispatch v2" for now but should be templatable.

## Post-generation: re-wire the harness banner

After dropping each generated `code.html` into `blueprint/pages/<id>.html`, inject the blueprint-banner snippet before `</body></html>`:

```html
<script>window.BLUEPRINT_PAGE = { id: "<id>", title: "<Title>" };</script>
<script src="/_blueprint-banner.js?v=20260525-2100"></script>
<script src="/chat-widget.js?v=20260525-2100" defer></script>
```

The Python snippet at the bottom of the earlier session's import step does this automatically for new pages.
