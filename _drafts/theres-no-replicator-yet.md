---
title: "There's No Replicator Yet"
status: "draft"
author: "Nino Chavez"
category: "AI & Automation"
tags: ["ai-development", "agentic-systems", "reflection"]
takeaway: "When an AI tool gets most of a task right, weigh the time it saved against finding and fixing its misses, and what an unfound miss would cost."
excerpt: "An AI agent did nearly all of a family member's data entry, missed one or two items, and almost got written off. All-or-nothing is a replicator's bar, and nothing I use with AI clears it yet."
---

# There's No Replicator Yet

A family member was copying from a sheet in one browser tab into forms in another. I showed her how to install an AI agent and its browser extension, and we asked it to do the data entry.

She was amazed and creeped out watching the computer work on its own. Then it missed one or two items, and she almost dismissed the whole thing.

I teased her: "Well, if it can't do 100% of it, then you're acting like it should not do any of it at all." By my estimate, it had done 99% of the work.

All-or-nothing is the right bar for a Star Trek replicator: ask for dinner and it appears exactly as you meant it. Nothing I use with AI works like that yet, and the machines change by the day.

Until the replicator exists, someone has to know how to cook. Here, cooking means judging what the machine missed and deciding whether the rest was worth keeping.

---

## Most People Around Me Need It Ready-Made

Short of a replicator, there are four ways to get dinner, from no cooking to all of it.

| | What you do | The AI version |
|---|---|---|
| **Microwave dinner** | Heat it and eat what comes out | Someone else sets it up; you press go and take what comes back |
| **Factor** (ready-made meals delivered) | Pick from a menu of meals cooked to a plan | You pick a ready-made AI tool built for one kind of job, like a meeting note-taker, and use it as delivered |
| **HelloFresh** (meal kits) | Cook from the recipe card with the ingredients in the box | You get the tools installed and the steps written down, then run them and fix what comes out wrong |
| **Homemade** | Choose the ingredients, taste, adjust | You decide what to hand over, check the result, and change your approach when the model changes |

Most people around me need the first row. My family member is still on it.

Installing the agent didn't move her. She judged the result by the replicator's bar, all or nothing. Moving toward the last row means judging whether the rest is worth keeping.

I've done this kind of setup many times over at a volleyball club where I do photo and media work. [TK: one concrete instance from the club, or cut this paragraph.]

I can cook with these tools, up to a point. Even the agent I build with is a packaged product I didn't make, which I wrote about in [Who Is Still Driving?](https://ninochavez.co/blog/who-is-still-driving)

---

## Swapping the Model Changes What Comes Out

New models ship constantly, and swapping one in can change the result. A cook tests the swap before trusting it. Someone using the tool ready-made doesn't see the swap.

I use AI agents to write code. At the end of a working session, I run a check on the session's transcript. Among other things, it looks for passwords and keys that ended up in the transcript by mistake.

On October 7, a smaller, cheaper model came out. I wanted to know whether it could run that check, so I ran five past transcripts through both models.

In one transcript, a key had been printed into the output of a command. The larger model flagged it and said to replace it. The cheaper model missed it on both of its runs.

One case says little about the model in general. It was enough to keep the check on the larger model.

Then I added a plain scan for anything shaped like a key, so catching a leak no longer depends on which model is paying attention.

Deciding which model to trust with which job is part of cooking. Someone using a ready-made tool doesn't get to make that call.

---

## Sometimes 100% Is the Right Bar

Her instinct isn't always wrong. If those forms had moved money, one or two missed items could have cost more than everything the agent saved.

My 99% is also an estimate, and it leaves something out. Finding the missed items is work too. [TK: How did she find them? Were they obvious at a glance, or did she have to check every entry?]

If she had to check every entry, that checking belongs in the comparison. The agent could still come out well ahead, but only a count that includes the checking shows it.

Deciding when 99% is good enough is the cook's job.

---

## Less Cooking, Once the Tool Can Say What It Missed

