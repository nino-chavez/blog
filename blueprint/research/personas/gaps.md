# Personas — measurement gaps

Per the workspace `feedback_no_unattributed_claims` rule, the three persona files in this directory ground in positioning intent + content composition, not in measured audience data. The following measurements would convert inference to evidence; until they exist, the percentages and priority orderings here are inference, not fact.

## Gap 1 — Subscriber mix

**Question**: of the RSS subscriber base, what fraction are peer architects vs. hiring evaluators vs. AI-curious ICs vs. other?

**Why it matters**: Persona priority ordering (1/2/3) drives F5 (nav promotion of whitepapers vs. series vs. blog) and F1 (tag-detail chunking strategy). Wrong priority → wrong prescription.

**Where the data lives**: Cloudflare Pages analytics if RSS is served from there; otherwise the upstream RSS hosting platform's stats. Subscriber email domains, if captured, are the strongest signal — `@stripe.com` / `@anthropic.com` / `@vercel.com` reads peer-architect; recruiter-domain emails read hiring-evaluator.

## Gap 2 — Referrer mix

**Question**: how do readers arrive? Search / LinkedIn / direct / RSS / referral?

**Why it matters**: F5 (nav rework) assumes nav is on the critical path. If 80% of traffic lands on post-detail from search/LinkedIn and never sees nav, the prescription should be "improve in-post related-content surfacing" not "rework nav."

**Where the data lives**: Cloudflare Pages analytics → top referrers per surface. LinkedIn referrer specifically, since the positioning artifacts (`_drafts/linkedin-profile-rewrite.md`, `_drafts/linkedin-reframe-post.md`) point readers at the blog.

## Gap 3 — Engagement depth by post type

**Question**: do whitepapers actually get read top-to-bottom, or do readers bounce after the Executive Summary?

**Why it matters**: F4 (whitepaper TOC + progress) presumes readers want to navigate within the doc. If actual engagement shows everyone bouncing at the Executive Summary, the prescription should be "make the Executive Summary self-contained" not "add TOC affordances."

**Where the data lives**: Scroll-depth analytics. Cloudflare doesn't surface this by default; would need a lightweight client-side ping (privacy-respecting, no per-user tracking — just a depth-bucket event). Worth a Stage-2 instrumentation question.

## Gap 4 — Direct stakeholder validation

**Question**: do any of the three personas actually exist in Nino's reader base, or are they constructs?

**Why it matters**: The personas are an educated guess from positioning intent. The cleanest validation is asking 3-5 actual readers — directly. If the [[peer-architect]] persona is dominant, the prescription priorities hold. If it turns out the dominant reader is the [[hiring-evaluator]] (i.e., this blog is mostly read by people considering hiring Nino), F1/F4/F5 priorities all shift.

**Where the data lives**: Direct outreach to known readers. Nino has visibility into this; the audit doesn't.

---

These gaps do not block Stage 1. They do constrain the confidence of Stage 2's prescription ordering. Document the constraint; don't paper over it with invented percentages.
