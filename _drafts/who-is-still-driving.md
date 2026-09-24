---
title: "Who Is Still Driving?"
status: "draft"
author: "Nino Chavez"
category: "AI & Automation"
tags: ["agentic-systems", "ai-development", "ai-governance"]
takeaway: "Before trusting an AI tool, check what it handles for you and what you still need to know or do yourself."
excerpt: "Using AI takes practice, but a product that needs an expert to catch its mistakes should say so before someone relies on it."
---

# Who Is Still Driving?

Knowing how to catch an AI tool's mistakes doesn't tell me whether someone else could use it without that help. In my own work, a useful result can depend on me correcting the agent or changing its setup.

Using AI well takes practice, but people shouldn't have to become AI engineers to use a product that promises to do a job for them. The builder needs to be clear about what the user still has to do.

---

## Checking the work is part of using the tool

I was testing whether events from Google Calendar would reach a day-planning app on my iPhone. Screenshots of a pretend day couldn't show that connection, so I asked an agent to create test events we could import. The appointments were made up, but we put them through Google Calendar and into the app on my phone.

I asked an agent to test a volleyball app from the organizer, captain, player, and spectator screens. It found that the existing tests reused one account for several roles, so they couldn't show whether one captain was blocked from another captain's work.

The agent built a test with separate accounts, and the practice tournament finished with workarounds for failed steps. The report kept those failures visible rather than treating completion as a clean pass.

---

## Using a tool and building it are different jobs

Driving is a useful comparison because operating a car and designing one are different jobs. A driver needs to read the road and know when to stop; a passenger can reasonably expect to get somewhere without learning either job.

Much of what I do around agents is closer to working on the car. I change instructions, fix test setups, and add checks intended to catch repeated mistakes. Those are useful engineering skills, but they aren't prerequisites for everyone who wants to use the result.

Someone choosing an app for one job may have no reason to learn how to build it. I'm already relying on a packaged product when I use Codex to build something else.

---

## A good tool can give people less to learn

I'm helping friends who run a coffee trailer with some unpaid work that started as a website review. It grew into work on a small app for posting stops and handling booking requests. They should be able to tell customers where they'll be without knowing how I instruct the AI, put the app online, or store its data.

Simple controls don't settle this for an AI product, either. If the user must still check whether the AI made something up or finished an action, the product has left them with that responsibility.

In the tournament test, the setup disables real emails and payments and refuses to connect to the online app's database. Whoever runs it can try the tournament without remembering those precautions, though they still have to notice the steps that fail.

---

## Some mistakes belong to the tool

