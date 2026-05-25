# Funnel — measurement gaps

The four gaps below cannot be closed without access Nino controls. They constrain the confidence of Stage 2's prescription ordering but do not block Stage 1. Document the constraint; do not invent numbers.

## G1 — Subscriber-base mix

**Question**: how many RSS subscribers, broken down by reader-cohort signal (peer-architect vs hiring-evaluator vs AI-curious-IC)?

**What we know publicly**: `/blog/rss.xml` resolves and serves 228 items. Cloudflare's CDN serves the file. Subscriber count is not exposed via public probe.

**What would close the gap**:
- Cloudflare Pages analytics for `/blog/rss.xml` requests (unique IPs, request count over 30/90 days)
- Email-domain analysis of any captured RSS subscriber metadata (if upstream RSS host captures any — most don't)
- Direct survey of 10-20 readers Nino knows

**Why it matters**: persona priority ordering ([[personas/peer-architect|peer-architect]] = #1) is an inference from positioning intent. If the actual subscriber base is dominated by hiring evaluators, the IA prescription priorities shift.

## G2 — Referrer / acquisition channel mix

**Question**: of readers landing on a post-detail page, where did they come from? (Search / LinkedIn / direct / RSS / referral)

**What we know publicly**: Nothing. Cloudflare's edge does not expose per-page referrer data without authenticated access.

**What would close the gap**:
- Cloudflare Web Analytics (referrer hostnames, top entry pages)
- Google Search Console (search queries, click-through rates per post)
- LinkedIn analytics on Nino-authored posts that link to the blog

**Why it matters**: [[01-diagnose#F5]] (nav rework) assumes the primary nav is on the critical path for many readers. If 70-80% of traffic lands on post-detail from search or LinkedIn and never sees the nav, the prescription should shift to "improve in-post related-content surfacing" not "redesign nav."

## G3 — Engagement depth by content type

**Question**: do whitepapers actually get read end-to-end? Or do readers bounce after the Executive Summary?

**What we know publicly**: Nothing. No client-side analytics ping on Signal Dispatch captures scroll depth (the SvelteKit shell scripts visible in the HTTP headers don't include a known analytics library).

**What would close the gap**:
- Lightweight scroll-depth events into Cloudflare Analytics Engine or Plausible (privacy-respecting, no per-user tracking — bucketed)
- A/B comparison: post-detail bounce rate vs whitepaper-detail bounce rate

**Why it matters**: [[01-diagnose#F4]] (whitepaper TOC) presumes readers want to navigate within the long-form doc. If actual engagement shows everyone bouncing at the Executive Summary, the prescription should be "make the Executive Summary self-contained" not "add TOC affordances."

## G4 — AI-agent / LLM citation rate

**Question**: are LLM answer engines (ChatGPT, Claude, Perplexity, Google AI Overviews) actually citing or quoting Signal Dispatch content?

**What we know publicly**: `/llms.txt` 404s, so anything that follows the llms.txt convention can't crawl the curated surface. `/api/posts.json` serves structured content, but its `/llms.txt` advertisement is broken.

**What would close the gap**:
- Manual sampling: query "what does Nino Chavez say about \<topic\>" across ChatGPT / Claude / Perplexity / Google AI; count citations
- Server-side analytics on `User-Agent` strings hitting `/api/posts.json` and `/blog/full-content-rss.xml` (GPTBot, ClaudeBot, PerplexityBot, etc.)
- Brand-mention monitoring (manual or via a tool like Mention, Brand24)

**Why it matters**: the AEO/GEO posture documented in `docs/SEO-AEO-STRATEGY.md` is one of the blog's reasons for existing. With `/llms.txt` 404'ing and the sitemap missing all posts ([[evidence#sitemap-contents]]), the AEO infrastructure isn't actually doing what the doc claims. Worth measuring whether it ever was.

---

None of these gaps block Stage 1. All four constrain Stage 2's prescription confidence. The cheapest gap to close is G4 (5-minute manual sampling); G1 and G2 require Nino's authenticated access; G3 requires a small one-time implementation.
