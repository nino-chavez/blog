I spent an hour trying to break a tool I had built for a youth volleyball club. I broke it seven times. Not one of those breaks was in the layer I had spent the entire design protecting.

Last October I published a post arguing that agent safety is an architecture problem: the model proposes, hard-coded code disposes, a human approves. Then I built exactly that. A language model suggests new wording for site copy. Code that never consults a model decides whether the suggestion can be written. Every write lands at exact byte positions with a content hash checked first.

That part held. I hit refresh in the middle of applying a change — the oldest bug in web development — and the write path caught the resubmit precisely as designed.

And I still ended up staring at a screen that was lying to me. The refusal came back labeled stale. Mechanically true: the proposal no longer matched the page. Completely false to the person reading it, because the reason it no longer matched was that the change had succeeded a second earlier. The tool reported a failure for work that was live on the page in front of me.

I had specified safety. I had not specified truthfulness. Those are different properties, and I only knew to be afraid of one of them.

There is an axis this sat on that my spec never named: who holds the loop. In an agent, the model decides what happens next and which tool to reach for. In a workflow, code decides, and the model is a function it calls — no loop, no tools, nothing remembered between calls. Anthropic's guidance splits them in those exact terms. What I built is wholly the second kind. What a text box advertises is the first, and the mental model I brought to breaking my own tool was the wrong one.

The wider version of that mistake is where the limits went. My spec does bound model calls — six turns, on the component that answers questions. The component that plans changes had no bound at all and could make hundreds of calls inside a single page load. Both call a model in a loop. Only one of them looked like a loop.

The honest counter-argument is that this was sloppy work with process bolted on. It was not. There was a decision record with twelve acceptance conditions, a spec, an adversarial fact-check that caught real problems every time it ran, and over a thousand test assertions running clean on three versions of PHP while both failures were live. The review asked whether everything written down was true. Everything written down was true. No review that checks claims can fail on a claim nobody made.

So here is the test I would now run on anything an agent helped me build. Do not read the code to judge it. For each layer, name the specific failure it was built in response to. The layers that came from something I had measured going wrong survived an hour of deliberate abuse. The layer that came from an assumption is where all seven problems lived. Same author, same process, different pedigree — and pedigree is what predicted quality.

https://ninochavez.co/blog/everything-i-was-afraid-of-worked
