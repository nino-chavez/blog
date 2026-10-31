# Signal Dispatch: choose an essay, then read it

Current direction for the publication's home, archive, subject pages and native essays. Nino selected **A — Journal + C — Subject library** on October 30, 2026. The comparison and source evidence remain in `docs/design/concepts/blog-20261030/`; the decision is recorded in `docs/design/experience-brief.md`.

## The reader's job sets the layout

A new visitor needs to understand what is here and choose a piece. A returning reader may know the subject or title they want. Once an essay is open, the text needs an uninterrupted reading column and a reliable way back.

The home page therefore leads with recent writing. One essay gets a large title, short excerpt and original image; four more pieces follow. Subjects sit beside these choices on desktop and become a compact section on phones. The archive is a separate list with visible search, pagination and subject context. An article has no persistent post index.

## The selected combination

| Device | Purpose and limit |
|---|---|
| Journal lead | Makes the latest essay the first clear choice. It shows the existing title, excerpt, date and image; it does not duplicate the complete article. |
| Subject navigation | Helps readers explore a known interest. Labels and routes use the existing canonical tag registry; older published tag URLs remain accessible. |
| Illustrated recent essays | Gives nearby alternatives enough context to choose. Images support real published pieces; there is no invented artwork or decorative category color system. |
| Focused article column | Keeps long-form text at a readable measure. Search, archive return, the table of contents and end-of-essay navigation remain available. |
| Compact series context | Identifies a chapter before reading. The full series panel follows the essay so it does not displace the opening. |
| URL-owned return state | Retains the useful behavior from rejected direction B: search, subject, page and original result survive movement between essays. |

## Type, color and spacing

Use the existing paper and ink palette: ground `#f4f0e8`, surface `#fbf8f1`, text `#122a3c`, secondary text `#536373`, links and focus `#0d5a93`. Code blocks retain the native syntax-highlighted dark ground; syntax colors must remain legible against it. A visible scroll hint and keyboard-focusable region expose long lines without altering indentation.

Georgia supplies the masthead, article titles and reading text. Inter Variable supplies navigation, excerpts and metadata. Native essays use a maximum 700px column, 22px body text with 1.67 line height on desktop, and 20px with 1.7 line height on phones. Main discovery pages use a maximum 1180px width. Heading scale and short metadata distinguish choices without making every row compete at display size.

These are scoped publication choices, not a new global brand export. `DESIGN.md` remains generated from the brand source. `SiteHeader.astro` owns the shared masthead; `article.css` owns essay reading and `reading-list.css` owns discovery and archive layout. Presentation content retains its authored deck palette.

## What stays separate

The profile and photography site retain their own styles and navigation. Their links open new tabs. Fiction, tutorials, whitepapers, presentations and counterpoints retain their formats and routes. This design changes how readers find and read the existing work; it does not revise article prose, claims, publication dates or content status.

## Superseded decisions

The July 2026 rail, coral treatment and category-palette discussion described an older rendered site. The October 26 split reading layout is also superseded for the surfaces above. Their historical records remain in Git history; they do not authorize rebuilding those devices into this direction. Specialized content outside the scoped pages is not adjudicated by this record.

Review the rendered page, not this document, when judging hierarchy, readability or completion. Test evidence and cold-review dispositions are recorded beside the comparison artifacts.

## Listen feature — preserve the reading surface

The affected surfaces are the native essay opening on desktop and phone, its optional audio controls, and a local listening room for author review. Keep the selected Journal typography, column width, byline and article prose. An approved recording sits below the byline and before the contents and opening paragraph. Native controls support play, pause and seeking without JavaScript or autoplay. Identify the selected narrator and disclose AI narration; the essay supplies the transcript. Nino selected an original British narrator after reviewing both his clone and three designed-voice auditions. The author byline remains separate from narrator identity.

Unapproved recordings remain outside Astro's source and public directories. The local listening room is bound to this computer and is never a published route. Only the author's approval of the actual recording permits adding public audio metadata and assets.
