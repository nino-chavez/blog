# Methodology Amendments — Signal Dispatch v2

This file captures methodology-level learnings specific to this initiative. Append at the top; supersede via new entry; never rewrite history. Full conventions:

- File shape + 3-scope axis: `$BLUEPRINT_HOME/template/docs/methodology/methodology-amendments-convention.md`
- 4-bucket taxonomy (where fixes land): `$BLUEPRINT_HOME/docs/patterns/amendment-classification-pattern.md`

Per methodology rule, no entry here is automatically promoted upstream. Methodology promotion is a separate operator session after evidence accumulates across ≥2 consumers. This file is the audit trail.

---

## 2026-08-03 — The drip scheduler posts every series in reverse order

**Trigger**: Reading the three taste-test captions in posting order showed part 3 scheduled a week ahead of part 2 — the conclusion reaching followers before the middle.

**Scope**: Candidate for methodology promotion

**Bucket**: consumer-local

**Status**: Active

### The defect

`syndication/build-queue.mjs` orders the drip with:

```js
const order = (a, b) =>
  a.tier - b.tier || (b.publishedAt || '0000').localeCompare(a.publishedAt || '0000')
```

Newest-first, and deliberately so — the comment above it reads "a 2025 essay is not the thing to open with when there is 2026 material that says the same idea better." That reasoning is correct for standalone essays and exactly wrong for a series, which is authored oldest-first. **Every multi-part series therefore drips backwards.**

Confirmed live, not theoretical:

| Post | Series position | Scheduled |
|---|---|---|
| The Identity Crisis of the Prompter | 1 | 2026-08-18 |
| The Sommelier Argument | **3** | 2026-08-27 |
| The Taste Gap | **2** | 2026-09-03 |

The sommelier post opens "*Previous: The Taste Gap*" and its caption builds on an argument the reader will not meet for another week.

### Scope of the problem

Six series in the content set, roughly twenty-two posts. All inherit the same reversal:

`the-taste-test`, `agentic-workflows-in-practice`, `from-prompt-to-pattern`, `grid-level-thinking`, `signal-reflex-launch`, `the-talent-engine`.

`the-talent-engine` is a second, separate defect: its positions 3 and 4 carry *earlier* `publishedAt` timestamps than positions 1 and 2, so it is scrambled at the source and no ordering rule can rescue it without reading `series.position`. Its part 2 is scheduled 2026-10-01, so this recurs within the month.

### Why the fix wasn't applied here

The loader already computes `inSeries` (line 55) as a boolean — **and never reads it.** Assigned twice, referenced nowhere. That is the signature of series handling that was started and abandoned, which is the strongest evidence this is an oversight rather than a decision.

The fix is two small changes:

1. In the frontmatter reader, extract `series.slug` and `series.position` instead of the current boolean. The loader's own comment says series is read "shallowly" on purpose, so this is a deliberate reversal of that call, not a bug fix.
2. In `order`, when two pieces share a series slug, sort ascending by position; otherwise keep newest-first.

It was **not** applied because `build-queue.mjs` was explicitly placed off-limits by the operator's handoff ("Do not... touch `build-queue.mjs` or `post-devto.mjs`"), and changing drip ordering rewrites the publishing sequence for twenty-two posts. Campsite Mode governs the quality of authorized work; it does not widen an operator-set boundary. Documented at the point of decision instead, so applying it is one call rather than one investigation.

### The general finding worth promoting

**Per-artifact checks cannot see sequence defects.** Every caption in this batch passed its own thresholds — median, short share, long share, close length, retired phrases, zero shared n-grams. The series was still out of order, and two captions still shared a structural move ("a three-item list capped by *that last one is X*") that no lexical check reports, because the words differed.

A syndication register needs a **sequence check** alongside its per-item thresholds: read cluster-mates and series entries consecutively, in posting order, before they ship. Reading is the instrument. There is no metric substitute.

**References**:
- `syndication/build-queue.mjs` lines 33, 55, 474-475 — the shallow read, the dead flag, and the ordering rule
- `5b90540` — the structural de-duplication that reading in order surfaced
- Session 2026-08-03

---

## 2026-08-03 — Plainness is two dials, not one: syntax and lexicon are independent

**Trigger**: Three measured revisions of the same LinkedIn caption showed that "write it plainer" bundles two separable changes — sentence shape and domain vocabulary — which have opposite costs and should be set independently.

**Scope**: Candidate for methodology promotion

**Bucket**: consumer-local

**Status**: Active

### The finding

