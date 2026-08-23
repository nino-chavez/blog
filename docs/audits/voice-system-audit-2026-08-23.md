# Voice-system audit — 2026-08-23

Four independent reviewers, one lens each, over the 21 pieces published
2026-07-24 → 2026-08-23 (15 blog, 4 tutorials, 2 whitepapers; selected on
`publishedAt`, not file mtime — mtime gives 41 and is wrong).

Every claim below was re-derived by the orchestrator against source before
being recorded. Claims that failed that check are marked.

## The one finding that outranks the rest

**There is no engagement data. None.** No analytics on the live site, no
instrumentation in `astro-build/src`, and `linkedin-shares.json` records only
title and domain. So "is this reaching anyone" is not a hard question — it is
an unanswerable one, by construction. Nothing in the pipeline reports back.

Everything else here is about what the artifacts make possible, never about
what a reader did.

## What is working

**Blog posts went from 1 of 6 to 8 of 9 doing a nameable reader job**, split at
the 2026-08-08 Reader Payoff rule. Tutorials are benched from that comparison —
they do a job by construction, and including them blends two populations.

The pre-gate evidence is heading text, not paraphrase:

```
## What I Still Don't Have        nothing-broke-it-just-wasnt-there
## What I Still Don't Have        the-cut-youll-make-twice
## And I'm Not Building It        every-link-resolves-nothing-checks-the-number
## The Missing Piece Is a Real Eval Set   the-style-guide-was-teaching-the-tells
```

That is the guide's own diagnosis — "its prescribed ending is an absence, which
is the structural opposite of a takeaway" — appearing as section headings in the
corpus it was describing. Post-gate closes carry an instruction instead.

**Structural compliance**: 17/21 state the point early, 18/21 close by
delivering rather than introducing. All three clear failures are dated 07-30,
08-06, 08-07 — every one predates the rule.

**Zero pieces lack an identifiable reader.** All 21 open on a specific situation
with an occupant.

**Rule 2 (every count needs a concrete instance) is near-universally observed.**
`the-cut-youll-make-twice` is the model: three counts, then "`AI` appears as a
live tag on four posts."

## Corrections made during the audit

- **Takeaway compliance is not 22%.** That number scored date-exempt pieces as
  failures. Among pieces the gate applies to it is 11/11.
- **Post-rule point-early compliance is 10/11, not 11/11.**
  `nine-rgb-points-from-claude-coral` (08-12) has no claim in its first 150
  words; its payoff sits at word 364. One reviewer passed it, another caught it.
  The gate checks that frontmatter exists, not that the payoff reached the body.
- **Minto is not losing to the defect-in-hand opener.** The guide resolves them
  by sequencing, not selection: the defect is the hook, the answer lands by word
  150. Both survive. An earlier read of the Freshness table had this backwards.

## What is broken, ranked by cost of the gap

1. **`denyTerms` is empty on every surface** in `reader-contract.json`, while the
   guide carries a retired-tells list in prose. The blocking mechanism exists and
   its self-test proves it works. It has nothing loaded into it. This is
   "one owner per rule" failing toward *zero* owners — the list lives only where
   nothing can read it. Cheapest fix, most leverage.
2. **`check-captions.mjs` is referenced by zero build scripts or workflows.** The
   gate built specifically because a relocation violation survived six editing
   passes fires only if a human remembers the command.
3. **The `takeaway` never reaches a reader.** Present in frontmatter, schema and
   checker; absent from every layout, component and page. Verified against a live
   render: zero occurrences. Defensible as a drafting gate, but the sentence is
   written for every piece and shown to nobody.
4. **The checker has a negation blind spot.** Takeaways that are scope statements
   ("They do not tell us whether…") pass. Nothing requires naming a reader action.
5. **The guide contradicts itself.** Quality Checklist line 747 still reads
   "Opens with tension or question, not thesis" — the pre-08-08 rule. Templates
   2–5 never got the controlling-point step, including Template 5, labeled
   "current dominant," which still prescribes closing on an absence.
