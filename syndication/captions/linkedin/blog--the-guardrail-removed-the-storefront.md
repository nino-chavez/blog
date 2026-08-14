A safe AI storefront can still be a fake AI storefront.

The difference is not whether the output passes a schema. It is whether a live model is allowed to make a bounded decision that a shopper can see.

An Aisles/Bealls implementation had real model-backed behavior this spring and summer. Whole layouts were generated within a fixed component vocabulary. Named zones carried generated or selected copy and composition. A later test-fixture concern was broader than the evidence: provider-free parity runs became a policy of no shopper model authority anywhere. That change removed the part of the system the demo was supposed to demonstrate.

The safer design was already available:

- merchant-owned schemas define facts, prices, components, links, legal copy, and policy;
- signed route grants define where a model may act;
- candidate allow-lists define what it may select;
- validated zone envelopes reject unknown products, URLs, assets, and markup;
- deterministic fixtures stay provider-free for ordinary tests.

The model still gets a real job: reorder approved products, select approved copy, choose a component variant, or retain the current arrangement. “Unchanged” is still a decision if the system can show that it considered the alternatives.

That is the commerce pattern worth building: live judgment inside a merchant-owned grammar.

The next demo should make the call visible. Fresh inference, cache hit, unchanged result, failure, and fallback should not collapse into one generic “AI” badge.

Read the full argument: https://ninochavez.co/blog/the-guardrail-removed-the-storefront
