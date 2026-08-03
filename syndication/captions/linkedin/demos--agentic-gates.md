For a stretch in May a live production site of mine was publishing fiction. Fictional pilot integrations. Partnership terms nobody had signed, presented as real. Competitor comparisons. All of it on the production domain and fully indexable.

Nothing malfunctioned, which is the part worth sitting with. A migration sweep moved every prototype page into the product's production routes and executed that instruction perfectly. The pages themselves carried no field saying what they were — strategy surfaces and product surfaces had been living in one prototype, distinguishable only inside a human's head. So the sweep, entirely reasonably, took everything.

That's what an ungated hand-off looks like. Not a bad decision anywhere in the chain. A missing declaration, amplified by a step that did exactly what it was told.

The pattern I keep landing on is that agents are strong inside a stage and unreliable at the boundaries between them. Research into strategy documents, documents into a prototype, prototype into production — the work inside each of those is delegable and mostly fine. The seam between them is where a confidently wrong artifact gets promoted rather than caught.

So the fix wasn't "be more careful," which isn't a fix. Every page now declares a destination, and only pages marked as product may ship to production routes. The check enforcing it is inverted — it goes looking for the strategic surfaces coming back and fails the build when it finds them. The incident is documented inside the check that prevents it, which is about the only place documentation reliably survives.

The honest limit is that this only works backwards. Gates encode failures already survived. That sweep happened with the methodology already in place, eighty-eight versioned revisions in and fourteen projects running on it. Anyone selling a gate set that catches failures nobody has hit yet is selling the sentence, not the check.

And I still have no mechanism for the thing that actually caused it. No schema field covers the next one.

https://ninochavez.co/demos/agentic-gates
