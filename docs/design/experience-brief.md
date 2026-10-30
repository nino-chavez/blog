# Make Signal Dispatch easier to browse and read

Design intent: **rethink**. Requested by Nino on October 30, 2026, after the profile redesign. This assignment concerns the existing publication's website. It does not resume the May greenfield proposal for a new name, voice, or publication in `blueprint.yml`.

The reader should be able to choose an article, read it comfortably, and find another without learning the site's organization first. The publication remains separate from the profile and photography sites. Existing article prose, claims, titles, dates, publication status, canonical URLs, feeds, and API contracts stay intact.

## Reader and job

The reader is a technically curious product, engineering, or business leader, as defined in `reader-contract.json`. They may arrive from a shared article, visit to see what is new, or return looking for a remembered topic. They need a useful choice before committing to a long read, then a stable reading column and a clear return route. They may be using a phone between other tasks or a desktop for sustained reading. Nino is the author; this is a publication, not an account dashboard or a sales page.

Public interface copy follows the reader-clarity contract. The existing essays retain their Signal Dispatch voice. Concept descriptions use the Executive Advisory register: recommendation and consequence first. No bylined content is rewritten for this comparison.

## Surfaces

- **Home and archive.** Find recent writing, scan titles and excerpts, narrow a list, choose a post.
- **Article.** Read a complete prose essay, return to the previous list, move to another article.
- **Technical and series article.** Read headings, code, callouts, and a sequence without losing place.
- **Search.** Find a remembered title or topic; handle an empty result and clear the query.
- **Other writing formats.** Keep series, fiction, tutorials, whitepapers, presentations, and counterpoints reachable. Their specialized reading controls survive the selected design.

## What the baseline shows

The live `/blog` and `/blog/archive` both present the latest complete essay beside a post list. On phones, header navigation and the collapsed post chooser precede the article, and an older-post promotion appears before the opening paragraph. The independent cold review is recorded with the baseline captures; it is an assessment of appearance, not measured reader success.

The useful parts are clear titles, real dates, search, native full articles, and an explicit path to another post. The comparison should retain these while reducing competing choices before the writing begins.

## Character and anti-goals

Character: personal, editorial, legible, navigable, unhurried.

Avoid: a product-marketing landing page; an administrative dashboard; a wall of equally prominent links; compulsory classification before seeing any writing; ornamental controls with no supported action.

## Density and hierarchy

At 1440 × 960, the browsing view should reveal at least three usable article choices, with title and relevant context kept together. At 390 × 844, a visitor should see a complete first choice and a clear route to the rest. Article body text should begin within the first phone viewport for the representative prose essay. Use a stable body measure around 60–70 characters, rather than stretching paragraphs to fill a large monitor.

On a browsing page: publication identity, available writing, then filters and utilities. On an article: title, concise original excerpt and metadata, then the argument. Navigation to the next article must be easy to find without interrupting the opening paragraph.

The home comparison has a budget of roughly two desktop screens before the footer, with the full archive reached through a clear link. Article length is source-owned and has no artificial screen budget. Adding a home section means shortening or replacing another.

## Three structures to compare

**A — Journal.** Recent writing is a short editorial front page. One lead essay has its original excerpt; a compact list supplies alternatives. Choosing an essay opens a focused page with the list one step away.

**B — Reading index.** The searchable title list is the entrance. A selected essay appears beside a compact index on desktop; phones choose between list and article with a visible return path. Selection and search remain in the URL.

**C — Subject library.** Existing subjects group the same writing into a few visible shelves. A recent essay remains available immediately. The reading page keeps its subject or series context nearby.

These are competing information structures, not palette swaps. All use the same real published sample, support both prose and technical content, and keep the chosen article identifiable. The comparison exposes home, article, technical, search, empty search, and phone states. The remaining archive entries retain real titles and destinations; the preview clearly identifies the fully rendered sample.

## Reference transfer

The two Instagram references were inspected earlier in this chat. Their source record is `sites/nino/nino-chavez-site/docs/design/concepts/profile-20261030/REFERENCES.md` in the profile repository. [The clarity example](https://www.instagram.com/p/DeZw-SxhfC-/) supports making each destination understandable without insider terminology. [The cognitive-load example](https://www.instagram.com/p/DehgzGJt7mJ/) supports keeping related information together and reducing simultaneous choices. These are design arguments, not measured claims about this site's readers.

For the blog, the test is concrete: can the reader identify a relevant article, reach its opening, and move to another without losing the list? More whitespace alone does not answer that question.

## Visual sources and constraints

The current publication's blue ink, pale paper, serif masthead, and editorial article type come from the live October 30 capture and `astro-build/src/styles/publication.css` / `article.css`. The older coral ledger in `DIRECTION.md` describes an earlier surface and does not override the live October 26 navigation decision. All concepts use one consistent palette so the structural comparison stays legible. The selected direction will own an updated system record.

Fixed: name, authorship, content, independent-site boundary, truthful metadata, native URLs, all writing formats. Guided: editorial identity and the need for clear post-to-post movement from `docs/site-navigation.md`. Open: browsing structure, default entry page, index placement, title/body scale, and the relation of browse controls to article content.

## Platform, theme, and feedback

Use semantic links, headings, forms, and buttons; browser Back and native scrolling remain dependable. Phone navigation must not depend on hover. Focus is visible. Search reports results and provides a direct clear action. The comparison uses a fixed light publication theme, matching the current public surface; no system-dependent switch or new appearance control is introduced. No automatic motion or scroll effects are proposed.

## Objects, actions, and states

| Object | Owner | Actions | States | Return or reverse |
| --- | --- | --- | --- | --- |
| Published essay | Existing content collection | Read, follow links, choose another | Opening, long prose, code, related/series context | Back to the same list and query |
| Archive | Publication | Scan, filter, paginate, select | Populated, dense, filtered, no matches | Clear filter; prior page |
| Search query | Reader | Enter, submit, clear | Empty, results, no matches | Clear; browser Back |
| Subject | Existing categories and tags | Browse its writing | Populated, no result in a filter | All writing |
| Series | Existing registry | Read next/previous entry | Beginning, middle, end | Series overview |
| Navigation | Publication | Visit supported writing formats | Current location, collapsed phone list | Native Back; close menu |
| Profile and photography | Separate sites | Open in a new tab | External destination | Original blog tab stays available |

Draft and unlisted content is excluded. No subscription, account, saved-post system, or new content taxonomy is invented. Static content needs no simulated network-loading, source-change, completion, or undo state. Search failure handling uses the existing full-text search implementation during the final port; the concept uses its local published index. Large text and narrow viewport checks remain required.

## Decision and implementation boundary

Nino selected **A + C** on October 30, 2026: “combine a and c.” This resolves the direction choice and authorizes production implementation.

The combined direction uses A's editorial lead and focused article, with C's subject-based discovery. Recent writing appears first. Below it, illustrated article choices sit beside links to existing subjects; the archive supports a visible subject selection alongside search. Articles retain a quiet route back to the same list and query. Subject and contents context must not compete with the opening argument.

Retain A's bounded reading measure, compact metadata, and related reading after the essay. Retain C's recognizable topic links, original artwork, dates, and grouped title/excerpt. Retain B's useful behavior—clear selection and reliable return state—without its persistent post index. All three original concepts remain available as the decision record.

The native Astro implementation preserves every published route, all writing formats, publication status, canonical metadata, Pagefind, feeds, the content API, and reading without JavaScript. Profile and photography links open in new tabs. The existing October 26 navigation document will be updated to distinguish these retained contracts from the superseded split layout.
