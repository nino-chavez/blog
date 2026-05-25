---
name: "Simon Willison — Simon Willison's Weblog"
url: "https://simonwillison.net"
category: "peer-architect-blog"
captured_on: "2026-05-25"
captures:
  - "captures/simonwillison--home.png"
  - "captures/simonwillison--tag-large.png"
  - "captures/simonwillison--post.png"
---

## What they do well

- **Pagination + related-tags sidebar at extreme scale.** The `llms` tag has **1,764 posts**, and the page is still navigable. Two design moves combined: (1) reverse-chronological with `1-30 (567 older)` pagination chips, (2) a "Related" sidebar listing co-occurring tags (`openai`, `claude`, `coding-agents`, etc.) that lets readers narrow without leaving the page.
- **Multiple content types interleaved.** `Entries / Links / Quotes / Notes / Tools / Elsewhere` filter chips at the top of the home page. Each entry is tagged with type. Lets readers compress to just the type they want.
- **Tag intro essay per topic.** The `llms` tag page opens with a 2-paragraph essay defining the topic and framing the reader's expectations *before* the post list. Treats the tag page itself as a piece of writing, not just an index.
- **Compact post titles + date + tags.** Each entry in the tag page shows title, date, tag chips, and the first paragraph as excerpt. High density without overwhelming.

## What we could learn

- **Pagination is mandatory at Signal Dispatch's tag sizes.** [[F1]] finding (44k-px tag page) is solved here at 40× the scale. The pattern is: 30/page + prev/next + related-tag sidebar. Apply directly.
- **Tag pages can be authored, not just generated.** Adding a 2-3 sentence intro per high-traffic tag converts the page from "auto-generated list" to "curated thread." Low effort, high signal-of-care.
- **Related-tags sidebar = narrowing tool.** When a reader lands on `/blog/tags/ai-development` (134 posts), surfacing `agentic-systems`, `ai-governance`, `architecture` as co-occurring tags lets them collapse the set to what they actually want.

## What to avoid

- **Dense home-page sidebar can overwhelm.** Simon's home has ~6 sidebar columns of running content. Works for him because he posts 1-3x/day; Signal Dispatch posts ~weekly and would feel under-fed at that density.
- **Plain-text tag chips can read as cluttered.** Each entry has 4-8 tag chips listed inline — readable here because the visual style is utilitarian. Signal Dispatch's stronger visual identity would clash with this density.

## Implications for the prescription

- **[[F1]] tag-detail chunking**: 30/page pagination + related-tags sidebar. Direct port of the pattern.
- **[[F2]] taxonomy resolution sub-question**: which tags are large enough (>15 posts?) to warrant authored intro essays? Lower-traffic tags can keep the auto-generated format.
