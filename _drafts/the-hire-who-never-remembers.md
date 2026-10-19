---
title: "The Hire Who Never Remembers"
status: "draft"
author: "Nino Chavez"
category: "AI & Automation"
tags: ["leadership", "agentic-systems", "ai-development"]
takeaway: "When an agent repeats a mistake, change what it reads at the start of every session, and add a check for the rules it still ignores."
excerpt: "People keep asking what kind of person is good at AI. My bet is a skill instead: the written half of management, the only half that reaches an agent's next session."
---

# The Hire Who Never Remembers

Over two weeks this fall, I typed "merge it" to my coding agents 42 times. Counting every version of it, 201 of my 1,422 messages were nudges: their only job was getting an agent to push, open a pull request, or merge work it had already finished. Those are the steps that hand finished code back to the shared project.

Every session, meaning every new conversation with an agent, starts by reading a file of standing instructions. One line in mine said "Push after commit when asked." So every session finished the work, then waited for me to ask. Each "merge it" fixed one session. The next one read the same line and waited again.

That's my answer to a question I keep hearing: what kind of person is good at AI? My bet is a skill, not a temperament: the written half of management. That means writing down what a newcomer needs, saying what done looks like, and checking for what the writing misses. The other half, coaching people and earning their trust, has nothing to carry it from one session to the next. What's written reaches every session. What's said doesn't.

The practical version is one move, plus a second I'm still testing. When an agent keeps making the same mistake, change what it reads instead of correcting it again in conversation. When it ignores what it reads, add a check that stops it.

---

## Management Is Half the Answer

The obvious answer to "who is good at AI" is managers, and that case has already been made well.

Ethan Mollick's [Management as AI superpower](https://www.oneusefulthing.org/p/management-as-ai-superpower) (January 2026) describes an experimental class at the University of Pennsylvania. Executive MBA students, few of whom had ever coded, built working startup prototypes in four days. Mollick's explanation:

> "What's scarce is knowing what to ask for."

The students had spent years scoping problems and defining deliverables in their own fields. Those habits became their prompts.

