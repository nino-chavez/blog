A tool I built ran successfully, fixed two real problems, and was gone in four days. No error. No log line. It had never been committed anywhere.

Nobody noticed until a transcript search went looking for it by name.

That's the failure this workshop is built around. Everything loaded into a session carries a cost, and some of it has no backup at all.

The check that would have caught it asks a different question from the rest. Not whether a thing is earning its keep. Just this: if the machine died tomorrow, would it still exist anywhere?

An untracked item sits on disk, fully loadable by your next session, backed by nothing. Lose it and there's no diff to read. It's simply gone.

The subtle part is symlinks. Most of what lives in a skills directory is a pointer, not a file. That pointer can aim at a perfectly committed repository while the pointer itself was never added to git. Checking where it points isn't enough.

Two severities, and they aren't the same. Untracked and never used is clutter. Untracked and actively used is something you rely on with no recovery path.

Ten checks, a report that opens in plain language, and two separate confirmation gates. Cleanup gets asked apart from permissions. Changing what runs without asking you is a different risk from disabling an unused skill. The two shouldn't share one yes.

Twenty-five minutes, and almost everything it proposes is reversible:
https://ninochavez.co/blog/tutorials/audit-your-ai-coding-harness
