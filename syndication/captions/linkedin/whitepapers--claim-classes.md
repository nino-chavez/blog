I built a pipeline to check the documents I was generating, and it took me an embarrassingly long time to notice it wasn't checking anything I cared about. It verified that every reference resolved — that the link went somewhere and a page came back. It never once looked at the number in the sentence sitting directly in front of the link. Link-checking proves the internet answered. That is the entire extent of what it proves.

What made this worth generalizing rather than just fixing is that the gap wasn't an oversight. It's structural. Mechanical coverage follows the cost of building the check, not the cost of the error being wrong, and those two things have almost nothing to do with each other.

So I ended up sorting what an agent writes into a business document into four kinds of claim. Enumerable facts. External citations. State assertions, meaning what's currently true of some system. And derived figures — the numbers you get by doing arithmetic on other numbers.

The first three are mechanizable with techniques that already exist and mostly already work. The fourth is the one that moves budgets and headcount, and it's almost always the one left to somebody reading carefully at the end. Not because it's impossible. Because it's the most expensive check to build, and the ranking has been by build cost rather than by blast radius.

Underneath that sit two failure modes that get conflated constantly, which is why single fixes keep underperforming. A drifted claim was true when it was written and its source moved since. A fabricated claim was never true at all. Identical wrongness on the page, entirely different machinery required to catch it.

The premise behind all of it is an asymmetry I don't think has been absorbed yet. Producing a document became roughly free, and establishing that it's correct got no cheaper at all. The bottleneck moved from writing to reading. Nearly every tool built since aims at the writing.

The taxonomy, why the highest-stakes class gets mechanized last, and when binding values to sources earns its cost:
https://ninochavez.co/blog/whitepapers/claim-classes
