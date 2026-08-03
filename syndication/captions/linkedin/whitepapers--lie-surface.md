A unit suite in one of my products reported 970 of 970 passing, build clean, everything green. Every authenticated page in that product crashed on load. The suite wasn't broken and nobody had sabotaged it. It was measuring a surface where the failure wasn't, and it reported honestly on the surface it could see.

That session turned up five artifacts I'd been trusting, and four of them were quietly wrong. A migration history claiming changes had been applied, several of which described tables that don't exist. Four brand documents from four different eras, of which only the stylesheet was still current. A visual audit asserting the design was verified, which had itself drifted — it only ever inspected one gallery page and never the actual product. Exactly one of the five failed loudly, and it was the humblest thing in the pile: a test that broke because a page had been redesigned on purpose.

What separates them isn't accuracy. It's how wrong a thing can get without anything signaling that it's wrong. I've been calling that lie-surface, and ranking artifacts by it inverts the instinct almost completely. The polished architecture document — the one that reads as most authoritative, the one you'd hand a new hire — carries the most. A test asserting something obvious carries nearly none, because it fails the build the moment it stops being true.

Authority and trustworthiness turn out to be different axes, and I'd been reading one for the other.

The part I got wrong: I assumed binding claims to verifiers would cut what a session costs. Tested cold, answer quality improved inside a single turn and the token count didn't move at all. The agent read the registry and then went and verified against source anyway, which, annoyingly, is exactly the behavior the whole model exists to protect. Verification isn't the waste. It's the point.

What I still can't solve is the layer underneath. Rationale has no verifier. You can date it and append to it. The source is one person's memory.

The ranking, the knowledge-type table, and where the pattern frays:
https://ninochavez.co/blog/whitepapers/lie-surface
