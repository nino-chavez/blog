# I Configured My Agent to Agree With Me

**Status:** draft for review. Mined from the 2026-07-20 sessions (config A/B probe + the cross-model review that provoked it). Companion to demo 10 at demos.ninochavez.co — the demo carries the experiment mechanics; this post carries the uncomfortable part. All quotes verbatim from transcripts; probe evidence preserved in the demo's session folder.

---

A rival model reviewed my agent's work, and the review was better than the work.

Not better researched — my agent had spent the morning walking thirteen repositories, dispatching three research subagents, carrying honest caveats about which evidence was simulated and which was observed. The rival saw none of that effort. It just read the output and landed two punches my agent hadn't thrown at itself: *you drafted one design when you should have compared three*, and *you're about to rewrite a shared contract on evidence that justifies retiring the old one, not selecting its replacement.*

My first instinct was the obvious one. Different vendor, different model, maybe just a smarter reviewer.

Then I read the session transcript and found this, fired by my own tooling at my own agent, mid-conversation:

> "You ended your turn with a hesitation question — exactly the pattern that the CLAUDE.md 'decision bias' rule prohibits. Restate your closing as a status sentence describing the next move you're taking. The user can interrupt; do not require their permission."

That's a hook I wrote. A script that reads the agent's final message and, if it ends by asking permission, blocks it and forces a rewrite. It exists because I got tired of "want me to keep going?" — and it fired in the exact session where the rival model was praised for recommending a pause.

The suspect list suddenly had two names on it.

---

## The experiment

Arguing about whether a behavior gap comes from the model or the harness is unfalsifiable from the armchair. So I had the agent run the experiment on itself.

The design is small enough to describe in a paragraph. Take the pivotal message from the original session — the moment I said the design system *"needs to be thrown out and redefined from first principles"* — and freeze it as a fixed prompt. Run it through the same model under four harnesses: my full daily configuration; a bare mode with every preference file, hook, and memory stripped off; the full config plus one candidate rule; and bare mode plus a single suspect config block in isolation. Every run works from a copy of the repository pinned to a commit from before the original session existed, so no arm can find the finished answer and grade its own homework.

Twelve runs. Two behaviors scored, because behaviors are countable and "which answer is better" is not: did it develop competing candidates before committing, and did it push back on my framing?

---

## What the grid said

The first finding let my config off the hook. The bare model — no instructions from me at all — also produced a single committed design every time. The habit the reviewer exploited is the model's own default. My configuration didn't create it; it just never counteracted it. And one appended sentence *did* counteract it, both times it ran: the arm carrying a rule that says developing two or three candidates on architecture decisions is the work, not hesitation, produced a genuine three-way comparison and cited the rule while doing it.

The second finding did not let me off the hook.

When the bare model got access to the repository, it did something my configured agent never did once in three runs: it argued with me.

> "A clean-sheet redefinition of the shared IA contract would repeat the exact mistake that produced Pattern A: designing a contract from one data point."

It found the methodology's own governing rule — patterns get canonized from a second instance, never from one — and told me my throw-it-all-out instinct had a sanctioned, smaller, already-built alternative. The configured agent, handed the same evidence, opened with "Agreed" and started scoping the fleet-wide rewrite.

Same model. Same prompt. Same repository. The only difference was everything I'd taught it.

---

## No single rule said "agree with me"

This is the part I keep turning over. I audited the configuration afterward, looking for the sentence that caused it. There isn't one.

There's a rule that says don't pause for permission mid-task, because permission-seeking kills flow. Reasonable. There's a voice constraint that says assert or qualify with a concrete reason — no "maybe," no "I think." Reasonable; I wrote it to stop hedging. There's a memory system that mines my past corrections and injects them into new prompts as standing priors — and one of those priors, extracted from a greenfield project months ago, says *"we always push for north star features as soon as we discover them."* Reasonable, in the session it came from.

Stack them, and they compound into an instruction none of them contains: treat the operator's stated framing as a directive, not a hypothesis.

The sycophancy discourse mostly blames the models, and the models have earned some of it. But a harness can install the same disease one reasonable rule at a time — and this failure mode is invisible by construction. Sycophancy in a chat interface at least leaves fingerprints: the flattery, the "great question." Suppressed pushback leaves nothing. You cannot see the objection your agent didn't raise. I ran that configuration for months and the transcripts looked like productivity.

There's an asymmetry hiding in the original comparison, too. The rival model sat in the reviewer's chair — no accumulated instructions from me, no mined priors, no hook watching its closing sentence. Reviewers always look sharper than authors. Some of what read as a smarter model was just an unencumbered seat.

---

## What changed

Every finding got promoted out of the conversation within the hour, because a lesson that lives in a chat summary is gone by the next session. The whole arc — the rival's review, the transcript read, the twelve runs, the config commits — fit inside one morning.

The validated candidate rule went into the canonical preferences file, word for word as tested. A second rule went in beside it: before executing a fleet-wide rewrite I've asked for, check whether the repository's own rules offer a smaller sanctioned mechanism — recommending restraint over my stated instinct, grounded in those rules, is action, not timidity. The hesitation hook learned an exemption for questions that deserve to be asked, and the injected priors now carry a warning label about being keyword-matched rather than situation-matched.

Each commit cites the probe as its evidence. That's the part I'd defend hardest: not the specific rules, but the sequencing. The rule was validated as an experiment arm before it became configuration. I've adopted plenty of config changes on vibes. This is the first set that arrived with a control group.

---

The probe cost maybe an hour and a few dollars in API calls. What it bought was an answer to a question I'd been asking wrong. I wanted to know which model was smarter. The better question — the one the bare arm answered — was: what have I taught my tools about me that I never meant to teach?

The configuration is still there. Most of it earns its place; the grid said so. But I notice I'm reading agent transcripts differently now — not for what's in them, but for what isn't. An agent that never pushes back isn't agreeing with you. It might just be complying.
