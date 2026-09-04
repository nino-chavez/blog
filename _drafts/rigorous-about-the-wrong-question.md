# Rigorous About the Wrong Question

**Status:** draft for review. Mined from the 2026-09-03 Minder product audit session. The session's own handoff is at `apps/minder/docs/audits/2026-09-03-product-audit/HANDOFF.md`; the nine reviewer reports sit beside it. Sibling of "The Audit Reproduced the Failure" (2026-08-23), which was about expansion without a stop rule. This one is about delegated looking.

**takeaway:** Before you dispatch reviewers on a question about what a user sees, open the rendered screen yourself and count the briefs against the ask.

---

I asked for a product audit and got a governance audit. Five reviewers, every claim labelled by evidence tier, every finding re-derived at source. Eleven photographs of the app, taken on a physical phone, sat in the repository the whole time. The session that wrote the report never opened one.

The fix is one rule and one check. When the question is about what a person sees, whoever forms the verdict looks at the screen first, before sending anyone else to look. And before dispatching reviewers, count the briefs against the ask. That is the whole post. The rest is why it took a correction to get there, and why the first report was good work anyway.

## The ask was three-quarters about the user

Minder is a day planner I have been building for one person, Zoey, who runs a household calendar that is not hers to edit. My message asking for the audit put four questions in one paragraph. How far has the app drifted from its mission? Is every interaction optimal for what a user like Zoey needs to do, see, and know? What does she do often, and is that quick? What is repeatable, automatable, saved and reusable?

The first question is about process. The other three are about her. Call it a quarter governance and three quarters experience. The word "optimal" is a request for judgment, not an inventory.

The session split the work across five reviewers. One mapped feature directories to the decision records that authorized them. One re-derived the design contract against source. One inventoried reuse and automation. One read the screenshots against the design contract. The fifth was named for the user, and its brief asked for tap counts and request traces. Four mechanical briefs, one proxy. Not one brief was holding the question I had actually asked.

## Everything in the first report was true

The report was not wrong. Its findings all held up, and several block a release.

The only recorded verdict from Zoey is a rejection, from the first build, on 2026-08-23. Twelve builds later, the newest reports zero installs. One decision record, still marked Proposed, says not to enable a feature in production and refuses to name a number for it. Twenty-seven hours later a commit named the number and turned the feature on. Five feature flags are enabled in the release build while three documents say all of them default off. A contrast setting changes about a quarter of one percent of the screen, and a prior review had marked that state accepted.

I read it and wrote one sentence back: "this report feels like it just audited the mechanical parts and none of the application functional parts for a user."

## The session then looked, and found more in ten minutes

That sentence sent the session to the captures. It opened them itself, wrote down what it saw, and the frames are in the repository for anyone to check.

Capture 02 is an upcoming gymnastics class. The card leads with a heading, "Destination needed for directions," three lines of policy about why the app wants a map location, and a large filled button to go choose one. Below all of that, in the smallest type on the card, is the child's name. Maya is the weakest element on her own card.

Capture 04 is a dense day, the state the product exists for. Between the thing happening now and the thing happening next sit two creation buttons, a date strip, a section heading, and a filter control. The next commitment starts at the bottom edge, its start time cut mid-line. The design contract says the screen must answer "what is now, what is next" in five seconds. It does not.

Capture 06 shows a calendar that has silently gone missing. The notice that says so sits below the fold, its action rendered as plain bold text, under a half-screen card whose dominant button is, again, "Choose map place." The app inverts the stakes.

None of that needed a reviewer. It needed someone holding the question to look.

## A reviewer looks with its brief, not with your question

The reviewer that read the captures did its job. Its brief said to judge the screens against the design contract, and it did that well. It was not carrying "is this what Zoey needs to see," so it did not report that a child's name had lost to a map prompt.

Delegating a search works. An agent sweeps a hundred files, and the conclusion comes back intact. Delegating the looking does not, because what makes looking worth anything is that the person looking is holding the question. Hand the looking to someone with a narrower question and you get a narrower answer, delivered with full confidence.

There is a second cause underneath. Minder's repository publishes seventeen decision records, a traceability matrix, an evidence ladder, a definition of done, and a log of methodology amendments. That surface is enormously greppable, and grep rewards governance questions. The functional map was equally present: the requirements document names forty-three user jobs, FP-0 through FP-42, each with a status. Two of them, FP-3 "Open the destination" and FP-4 "Set a leave reminder," are the gymnastics card. The session found that list after the correction, not before. The briefs took the shape of what the repository made easy to find.

## The repository had already made the same mistake

The best evidence that this is a mechanism and not a bad afternoon is that Minder's own process had committed it two days earlier.

A screen review of the current build, at line 162, states that four captures "show 'Mark done' buttons on read-only calendar events." A decision record dated 2026-09-01 removed completion from imported calendar events, and the code change landed the same day, before those captures were taken. Capture 01 is the imported calendar event. It shows a "Choose map place" button and a "Details" button and no completion control at all. The "Mark done" in capture 04 sits on an item whose provenance line reads "In Minder · My day · editable."

The review agreed with the design document, which still described the pre-fix defect as verified in source. The document and the review confirm each other, and neither matches the frame. A reviewer can be looking at a screenshot and still be reading a stale document.

## What the story overstates

The session's handoff ends on a line it wanted me to use:

> Minder's team wrote 96,000 lines of Swift, 37,900 of them tests, built an evidence ladder stricter than most professional teams keep — and never put the product in front of the one person it was built for.

The counts are right. A recount gives 95,787 lines of Swift, 37,869 of them in test targets. The last clause is not. A signed debug build was installed on Zoey's phone on 2026-08-25, and the TestFlight receipt shows two of three external testers on build 8. The narrower claim survives and is still the point. Her only recorded verdict is the rejection of build 1, and every evidence rung added since then measures what the team could verify without her.

One more thing the session cannot claim. Its second wave changed two things at once. The briefs were reorganized around Zoey's jobs, "get me and a child out the door on time, with the right stuff," and every reviewer was told to look at the captures before reading source. The findings improved. Which change did it is unmeasured.

## Two rules, not six

The handoff proposed six rules. They are two.

The first goes into my working rules next to the anti-circularity clause I already had. That clause said a verdict formed from another agent's summary is not a verdict until you pull a source yourself. The session honored it for every textual claim and lost the point: it pulled sources and delegated the looking. The new sentence says that when the claim is about what a person sees, the source-pull is opening the frame yourself.

The second goes into the dispatch checklist. Before briefs go out, decompose the ask by kind, enumerate the repository's user jobs separately from its decision records, and compare the brief mix with the ask. Four mechanical briefs against an ask that is three-quarters about the user is visible in thirty seconds, and once the briefs go out it stops being cheap to fix.

The other four candidates were the same two rules seen from other angles. I declined them.

Capture 04 is still on disk. Gymnastics starts at the bottom edge, mid-line, and the session that wrote the report had not seen it.
