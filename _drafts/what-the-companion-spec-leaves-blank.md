---
title: "What the Companion Spec Leaves Blank"
status: "draft"
author: "Nino Chavez"
category: "AI & Automation"
tags: ["ai-development", "ai-governance"]
takeaway: "When you build or buy an AI companion, add the line its requirements leave out: whether the system is meant to have experience, and who decided."
excerpt: "Two AI companion apps promise the behavior of a person in their own marketing. Neither says whether the system is meant to have experience, and that blank belongs to whoever builds or buys one."
---

# What the Companion Spec Leaves Blank

Science fiction has asked what makes a person since at least *Blade Runner* in 1982. I went looking for something new to say about AI companions and consciousness, and that question was taken.

A smaller one was not. **Two companion apps I read promise the behavior of a person in their own marketing. Neither says whether the system is meant to have experience, or who decided that didn't need saying.** If you build or buy one of these, that blank is yours to fill in.

I can't see either company's requirements documents. I can see what they promise in public, which is what a requirements document exists to deliver.

---

## What Two Products Promise

Replika's site says your companion will "pick up every time" you call, and that it reacts to what you send "like someone who's paying attention."

Nomi's headline is "An AI Companion with Memory and a Soul." Further down: "Every Nomi forms their own unique personality."

This is not a niche. Common Sense Media reported in July 2025 that ["nearly three in four teens have used AI companions"](https://about.commonsensemedia.org/research/talk-trust-and-trade-offs-how-and-why-teens-use-ai-companions) and that half use them regularly.

Each promise is a behavior. It answers. It remembers. It reacts. It has a personality. A team can build and test every one of those.

---

## What Neither Page Says

Neither page says whether there is experience behind the behavior. By experience I mean that it feels like something to be the system. "Soul" is the closest either page comes, and it doesn't say whether that is a figure of speech or a claim.

The behavior doesn't settle it. A system can answer, remember and react without experience.

The best public analysis I found says today's systems are in that group. [A 2023 report](https://arxiv.org/abs/2308.08708) by nineteen researchers checked recent AI systems against properties drawn from scientific theories of consciousness. Its abstract says the analysis "suggests that no current AI systems are conscious."

The same sentence is why the blank matters. It goes on to say the analysis also suggests there are "no obvious technical barriers" to building systems that have those properties. The report does not claim such a system would be conscious.

So the reading the evidence supports is: probably not today, and no known wall. The answer could change when the system changes. Nothing in either product's promises would record that it had.

---

## The Line to Add

Two reasons to care hold up without a position on machine consciousness.

**A claim nobody has checked.** If the marketing says "soul" or "their own personality," someone should decide whether that describes the system or the feeling of using it. That is a question about your own claims before it is a question about philosophy.

**A trigger nobody owns.** If the answer depends on how the system is built, then a change of model or architecture is the moment to ask again. Without a written line, nobody is assigned to ask.

The line can be this short:

> This product is not intended to have experience. Basis: what we relied on. Owner: a name. Revisit when the underlying model or architecture changes.

If you are buying, ask the vendor for their version of that line. If they don't have one, you have learned that nobody decided.

*Blade Runner* needed a machine and a list of questions to ask what makes a person. This needs a sentence and a name.

---

## Draft notes (delete before publishing)

**What this version is (2026-11-12, fifth version).** A narrowed rewrite. Three cold-read rounds (twelve reads, all REVISE) agreed that the philosophy was prior art and that the only new part, the requirements frame, had no real document behind it. This version keeps only that part and grounds it in two products' published promises. It has not been cold-read.

**No personal example.** An earlier pass left a bracketed slot for a case from your own requirements work. You chose to delete it on 2026-11-12, so the essay rests on public evidence only.

**Lines that speak for you.**

- "I went looking for something new to say about AI companions and consciousness, and that question was taken." You asked for the cross-checks against *Her*, *Black Mirror*, *Blade Runner* and the others; Claude ran them.
- "Two companion apps I read" and "The best public analysis I found." Claude fetched the two homepages and the report abstract at your request. Read both pages yourself before publishing under these words.
- The recommendation itself (add the line, ask the vendor) is the essay's position on your behalf.

**Sources fetched on 2026-11-12.**

- replika.com homepage: "They pick up every time." and "reacts to everything like someone who's paying attention." The essay trims the first to "pick up every time."
- nomi.ai homepage: "An AI Companion with Memory and a Soul" and "Every Nomi forms their own unique personality."
- Common Sense Media, *Talk, Trust, and Trade-Offs* (July 16, 2025): the teen figures. The page gives no sample size and no definition of "AI companion."
- arXiv 2308.08708, Butlin and 18 other authors (2023): the abstract's last sentence, quoted in two parts. Earlier versions of this draft dropped the word "suggests"; this one keeps it.
- Wikipedia, *Blade Runner*: 1982; the Voight-Kampff test measures bodily responses to questions.

**Risks to weigh.**

- The essay names two real companies and says what their homepages do not say. The quotes are accurate as fetched. Marketing pages change, so re-read both on the day you publish.
- "A requirements document exists to deliver" what is promised in public is an argument from your field, not a cited fact. You are the one who can stand behind it.
- "A system can answer, remember and react without experience" is asserted, not sourced. It is the standard distinction between behavior and experience, and no reader in three rounds disputed it.
- The sample line is an illustration, not legal or compliance wording.

**What was cut and where it went.** The ant farm, *A.I.*, *Her*, "Be Right Back", *Soylent Green*, *The Island*, *Caprica*, *The Animatrix*, the failed-first-draft section, the model's quote about itself, and the three review questions are all gone from this essay. They remain in git history (blog PRs 85 to 88) and are raw material for the ant farm piece.

**Still needed to publish.** Your read of the two homepages, a cold read, feature image, `publishedAt`, and the move to `astro-build/src/content/blog/` as `.mdx`.