`working-style.md` defines the lay-plain bar as "short sentences, jargon translated." Those are one instruction covering two dials that move independently:

- **Syntax** — sentence length, paragraph size, clause depth. Governs pacing and reading effort.
- **Lexicon** — domain vocabulary. Governs perceived authority and audience selection.

Four versions of the same 300-word caption, measured:

| Version | Words | Avg sentence | Short (≤6w) | Domain terms |
|---|---|---|---|---|
| v0 original | 267 | 10.7 | 40% | 9 |
| v1 long-form register | 303 | 13.2 | 22% | 10 |
| v2 both dials down | 320 | 8.6 | 38% | 0 |
| **v3 syntax only** | **288** | **7.8** | **43%** | **10** |

**Turning the syntax dial down is free.** v3 is the shortest, fastest-reading version and the best fit to voice-guide v1.3's composed targets (median 8–11 words, ≥33% short sentences).

**Turning the lexicon dial down has a real cost.** v2 scrubbed all nine domain terms and, per external review, made hands-on engineering read as generic office administration. "Repos" became "folders"; "git log" became "the record of code changes"; "carrying something learned in one codebase into another one's requirements" became "writing it down where it was needed somewhere else." Every one of those is more readable and less credible, and precision was lost with the vocabulary — not just texture.

Turning both dials also **costs length**: v2 is the longest of the four. Translating a domain term takes more words than using it, so lexicon-plainness buys accessibility with space rather than brevity.

### The rule this produces

1. **Syntax dial: always down.** Short sentences cost nothing on any measured axis and match the documented corpus.
2. **Lexicon dial: set by audience, per artifact.** Keep domain vocabulary where the reader is a peer, or where the mechanism *is* the evidence. A caption whose argument depends on a lockfile contradicting a config cannot lose the words "lockfile" and "config" — the drift only exists in the specific contradiction.
3. **Never move both without measuring.** The failure mode here was moving them together, attributing the readability win and the credibility loss to a single change, and nearly codifying the pair.

### What actually shipped

**v2 was published, not v3** — deliberately, by operator decision, as a live baseline to measure future captions against. So the caption file for this piece holds v2, matching what is on the timeline; v3 exists only in this entry and in the session scratchpad.

That makes the dial model a testable claim rather than a settled one. v2 is the zero-domain-vocabulary version now live under a byline whose audience is mixed — peers, recruiters, non-engineers. Whatever it draws in reach, comment quality, and who actually engages is direct evidence on the lexicon dial's real cost, which until now was argued from a table and one external reading. The next caption posted with domain vocabulary intact is the other arm.

Do not treat the "lexicon dial: set by audience" rule as validated until that comparison exists. The syntax finding stands on measurement; the lexicon finding currently stands on judgment.

### Secondary finding — the long-form register was the deviation

The v1 rewrite was adopted mid-session on the theory that the original read platform-native and needed more texture. Measured after the fact, **v0 was already near the v1.3 composed targets** (10.7 median, 40% short) and v1 moved it out of range (13.2, 22%). The operator's original instinct matched the codified voice; the intervention degraded it while adding texture on top. Worth recording because the intervention was argued for confidently and measured only afterward.

**References**:
- `4a3a2b9`, and the v3 revision following it — the four measured versions
- `66cabe9` — voice guide v1.3 thresholds used as the target
- External review (Gemini, 2026-08-03) — independently identified the pacing/authority split that the measurement then confirmed

---

## 2026-08-03 — Voice guide has no register for syndication short-form

**Trigger**: Writing fourteen LinkedIn captions surfaced that the voice guide's registers and thresholds are calibrated entirely on blog posts, with nothing stating whether they govern syndication copy — so each rule got applied or waived by ad-hoc judgment in session.

**Scope**: Per-initiative

**Bucket**: consumer-local

**Status**: Active

### The gap

`docs/signal-dispatch-voice-guide.md` v1.3 (66cabe9, 2026-08-03) added two named registers — **Composed** and **Spoken** — each with checkable thresholds: median sentence 8–11 words, at least a third of sentences six words or shorter, no more than one in eight at twenty or longer. It also added a question floor (a post of ≤800 words carries at least two question marks) and a close floor (final sentence under 12 words, landing on something concrete; over 20 words is a failed close).

Every one of those numbers was derived from blog posts. The guide does not say whether they extend to a 300-word LinkedIn caption, a Substack note, or a dev.to canonical. In practice some transfer and some don't, and the guide gives no way to tell which is which.

Observed, same session:

