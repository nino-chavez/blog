# Signal Dispatch: three structures to choose from

**Decision pending.** Nino requested the same rethink used for the profile site. These are working concepts, not a production redesign. The recommended direction is **A — Journal**: show enough writing to make a choice, then give the chosen essay a focused reading page.

| Direction | Reader's path | Main tradeoff |
| --- | --- | --- |
| A — Journal | Recent writing → essay → same list | Browsing is one step away while reading. |
| B — Reading index | Searchable index beside the essay | Desktop readers keep two competing areas in view. |
| C — Subject library | Subject → illustrated choices → essay | The reader must understand the subjects to narrow the collection. |

Open `index.html` through a local HTTP server. The comparison toolbar switches direction while retaining the selected state. The View menu includes browsing, prose, technical writing, and a series entry. Search, empty-result recovery, pagination, archive return, and browser Back work. Six complete published articles are rendered locally; the index contains 266 published essays. Other articles and specialized writing formats open the current site in a new tab, as the preview explains. This fallback is a prototype boundary, not a proposed change to native blog navigation.

The same source writing, current publication palette, and existing article artwork appear across the concepts. Profile and photography remain separate sites, opened in new tabs. No essay prose, title, claim, publication date, publication status, canonical route, feed, or API has been changed.

## What the screens support

The live archive places the latest full essay beside the post chooser. It combines two jobs: finding something to read and reading it. The live article also places an older-post promotion before the opening paragraph. The concepts separate or reduce those competing elements while retaining the publication identity, dates, search, and a clear route to more writing.

The recommendation is a design judgment, not a measured usability result. A provides a clear entrance for a new visitor and a focused page for a shared article. B is useful for readers repeatedly moving through a known archive. C supports interest-led discovery. If A is selected, C's subject discovery is worth carrying into the archive; B's explicit selected-post and return-state behavior should survive in every direction.

## Independent review and source checks

A cold reviewer saw four live baseline captures. A separate cold pass saw the twelve concept home/article captures without the brief, proposed rationale, or parent recommendation. The dispatch receipts recorded matching requested and runtime model evidence. Reviews are retained as `baseline-review.md` and `concept-review.md`; they are observations to check, not acceptance receipts.

| Finding | Check and disposition |
| --- | --- |
| Baseline: the latest essay dominates the archive. | Retained. The desktop and phone baseline archive frames show a complete essay competing with the chooser. All three concepts offer a separate searchable archive. |
| Baseline: a heavy divider dominates the left rail. | Narrowed. The dark element is a scrollbar, not a decorative divider. The split's visual competition remains a design concern. |
| Baseline: context delays the opening paragraph. | Retained. The older-post block appears before prose in the baseline article frames. In the concepts, related reading follows the essay. |
| Baseline: prose measure is excessive. | Unproven as a comparative claim; no baseline character-per-line measurement was made. The concepts independently constrain the reading column. |
| Baseline: utilities compete with browse choices. | Retained as a design judgment. RSS moves to the footer, and additional formats remain grouped under More writing. |
| Concepts: A and C articles lack the masthead; B's home lacks identity. | Rejected. The supplied whole-screen captures visibly show Signal Dispatch and publication navigation in all three cases. C also shows All essays above the article on phone. |
| Concepts: C's cards lack dates. | Confirmed in the first captures and fixed. Every card now includes its original publication date. Four focused Chromium/WebKit viewport checks passed. |
| Concepts: C's phone subject links are dense. | Retained as a product judgment. The six wrapping links remain usable; this tradeoff belongs in the selection. |
| Concepts: the latest essay's food illustration gives weak topical information. | Retained as an observation about existing artwork. The source image is preserved rather than replacing authored content during a layout comparison. |
| Reviewer preference: B. | Recorded as a preference. Its stated advantage depended partly on the false missing-header claims above, so it does not establish B as the winner. The parent's recommendation remains A for the reader's browse-then-read path. |

The parent personally inspected the baseline and all twelve home/article concept frames. Source checks rejected the missing-header claims rather than repeating them. A later technical-frame inspection also found an actual contrast defect: the captured dark syntax theme had been placed on a light code background. The prototype now uses legible monochrome code, preserving the source text. The lowest computed contrast increased from 1.22:1 to above 4.5:1. A blank code capture was separately traced to capturing immediately after scrolling; the capture waits for two paint frames before saving.

## Verification and limits

- The unchanged production Astro build passed, including its normal content, Pagefind, route, sitemap, and caption checks. It reports existing review notices; this does not mean every historical essay or caption was editorially reviewed in this task.
- The prototype passed 48 rendered states: three directions, four content states, two viewport sizes, and Chromium plus WebKit. Reading checks cover filtered return with the original row focused, no-results recovery, pagination, browser Back, and phone access to Fiction.
- Technical checks cover all twelve source code blocks, a minimum 12px code font, and at least 4.5:1 code contrast. A focused rerun covers code rendering and clearing a hidden search query when changing subjects.
- The overflow check was deliberately made to fail by injecting a 2000px minimum page width. The contrast check first failed at 1.22:1 before the fix. Passing checks therefore have observed failure cases.
- Captures are 1440 × 960 and 390 × 844 browser viewports. They are browser evidence, not a claim of physical-phone testing. Product captures hide only the comparison toolbar and its explanatory note.
- The prototype is JavaScript rendered. The production port must preserve native Astro articles and existing no-JavaScript reading, all writing formats, search integration, metadata, and canonical routes. Those contracts have not been ported or revalidated yet.

The accepted direction still needs to be named by Nino. After selection, record it in the experience brief, carry over useful details from the rejected concepts, implement the native Astro pages, and obtain a new cold review of the finished production build before merging.