In [Who Is Still Driving?](https://ninochavez.co/blog/who-is-still-driving), I wrote that a product needing an expert to catch its mistakes should say so. I listed three things I want to know before I rely on an agent:

- What mistakes will I need to catch?
- What can I do if something goes wrong?
- How will I know the job is finished?

Those questions also mark how much cooking a tool still leaves you. When a tool can answer them for itself, and tell my family member which items it skipped, her only job will be deciding whether the misses matter.

Until then, a result that comes back mostly done needs two checks. One is the time it saved, minus the time it took to find and fix what it missed. The other is what a miss nobody found would cost.

<!--
EDITORIAL NOTES — private source record; excluded from any published article.

Status: draft, not published, no feature image, no social or newsletter send. Lives in _drafts/ so the site build never routes it.

Reader: the reader-contract default (technically curious product, engineering, or business leader); plainness practitioner. Job: understand why AI use still needs someone who can judge partial results, and leave with a check for "mostly done" output. Mode: Thought Leadership, composed register. Companion to "Who Is Still Driving?" (2026-09-06), not a reversal of it.

Origin and author decisions, 2026-10-14 (Claude Code session 16ce6368; Codex thread 01a13b26-97a1-7fd2-b3c3-59f82cc1f904):
- Nino's first pitch: self-driving cars, people who refuse to learn to drive, driving "required just to survive." He then pushed back on the reversal concern: we're in an in-between stage, the machine changes daily, there is no "universal replicator" yet, so drivers who understand the limits are still needed; he drives "to a point" while most people around him need auto mode; the meal ladder (microwave dinner, Factor, HelloFresh, homemade) is his.
- Dropped by design: the survival claim (the meal ladder cannot carry it, and no evidence supports it), the word "refuse" (the anecdote shows an expectation, not refusal), and the car as the spine (car/driving already carries three posts: Unmarked Roads 2025-06, Ferrari 2026-01, Who Is Still Driving 2026-09).
- Kitchen metaphors already appear in six posts (MasterChef Problem, ChatGPT Doesn't Eat, Kitchen I'm Looking For, Open Kitchen, Walk-In Is Full, Describe the Pear). The four-option delivery ladder and the replicator do not; the draft avoids repeating "taste the sauce."
- Family member: kept unnamed at Nino's instruction ("keep it generic just use her as a for instance"). Swap "a family member" for "my wife" if he prefers; nothing else depends on it.

Evidence and attribution (guide §1b; every first-person claim traced to Nino specifically):
- Two tabs, sheet to forms, installing the agent and browser extension, asking it to do the data entry: Nino, both sessions, 2026-10-14.
- "Amazed and creeped out," missed "one or two items," "almost became dismissive," the teasing line (quoted with light punctuation), "saved her 99% of the work": Nino's answer in the Codex thread, 2026-10-14. 99% is his estimate, labeled as such.
- "Still on microwave dinner": Nino, 2026-10-14. "Installing the agent didn't move her" follows from his account (he showed her how to install it) plus that answer. "What moves someone down the table is judging what the machine hands back" is the essay's argument, not a reported fact.
- Volleyball club: Nino, "i've lived this scenario many times over helping with 630 volleyball." Club unnamed per the guide's sanitization rule. The draft claims only that he did the setup many times, not how those people reacted.
- "Up to a point": Nino's "i know how to drive the new 'ai' car to a point." Packaged-product line: the published Who Is Still Driving? ("I'm already relying on a packaged product when I use Codex to build something else").
- October 7 model test: Nino asked whether the closeout check should always run on the newly released smaller model and said "run the haiku comparison on 5 past sessions," then "add the secret scan step to the closeout skill" (Claude session a53a1c25, 2026-10-07). Results from memory note project_closeout_haiku_55_verdict.md: in one replayed session a token had been printed into a tool result; Opus made rotating it the next action; both Haiku runs missed it; verdict kept closeout on the session model; mechanical secret-scan merged the same day. n=1 on the deciding case, stated in the draft. Model and product names kept generic per the guide.
- "The machines change by the day": Nino's "the machine is changing daily." Replicator: Nino's "there is no 'universal replicator' yet"; the Star Trek gloss is added for the reader.
- Closing test ("time it saved minus the time it took to find and fix what it missed") comes from the Codex thread's point that checking time belongs in the comparison. Revision 3 adds the cost of a miss nobody finds, because the money-moving case in "Sometimes 100% Is the Right Bar" is exactly that miss. Stated as the essay's test, not as Nino's described practice; confirm he endorses it.
- Revision 3 attribution recheck: "I'm on the last row" reverted to "I can cook with these tools, up to a point" (his words place him only "to a point", not on a row); "I'm not grading the model on it" replaced with an evidence-scope statement, since the stance was not his.
- Three questions: quoted from the published Who Is Still Driving?

Cold read, 2026-10-14: a general-purpose agent read only the body, not the conversation or these notes. It placed the point at about word 170 and flagged: the replicator appearing once, an ending that made the microwave dinner the goal after the opening called that bar mistaken, "the in-between" undefined, unclear referents ("Until they don't", "that choice", "said as much"), vague Factor and HelloFresh rows, no stated row for the author, metaphor-label headings, transcript jargon, and two section-end morals. All addressed in revision 2. Second cold read (revision 3) confirmed the ending now fits the 100% section and flagged: the cook-optional claim outrunning the argument, a heading that claimed models change under a user when the evidence shows a swap changing the result, a line implying she did not judge at all, no example in the Factor row, and a repeated in-between sentence. All addressed in revision 4; the term "in-between" is now used only in these notes. Declined: holding the thesis back past word 170 (the guide requires it within 150). Its flag that the volleyball line might be invented is wrong on the facts (Nino said it), but the paragraph now carries a TK for one instance because a reader has nothing to picture.

Open before publishing:
- [TK] One concrete volleyball-club instance, or cut that paragraph.
- Cold reader asked which row the author is on; the draft keeps Nino's own "up to a point" rather than assigning him a row. Name one if he wants.
- "New models ship constantly" stands on Nino's "the machine is changing daily" plus the single October 7 release; it is his characterization, not a measured rate.
- [TK] How the missing items were found. If checking every entry was needed, keep the comparison paragraph; if they were obvious, shorten it.
- Confirm the key in the October 7 replay has been rotated before publishing. The draft does not name it.
- "If those forms had moved money" is a labeled hypothetical, not a claim about her forms. Confirm the forms did not move money, or cut the line.
- Factor and HelloFresh descriptions are general product knowledge (ready-made meals from a menu; meal kits with recipe cards), not fetched this session.
-->