In [“We Gave Everyone a Ferrari and Blamed the Engine”](https://ninochavez.co/blog/we-gave-everyone-a-ferrari), I called for instructors, roads, and rules. But treating every failure as a training problem lets the tool off too easily.

The agent I asked to [review my day planner](https://ninochavez.co/blog/rigorous-about-the-wrong-question) produced a careful report that answered the wrong question, and I had to point out the mismatch. In the coffee-app work, I also had to identify unfinished pages after earlier checks had reported success.

These sessions show what this way of working asks of me, not whether an agent built for those tasks would do better. We didn't run that comparison.

---

## Say what the user still has to do

Before I rely on an agent, I want to know:

- What mistakes will I need to catch?
- What can I do if something goes wrong?
- How will I know the job is finished?

A product that needs an expert to catch its mistakes should say so before someone relies on it.

I can choose to spend time under the hood of my own systems. My friends should be able to publish a coffee stop and get back to serving coffee.

<!--
EDITORIAL NOTES — private source record; excluded from the published article.

Publication: https://ninochavez.co/blog/who-is-still-driving
Published 2026-09-06 from commit d7e7ef7; prose revised in 632d416 the same day. The revision's Cloudflare build succeeded; new wording verified on both the public domain and Pages. Original image and publication date retained. No social or newsletter send performed.

Reader: an adult familiar with apps and the broad idea of AI, without software-building knowledge. Plainness: lay for this draft, at the user's explicit request; the shared reader contract is unchanged. Job: understand what people need to learn to use AI and what a product should handle for them. Mode: Thought Leadership, composed register.

Evidence checked on 2026-09-06:
- Calendar example: task 01a06f62-99d7-7361-a30c-7671ae1725d0; /Users/nino/Workspace/dev/apps/minder/.worktrees/real-device-remediation/docs/evidence/fixtures/minder-test-calendar/minder-test-acceptance.ics and /Users/nino/Workspace/dev/apps/minder/.worktrees/real-device-remediation/docs/evidence/screen-reviews/real-device-remediation-2026-09-05/physical/seed-import-receipt.json. Synthetic entries used a real Google Calendar/EventKit/device path. This does not establish ordinary customer acceptance or every app behavior. The agent executed the import; the user's batch-import suggestion is in the task.
- Tournament example: task 01a07715-812a-74a1-b4ae-caebbbff351a; /Users/nino/Workspace/dev/apps/rally-hq/docs/testing/rehearsal-2026-09-06/progress.md and /Users/nino/Workspace/dev/apps/rally-hq/playwright.rehearsal.config.ts. The local rehearsal completed with workarounds. Hosted completion is not claimed. The agent identified identity reuse and built the new runner; the article retains that attribution.
- Coffee example: task 01a062d0-99a9-7c90-b92a-5dbbdd25ec07; /Users/nino/Workspace/dev/rgz/app-concept/decisions/0001-next-stop-recommendation.md. User explicitly supplied the friendship/pro bono constraints and reported incomplete pages later. Owners' selection, business benefit, and physical-phone acceptance are not claimed. Names and private business details are omitted.
- Earlier audit: public Rigorous About the Wrong Question article supplies the narrow account of the user's correction. This paragraph does not claim a new audit was performed in the cited remediation task.
- Both article links were fetched directly: HTTP 200, correct titles and supporting body text. Ferrari article explicitly attributes failures to missing training; the draft challenges that explanation without repeating its numerical claim.
- Reader-clarity review prompted clearer local-rehearsal scope and a concrete example of infrastructure supporting practice. First-person experience checked against the user messages and sources above.
- Revision after Humanize-Copy review: removed the unconfirmed personal reassessment of the Ferrari post, repeated calendar interpretations, the generic infrastructure inventory, the brakes maxim, and the symmetric closing concession. Preserved the concrete examples and their limits. Rechecked the full skill and eval against the revised text, using the canonical Signal Dispatch voice guide. Intentional style exceptions: harness is a defined technical term; the three questions are distinct decisions; analogy passages argue a specific division of responsibility rather than supply autobiography. No new personal experience, historical adoption claim, comparative benchmark, or failure rate is asserted.
- Plain-language pass: moved the full claim to the opening and simplified headings, sentence structure, and vocabulary. Removed the harness label but retained the actual instructions and checks it described. A cold reader received only the article, not the intended argument, and identified the main claim from the opening. Their remaining findings prompted the explicit email/payment example and removal of the vague same-benefit reference. Evidence limits remain: made-up calendar events through a real connection, a practice tournament with workarounds, no claim that the coffee app's owners have adopted it, and no comparison showing this approach beats a task-specific agent.

Feature image production, 2026-09-06:
- Mode: built-in image generation.
- Published assets: astro-build/public/images/generated/who-is-still-driving.webp (1200 x 675) and who-is-still-driving-600w.webp (600 x 338).
- Prompt: Use case: illustration-story. Asset type: 16:9 feature image for the Signal Dispatch essay 'Who Is Still Driving?' about learning to operate AI without having to engineer every part of the tool. Create one distinctive editorial illustration: a single unbranded compact car at rest, in a three-quarter cutaway view. The driver's seat and simple steering wheel are clearly visible in the cabin; below the clean body panels, reveal a carefully drawn steering linkage and engine as a technical cross-section. The car rests on a short stretch of road with a protective guardrail. The visual contrast is between accessible controls and the machinery and safeguards that make them usable. Style: fine hand-drawn technical linework with natural variation and subtle paper grain, electric cyan #00d9ff and soft white lines on deep navy #0a1628 to midnight #162447. Sophisticated editorial artwork, calm and precise, matching a technical blog rather than a children's illustration. Composition: wide landscape, one coherent scene, substantial but balanced subject occupying the middle 70% of frame; all essential details safe for a small thumbnail and modest edge crops. No people, robots, brains, floating circuit icons, screen interfaces, logos, text, letters, numbers, watermarks, borders, or photorealism. No comparison panels. Avoid ornamental complexity outside the actual vehicle. Generate a 16:9 landscape image.

Editorial rhythm revision, 2026-09-06:
- Reader and scope: adult familiar with apps and AI; retain accessible vocabulary, original evidence limits, and the composed Signal Dispatch register. Only the post and its excerpt changed; no shared writing instructions changed.
- What changed: connected causes with consequences, cut standalone process beats and repeated interpretation, put the product-readiness claim in the opening, and clarified vague referents. Preserved the real calendar path, account separation, failed-step limitation, unpaid coffee-app work still in progress, tool protections, and absence of a comparative benchmark.
- Humanize-Copy editorial eval reviewed against the actual final MDX and original source. Sentence/structure, integrity, voice/proportion, and ownership reviewed; newsletter rules not applicable. No invented experience, reconstructed dialogue, new figures, or manufactured change of mind. PASS — intentional: three questions cover distinct user decisions; the driving comparison is the user's own framing; "rather than" expresses an actual distinction between completion and a clean pass, not a hedging adverb; the closing coffee image was retained from the source rather than invented as a kicker.
- Cold editorial read: agent 01a078ba-0f59-7920-be59-c1f742d9971f saw the post without the conversation, stated the controlling point, and evaluated prose rather than layout. Its referent findings were addressed and it re-read the final file. No remaining release-blocking prose issue reported.
- Diagnostic counts only, not gates: body sentence units 70 to 38; median words per sentence 11 to 17; units of six words or fewer 13 to 1. The technical names and underlying mechanisms were retained. Final product-build checks passed.
-->
