---
name: "Lenny Rachitsky — Lenny's Newsletter"
url: "https://www.lennysnewsletter.com"
category: "follow-not-subscribe-at-scale"
captured_on: "2026-05-25"
adjacency: "v2 cross-industry — what email-capture at scale looks like when it works (anti-pattern reference)"
---

## What they do well

- **Identity-first proposition above the fold.** Home leads with the audience proposition: "Deeply researched product, growth, and career advice for product leaders, founders, and ambitious builders." Reader knows who the publication is for before any conversion ask.
- **Subscriber count as social proof.** 1,200,000+ subscribers prominently displayed near the fold. Demonstrates scale without overtly pitching subscription. For an audience that responds to social-proof signals (Lenny's reader base = career-conscious operators), this works.
- **Email capture as modal with friction acknowledgment.** Subscribe modal includes legal disclosures (Terms, Privacy, Information Collection Notice) and a "No thanks" dismissal — the friction acknowledgment is unusual and signals the publication respects the reader's choice rather than dark-patterning around it.

## What we could learn

- **Audience-proposition sentence as load-bearing.** Lenny's first sentence specifies WHO the publication is for. v2's editorial single-sentence (D2) should do the same — the sentence is the answer to "is this for me." Currently the v1 publication has no equivalent sentence visible to a cold-arrival reader.
- **Friction-acknowledged email capture is the LEAST-bad version of email capture.** If v2 ever decides to capture email (currently rejected per the hiring-evaluator no-marketing-tells rule), Lenny's modal pattern — clear opt-out, legal disclosure, no dark patterns — is the reference. Don't borrow the modal trigger; borrow the modal shape if it ever becomes relevant.

## What to avoid

- **The whole subscribe modal is the anti-pattern for v2.** Even Lenny's "friction-acknowledged" version still interrupts the reader with a modal. v2's hiring-evaluator persona reads modals as marketing-tells regardless of how politely they're framed. Don't introduce.
- **Subscriber-count display.** Lenny's 1.2M signal works because his audience responds to that signal. v2's hiring-evaluator audience reads "subscriber count prominently displayed" as personal-brand performance. Even if v2 ever measures subscriber count, don't surface it on home.
- **Substack-native UI defaults.** Lenny runs on Substack; the modals, the share buttons, the comments-by-default, the "Subscribe" CTA placement are all platform defaults. v2 runs on its own infrastructure (per Stage 6 deploy) — no inherited platform UI. Confirms the v1 architectural choice (Astro + custom shell, not Substack).
- **Freemium tier obscurity.** The page doesn't clearly signal free vs paid until after the subscribe ask. v2 has no paid tier and doesn't need this; don't introduce a model that requires this kind of disclosure pattern.

## Implications for v2

- **D2 (editorial sentence) test**: every candidate sentence should answer "is this publication for me" in 12 words or less. Lenny's "Deeply researched product, growth, and career advice for product leaders, founders, and ambitious builders" is 17 words but does this work well. v2's sentence should aim for the same load-bearing audience-naming function.
- **Anti-pattern catalog for the no-marketing-tells rule** — Lenny's home page is the most concrete example of what v2 specifically rejects. Document the rejection so future iterations don't slip into Lenny-shape "well, it works for them" reasoning.
- **Reaffirm the no-platform-defaults architectural choice** — v2's deploy on its own infrastructure (not Substack/Medium/etc.) is the only way to avoid platform-default email-capture UI. Stage 6 deploy already locks this in.
