I had four theories about where my tokens were going. Three were wrong. I only found out by giving up on theorizing and going to measure.

The thing that reframed it is boring and structural. The agent API is stateless. Every single tool call resends the entire conversation from the top. Nothing is free just because you already said it once. A token that lands early gets paid for again. Every turn that follows. That makes session cost roughly quadratic in turn count. Across 529 sessions that came out as a replay multiplier of 41. Cache reads over tokens written. So the real driver is session length, not any individual action that feels expensive. Trimming what you send is almost never the fix.

Then images. Seventy-eight percent of every byte read. They bill by pixel dimensions rather than file size. Mine were mostly full-page screenshots, re-read dozens of times inside design loops. A cropped copy costs a fraction.

The workshop is the hands-on half of that. A hook that blocks two specific wastes without you having to think about them. A statusline that makes context usage visible while it's happening, rather than three tool calls later. Then the measurement tool, run against your own session logs instead of mine. Five metrics, with enough on each to pick one habit to change.

My reference numbers are the least useful part. They came from my sessions, my projects, my bad habits. What's interesting is what a different history says. The 41 gets re-checked in a few weeks.

Four exercises, twenty minutes:
https://ninochavez.co/blog/tutorials/measure-your-own-token-waste
