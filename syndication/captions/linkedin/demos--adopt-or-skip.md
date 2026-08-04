A plugin came across my desk advertising eleven agents and fifty-four hooks. That's the kind of number that does your thinking for you. Fifty-four of anything sounds like a lot. Measured against my actual machine, the delta was one component.

Not because the plugin was bad. A feature list is only half of a subtraction. The half nobody publishes is yours.

Eight of its components could plausibly have landed on my setup. Three I was already running in some form. One was for a platform I don't use. One was broken upstream. I only found that by searching its issue tracker. That's the part of a repo a maintainer can't curate. The gap shows. And two weren't additions at all. They were costs: things that load on every session and buy nothing.

That left one worth installing.

The uncomfortable part is what the exercise did in the other direction. Writing down my own baseline meant listing what loads at startup. Every hook. Every rule. Every helper. That list had grown one reasonable addition at a time. No single entry was a mistake. An earlier audit of the same setup found a duplicate install and a tool connection nothing had invoked. All of it still loading, every session. Nothing ever prompts you to take something out.

So the honest version of "should I install this" surfaces a second question underneath. It's the less comfortable one: what's already in here that I wouldn't install today?

I got this wrong the first time and had to retract a recommendation. That correction is in the session, not edited out of it.

The full component-by-component pass, including the tracker queries and the retraction:
https://ninochavez.co/demos/adopt-or-skip