6. **The Freshness table is 14 pieces past its own cadence** ("every 5 posts or
   monthly"). Its own text records a prior five-month lapse.
7. **Companion routing is one-directional.** All four tutorials link their parent
   essay; one of three parents links forward.

Items 1, 2, 5 and 6 are four instances of the operator's own named failure —
"updating the prose does not update the machines that enforce it" — occurring
inside and around the document that states the rule.

## The frameworks

- **Cut SCQA.** One reference in each source document, zero in the blog repo, no
  template or check encodes it. No drafting decision it changes that Minto does
  not already cover.
- **Diátaxis is load-bearing** and the only one visible in artifacts rather than
  inferred from prose: four deliberate essay+tutorial pairs this window, each
  tutorial naming its parent.
- **Minto became load-bearing on 08-08.** Before that it sat in the stack doing
  nothing observable in blog posts.
- **CTE mode's syntax half is not visible, and the trend runs the wrong way.**
  Blog-post median sentence length: 8.0 words pre-2026 → 8.5 (Jan–Apr) → 10.0
  (May–Jun) → 12.0 (Jul onward). Short-sentence share falls 50% → 31%. The corpus
  was plainest before any of this guidance existed. This is not proof CTE mode
  does nothing — it postdates all but nine of these pieces — but the guide is not
  producing the plainness it prescribes. Its referential half (explicit subjects,
  stable terms) was never measured.
- **The coherence is not from the four frameworks.** It comes from the ordered
  stack — evidence → reader/job → argument → cognitive load → voice → surface
  mechanics, later layers unable to override earlier ones. That ordering is the
  load-bearing invention; the borrowed frameworks are inputs to it.

## A tell the rule created, two weeks after the rule

"Here's the point, up front" (08-09), "Here's the claim up front" (08-13),
"Here is the thing worth knowing" (08-23). Three uses in fifteen days; the
variant appears nowhere before 2026-08-09. The guide's graduation rule is three
appearances in six months.

The 08-23 instance was written by an agent during this session, which is the
mechanism in miniature: a rule produces a phrase, the phrase becomes the
compliant move, and nothing notices.

## What 11/11 does and does not prove

It proves the rule is followed rather than decorative. It proves nothing about
quality. The same person wrote the rule and then the posts. The 08-08 boundary
also carries a stack reordering, a subject shift toward commerce and agent
assurance, and four weeks of practice; n=9 post-gate cannot separate them.

By the operator's own standard — "corpus observations are diagnostics until they
improve held-out writing," established when the email guide **lost to a no-guide
control** — the Reader Payoff rule is an untested hypothesis with good compliance
data. Which is more than most of the guide has.

## Recommended next moves

1. **Add a takeaway-versus-body check.** Mechanizable now: does the takeaway's
   content appear in the first 150 words of body text? Converts a hand
   classification into a build gate, and would have caught nine-rgb-points.
2. **Load the retired-tells list into `denyTerms`.** Config gap, not a feature gap.
3. **Wire `check-captions.mjs` into the build.**
4. **Sweep the Quality Checklist and Templates 2–5** to match Reader Payoff. The
   stale half is the half a drafter reaches for.
5. **Add the "up front" signpost family to the Freshness table.**
6. **Cut SCQA from both source documents.**
7. **Render the takeaway**, or decide deliberately that it stays author-side.

## The test worth running before adding another rule

The email-guide design, repeated. Hold out five pieces, calibrate nothing on
them. Three arms on the same brief: full guide / **stack-only** (the six ordered
layers plus `reader-contract.json`, no templates, no phrase tables, no corpus
statistics) / no guide. Score blind on what the guide claims — payoff within 150
words, count-plus-instance pairing, adverse evidence that changes scope, sentence
distribution.

Watch for stack-only matching or beating full-guide. If it does, the templates,
freshness tables and corpus statistics are cost without benefit, and the guide
should shrink to the stack plus the contract.

## Method and limits

Four `general-purpose` reviewers, one question each, briefed with a verified
baseline marked as a prior rather than a spec and licensed to deviate with a
justifying quote. The commissioning phrasing ("are we just shouting into the
void") was deliberately withheld — it is leading, and an agent handed it confirms
it.

Two of the four went idle without delivering. Because these reviewers write no
files, the report was the entire artifact and nothing was recoverable; both had
to be re-prompted. **Future reviewer waves should require each agent to write
findings to a file as it goes**, so an idle agent leaves something behind.

Not checked: anything about reader behaviour; the referential half of CTE mode;
causal attribution of the 08-08 shift; rendered output beyond spot checks
(`dist/` is stale, dated Aug 16).
