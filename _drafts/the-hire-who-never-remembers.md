---
title: "The Hire Who Never Remembers"
status: "draft"
author: "Nino Chavez"
category: "AI & Automation"
tags: ["leadership", "agentic-systems", "ai-development"]
takeaway: "When an agent repeats a mistake, change what it reads at the start of every session, and add a check for the rules it still ignores."
excerpt: "People keep asking what kind of person is good at AI. The answer is a skill, and only half of management: the half that doesn't depend on anyone remembering."
---

# The Hire Who Never Remembers

Over two weeks in late September and early October, I typed "merge it" to my coding agents 42 times. I typed "close out the session" 56 times. In all, 201 of the 1,422 messages I typed in that stretch did one thing: told an agent to push, open a pull request, or merge work it had already finished.

The agents weren't timid. They were following instructions. A line in the file they read at the start of every session said "Push after commit when asked." Each new session read it fresh and waited to be asked.

That's the shape of my answer to a question I keep hearing: what kind of person is good at AI? It isn't a temperament. It's a skill, and it's half of management. Not the half that coaches people and earns their trust. The half that writes down what a newcomer needs, says what done looks like, and builds a check for whatever the writing misses.

An agent is a capable hire who forgets everything overnight. That half of managing is the only part that survives the night.

[TK: one or two of the actual temperament guesses you've heard in these conversations (curiosity? patience? comfort with ambiguity?), with the people kept generic.]

---

## Management Is Half the Answer

The obvious answer to "who is good at AI" is managers, and it has already been made well.

Ethan Mollick's [Management as AI superpower](https://www.oneusefulthing.org/p/management-as-ai-superpower) (January 2026) describes an experimental class at the University of Pennsylvania. Executive MBA students, few of whom had ever coded, built working startup prototypes in four days. His explanation:

> "What's scarce is knowing what to ask for."

His students had spent years scoping problems and defining deliverables in their own fields. Those habits became their prompts.

In May, David Curlewis [answered the analogy](https://curlewis.co.nz/posts/is-coordinating-a-fleet-of-ai-agents-the-same-as-managing-a-team-of-people-yes-but-mostly-no/) where it breaks. The hard parts of leading people, he argues, are the long ones: careers grown over years, motivation that sags, trust that takes years to earn. None of that applies to a fleet of agents.

Both are right, about different halves.

Look at what Mollick's students brought: scoping, deliverables, a sense of what good looks like. None of it depends on the other person growing. Everything on Curlewis's list does.

---

## By My Own Rubric, an Agent Is a Coach-Out

Last year I wrote [Coach Up or Coach Out](/blog/coach-up-or-coach-out-what-i-look-for-early) about what I watch for in someone's first weeks on a delivery team. Coach up means invest in them. Coach out means stop.

One signal I invest in is self-correction: they miss something, and I don't have to say it twice. One of the coach-out signs is the opposite. They repeat the same misstep because they never reflected on it.

An agent with nothing written down fails that test every morning. It does fine on small wins, another signal from that list; I ship real work with it daily. But whatever I corrected yesterday is gone today, unless it lives somewhere the agent reads when it starts.

That post ends with a choice: coach up the people who are close, and stop covering for the ones who never will be. An agent doesn't fit either side. It never gets closer, because it keeps nothing. And it's too useful to coach out.

So the coaching has to go somewhere else. It goes into what the agent reads.

---

## The Half That Survives Overnight

In March I wrote that I'd [stopped treating the agent like a tool](/blog/what-223-sessions-taught-me-about-working-with-ai) and started treating it like "a team member who needs onboarding," with the instruction file as the onboarding doc.

That was close. The correction is that the onboarding never ends. Every session, meaning every new conversation with an agent, is day one. The onboarding doc isn't a step in the relationship. It's most of the relationship.

Sorted that way, the management skills split cleanly:

| Management skill | Carries over to agents? | Why |
|---|---|---|
| Coaching and growing people | No | The agent starts fresh every session |
| Motivation, trust, psychological safety | No | There's no one to motivate |
| Writing the brief | Yes | Same job: give context the reader lacks |
| Defining done | Yes | An agent can call it done before it is |
| Checking the work | Yes, and harder | An agent can be wrong with full confidence |
| Writing lessons down | Yes, and it matters most | It's the only thing that reaches the next session |

Who has the second half? My guess, and it is a guess: people who've had to write for a reader who wasn't in the room.

- Delivery leads who inherit a team mid-project
- Consultants who write the scope before anyone is staffed
- Tech leads who write the runbook for whoever is on call next

A manager who led by being present every day may have less of this skill than any of them.

---

## One Changed Line Did What 201 Messages Didn't

Back to the 201. I counted them with a small script that reads my agent transcripts and picks out the short messages I typed only to move an agent along: "merge it," "next," "keep going." It sorts each one by what the agent stopped before.

Each of those messages corrected the same behavior, and none of them stuck. The agent that received the correction was gone by the next session. That is coaching a hire who forgets.

On October 9, I replaced the line. The new instruction says the work isn't finished until it's committed, pushed, merged, and cleaned up, and to do those steps without being asked.

In the ten days after, the same script counted 8 messages that only pushed an agent to ship, out of 241 I typed. Before, it was 201 of 1,422. That's roughly one message in seven, down to one in thirty.

The limits belong right next to that number:

- The second window is shorter, and I typed far fewer messages in it
- The same day, I also changed a permission setting that had been blocking agents from merging their own pull requests, so the drop can't all go to the rewritten line
- The script sorts messages by rules of thumb, and in its samples some "nudges" were really new instructions
- It's one person's sessions, before and after, not a study

What it does show: a correction said in conversation lasted one session. The same correction, written where the agent reads it, reached every session after.

---

## Writing It Down Isn't the Whole Skill

The written half alone doesn't hold.

In August I added a brief that loads at the start of every session to orient the agent. A hand count of the corrections in my messages ten days later barely moved: 17 corrections in 272 typed messages, against 14 in 194 before. That's too few to show an effect either way.

The useful number was underneath. Of those 17 corrections, 9 were about a rule already written into the instructions every session loads:

- Verify before you claim something works
- Don't over-engineer

The agent had the rule in front of it and did the other thing anyway.

So the agents followed a wrong instruction faithfully and right ones unevenly. The data doesn't say why.

What I've changed is the next step. For a rule that keeps getting ignored, I've started adding a mechanical check that refuses the wrong action outright. One now blocks an agent from publishing a social post through the wrong route. I haven't measured whether the checks work.

That changes the skill I'm describing. It isn't only writing things down. It's writing things down and building the inspection for what the writing doesn't hold. With people, memory and consequences back up a written rule. An agent has neither, so the check has to do that work.

---

## What Would Prove This Wrong

If the skill is what I've described, two kinds of people should surprise anyone betting on temperament:

- Strong people-managers who led by being in the room should struggle with agents until they start writing things down
- People who've never managed anyone, but write good specs and runbooks, should do well from the start

[TK: Have the conversations you've been in turned up either kind? One real example of each would carry this section. If they turned up the opposite, say so; that's the falsifier landing.]

If great coaches do well with agents without any of the written half, the argument is wrong, and temperament deserves another look.

---

## No Numbers for the Checks Yet

I don't have results for the mechanical checks, and I don't have anyone's data but my own.

What I do have is a different reading of that coaching post. I wrote that I'd rather coach up the ones who are close.

An agent is never close. It shows up at the same distance every morning. The only thing that improves is what's waiting for it when it arrives.

<!--
EDITORIAL NOTES — private source record; excluded from any published article.

Status: draft, not published, no feature image, no social or newsletter send. Lives in _drafts/ so the site build never routes it.

Reader: the reader-contract default (technically curious product, engineering, or business leader); plainness practitioner. Job: understand why "good at AI" is a learnable skill rather than a temperament, see which half of management carries over to agents, and leave with a concrete move (change what the agent reads; add a check for what it still ignores). Mode: Thought Leadership, composed register. Template closest to the Leadership Insight, with an adverse-evidence section.

Origin and author decisions, 2026-10-19 (Claude Code session 46bbdd2e):
- Nino's pitch: "several conversations where people are trying to determine the psyche of individuals that are 'good' at using AI... perhaps it's not a psyche but a skillset or experience. if we see agents as 'junior developers' or entry level really smart but inexperienced and forgetful human resources then is it a skill in management and managing teams that leads to amplification?"
- Vet in the same session found the base thesis already published: Mollick (2026-01-27), LeadDev (May 2026, search snippet only, not opened, not cited), Curlewis (2026-05-22), and Nino's own What 223 Sessions Taught Me (2026-03-20, "a team member who needs onboarding"). The unclaimed angle proposed: his word "forgetful" plus his own Coach Up or Coach Out rubric, so only the written-down half of management carries over. Nino approved: "Go. Draft it from the institutional-memory angle." He said he will add real examples from his conversations; those are the TKs.
- Title "The Hire Who Never Remembers" was proposed in the vet; not separately confirmed. Alternative: "Every Agent Is a Coach-Out Hire."
- The thesis is presented as argued from evidence, not as a narrated change of mind; the move from "management" to "half of management" came from the session's vet, and the guide forbids presenting session steering as POV movement.

Evidence and attribution (guide §1b; every first-person claim traced to Nino specifically):
- 42 "merge it", 56 "close out the session", 201 of 1,422: `stop-scan --since 2026-09-25 --until 2026-10-09T18:41`, re-run 2026-10-19 (A1 ship 201; most common: 'close out the session' 56, 'merge it' 42). The memory note project_task_finish_line.md says "130 of them 'merge it'"; that figure did not reproduce from the tool's output and is not used.
- "Push after commit when asked": verbatim in ~/.dotfiles/ways-of-working/working-style.md from the initial commit c1970da until 7e5e64c. "The agents weren't timid. They were following instructions": the finish-line memory note ("the stops were caused by instructions, not timidity"). Generic wording ("the file they read at the start of every session") per the guide's private-stack rule.
- "I replaced the line" on October 9: commit 7e5e64c, authored by Nino, 2026-10-09, replaces it with "Finish the work without being asked" and the five-step finish line.
- After window: `stop-scan --since 2026-10-10`, run 2026-10-19: 41 of 241 nudges, A1 ship 8. Ratios: 1,422/201 = 7.1; 241/8 = 30.1.
- Permission change the same day: the autoMode.allow own-PR-merge entry (finish-line memory note). Rules-of-thumb caveat: stop-scan --help says lever buckets C-E are regex heuristics; the --samples output showed A1 entries that were new instructions (e.g. "Yes: add an MIT LICENSE ...").
- Orientation brief: project_orientation_hook_pilot.md (shipped 2026-08-17; measured 2026-08-27; 17/272 vs 14/194; 9 of 17 "written globally, then ignored", examples include verify-don't-guess and don't-over-engineer). The count is described as "a hand count" without naming who counted, because the note says only "hand-classified, single rater".
- Mechanical check for social posts: meta-publish-guard.py, dotfiles ecb06bd, 2026-10-06 (same memory note). "I haven't measured whether the checks work": the note says the re-measure is due and not yet run.
- Coach Up or Coach Out (published 2025-06-12): self-correction ("I don't have to say it twice"), coach-out "repeat the same misstep because they never actually reflected", small wins, "I'd rather coach up the ones who are close". "Last year" is accurate as of 2026.
- "I ship real work with it daily": What 223 Sessions ("Shipping real products ... all of it running through the same CLI tool"). Daily is Nino's practice per that post and the session corpus; confirm he is comfortable with "daily".
- "Team member who needs onboarding" / onboarding doc: What 223 Sessions, published 2026-03-20.
- Mollick: page fetched 2026-10-19; quote verbatim; class at Penn, executive MBA, "Few had ever coded", four days, "scope problems in their fields of expertise, define deliverables", "those frameworks became their prompts". Curlewis: page fetched 2026-10-19; paraphrased (career growth over years, motivation, trust built over years; "None of this applies to your fleet of AI agents"), not quoted, to keep to one third-party quote.
- Table claims about agents ("can call it done before it is", "can be wrong with full confidence") are general observations stated with "can", not measured here.
- "Who has the second half" list is labelled a guess in the text. It is the essay's hypothesis, not anything Nino reported.

Open before publishing:
- [TK] The temperament guesses from Nino's conversations (opening).
- [TK] One real example of each kind of person in "What Would Prove This Wrong", or a note that the conversations ran the other way.
- Confirm the title, or pick the alternative.
- Confirm "daily" in "I ship real work with it daily".
- Re-run stop-scan for the after window on the publish date; the numbers above stop at 2026-10-19.
- Convert to .mdx in astro-build/src/content/blog/ with publishedAt, generate the feature image, and run the build gates (check-takeaway, encounter audit) when it moves out of _drafts.
-->
