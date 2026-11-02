# Approved Blog Colors — 2026-11-02

The approved Blog refit uses Chalk & Oxblood: background `#FAF3EB`, ink `#30262B`, accent `#883B4C`, surface `#F0E2DE`, muted `#6C5B60`, and rule `#D6C6C6`.

This selection preserves Signal Dispatch’s serif editorial identity. The approved comparison is the authority for the accompanying lead, card, feature-image, and audio-panel treatments.

Nino approved both the proposed color and design on November 2, 2026. Profile is outside this change.

Native build captures are saved in [the review evidence](../evidence/approved-colors-20261102/). The Blog home and an article were rendered at 1440, 390, and 320 pixels. They have no horizontal overflow, missing visible images, or uncaught page errors. The full build, listen tests, and post API tests passed. Local static review does not exercise the runtime audio endpoint; the existing seeking fix and audio logic are unchanged.

Shared navigation remains usable on unlisted posts, which do not use the public theme. The header retains its opaque light background; the footer inherits light text from the dark page. The actual built unlisted template was rendered locally at desktop and phone widths through a neutral test address. Only the shared header, dropdown, and footer were exported. No private article text or access path is included in the evidence.

The private navigation check confirms opaque header/dropdown backgrounds and a visible keyboard outline at both widths. Footer text and links measure 19:1 against the sampled rendered background; see the [private chrome checks](../evidence/approved-colors-20261102/private-chrome/checks.json).
