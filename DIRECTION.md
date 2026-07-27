# Direction — blog.ninochavez.co, home

Art direction for this surface. Sits above the brand kit (`DESIGN.md`, which says what
the colors *are*) and above the defect scanner (which says what is broken). This says
what the page is *arguing*, and which devices are allowed to trip a slop rule because
they carry that argument.

A finding with no `authorized` row here is a defect. Absence of a record is not
permission.

## Thesis

Signal Dispatch publishes thinking in progress, not finished insight. It argues that by
looking like a periodical with a live table of contents — serif masthead, small-caps
section kickers, a standing rail of what is mid-flight — rather than a product page. The
voice guide (`docs/signal-dispatch-voice-guide.md`) makes the same commitment in prose:
*public practice*, *provisional conclusions*, and "the 'signal in the noise' metaphor is
operational, not decorative." It refuses the strategy-blog default: dark page, one violet
accent, gradient headline, single CTA.

## Ledger

Every device must cite the thesis. A device that cannot is not authorized, whatever else
can be said for it.

| id | verdict | device | cites the thesis by | rules |
|---|---|---|---|---|
| `serial-rail` | authorized | Right rail: currently-serializing chapter count, essay series, four channels each with a latest item | Public practice made structural — the reader sees what is mid-flight, not only what is finished | — |
| `editorial-kickers` | authorized | Small-caps letterspaced section labels (FEATURED, CURRENTLY SERIALIZING, ESSAY SERIES, ALSO HERE) | Periodical, not product. Sections are departments of an issue | — |
| `serif-masthead` | authorized | Serif wordmark and italic serif tagline against sans body — four `ui-serif` leaves against 74 in Inter | The same claim in type: edited writing, not content marketing | — |
| `wordmark-gradient` | removed | Violet→orange gradient under `bg-clip-text` on the **sticky nav** wordmark (`SiteHeader.astro:43`) | **Could not cite it.** A gradient nameplate is the finished-insight look — the visual form of the "In this post, I'll explore…" opener the voice guide rejects by name | `gradient-text` |
| `essay-grid` | authorized | Recent essays as a two-column grid of borderless cards — feature image, category pill, title — where the title is the card's last element (`pages/blog/index.astro:192-222`) | It is the live table of contents the thesis names. A periodical's contents page lists what is in the issue; it does not write an excerpt for each entry | `heading-rhythm` |
| `category-violet` | condemned | Every category resolves to one `--color-athletic-brand-violet`, with the category argument discarded (`astro-build/src/utils/category-colors.ts`) | **Cannot cite it.** Pattern recognition is this publication's stated core value; declining to show the taxonomy's differences argues the opposite — in a token named for a design system no app in the workspace defines | `ai-color-palette` |

## Open

**What replaces the violet is not decided here.** Coral already works as the action color
and teal as the illustration palette, so neither is free to become the category color
without collision. Whether categories get a system (a ramp, per-category assignment) or
lose color entirely and lean on the kicker system that already works — both are consistent
with the thesis. That decision belongs to a person.

**Ground color.** `DESIGN.md` declares `mode: dark` while the site ships genuine white
surfaces. A periodical running two grounds with no rule for which is which is a
thesis-level question, not a token bug. Do not "fix" it by forcing one mode.

## Notes

**Two claims in the first draft of this record were wrong, and the DOM says so.** It read
`gradient-text` ×3 as "the masthead and two other headings." There is exactly **one**
gradient-clipped element on the page — the sticky nav wordmark — and the detector counts it
three ways. Querying every element's computed `background-clip` returned one hit; every
stylesheet on the page contains zero `background-clip: text` rules; the raw HTML contains
one `bg-clip-text`. The serif masthead this record authorizes never carried a gradient, so
the "device authorized, treatment condemned" split against it was also wrong.

Removed, and measured against live on the same build: `gradient-text` 3 → 0, with
`ai-color-palette` 28 → 27 and `low-contrast` 21 → 20 as the gradient's two side effects.
Everything else holds — `heading-rhythm` 7, `image-hover-transform` 7, `text-occlusion` 2.
Page total 72 → 67. The replacement is `text-white`, deliberately not a brand color: the
violet question below stays open.

**The same device survives on two surfaces this record does not cover** — the "NC" avatar
initials on `/about` and the `insight` callout title in `Callout.tsx`. Both are the same
violet→orange gradient and would fail the same reasoning, but neither surface has a
direction record, and inventing a verdict for an unadjudicated surface is exactly what this
layer exists to prevent. They belong to whichever record covers those surfaces next.

**`heading-rhythm` ×7 was recorded as a real defect that "flattens the structure this
thesis depends on." Measured, it is the rule failing on a shape it cannot evaluate.**

All seven are the same component — the Latest Essays grid — and in every one the `h3` is
the **last element in its container**. The rule's premise is that a heading binds to the
content it introduces, so space above should exceed space below. Its `edgeBelow` walks up
to parents to find the next sibling, so for a heading that terminates its card the "space
below" is necessarily the grid gap to a *different post*. The 12px above is the card's own
image-to-title spacing; the 24–52px below is `gap-6` between cards. Six of the seven bind
upward to their own category pill, inside the same card. The rule has an
`insideSmallCard` exemption for exactly this, but it requires a border, shadow, radius or
background on an ancestor and a card under 200px tall; these cards are borderless and
taller, so it misses.

Inflating the top margins would satisfy the rule and make the grid worse — a contents page
whose entries drift apart is a worse contents page. That is the sanding-toward-default this
record exists to prevent, so the grid is authorized as `essay-grid` and the finding is
waived against it rather than designed around.

The `category-violet` verdict is not "the kit says coral." `git log --follow` on
`category-colors.ts` shows the helper was born uniform, inside a commit about Astro SSG
and LLM crawler access. The color arrived as a migration side effect and the rationale
exists only as a code comment. Changing the kit to violet would not have fixed it.
