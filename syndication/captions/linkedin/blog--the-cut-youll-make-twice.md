There is a file in this blog's repo that tells every agent writing a post: do not add new tags without updating this file, because build validation will reject unapproved tags.

The schema that would do the rejecting accepts any array of any strings. No validation anywhere compares a post's tags against the approved list.

So I counted. Two hundred seventy-seven files carry tags. The approved list has eighteen entries. Forty-nine distinct tags are actually in use, thirty-two of them off-list, across sixty-four uses. One approved tag even declares a list of the sloppy tags it exists to absorb, names `AI` in that list by name, and `AI` is live on four posts.

The file names the exact mistake. The mistake is in the repo four times. The build has been green the entire time.

That file is a warning label, and most of what any of us gives a coding agent is a warning label — the instructions file, the rules file, the paragraph pasted at the top of a session. Text that gets read and mostly honored. Mostly is worse than it sounds, because when a rule gets skipped and the work still looks fine, nothing tells you.

There are three things here, not two. A rule the agent can decline. A valve that stops it and can be reset. And a surface with nowhere to put the bad instruction.

The third is the one I never had a word for. In a retail storefront where a model composes the page layout, a catalog declares every named place that model may write — twenty-eight zones across ten surfaces. The cart has three. Line items, order totals, promo entry, the checkout button itself: none of them are zones. No policy says the model may not change the cart total. Nobody wrote that sentence and nobody has to. There is nowhere to put the instruction.

Here is the part that took longest to see. A valve announces itself. The trip is the record, so when I set a threshold in the wrong place I find out, because I watch the agent get stopped from doing something reasonable. A jig produces nothing. That is the point of it, and it is also the problem.

The resolver throws loudly on a zone ID that doesn't exist. The line enforcing the actual constraint sits twelve lines further down, and when the engine writes somewhere it isn't allowed, that condition is simply false. Execution falls through to the static fallback. The page renders. Nothing throws, and a merchant sees a completely normal page.

Loud about the harmless failure, silent about the real one. A fence in the wrong place and a fence in the right place produce identical telemetry: clean.

The full piece, including the measurement where my own README came out off by roughly three and a half times, in the direction that flattered my own tool:

--- first-comment ---
https://ninochavez.co/blog/the-cut-youll-make-twice
