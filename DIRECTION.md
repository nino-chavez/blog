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
| `coral-accent` | authorized | `--color-signal-coral` `#e86c5d` as the single accent — links, hovers, focus, code, blockquote rule, category selection, card borders (265 references) | The kit has declared coral as this publication's accent since it was generated, and `lib/og-card.ts` already used it for share cards. Implementing it retires a violet→orange pair inherited from the volleyball portfolio — a palette that not only was never chosen for this publication but is the most recognizable generated-UI signature there is, which no page arguing for pattern recognition can afford to wear | `ai-color-palette` |
| `insight-cyan` | authorized | `--color-signal-cyan` `#00ced1` on the `insight` callout and the presentations surface only | The kit declares cyan as secondary for "highlights, data viz." Three callout types need three treatments; collapsing them to one accent would discard a distinction the reader uses | — |
| `category-palette` | undecided | Eight categories, eight hues — violet, orange, blue, emerald, amber, pink, cyan, indigo (`BlogList.tsx:23`), none of them in `DESIGN.md` | The *device* cites the thesis directly: pattern recognition is this publication's stated core value, and showing the taxonomy's differences is that value made visible. What cannot be settled here is the palette — eight undeclared hues against a kit that declares one accent. Two honest resolutions, both thesis-consistent: declare a category ramp in the preset, or drop to label-only. Left in place, unchanged, until that is chosen | `ai-color-palette` |

## Open

**~~What replaces the violet is not decided here.~~ The *accent* was decided 2026-07-27:
coral. The *category* question is still open and still belongs to a person.** These were
always two questions and this record ran them together. Settling the accent does not settle
the categories: a single-accent kit and a declared category ramp coexist without
contradiction — that is what a sidecar palette extension is for. The two paths this record
named remain both live and both thesis-consistent.

*(A first pass at this deleted the eight category hues outright and recorded the choice as
"forced" by the accent decision. It was not forced, and the decision that authorized the
accent migration said nothing about category pills. Backed out and restored unchanged.)*

Worth recording that this record's framing of the problem was wrong in both directions.
"Coral already works as the action color" — coral existed in exactly one file,
`lib/og-card.ts`, which renders social share images and therefore never appears on the
site. And "teal as the illustration palette" undersold it: teal/cyan is 350 references,
concentrated in `content/presentations` and `components/presentations`. That is not an
illustration palette, it is the presentations surface running its own system — which is
now reconciled, since the kit declares cyan as secondary and that is what presentations
were already using.

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

**The device no longer exists on those two surfaces — which is not the same as adjudicating
them.** The "NC" avatar initials on `/about` and the `insight` callout title in
`Callout.tsx` carried the same violet→orange gradient, deferred here because neither surface
has a direction record. The accent migration retired the gradient's second hue across the
codebase, so the construct disappeared as a side effect: `/about` is flat coral now, the
`insight` callout flat cyan, and 24 gradient constructs went with them.

No verdict is being entered for those surfaces. `/about` still has no record, and a finding
there still has no authorized row — absence of a record is not permission, and that holds
just as much when a change happens to make the finding go away. They belong to whichever
record covers them next, exactly as before.

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

**The `category-violet` row described a file that nothing imports.** It read: "Every
category resolves to one `--color-athletic-brand-violet`, with the category argument
discarded (`astro-build/src/utils/category-colors.ts`)." Two things wrong with that. The
file was **dead** — `grep -rn "category-colors" src` returns nothing outside the file
itself — and the live helper is a local `getCategoryColors` at `BlogList.tsx:23` that did
the **opposite**: it assigned eight distinct hues, one per category. The record condemned
uniformity on a surface that was actually running an eight-color palette. Deleted the dead
file; the live map is adjudicated above as `category-palette`.

The row's closing clause was also false. It called `athletic-brand-violet` "a token named
for a design system no app in the workspace defines" — this app defined it, at
`astro-build/src/styles/global.css:23`, along with an eleven-step `athletic-neutral` ramp
and `court-navy`/`success`/`warning`/`error` that **nothing** referenced. Those are now
deleted too.

The pattern across both this record and `website-nc`'s is worth naming once: every false
claim came from reading a file that *looked* authoritative — `DESIGN.md`, a
plausibly-named util — and describing the site it implied, instead of querying the site.
A record that inherits its facts from another document inherits that document's errors,
and this layer's entire value is being the thing that doesn't.
