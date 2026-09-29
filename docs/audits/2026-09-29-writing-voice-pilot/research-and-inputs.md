# Build a copywriter from examples and editorial decisions

Writing can be described and compared systematically. For this project, the useful result is an assistant whose drafts need less correction, not a claim to have made a complete copy of a person. Start with the existing voice sources, relevant examples, and a record of Nino's choices. Test each addition before turning it into a lasting rule.

## The research gives us separate tools for separate jobs

**Stylometry** measures recurring properties of writing for tasks such as authorship attribution. It can describe vocabulary and other linguistic patterns. Recognizing an author and generating writing that the author wants to use are different tests. Stamatatos's survey provides a foundation for the former; it does not establish the latter. [A Survey of Modern Authorship Attribution Methods](https://onlinelibrary.wiley.com/doi/10.1002/asi.21001).

**Idiolect** concerns an individual's habitual language use. Nini's theory connects individuality with repeated linguistic choices and provides a formal approach to authorship analysis. For this project, that supports looking at recurring choices rather than collecting a few favorite phrases. It does not warrant treating a small set of messages as a complete or fixed fingerprint. [A Theory of Linguistic Individuality for Authorship Analysis](https://www.cambridge.org/core/elements/theory-of-linguistic-individuality-for-authorship-analysis/E52B7B8ADC2B5EC579037AC9D81575E5).

**Personalized language generation** studies producing outputs informed by a user's previous material. LaMP evaluates personalized tasks and retrieval of relevant items from user profiles. This makes selecting examples a research-backed starting point. It is not proof that retrieval alone can reproduce Nino's editorial judgment. [LaMP: When Large Language Models Meet Personalization](https://aclanthology.org/2024.acl-long.399/).

These sources were fetched from publisher or conference pages in this session. The proposed workflow below is our design inference, not a procedure validated for Nino by those papers.

## Inputs have different jobs

| Input | What it can teach us | What it cannot establish alone |
|---|---|---|
| Earlier drafts plus Nino's exact edits | What he rejects, what he preserves, and why a revision works | A universal rule from one preference |
| Independently authored essays or documents | Sustained argument, explanation, transitions, and finished prose | Current preference without checking date and audience |
| Sent email, with the preceding request | How he explains, disagrees, asks, and ends an exchange | Blog rhythm or public disclosure permission |
| Slack threads | Colleague-facing explanation, qualification, collaboration | Personal-chat or essay mechanics |
| Text conversations | Informal humor, context dependence, relationship-sensitive wording | A finished prose template or known unaided authorship |
| Published AI-assisted work | Output he accepted, when approval is recorded | A human-authored control |

We do not need an entire inbox or another indiscriminate export. Existing email examples and Slack guidance already give us a starting point. For the next evidence gap, prioritize dated originals with a known writing history and draft-to-final pairs. A proposed next batch is 6–10 substantial pieces across explanation, disagreement, and storytelling, reserving roughly a third untouched for evaluation. Those are collection conveniences, not scientifically established minimum sample sizes. Add more only when a missing use case or an unstable result justifies it.

For each sample retain source pointer, date, format, audience, purpose, author, AI/editor involvement, approval status, and intended use. Each field answers one question. Remove quoted replies, signatures, boilerplate, duplicated posts, and pasted agent output. Incoming messages supply context, not authorship evidence. Exclude sensitive third-party details from general drafting references.

## Execute the smallest useful system first

Three approaches fit the stated goal:

| Approach | Fit to the evidence here | Decision |
|---|---|---|
| A large checklist of style rules | Easy to apply, but the existing email guide reports losing its comparison; rules can become mannerisms of their own | Do not expand by default |
| Relevant examples plus a small, tested record of editorial choices | Uses the accepted revision evidence and keeps different writing jobs separate | Start here |
| A fine-tuned personal model | Requires cleaner authorship evidence and repeated evaluation than this inventory supplies | Defer |

Keep the useful part of the first option: explicit factual and attribution constraints. Keep the third option's demand for clean, separated evaluation material. Neither requires a larger guide or a trained model now.

1. Select the writing job and register. A blog post, an email, and a text need different examples.
2. Assemble a verified content brief. Facts, proposed arguments, and lived experiences stay separate.
3. Retrieve a few relevant examples plus the canonical voice source. Keep source provenance attached.
4. Add only editorial choices supported by actual corrections. Treat observations as hypotheses until they improve writing.
5. Draft, then check factual attribution and whether the reader can follow the argument. Do not manufacture confessions, typos, questions, or casualness to imitate a person.
6. Compare with the existing approach, hide the conditions, and let Nino judge usefulness and resemblance. Save exact accepted edits with their reasons.

The pilot stopped after one draft pair and that judgment. Nino later chose A after an initial tie, then requested and approved the full article and caption. The choice is recorded in the canonical guide and STATUS.md; it does not establish a measured advantage. A later validation should hold out entire pieces and conversations, separate topics and dates where feasible, and include an ordinary baseline and a wrong-writer reference. Sentence length, short-sentence share, and domain vocabulary can diagnose differences; none proves quality. If a profile loses, keep the simpler approach. Fine-tuning is a later option only if enough clean evidence and repeated evaluation establish a benefit that example selection cannot provide.

## What would change the recommendation

If relevant examples alone repeatedly outperform added instructions, omit the added profile. If the available documents prove substantially AI-written, collect independently authored material before claiming human-voice validation. If Nino prefers different behavior by audience, keep separate registers rather than averaging them. A successful single draft is useful output, but not evidence of general success.
