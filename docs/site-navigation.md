# Signal Dispatch has its own navigation

On October 30, 2026, Nino selected a combination of **A — Journal** and **C — Subject library**: “combine a and c.” This supersedes the October 26 post-list-beside-article layout. The publication remains separate from the personal profile and photography site. Author and photography links open those experiences in new tabs.

## Choose, then read

`/blog` presents the latest essay and four more recent pieces with their original images, excerpts and dates. Recent cards also show reading times. Subject links offer another way into the writing. `/blog/archive` is the complete essay list, with search and explicit pagination. `/blog/tags` lists subjects; existing `/blog/tags/<tag>` routes remain valid, including older tags outside the canonical registry.

Each essay opens at its original URL in a centered reading column. The opening includes its title, excerpt, byline, date and reading time. A series essay has a compact series link above the text; the full chapter navigation follows the essay. The table of contents remains a native disclosure. Other writing formats keep their own content and layouts under the shared publication masthead.

The masthead reaches All essays, Series, Fiction, More writing and Search. More writing contains Tutorials, Whitepapers, Presentations, Counterpoints and All subjects; Fiction moves there on phones. Feeds and data links remain in the publication footer.

## Returning preserves the reader's place

Search (`q`), subject (`subject`), archive page (`page`) and original result (`from`) travel in the URL. Newer and older essay links respect that filter. Returning restores the original result's archive page and keyboard focus through `#post-<slug>`, even after reading a neighbor. Reloading and browser Back preserve the same state; there is no local-storage dependency. The older `#choose-another-post` archive anchor still resolves.

Without JavaScript, complete native articles, every archive link and subject-specific lists remain available. Search, pagination and exact filtered return are enhancements. Full-text Pagefind search continues to index original article URLs, without duplicate home or archive reading copies.

Article prose, titles, dates, publication status, canonical URLs, feeds and the content API remain intact. The old `archive` content entry remains excluded because its URL collides with the archive route. The proposed `blog.ninochavez.co` and `photo.ninochavez.co` migration is outside this change; the existing `/blog` entrance uses the separately managed router.

## Evidence

The alternatives and selected combination are recorded in `docs/design/experience-brief.md` and `docs/design/concepts/blog-20261030/REVIEW.md`. The current visual direction is in `DIRECTION.md`.

Verification uses the production build and `astro-build/scripts/check-reading-navigation.mjs`, with an installed Playwright module path, preview URL and output directory as its three arguments. It covers Chromium and WebKit, desktop and narrow viewports, filtered reading and return focus, boundaries, native article rendering, full-text search, anchors, other formats and no-JavaScript browsing. Browser emulation and model screen reviews do not establish physical-device or screen-reader acceptance.
