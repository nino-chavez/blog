---
name: "AI-Curious Staff IC"
priority: 3
evidence:
  - "Content composition: posts tagged 'ai-development' (134 posts, the largest tag) directly serve this audience — practitioners trying to figure out how AI fits their own work."
  - "Counterpoints index (current-state/counterpoints-index--1440.png) shows multiple counterpoints to AI-productivity claims — implies an audience interested in the debate, not just the verdict."
inference_flags:
  - "Subscriber percentage is unmeasured. This persona is a guess at who the long tail of organic search traffic resolves to."
  - "Could be wrong shape — the long tail might be 'curious managers' rather than 'curious ICs.' Competitive leg (especially the Pragmatic Engineer comparison) may sharpen this."
---

## Goal

Found the blog via search or a colleague's link — likely searching for something specific like "agentic workflow patterns," "AI code review chassis," "process beats inspection." Came to learn, not to evaluate the author.

May not know who Nino is when they land. The post needs to make sense on its own.

## Read pattern

- Search-driven entry, single-post visit, no nav exploration.
- Mobile-heavy (off-hours reading).
- May save / bookmark for later; rarely returns to browse more.
- Subscribes to RSS only if the post genuinely earned it.

## Drop reasons

- Post assumes context they don't have (e.g., references "the lathe argument" without re-anchoring).
- Mobile reading experience breaks down (long unbroken sections, no anchor links, slow image loads).
- No clear next-step — they finished the post but the page doesn't offer "more like this." Related-posts component on `post-detail` does some of this; tag-detail at scale (F1) defeats it.

## What the redesign owes them

- **Mobile reading parity with desktop** — the captures show post-detail reflows cleanly (F8 positive), but tag-detail and whitepaper-detail at 375 are hostile (F1, F4). Fix the hostile surfaces.
- **Self-contained posts** — each post should open well as the reader's first contact. The voice guide already enforces this at the writing level; the IA shouldn't break it by hiding context links.
- **Frictionless RSS or subscription path** — the footer links exist (`/blog/rss.xml`, `/blog/full-content-rss.xml`) but aren't surfaced in-post. A subscribe-or-follow affordance at end-of-post would harvest this audience without violating the no-marketing-tells rule (per the [[hiring-evaluator]] persona).
