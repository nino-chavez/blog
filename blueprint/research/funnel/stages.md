# Funnel — reader stages and the surfaces that serve them

Per the brownfield variant, the funnel leg maps reader journey stages to the surfaces and drop points the redesign needs to address. Where measurement is missing, [[gaps.md]] flags it explicitly — claims here are either evidence-cited or marked as inference.

## Stage map

```
Discovery          → First-read              → Second-look           → Return / subscribe
  ↓                  ↓                          ↓                       ↓
  Search             Post detail               Related-posts          RSS subscribe
  LinkedIn           Featured hero on home     Tag detail             Direct return
  Direct             Series detail entry       Series detail          (no email capture)
  RSS subscriber     Whitepaper detail         Counterpoint chain
  AI agent crawl     Counterpoint detail       Author / About link
```

## Stage 1 — Discovery

| Channel | Surface that serves it | Evidence | Status |
|---|---|---|---|
| Organic search | Post detail (deep link from SERP) | `/api/posts.json` exposes 228 posts with structured metadata; per [[evidence]], `/sitemap.xml` lists **9 URLs total and includes zero blog posts** | **Broken** — see [[F10]] in 01-diagnose |
| LinkedIn (Nino-authored) | Post detail (link in caption); home | `_drafts/linkedin-profile-rewrite.md` + `_drafts/linkedin-reframe-post.md` exist in repo; live LinkedIn analytics unknown | Inferred path, traffic-volume unmeasured ([[gaps]] G2) |
| Direct | Home (`/blog`) | Captures show home as the bookmark-equivalent landing | Working |
| RSS subscriber | RSS XML → external reader | `/blog/rss.xml` returns 228 items; `/blog/full-content-rss.xml` returns 50 with full HTML body | Working (subscriber count unmeasured — [[gaps]] G1) |
| AI agent crawl | `/llms.txt` (advertised), `/api/posts.json` | `/api/posts.json` returns valid JSON; `/llms.txt` **404s despite being linked in nav and the posts.json `endpoints.llmsContext` field** | **Broken** — see [[F11]] in 01-diagnose |

## Stage 2 — First-read

The reader lands on a single post (most likely from search or LinkedIn) and decides whether to continue.

| Surface | Reads well | Drop risk |
|---|---|---|
| Post detail (`post-detail--{1440,375}.png`) | Narrow column, hero image, callouts, pullquote, related-posts footer. [[F8-positive]] in 01-diagnose. | Low. Reading experience is intact. |
| Whitepaper detail (`whitepaper-detail--1440.png`) | Voice + framing are strong. | High — ~20k px tall with no TOC or progress affordance. [[F4]] in 01-diagnose. |
| Counterpoint detail (`counterpoint-detail--1440.png`) | Numbered formal sections + Executive Summary; signals rigor. | Unknown — depends on whether the formality is intentional ([[F-INVESTIGATE]] in 01-diagnose). |

## Stage 3 — Second-look

The reader finished a post and is deciding whether to read more. This is the surface bundle the redesign is most concentrated on.

| Surface | Effectiveness | Compounds with |
|---|---|---|
| Related-posts component (footer of post detail) | Working — `post-detail--1440.png` shows "More in Reflection" with 4 cards | — |
| Tag detail | **Hostile at scale** ([[F1]]) — 44k-px scroll on mobile for the `architecture` tag | [[simonwillison]] competitive pattern (pagination + related-tags sidebar) |
| Series detail | **Strongest IA on the site** ([[F7-positive]]) — numbered reading-order cards | Adopt for tag-detail chunking |
| Counterpoints index | Cleanest secondary surface ([[F6-positive]]) — adversarial-relationship affordance per card | Adopt for cross-post relationship surfaces generally |
| Home page right rail | Surfaces "Currently Surfacing" / "Recent Series" / "Also Here" deep links | Collapses below the fold on mobile — partial-only utility |

## Stage 4 — Return / subscribe

| Affordance | Surface | Drop risk |
|---|---|---|
| RSS subscribe | Footer (`/blog/rss.xml`, `/blog/full-content-rss.xml`); also linked from "More" in nav | Working but unsurfaced in-post — reader has to look for it |
| Direct return | Bookmark / typed URL | Working |
| Email subscribe | **None** — Signal Dispatch does not capture emails | By design (per [[hiring-evaluator]] persona — no marketing tells). Don't introduce. |
| LinkedIn follow | External — no on-site affordance | Asymmetric — posts get cross-published to LinkedIn but the blog doesn't surface "follow on LinkedIn" |

## What the stage map implies for the prescription

1. **Discovery is broken at the SEO/AEO layer** — sitemap + llms.txt. These are infrastructure bugs, not IA prescriptions. Fix before Stage 2 design work.
2. **Second-look is the highest-leverage redesign target** — the gap between [[F1]] (broken tag detail) and [[F7-positive]] (working series detail) is where most of the prescription will land.
3. **Return path is intentionally thin** — don't add email-capture or "follow" widgets. Lean on the RSS surface that already works.
