# Signal Dispatch has its own navigation

Nino selected a post list beside the article on October 26, 2026, after rejecting the combined profile, blog and photography navigation. The profile remains a separate personal page; photography retains its gallery navigation. This decision supersedes the shared header and footer introduced in `5f07797`. Removing that shared navigation is intentional across the publication, including its other writing formats. The author link is the quiet route back to the profile.

The approved comparison and review evidence live in the private `nino-chavez/public-site-rethink` repository under `sites/nino-separated/docs/design/experience-brief.md` and `docs/evidence/screen-reviews/separation-2026-10-26/` relative to that site folder.

The desktop post list stays beside the complete native article. On phones, Choose another post opens the list, and Sections in the masthead reaches all writing formats from any publication page. Search, archive page and the original result survive reading another post and returning. Full-text search indexes the original article URL, without duplicate home/archive reading copies. Feeds and data links remain in the publication footer.

Article URLs, canonicals, native Astro rendering, publication status, feeds and the content API remain intact. The old `archive` content entry is excluded from post navigation because its URL collides with the real archive route. No article prose is rewritten. Without JavaScript, the complete article and native links to every post remain available; filtered pagination is an enhancement for the static archive.

The existing `/blog` entrance requires the separately managed router update in `nino-chavez/ninochavez-router` PR 6. The proposed `blog.ninochavez.co` and `photo.ninochavez.co` migration is not part of this change.

Verification uses the production build and `astro-build/scripts/check-reading-navigation.mjs`, with an existing Playwright module path, preview URL and output directory as its three arguments. The browser checks cover the reading loop, focus restoration, boundaries, narrow screens, persistent desktop list, full-text search, article anchors, other formats and browsing without JavaScript. Parent and independent model reviews inspected rendered desktop and phone captures; these do not claim physical-device or screen-reader acceptance.
