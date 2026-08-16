I spent an hour trying to break a tool I had built for a youth volleyball club. I broke it seven times. Not one of those breaks was in the layer I had spent the entire design protecting.

Last October I published a post arguing that agent safety is an architecture problem: the model proposes, hard-coded code disposes, a human approves. Then I built exactly that. A model suggests new wording. Code that never consults a model decides whether the suggestion can be written. Every write lands at exact byte positions behind a content hash.

That part held. I hit refresh mid-apply — the oldest bug in web development — and the write path caught the resubmit precisely as designed.

And I was still staring at a screen that lied to me. The refusal came back labeled stale. Mechanically true, completely false to the person reading it: the proposal no longer matched the page because the change had already succeeded a second earlier. The tool reported failure for work that was live in front of me.

I had specified safety. I had not specified truthfulness.

What let me miss that is an axis my spec never named: who holds the loop. In an agent, the model decides what happens next and which tool to reach for. In a workflow, code decides, and the model is a function it calls — no loop, no tools, nothing remembered between calls. Anthropic's guidance splits them in those exact terms. What I built is wholly the second kind. What a text box advertises is the first.

With the axis unnamed, my operational knowledge had nothing to attach to except resemblance. The spec does bound model calls — six turns, on the component that answers questions, the one that looked like the pictures in every agent-architecture post I had read. The component that planned changes was bounded by nothing, and one request could reach hundreds of model calls before the page finished loading. Both call a model in a loop. Only one of them looked like a loop.

None of this was process-free. There was a decision record with twelve acceptance conditions, a spec, an adversarial fact-check that fired correctly every time it ran, and over a thousand assertions green on three PHP versions while both failures were live. The review asked whether everything written down was true. It was. No review that checks claims can fail on a claim nobody made.

So here is the test I would now run on anything an agent helped me build. Do not read the code to judge it. For each layer, name the specific failure it was built in response to. The layers that came from something I measured going wrong survived an hour of deliberate abuse. The layer that came from an assumption is where all seven problems lived. Same author, same process, different pedigree — and pedigree is what predicted quality.

https://ninochavez.co/blog/everything-i-was-afraid-of-worked