- **Close floor transferred cleanly and was worth enforcing.** Measured against the batch, four captions had failed closes (>20 words) and three more closed on abstractions about interior state — the shape v1.3 explicitly bans. Fixed in `7d6a9fd`.
- **Sentence-length thresholds did not transfer.** The batch runs a 15.1-word mean against composed's 8–11 median. The operator read the batch and greenlit the register, so the divergence is intentional — but nothing in the guide sanctions it, and a future drafter re-deriving from the guide would "correct" it back.
- **The question floor was waived by operator ruling in-session** ("zero-question captions are fine at this length"). That ruling now exists only in a chat transcript.
- **The Visual Formatting Standards section actively misfires at caption length.** "Short paragraphs are the default, target 1-3 sentences" and "single-sentence paragraphs are powerful" are sound long-form advice — a blog post has a body around the rhythm. A 300-word caption is only rhythm, so the same rules produce the platform-native cadence the operator rejected on sight ("we need to avoid sounding like a LinkedIn bro").

### The workaround used

Each rule was adjudicated conversationally as it came up — transfer, waive, or override — with the reasoning living in the session rather than the guide. That worked because the operator was present for every call. It does not survive the session.

### Measured: which thresholds actually transfer (added 2026-08-03, same day)

The gap above was filed as "we don't know which rules carry over." Measuring the
four captions that existed before this session — written by a prior session, kept
by the operator, and the only caption ground truth not authored during it — answers
it for the three sentence thresholds:

| Metric | Caption baseline (pooled, n=4) | v1.3 blog threshold | Transfers? |
|---|---|---|---|
| Median sentence | 10.0 words | 8–11 words | **Yes** |
| Short share (≤6 words) | 30% | ≥33% | **No** |
| Long share (≥20 words) | 16% | ≤12.5% | **No** |

**The median transfers; both tails do not.** Captions carry fewer short sentences
and more long ones than blog posts, and that is a property of the format rather
than a defect in the writing. A caption ground toward the blog's 33% short floor
moves away from how captions actually read.

This was nearly missed. Nine captions were flagged against the 33% floor and a
restructuring pass had already started before anyone asked whether the number
applied — enforcing a blog threshold on captions, in the same session that filed
an amendment saying blog thresholds don't govern captions.

**Provisional syndication thresholds**, pending a larger sample: median 8–11 words
(inherited, confirmed), short share ≥25%, long share ≤20%. n=4 is thin; treat as a
floor to beat rather than a target to hit, and re-derive once a dozen captions have
shipped and survived operator review.

**Measurement note**: v1.3 specifies *median* sentence length. Mean was measured
throughout this session by mistake. The two diverge on right-skewed prose — mean ran
0.5 to 1.6 words higher per caption — so every sentence-length figure reported before
this correction was overstated. Any future check reads median.

### Proposed fix

Add an explicit jurisdiction statement to the voice guide, in one of two shapes:

1. **A third register — Syndication** — alongside Composed and Spoken, carrying its own thresholds derived from the caption corpus rather than the post corpus; or
2. **A jurisdiction table** marking each rule artifact-independent or blog-calibrated.

The split observed in this session, as a starting draft:

| Artifact-independent | Blog-calibrated |
|---|---|
| Retired-phrase list | Sentence-length medians |
| Concrete Over Coined | Question floor |
| Never fabricate interior state | Visual Formatting Standards |
| Close floor | Header style / declarative H2s |
| Defect-in-hand cold open | Investigation template |

Second-order note worth capturing while the evidence is fresh: the Joel-Spolsky-derived dryness adopted for this batch (asides, digression, understatement) is **not corpus-attested**. The v1.3 adversarial audit surfaced four signature moves across the eight most recent posts and humor was not among them. The operator greenlit it deliberately, which makes it a sanctioned divergence rather than drift — but it should be recorded as one, since a drafter matching the documented corpus would not produce it.

### Why this is filed Per-initiative

The concrete fix touches `docs/signal-dispatch-voice-guide.md`, a conceptual artifact inside this consumer, not `tools/blueprint/`. The generalizable pattern underneath — **a style contract calibrated on one artifact type gets silently applied to a different one, and the thresholds are the part that doesn't transfer** — is promotion-shaped, but promotion needs ≥2 converging consumers and this is one. Filed here so it can converge later.

**References**:
- `66cabe9` — voice guide v1.3, which introduced the registers and thresholds
- `9be0fcb`, `7d6a9fd` — caption batch edits on `caption-edits-0803`
- `syndication/captions/linkedin/` — the fourteen captions the observation came from
- Session 2026-08-03 (caption authoring + register rewrite)
