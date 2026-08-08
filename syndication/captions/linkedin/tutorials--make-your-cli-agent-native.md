I pointed an agent at a CLI tool I maintain and watched it waste four steps landing on the wrong brand.

It read the README first, four hundred well-structured lines, then the help output. Then it ran a generate command without specifying which brand kit. The tool errored, and it guessed a filename that didn't exist. It scanned the directory, found a presets folder, picked one — and picked the wrong one.

The docs weren't bad. The interface was wrong for the reader.

So I added three layers, each with one job. An AGENTS.md that orients, then asks the human two questions before anything runs. A CLAUDE.md that sets constraints instead of explaining the tool. And a command that emits a structured payload generated from the tool's own schema.

That last choice is the one that matters. Generate the prompt from the same source of truth that validates the tool, and adding a new export format updates what the agent knows for free. Hand-write it and it drifts inside a week.

Rules only work when a violation is mechanically detectable. "Exporters are pure" survives because you can grep the directory for a network call. "Write clean code" does nothing at all.

My first AGENTS.md ran two hundred lines. I cut it to forty. The agent doesn't need architectural history. It needs what this is, what you want, and what can go wrong.

The signal that it's working: two questions. Before anything runs. Not one. Not zero.

Three files, thirty minutes:
https://ninochavez.co/blog/tutorials/make-your-cli-agent-native
