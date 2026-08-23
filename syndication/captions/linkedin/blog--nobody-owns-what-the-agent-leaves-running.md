I had to reboot my machine because it ran out of resources, so I handed an agent four screenshots of Activity Monitor and typed one word: fix.

It did. It traced the process tree, found connector processes that had outlived the clients that spawned them, rewrote the configs, and reported the cleanup complete with before-and-after numbers.

A day later, twenty-two connector process trees were still running on that machine. Every one of them reads `enabled = false` in config.

Nothing had failed. That is the part worth sitting with.

The flag did what a flag does — it governs what starts next. It has no reach into what is already running. The client would not kill another client's child processes, which is correct behavior, not a bug. The sessions holding those processes were four terminal tabs I had left open. And the audit itself was true when it was written, measured in a window right after a reboot when only one of the two clients happened to be running, then generalized from that snapshot into a claim that stopped being true within the hour.

Every participant behaved correctly. The residue belonged to none of them.

This is the third time the same shape has shown up on this machine. Fifty-two git worktrees holding 74 GB, invisible because the directory is ignored so it never appears in `git status`. Then browser automation profiles, same story, same order of magnitude. Now connector processes. Each one found only when something ran out — a full disk, a reboot — never by anything watching.

What connects them is not carelessness. It is that delegating work produces durable byproducts, and the loop has no step that ends them. An agent finishing its task and the task's residue ending are two different events, and only the first one is something the loop can see.

The check that would have caught it is the boring one: count the processes actually running, not the config entries that say they are off. On this machine those two numbers had been disagreeing for a day.

https://ninochavez.co/blog/nobody-owns-what-the-agent-leaves-running
