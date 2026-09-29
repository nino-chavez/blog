# Publication checks: Trying to teach an AI how I edit photos

Nino authorized running the approved draft through the blog process, publishing it, and cross-posting to LinkedIn on September 28, 2026.

The published-source body preserves the approved draft and closing paragraph. Publication metadata and an explicit generated-illustration disclosure were added. The LinkedIn companion was checked against the article, reader contract, voice guide, and repository reference caption. Its first-person claims remain attributed to Nino; the API-rate estimate remains distinct from an account charge; proposed controls remain unimplemented.

- Full Astro production build: passed, including image variants, takeaway, sitemap, reader contract and caption checks.
- Automated render checks: 1280 px desktop and 390 px mobile, DPR 1; no horizontal overflow or broken images; closing paragraph present. Desktop height 6272 px, mobile 9974 px.
- Parent visually inspected both page captures. The in-app browser's initial full-page capture repeated sections and was rejected; the saved captures were replaced using an isolated automated browser check.
- Primary review JSON files still match the previously recounted evidence hashes: 0/6/4, 0/7/3, 0/3/0 wins/losses/ties.
- Recomputed API-equivalent estimate: $795.296892. Pricing source fetched again and supports $10/$1/$50 per million at standard short-context rates. Actual account charge remains unverified.
- LinkedIn dry run: one selected article, under character limit, signed in, composer never opened. `/in/me/` resolves to Nino Chavez's `/in/nino-chavez/` profile.
- Syndication ledger change scoped to the new article; unrelated route states and dates preserved.

Feature image: project generator rejected three candidates; reported rendering cost $0.1169. One subsequent built-in image-generation call produced the selected image, saved as `astro-build/public/images/generated/trying-to-teach-an-ai-how-i-edit-photos.webp` and its 600w variant. Built-in call cost was not returned.

Image brief: a wide editorial illustration of a single photo-editing monitor displaying two versions of one indoor volleyball photograph, with restrained cyan and white linework on deep navy, simple sliders, no readable text, robots, brains, circuitry, or trophies. It illustrates comparing edits and is not evidence of a successful editor or a real test photograph.

Cold review: pass with no publication blockers. The independent readback correctly distinguished mechanics from utility, estimated cost from invoice, and proposed controls from implemented safeguards. Operator dispatch `04ce0754-fb01-4677-abdf-35d4eb7fe66b` completed; selected Terra/medium, runtime model and effort were not exposed. External publication results follow when complete.


## Published

Article: https://ninochavez.co/blog/trying-to-teach-an-ai-how-i-edit-photos

Source commit: `92fad79f17e65fc97617564db247269efee62ffa`. Cloudflare production deployment `5f6946ba-ca23-4cd7-873b-7e92c62e71d1` completed successfully. Public article and both WebP variants returned HTTP 200; title and approved closing verified in the live HTML.

LinkedIn: https://www.linkedin.com/feed/update/urn:li:share:7510504384657530880/

The existing publisher submitted the post but could not identify it to add the first comment. The `/in/me/recent-activity/all/` alias showed no posts; the verified profile's `/in/nino-chavez/recent-activity/all/` showed the exact new caption. Its post controls used the newer `role=listitem` layout instead of the publisher's older selectors. The parent identified this post by its text and share URN, added the article URL once, and verified the published comment after navigating to the post's own URL. No repost was made. `linkedin-live.png` captures the published post. Publisher maintenance is separate work; no delivery code changed here.

No other social channel was published. The task's local preview server was stopped after review.
