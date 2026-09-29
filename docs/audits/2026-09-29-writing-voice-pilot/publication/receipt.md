# Publication receipt — The Work Doesn’t End at Send

Nino authorized both publications on September 29, 2026.

- Blog: https://ninochavez.co/blog/the-work-doesnt-end-at-send
- LinkedIn: https://www.linkedin.com/feed/update/urn:li:share:7510798923188355072/
- Article commit: `f0b6c894590b84035734144ba71cbf0a7b2870d1`.
- Cloudflare Pages production deployment: `3fde4a18-9801-47c3-b951-f674e25b66bb`, success at 2026-09-29T20:32:16Z.
- Public article returned HTTP 200. All 32 approved title, heading, and paragraph blocks matched the live HTML after whitespace normalization. Canonical URL and image loading checked in the browser.
- Production build, image variants, reader contract, and caption checks passed. Desktop and 390px mobile captures showed no overflow or missing images. Independent cold review found no publication blocker.
- Reused the existing AI-generated Jevons illustration from the Signal Dispatch archive. Three new image attempts failed the generator's QA; none was published.
- LinkedIn body was verified on its permanent post URL. The publisher skipped the first comment when it could not match the new interface. The article link was then submitted through the verified post's comment editor and confirmed visible under Nino's Author label after reload.
- Verified at: 2026-09-29T20:35:49Z.
- Other syndication channels are held with `skip-manual`; other queue items were preserved.

## Pending publishing repairs

These defects are recorded for a separate repair task. They were worked around for this publication; the runtime tools have not been changed.

| Owner | Observed defect | Repair and acceptance check |
|---|---|---|
| `syndication/post-linkedin.mjs` | Post discovery expects `feed-shared-update-v2` or `data-urn`; the live activity page used `role=listitem`. Its comment fallback expects Quill, while the verified permanent post used a TipTap editor. The caption posted; the comment was skipped. | Support the observed interface, preserve exact-post matching, and track post and comment outcomes separately. Test matching and rejection offline; on the next authorized post, confirm the comment after reload. |
| `astro-build/scripts/generate-illustration-images.js` | The category prompt encourages robots and circuitry; the generated scene omitted them. QA rejected all three renders for scene mismatch or lettering. The source already documents this mismatch pattern. | Reconcile concept, style instructions, and QA criteria before another paid attempt. Preserve the attempt cap and compare against the same scene. |
| `syndication/build-queue.mjs` | Full regeneration in this isolated checkout removed unrelated queue entries. The checkout lacked the sibling demo source. Before committing, the parent restored all other entries and added only the new article. | Reproduce which missing inputs remove records; preserve unrelated records or fail clearly when sources are incomplete. Test with an intentionally missing source and ensure existing posted states survive. |

The Jevons evaluation proposal remains open research: compare whole exchanges, including recipient effort and commitments, with and without assistance. No assistant-overload outcome was measured here.
