I wanted to see whether we could build something that learned how I edit photos and applied those edits in Lightroom. I already use presets. The point was to get a better starting point for the photos that still need work.

Early in the session, I asked what we were actually training. Were we training a model, or just steering one? Would we need open weights? A small model or a large one?

I also said development time and effort were negligible because coding agents were doing the work.

We got the Lightroom part working. The system could recover saved edits, propose new settings, apply them to isolated copies, and render the results for comparison. It could do that without changing the originals.

But when I compared one learned model with a fixed recipe on ten photos, the model won none, lost six, and tied four. A simpler model lost seven and tied three on the same photos. These were small, overlapping development tests. We hadn't measured how much time either approach would save compared with my normal editing workflow.

During the session I asked, “Is this actually showing promise of accomplishing something with greater value and utility than, say, a batch preset in Lightroom?” Later I asked whether the fixed recipe was just a preset, which I was already using, and whether there was any point in continuing.

Then I asked what the session had cost.

The main chat's token record worked out to about $795 at standard API rates. That wasn't a verified bill to my account. It didn't include the separate workers or the photo-model API calls. The research plan had proposed a $100 ceiling for inference, training, and diffusion trials, but that didn't cover the coding conversation.

My next question was what guardrails we could build: clearing context more often, recognizing diminishing returns, or something else. I called it “a lot of wasted value, time, effort, and token quota.” We don't have a measured amount we could have avoided. The predictor configuration is stopped; the accounting and stopping controls are still proposed.