In May, David Curlewis [argued that the analogy breaks](https://curlewis.co.nz/posts/is-coordinating-a-fleet-of-ai-agents-the-same-as-managing-a-team-of-people-yes-but-mostly-no/) where managing gets hard. The hard parts of leading people, in Curlewis's account, are the long ones: careers grown over years, motivation that sags, trust that takes years to earn. None of that applies to a fleet of agents.

Mollick is describing the half of management that can be written down: the scope, the deliverable, the standard for good. Curlewis is describing the half that lives in a relationship.

Only the relationship half needs the other person to grow, and an agent doesn't grow.

---

## My Coaching Rubric Has No Box for an Agent

Last year I wrote [Coach Up or Coach Out](/blog/coach-up-or-coach-out-what-i-look-for-early) about what I watch for in someone's first weeks on a delivery team. Coach up means invest in them. Coach out means stop carrying them.

The four signals I invest in are curiosity without panic, self-correction, situational awareness, and small wins. Self-correction is the one that matters here: they miss something, and I don't have to say it twice. One of the coach-out signs is the opposite. They repeat the same misstep because they never reflected on it.

Across sessions, an agent fails self-correction unless the correction is written somewhere it reads. It does fine on small wins. I ship real work with it daily.

That post ends with a choice: coach up the people who are close, and stop covering for the ones who never will be. An agent fits neither side. It doesn't get closer on its own, because it keeps nothing it's told. And it's too useful to coach out.

So the coaching goes somewhere else: into what the agent reads.

---

## The Onboarding Never Ends

In March I wrote that I'd [stopped treating the agent like a tool](/blog/what-223-sessions-taught-me-about-working-with-ai) and started treating it like "a team member who needs onboarding," with the instruction file as the onboarding doc.

That onboarding happens again every session, so the onboarding doc is most of the relationship.

Split by whether a skill can be written down and handed over, the management skills sort cleanly:

| Management skill | Carries over to agents? | Why |
|---|---|---|
| Coaching and growing people | No | It builds a person over time, and the agent starts fresh every session |
| Motivation, trust, psychological safety | No | They live in a relationship, and nothing carries one over |
| Writing the brief | Yes | Same job: give context the reader lacks |
| Defining done | Yes | Done has to be stated, not assumed |
| Checking the work | Yes | A report of done is a claim until someone checks it |
| Writing lessons down | Yes, and it matters most | What's said in one session is gone in the next |

---

## A Correction in Conversation Lasts One Session

I counted the 201 with a small script that reads my agent transcripts. It picks out the nudges by their shape: short messages like "merge it," "next," "keep going." Then it sorts them by where the agent stopped: before a push, before a merge, before cleanup. A stop that came right after a permission check refused the agent goes in a separate pile, because there the agent had no choice.

On October 9, I replaced the line. The new instruction says the work isn't finished until it's committed, pushed, merged, and cleaned up, and to do those steps without being asked.

In the ten days after, nudges to push, open a pull request, or merge fell from about one message in seven to about one in thirty: 8 of 246, against 201 of 1,422.

The same day, I also changed the permission settings, the rules that decide which actions an agent can take without asking me. I let agents merge their own pull requests, and I described opening one as routine to the system that reviews agent actions. So the merge and pull request numbers can't all be credited to the line.

Pushes are the cleaner case. A standing permission already let agents push without asking before the change, so permissions can't explain a drop there. Nudges asking for a push went from about 30 in two weeks to none, apart from two that were really new instructions. At the old share of my messages, the second window would still have had about five.

The other limits stay next to the numbers:

- I typed far less overall in the second window, about 25 messages a day against about 100
- The script sorts messages by pattern, so some land in the wrong pile
- It's one person's sessions, before and after, not a study

So the push numbers are the ones I'd lean on. About thirty corrections typed in conversation never changed what the next session did. One changed line did.

---

## Writing It Down Isn't the Whole Skill

The written half has its own failure.

An earlier test, in August, showed it. I added a short brief that loads at the start of every session, alongside the standing instructions, to orient the agent. Ten days later, a hand count of the corrections in my messages had barely moved: 17 corrections in 272 messages, against 14 in 194 before. That's too few to show an effect either way.

The more useful number was in what those corrections were about. Of the 17, 9 concerned a rule already written into the standing instructions:

- Verify before you claim something works
- Don't over-engineer

The agent had the rule in front of it and did the other thing anyway. Reaching an agent isn't the same as being followed. My agents followed "Push after commit when asked" to the letter and the rules I cared about unevenly, and the data doesn't say why.

For a rule that keeps getting ignored, I've started adding a mechanical check: a small program that runs before a risky action and refuses it when the rule isn't met. The first covers the tool correction I'd repeated most: it stops an agent from publishing a social post unless it has named the publishing route my rules require. I haven't measured whether the checks work.

So the written half has two parts: the instructions, and a check for each rule the instructions alone don't hold.

---

## What Would Prove This Wrong

This argument rests on one person's sessions, so it should make predictions other people can check.

If the written half is the skill, the people who already have it are the ones who've had to write for a reader who wasn't in the room:

- Leads who write handoff notes before they rotate off a project
- Consultants who write the scope before anyone is staffed
- Tech leads who write the runbook for whoever is on call next

They should do well with agents early, whether or not they've managed anyone. And strong people-managers who led by being in the room should struggle until they start writing things down.

If great coaches do well with agents without any of the written half, the argument is wrong, and temperament deserves another look.

---

## No Numbers for the Checks Yet

Those are the next counts: whether the checks hold, and whether anyone else's sessions look like mine.

What I do have is a place to look when an agent keeps doing the wrong thing: what it reads first, and what stops it when it ignores that.

The written line behind those 201 messages was five words long.

<!--
EDITORIAL NOTES — private source record; excluded from any published article.

Publication: https://ninochavez.co/blog/the-hire-who-never-remembers, published 2026-10-19 at Nino's instruction ("Publish it: flip to published with today's date, rebuild, merge to main, and confirm the live URL.") from astro-build/src/content/blog/the-hire-who-never-remembers.mdx after he reviewed the rendered unlisted page. Feature image generated. LinkedIn: Nino asked the same day to "run the cross post and caption flow for linkedin"; the teaser caption is syndication/captions/linkedin/blog--the-hire-who-never-remembers.md, and its post URL and first-comment state are recorded in syndication/queue.json. Substack: the default routing queues a full Substack send for 2026-10-20; nothing sends until someone runs post-substack.mjs, and this session was not asked to. This file stays as the source record.

Reader: the reader-contract default (technically curious product, engineering, or business leader); plainness practitioner. Job: understand why "good at AI" looks like a learnable skill rather than a temperament, see which half of management carries over to agents, and leave with a concrete move (change what the agent reads; add a check for what it still ignores). Mode: Thought Leadership, composed register. Closest to the Leadership Insight template, with an adverse-evidence section.

Origin and author decisions, 2026-10-19 (Claude Code session 46bbdd2e):
- Nino's pitch: "several conversations where people are trying to determine the psyche of individuals that are 'good' at using AI... perhaps it's not a psyche but a skillset or experience. if we see agents as 'junior developers' or entry level really smart but inexperienced and forgetful human resources then is it a skill in management and managing teams that leads to amplification?"
- Vet in the same session found the base thesis already published: Mollick (2026-01-27), LeadDev (May 2026, search snippet only, not opened, not cited), Curlewis (2026-05-22), and Nino's own What 223 Sessions Taught Me (2026-03-20, "a team member who needs onboarding"). The unclaimed angle proposed: his word "forgetful" plus his own Coach Up or Coach Out rubric, so only the written-down half of management carries over. Nino approved: "Go. Draft it from the institutional-memory angle." He first planned to add real examples from his conversations; later the same day, with none top of mind, he decided: "lets just skip these TKs and go without them." Both placeholders are removed; the opening rests on his own data, and the falsifier section states predictions without examples.
- Title "The Hire Who Never Remembers": proposed in the vet, confirmed by Nino 2026-10-19 ("Keep the title") over the alternative "Five Words Long".
- The thesis is presented as argued from evidence, not as a narrated change of mind; the move from "management" to "half of management" came from the session's vet, and the guide forbids presenting session steering as POV movement.

Evidence and attribution (guide §1b; every first-person claim traced to Nino specifically):
- 42 "merge it", 201 of 1,422: `stop-scan --since 2026-09-25 --until 2026-10-09T18:41`, re-run 2026-10-19 (A1 ship 201; most common: 'close out the session' 56, 'merge it' 42). The memory note project_task_finish_line.md says "130 of them 'merge it'"; the tool lists 42 exact. A regex split of the 201 found 126 mentioning "merg", which is likely the note's figure; the draft uses only the exact 42.
- "Push after commit when asked": verbatim in ~/.dotfiles/ways-of-working/working-style.md from the initial commit c1970da until 7e5e64c. "The agents weren't timid": the finish-line memory note ("the stops were caused by instructions, not timidity"). The tool's own default ("commit or push only when the user asks", quoted in the new working-style text) said the same; the draft does not mention it, so the five-word close says "the written line behind those 201 messages", not "the only cause". A1 excludes stops after a classifier refusal (bucket B).
- "I replaced the line" on October 9: commit 7e5e64c, authored by Nino, 2026-10-09, replaces it with "Finish the work without being asked" and the five-step finish line.
- Confound and push split (revisions 2-3, answering both cold readers' flag): commit 7e5e64c changed more than the line. settings.json gained autoMode.allow entries (own-PR merge, own worktree cleanup, own-branch force-with-lease) and an autoMode.environment entry saying pushing a session's own branch and opening a PR "is routine"; its message also says this Mac's machine-local `Bash(git push:*)` allow rule was removed, so pushes reach the classifier only after the change, and that blast-radius (which mostly held deletes of scratch files) was turned off. Revision 2 claimed push+PR nudges isolated the line; that was wrong because the environment entry touched PRs. Revision 3 uses pushes only: before the change pushes were allowed by rule (nothing to refuse them), so permissions cannot explain a drop. `stop-scan --samples 5000`, A1 messages mentioning "push" and not "merg", "pr" or "pull request": before 31 (regex noise: one includes "open the PRs"), after 2, both new instructions ("Yes: add an MIT LICENSE to codex-cu-bridge, push it, ..." and "Push the rewritten main now, then I'll send the Support request ..."). Expected at the old share: 31 × 241 / 1,422 ≈ 5.3. The allow-rule removal rests on the commit message; the rule lived in a machine-local file not in git. Merge split for reference: before 126 mentioning "merg", 75 not; after 4 and 4.
- After window: `stop-scan --since 2026-10-10`, run 2026-10-19: 41 of 241 nudges, A1 ship 8. Per day: 1,422 over about 14.8 days ≈ 96; 241 over about 9.6 days ≈ 25. 75/14.8 ≈ 5.1 a day.
- Rules-of-thumb caveat: stop-scan --help says lever buckets C-E are regex heuristics; the --samples output showed A1 entries that were new instructions.
- Orientation brief: project_orientation_hook_pilot.md (orient-brief.py shipped 2026-08-17; measured 2026-08-27; 17/272 vs 14/194; 9 of 17 "written globally, then ignored", examples include verify-don't-guess and don't-over-engineer). "A hand count" names no counter, because the note says only "hand-classified, single rater".
- Mechanical check for social posts: meta-publish-guard.py, dotfiles ecb06bd, 2026-10-06; it checks the skill's route_reason against its table (same memory note). "I haven't measured whether the checks work": the re-measure is due and not yet run.
- Coach Up or Coach Out (published 2025-06-12): the four signals verbatim as its headings; self-correction ("I don't have to say it twice"); coach-out "repeat the same misstep because they never actually reflected"; "I'd rather coach up the ones who are close… Than keep covering for the ones who never will be." "Last year" is accurate as of 2026.
- "I ship real work with it daily": What 223 Sessions ("Shipping real products ... all of it running through the same CLI tool"). "Daily" checked 2026-10-19 against this Mac's Claude Code transcripts: human-typed messages on 87 of the last 90 days and all of the last 30 (a floor; Codex and the other machine not counted).
- "Team member who needs onboarding" / onboarding doc: What 223 Sessions, published 2026-03-20.
- Mollick: page fetched 2026-10-19; quote verbatim; Penn class, executive MBA, "Few had ever coded", four days, "scope problems in their fields of expertise, define deliverables", "those frameworks became their prompts". Curlewis: page fetched 2026-10-19; paraphrased (career growth over years, motivation, trust built over years; "None of this applies to your fleet of AI agents"), not quoted, to keep to one third-party quote.
- The "who already has the written half" list sits in the falsifier section as predictions. It is the essay's hypothesis, not anything Nino reported.

Cold read, revision 1 (2026-10-19): two general-purpose agents (practitioner, skeptical peer) read only the body. Both understood the argument (4/5). Converging flags and dispositions:
- "Half" used several ways ("second half", "that half", "different halves") → now "the written half" and "the relationship half", defined in the Mollick/Curlewis section and the opening.
- Heading "an Agent Is a Coach-Out" contradicted "doesn't fit either side" → retitled "My Coaching Rubric Has No Box for an Agent".
- The permission-setting confound was the weakest link; heading "One Changed Line Did What 201 Messages Didn't" was causal → heading now "A Correction in Conversation Lasts One Session"; the confound is named in full; the only isolated comparison is pushes; the section's claim rests on the mechanism ("reached"), not on crediting the drop to the line.
- Advisor review before the PR (revision 3): the opening's "An agent keeps what's written" and the excerpt's "the only half an agent can keep" contradicted the 9-of-17 finding → now "sees" / "reaches". Shares are given alongside counts because typing volume fell about fourfold.
- Skeptic: the agents obeyed a line rather than forgot a correction, so "coaching a hire who forgets" mismatched → opening now says the agents kept the line and lost what was said, which is what the evidence shows.
- Undefined: session, the instruction file, the brief vs. that file, nudge, the mechanical check, "that list" → each defined at first use.
- "It isn't a temperament. It's a skill" asserted on n=1 → scoped to "my own sessions point to"; the falsifier section opens by naming the n=1.
- Typing volume fell from about 100 to about 25 a day → stated as a limit.
- Cut: "With people, memory and consequences back up a written rule" and "A manager who led by being present every day may have less of this skill" (unsupported). "Writing lessons down ... the only thing that reaches the next session" conflicted with the checks → reworded.
- Close flagged as generic and drifting from the action → rewritten to name the two places to look, ending on the five-word line.
- The action landed about 60% in → the practical move now sits right after the thesis, before the first section break.
- Declined: cutting the March self-citation (now two sentences; it is the piece's own prior claim being extended).

Prep for publishing, 2026-10-19 (Nino: "Prep it for publishing: final cold read, re-run the counts, convert to .mdx with a feature image, run the build gates, then show me before it goes live."):
- Counts re-run: stop-scan --since 2026-10-10 now reads 41 of 246 (was 241); ship nudges still 8; push split unchanged (2, both new instructions). Body updated to "8 of 246".
- Feature image: scripts/generate-illustration-images.js with a pinned style-aligned VISUAL_CONCEPT (lesson from the replicator post, whose unpinned concepts drew robots): "One open three-ring binder lying on an otherwise empty desk, drawn in electric cyan blueprint linework on a deep navy background, centered with lots of empty space. The binder's pages glow warm with plain ruled lines and no lettering. A coffee mug sits beside it, and an empty office chair is pushed up to the desk, waiting for someone. Faint flowing connection lines and a few glowing nodes drift around the desk as background accents." QA passed first render, $0.0389 (google/gemini-2.5-flash-image). Viewed before use: glowing binder, steaming mug, empty chair, no text, no robots. 600w sibling made with magick per check-feature-images.mjs.
- Final cold read, four readers on the title, excerpt and body only: practitioner, non-practitioner manager, skeptical peer (Claude Sonnet subagents) and Codex (gpt-5.6-terra, read-only, operator dispatch d0fdcef9). Confidence 4, 4, 4 (3 on the people claim), 5. All placed the takeaway in the opening. Converging flags and revision-4 fixes:
  - "What holds either way is the mechanism" was true by construction (Codex, practitioner, skeptic) → replaced with the push result: about thirty conversational corrections never changed the next session; one changed line did.
  - The opening never said "when asked" caused the waiting (manager, practitioner, skeptic) → now says so; "The agents weren't timid" cut; "forgot everything I'd said" replaced by "Each 'merge it' fixed one session. The next one read the same line and waited again."
  - "Every session sees what's written" vs. the 9-of-17 finding (skeptic; Codex called it a tension) → "reaches", plus "Reaching an agent isn't the same as being followed" in section 5.
  - Undefined: nudges at first use, ship nudges, the permission checker, the refused-stop pile, "rules of thumb", "old rate" (all four) → each defined or reworded; push/PR/merge glossed once for non-developers.
  - "outdated instruction" unnamed (all four) → names "Push after commit when asked".
  - "My own sessions point to a skill, not a temperament" untested (practitioner, skeptic) → "My bet is a skill"; the falsifier section carries the test. The check half is thin and unmeasured (skeptic, practitioner) → the practical move says "a second I'm still testing"; the example is now identified as the tool-choice correction Nino repeated most (orientation-pilot memory note: meta-publish-guard "targets the most-repeated tool-choice correction").
  - Table criterion did not fit its rows; "There's no one to motivate" overreached (skeptic, Codex) → criterion is now "can be written down and handed over"; motivation row reworded.
  - "Delivery leads who inherit a team" read others' notes rather than write them (practitioner) → "Leads who write handoff notes before they rotate off a project".
  - Generic lines ("Both are right", "The onboarding just never ends", the "inspection" sentence) → rewritten. Close no longer repeats "I haven't measured".
  - Pronouns: "he writes" and "His explanation/students" for Curlewis and Mollick removed; no source consulted states their pronouns.
  - Push permission claim ("A standing permission already let agents push without asking") rests on the 7e5e64c commit message about the machine-local `Bash(git push:*)` allow rule.
  - Declined: cutting the coaching section (manager) — it is the piece's distinctive argument; cutting the four-signal list (practitioner) — kept as context for "small wins".
- Build: full `npm run build` (feature images, takeaway, astro, pagefind, sitemap, reader:check, captions:check) passed on revision 3 and is re-run on revision 4 before Nino's review.

Open after publishing:
- The Substack send queued for 2026-10-20 by default routing: Nino's call (send it, or set the route to skip-manual).
-->
