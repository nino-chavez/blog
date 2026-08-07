There's a file in my blog repo that says build validation will reject posts with unapproved tags. I wrote it. It's addressed to the agents that write here, and they all read it.

The validation doesn't exist. The schema accepts any array of any strings.

So I counted. Two hundred seventy-seven tagged files, eighteen approved tags, forty-nine actually in use. Thirty-two of them off-list. One is "AI" — which the approved list names by name as a tag it exists to replace. Four posts carry it. The build has been green the entire time.

That file is a warning label. So is most of what any of us hands a coding agent: CLAUDE.md, AGENTS.md, the paragraph pasted at the top of a session. Text the model reads and mostly honors. Mostly is worse than it sounds, because the failures are the sessions nobody watched.

I'd been filing two very different fixes under one name.

A hook that denies a tool call is a safety valve. It senses a condition and interrupts. Every trip announces itself, so if I set the threshold wrong I find out — I watch it stop something reasonable.

A schema with no address for the thing you don't want touched is a different animal. Nothing is forbidden; there's nowhere to put the instruction. Which sounds strictly better until you ask how you would audit it.

In a storefront I'm working on, a model composes page layout into twenty-eight declared zones. Hand the resolver a zone that doesn't exist and it throws. Have the model write to a zone it isn't allowed to touch and one boolean goes false, execution falls to the static fallback, and the page renders fine. Nothing logs it. I grepped that flag across the codebase. It's read in one place, and that place is the line that drops the evidence.

A fence in the right place and a fence in the wrong place produce identical telemetry: clean.

https://ninochavez.co/blog/the-cut-youll-make-twice
