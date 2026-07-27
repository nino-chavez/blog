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
| `serif-masthead` | authorized | Serif wordmark and italic serif tagline against sans body | The same claim in type: edited writing, not content marketing. **Device authorized, treatment condemned** — see `wordmark-gradient` | — |
| `wordmark-gradient` | condemned | `background-clip: text` + gradient on the masthead and two other headings | **Cannot cite it.** A gradient headline is the finished-insight look — the visual form of the "In this post, I'll explore…" opener the voice guide rejects by name | `gradient-text` |
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

`heading-rhythm` ×7 (h3s at 12px above / 24px below) is not a device and is not
adjudicable. It binds each heading to the block above, flattening the structure this
thesis depends on — so it earns priority it would not otherwise get.

The `category-violet` verdict is not "the kit says coral." `git log --follow` on
`category-colors.ts` shows the helper was born uniform, inside a commit about Astro SSG
and LLM crawler access. The color arrived as a migration side effect and the rationale
exists only as a code comment. Changing the kit to violet would not have fixed it.
