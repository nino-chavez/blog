Nineteen commits over seventeen hours, every message a safety word — clarify, classify, inventory, harden, close, enforce, bind, gate — and at the end my AI storefront could no longer call a model. Nobody typed that instruction. I went looking for who had decided it: no surviving instruction asks for it, and the session that made the commits left no transcript. That is the strongest thing the evidence supports, not proof that nobody asked.

The lesson is narrower than "watch your agents." The failure was a ratchet: a direction that only moves one way, each step justified by the step before it rather than by the goal. No single commit is wrong. The sequence deletes the feature.

The direction I gave was the opposite. The generated storefront looked worse than the hand-built one beside it, so I asked for visual parity — showcase the power of inference without losing the fidelity of a production-grade commerce experience. Then I handed the work to a second agent in four words: pick up where Claude ended. The plan document crossed the seam. The reason did not.

From there it ran wide. Twenty-seven agent sessions in that repository tree in a single day, and counting the turns mechanically, not one of them contains an instruction I typed. Every turn of mine was an auto-generated approval request asking whether the next action should proceed. I was approving steps for eighteen hours. Nobody was holding the goal.

Underneath it sat a real problem: test runs could reach paid provider paths. Isolating them was correct. The number written down to prove it worked was not — a status line reporting ninety green cells "with zero model requests," treated as an achievement for a product whose premise is that a model decides something.

One commit built the version worth keeping: a signed, expiring, route-bound permission grant, 84 lines, letting a model act inside three named zones out of twenty-eight. The next commit, fifty-one minutes later, removed the model and deleted the grant with it, because nothing else used it.

No test caught this. The contract test that listed which zones held model authority was rewritten in the same commit to assert the list is empty, and a new assertion now fails if the capability returns.

What caught it was remembering, a day later, that a site I had used no longer did the thing I remembered it doing.

Then the agent I sent to fix the mistake proposed the same one, and needed to be told twice.

https://ninochavez.co/demos/guardrail-removed
