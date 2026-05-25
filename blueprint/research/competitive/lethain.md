---
name: "Will Larson — Irrational Exuberance"
url: "https://lethain.com"
category: "peer-architect-blog"
captured_on: "2026-05-25"
captures:
  - "captures/lethain--home.png"
  - "captures/lethain--tags.png"
---

## What they do well

- **Five-item nav, no dropdown.** `Popular | Tags | Newsletter | RSS | About` — every content type is one click away. No "More" menu, no hierarchy to navigate. (Reference for [[F5]].)
- **"Popular" as the lead nav item.** Acknowledges that most first-time visitors don't want to scroll the latest — they want the curated entry point. Signal Dispatch's home does some of this via the "Featured" hero card, but doesn't expose curation as a named destination.
- **Title-only post listing on home.** Reverse-chronological list of titles + dates, no images, no excerpts. Strips the discovery surface down to "what's the title, when was it written." Forces the title to carry the click.
- **Tags page as A-Z grouped index.** Posts grouped under each tag inline rather than tags-as-cards. Works *because* his tags are small (2-5 posts each) — would not scale to Signal Dispatch's tag sizes.

## What we could learn

- **Promote "Popular" or "Best of" to nav.** Signal Dispatch's home features one post in the hero ("The A/B Test That Built the Lathe") but doesn't expose curation as a destination. A `/blog/best` or `/blog/start-here` route — surfaced in the primary nav — would serve the [[hiring-evaluator]] and [[ai-curious-ic]] personas who arrive cold.
- **Title-only as a discovery primitive for one surface.** The card-with-image grid on Signal Dispatch's home is the right surface for the peer-architect reader who knows what they came for. A separate "all posts, plain list" surface (the archive Lethain shows on home) serves the reader who's scanning history.

## What to avoid

- **Tags-as-A-Z-list breaks at scale.** Lethain's tags page works because no tag has more than ~5 posts. Signal Dispatch's `architecture` (44 posts) and `ai-development` (134 posts) would render as walls. Don't borrow this pattern for [[F1]] prescription.
- **Plain-text post body with no in-post visual rhythm.** Will's posts are dense paragraphs with minimal subheadings. Signal Dispatch's callouts + pullquotes give the reader visual rest points; preserve that.

## Implications for the prescription

- **[[F5]] nav rework**: 5 items, no dropdown, "Popular" or "Start Here" as the lead non-content item.
- **New surface candidate**: `/blog/start-here` or `/blog/best` — curated entry point for cold-arrival readers.
