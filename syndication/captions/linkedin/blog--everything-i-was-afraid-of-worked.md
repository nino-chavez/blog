I spent an hour trying to break a tool I had built for a youth volleyball club. I broke it seven times. Not one of those breaks was in the layer I had spent the entire design protecting.

Last October I published a post arguing that agent safety is an architecture problem: the model proposes, hard-coded code disposes, a human approves. Then I built exactly that — writes land at exact byte positions behind a content hash, and nothing a model says reaches a page without code agreeing.

That part held. I hit refresh mid-apply — the oldest bug in web development — and the write path caught the resubmit precisely as designed.

And I was still staring at a screen that lied to me. The refusal came back labeled stale: true to the bytes, false to the person, because the proposal stopped matching the page for exactly one reason — the change had already succeeded. It reported failure for work that was live in front of me.

I had specified safety. I had not specified truthfulness.

What let me miss it is an inversion my spec never named. When you work with an AI assistant, you begin inside the model and stay there — it holds the state of the job and reaches for tools when it wants one. Mine runs the opposite direction. The job lives in a database. Code owns it, hands the model one bounded question, takes the answer back, and decides what to write. The model is called cold every time and remembers nothing. Anthropic's guidance calls the first shape an agent and the second a workflow.

Everything good about mine comes from that flip — a plan can be stored, resumed, audited, unit-tested. So does everything missing: no path exists that nobody wrote. And the interface is a text box, which advertises the first kind and delivers the second. The mental model I brought to breaking my own tool was the wrong one.

With the inversion unnamed, my operational knowledge had nothing to attach to but resemblance. The spec does bound model calls — six turns, on the component that answers questions, the one that looked like the diagrams I had studied. The planner was bounded by nothing and could reach hundreds of calls in one page load. Both call a model in a loop. Only one looked like a loop.

None of this was process-free: twelve acceptance conditions, a spec, an adversarial fact-check that fired correctly, a thousand assertions green while both failures were live. Every check asked whether what was written was true. It was. No such check can fail on a claim nobody made.

Here is the test I would now run on anything an agent helped build. Do not read the code to judge it. For each layer, name the specific failure it was built in response to. The layers that came from something I measured going wrong survived an hour of deliberate abuse. The layer that came from an assumption is where all seven problems lived. Same author, same process, different pedigree — and pedigree is what predicted quality.

https://ninochavez.co/blog/everything-i-was-afraid-of-worked
