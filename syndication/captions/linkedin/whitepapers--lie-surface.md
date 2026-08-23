A unit suite in one of my products reported 970 of 970 passing. Build clean. Everything green. Every authenticated page in that product crashed on load.

The suite wasn't broken. Nobody had sabotaged it. It was measuring a surface where the failure wasn't, and it reported honestly on the surface it could see.

That session turned up five artifacts I'd been trusting. Four were quietly wrong. A migration history claiming changes had been applied, several describing tables that don't exist. Four brand documents from four different eras, only the stylesheet still current. A visual audit asserting the design was verified, which had itself drifted — it only ever inspected one gallery page, never the actual product.

Exactly one of the five failed loudly. It was the humblest thing in the pile: a test that broke because a page had been redesigned on purpose.

What separates them isn't accuracy. It's how wrong a thing can get without anything signaling that it's wrong. I've been calling that lie-surface. Ranking artifacts by it inverts the instinct almost completely. The polished architecture document carries the most — the one that reads as most authoritative, the one you'd hand a new hire. A test asserting something obvious carries nearly none, because it fails the build the moment it stops being true.

Authority and trustworthiness are not the same axis.

The tempting justification is efficiency. An agent that reads a registry skips the rediscovery and answers in fewer tokens. Tested cold, that's wrong in an instructive way. Answer quality improved inside a single turn. The token count didn't move at all. The agent read the registry, then verified against source anyway. That is the behavior the whole model exists to protect. Verification isn't the waste. It's the point.

The layer underneath resists all of it. Rationale has no verifier. You can date it and append to it. The source is one person's memory.

The ranking, the knowledge-type table, and where the pattern frays:

--- first-comment ---
https://ninochavez.co/blog/whitepapers/lie-surface
