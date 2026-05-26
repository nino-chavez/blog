---
name: "Maggie Appleton"
url: "https://maggieappleton.com"
category: "author-as-house-multi-format"
captured_on: "2026-05-25"
adjacency: "v2 cross-industry — author-as-house with deliberate format taxonomy"
---

## What they do well

- **Eight-format taxonomy, surfaced in nav.** Primary nav exposes Essays / Notes / Patterns / Smidgeons / Talks / Podcasts / Library / Antilibrary — each format is a named destination with a one-line definition (e.g., Essays = "Opinionated, longform narrative writing with an agenda"; Notes = "Loose notes on things I don't entirely understand yet"). The reader knows what they're getting per format before clicking.
- **Author identity above the fold, with role.** Home leads with "Designer, anthropologist, and mediocre developer" — discloses role and self-deprecates in one line. Doesn't perform expertise; states it.
- **"The Garden" as the conceptual centerpiece.** Below the author fold, the home page features the digital garden as the load-bearing surface — signals that this is a body of work in progress, not a finished archive. Frames partial / exploratory content as a feature, not a gap.
- **Visual hierarchy by format.** Essays carry thumbnail images (rich treatment); Patterns are text-only with timestamps (formal treatment); Notes are loose. The visual hierarchy signals "how finished is this" without requiring a maturity label.
- **No email capture; RSS + social only.** Footer carries RSS link + 6 social icons (Bluesky, GitHub, LinkedIn, Dribbble, Twitter, Mastodon). Indie-web posture; reader picks their own subscription mechanism.

## What we could learn

- **Named-format definitions in the nav itself.** v2's nav currently surfaces Library / About / Follow. Adding format definitions inline (e.g., "Essays — opinionated longform"; "Whitepapers — formal companion docs") would resolve Rule 2 (use reader's terminology) at the surface level. D8 (reader-facing labels) could borrow the one-line-definition pattern.
- **Maturity-by-format-treatment, not by status field.** v1 has `status: draft|published|unlisted` for posts but no equivalent for whitepapers/series. Maggie's "treatment signals maturity" approach is one way to surface "this is in progress" without a maturity flag — visual rhythm carries the signal.
- **Garden / Antilibrary as exploratory surfaces.** v2 could consider a parallel — a "what I'm thinking about" or "what I'm reading" surface that's allowed to be incomplete. Lower stakes than a published essay, higher signal than nothing. (Already exists in v1 as `research-notes` collection with 1 item — atrophied. Either commit or prune per D3.)

## What to avoid

- **Eight formats only work because she's curating eight formats actively.** Appleton publishes across all 8 with measurable cadence. v1's 8 collections include 2 that are dormant (presentations, tutorials) and 1 with a single entry (research-notes). Borrowing the 8-format-in-nav pattern without the active-curation underneath would surface dead destinations.
- **Self-deprecating role label ("mediocre developer") is a specific brand voice that won't translate.** It works for Appleton because the rest of her work demonstrates rigor. The hiring-evaluator persona for v2 reads self-deprecation as positioning weakness, not honesty. Don't borrow the label shape; do borrow the role-statement-above-author-name shape.

## Implications for v2

- **Format-definition strip in nav or footer** — one-line definition per format, surfaced near the format name. Sharpens D8 (reader-facing labels) and Rule 2 (reader's terminology).
- **Visual-treatment hierarchy across formats** — already partly in v1 (whitepapers render plain markdown vs blog's MDX components). v2 can codify this as a Stage 2 rule: format determines treatment, treatment signals maturity.
- **Reject the "expose all formats in primary nav" pattern unless v2 commits to active curation across all of them** — D3 (format mix) is the gate. Default to pruning dormant collections before promoting their surface.
