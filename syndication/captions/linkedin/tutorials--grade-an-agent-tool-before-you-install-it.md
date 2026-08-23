A feature list is half a subtraction. The other half sits on your own machine, and nobody publishes that half for you.

Which is why the first check is the one that gets skipped: write down what your agent already loads at startup. Instruction files, skills, commands, hooks, tool connections, helper binaries on the path. A list of fifty-four things is fifty-four gains only against zero.

Then subtract. Every component the tool ships lands in exactly one of three buckets. Native — your setup already does this. New — genuinely absent, and the only column that argues for installing. Blocked — new but unusable for a reason unrelated to quality: wrong platform, a subscription you don't hold, patching something you don't control.

Blocked is the bucket that gets collapsed into the other two, and it distorts the answer in both directions. A component that is excellent and unusable is not a gain, and it is also not a criticism of the tool.

One rule keeps the whole thing honest. For every row marked Native, name the specific thing on your side that covers it. "I think I have something like that" is not coverage. If it can't be named, it belongs in New.

The two remaining checks are mechanical. A project's documentation describes what it does when it works; its issue tracker describes what it does on other people's machines, and a maintainer cannot curate that without the gap being obvious. Then read the install guide's own account of what lands on disk. Prefixed names and new named sections are additive and reversible. Bare generic names and rewrites of sections you already use are not. Search the tracker for the uninstall itself while you're there — "it's cheap to try" is a claim about uninstalling, not installing, and the exit is the part nobody tests.

The first exercise is the one that hurts, and not because it is difficult. It tends to raise a second question underneath the first: what is already loaded that I would not install today?

Four checks, forty minutes, nothing touched:

--- first-comment ---
https://ninochavez.co/blog/tutorials/grade-an-agent-tool-before-you-install-it
