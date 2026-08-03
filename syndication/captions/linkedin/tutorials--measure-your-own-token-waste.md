I had four theories about where my tokens were going and three of them were wrong, which I only found out by giving up on theorizing and going to measure.

The thing that reframed it is boring and structural: the agent API is stateless. Every single tool call resends the entire conversation from the top. Nothing is free just because you already said it once. A token that lands early in a long session gets paid for again on every turn that follows, which makes session cost roughly quadratic in turn count. Across 529 sessions that came out as a replay multiplier of 41 — cache reads over tokens written. So the real driver is session length, not any individual action that feels expensive. I had been trimming what I sent, which is precisely the wrong lever.

The number I genuinely didn't see coming was images, at 78 percent of every byte read. They bill by pixel dimensions rather than file size. Mine were mostly full-page screenshots re-read dozens of times inside design loops, where a cropped copy of the same content costs a fraction.

The workshop is the hands-on half of that. A hook that blocks two specific wastes without you having to think about them. A statusline that makes context usage visible while it's happening, rather than three tool calls later. Then the measurement tool, run against your own session logs instead of mine. Five metrics, with enough on each to pick one habit to change.

My reference numbers are honestly the least useful part of it. They came from my sessions, my projects, my bad habits. What's interesting is what a different history says. The 41 gets re-checked in a few weeks.

Four exercises, twenty minutes:
https://ninochavez.co/blog/tutorials/measure-your-own-token-waste
