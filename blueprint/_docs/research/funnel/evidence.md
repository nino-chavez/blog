# Funnel — measured evidence (public signals only)

All data here from public HTTP probes against production on 2026-05-25. Anything requiring authenticated analytics access (Cloudflare, Substack, LinkedIn, etc.) is in [[gaps.md]], not here.

## Posts and feeds

| Endpoint | HTTP | Item count | Notes |
|---|---|---|---|
| `https://ninochavez.co/api/posts.json` | 200 | **228 posts** | `meta.totalPosts: 228`, `meta.lastUpdated: 2026-05-25T14:02:00.350Z`. Post records expose `slug`, `title`, `excerpt`, `publishedAt`, `category`, `tags`, `author`, `url`, `featureImage`. The `collection` field is missing — all 228 records are equivalently typed, so the API does not distinguish blog vs whitepaper vs presentation vs counterpoint vs series vs fiction vs tutorial. |
| `https://ninochavez.co/blog/rss.xml` | 200 | **228 items** | Full feed. Each item has title, link, guid, description (excerpt), pubDate, category × N, author. Healthy. |
| `https://ninochavez.co/blog/full-content-rss.xml` | 200 | 50 items | Capped at 50 with full HTML body. Reasonable for full-content; the standard feed has the full 228. |
| `https://ninochavez.co/sitemap.xml` | 200 | **9 URLs** | See "Sitemap contents" below — the issue is what's missing, not the count itself. |
| `https://ninochavez.co/llms.txt` | **404** | — | Advertised in primary nav and in `posts.json.meta.endpoints.llmsContext`. Returns the SvelteKit 404 shell (HTML, ~2 KB). |

## Sitemap landscape (REVISED 2026-05-25)

Initial framing here said "the sitemap enumerates zero blog posts." Deeper investigation found the blog DOES have a sitemap with 228+ entries — it's just leaked to the wrong path.

| URL | HTTP | Notes |
|---|---|---|
| `/sitemap.xml` | 200, 9 URLs | Portfolio project's sitemap (separate Cloudflare Pages project). Lists `/`, `/about`, `/now`, `/blog`, `/photography`, plus 4 `/api/*.json` AEO endpoints. **Does not reference the blog's sitemap as a sub-sitemap.** |
| `/sitemap-index.xml` | 200, 227 B | **Blog project's sitemap-index, leaked to root path.** Should live at `/blog/sitemap-index.xml`. Points to `/sitemap-0.xml`. |
| `/sitemap-0.xml` | 200, 55,722 B | Blog project's full sitemap — 228+ post URLs, all correctly prefixed `https://ninochavez.co/blog/<slug>`. |
| `/blog/sitemap.xml` | **404** | URL referenced in `/robots.txt`. Broken. |
| `/blog/sitemap-index.xml` | **404** | Canonical location for the blog sitemap. Broken. |
| `/gallery/sitemap.xml` | **404** | Same bug pattern affects the photography project. |

The robots.txt content:

```
# Sitemap locations
Sitemap: https://ninochavez.co/sitemap.xml              # portfolio (200; 9 URLs, no blog)
Sitemap: https://ninochavez.co/blog/sitemap.xml         # advertised (404)
Sitemap: https://ninochavez.co/gallery/sitemap.xml      # advertised (404)
```

So:
- A crawler that follows robots.txt to discover sitemaps gets one working sitemap (portfolio, 9 URLs) and two 404s.
- A crawler that probes root might luck into `/sitemap-index.xml` and discover the blog content, but Google's crawler typically doesn't probe paths robots.txt didn't name.
- No machine-readable path connects `ninochavez.co/sitemap.xml` (portfolio) to `ninochavez.co/sitemap-index.xml` (blog).

**This is a Cloudflare reverse-proxy routing bug, not a missing-sitemap bug.** The 228 post URLs exist; crawlers can't reach them via the documented paths. F10 in `01-diagnose.md` is revised accordingly; P1 in `02-prescription.yml` is reframed as "fix routing + robots.txt + portfolio cross-reference + /llms.txt."

## Content-type composition (from posts.json)

`posts.json` returns 228 records but does not differentiate content types via a `collection` field. The astro source under `astro-build/src/content/` has 7 collections (blog, counterpoints, fiction, presentations, research-notes, series, tutorials, whitepapers). The API's flat shape is either intentional (everything is "a post") or accidental (collection metadata not propagated).

Action item for Stage 2: confirm intent. If the public API is meant to expose only `blog` collection items, the 228 number is too high. If it's meant to expose everything, the missing `collection` field is a bug — readers consuming the JSON can't filter by content type.

## What this does NOT cover

- **Subscriber counts** (RSS, LinkedIn) — see [[gaps]] G1
- **Referrer distribution** — see [[gaps]] G2
- **Engagement depth per post type** — see [[gaps]] G3
- **Per-surface bounce rates** — see [[gaps]] G3
