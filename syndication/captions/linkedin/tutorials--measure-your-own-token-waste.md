The agent API is stateless. Every tool call resends the whole conversation from the top, so a token that lands early in a long session gets paid for again on every turn that follows it.

That single fact reorders the cost picture. The driver is usually session length, not whichever individual action felt expensive at the time.

There is a number for it: cache reads divided by tokens written. On a reference corpus of 2,335 files across 529 sessions, it came out at 41×. Where that number runs high, the fix is almost never trimming what gets sent. It is shorter sessions, and handing multi-file exploration to a subagent whose context dies with it instead of accumulating in yours.

The case for measuring rather than reasoning is that on that same corpus, three of four starting hypotheses turned out to be wrong.

Four more numbers carry the rest. Redundant re-reads — same file, same session, unchanged content, read twice — which is usually a symptom of length rather than a bad habit: compaction drops tool results, the agent re-reads what it lost, context grows, compaction fires again. Image reads, billed by pixel dimensions rather than file size, and 78% of all read bytes on that corpus, mostly full-page captures re-read dozens of times inside design loops. Cache-write ratio, where writes run about 1.25× the input price and fire when the cache expires after roughly five idle minutes, so casually resuming a fat session rewrites the entire context at a premium. And per-model spread, because a cache does not survive switching models mid-session.

Two of the fixes stop needing thought once installed. A hook bounces an oversized image read once, with a 1000px copy already written to disk and its path handed back. A statusline puts context usage in front of you rather than leaving it to be discovered three tool calls later.

The exercise that decides whether any of this mattered is the last one. Take the single largest number and change one habit. A measurement that changes no habit was a research exercise, not an audit.

Twenty minutes, run against your own logs:
https://ninochavez.co/blog/tutorials/measure-your-own-token-waste
