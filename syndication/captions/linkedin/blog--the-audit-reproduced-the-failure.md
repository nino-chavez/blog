I asked an agent fleet to audit where a project had backtracked, regressed, and needed to be re-steered. It found useful patterns. Then it made the same evidence mistakes it was meant to expose.

Journal rows were counted as completed events, even though stopped runs had left duplicates. A receipt for the final logical run was reported as the whole execution history, leaving out abandoned and restarted attempts.

The worse error was in the verification design.

The filter selected every event already labeled “the packet would have prevented this.” That bucket was audited at 100%. The comparison buckets were audited at 28% and 25%.

The fully checked bucket shrank. The lightly checked buckets mostly kept their labels. Then the relative size of those buckets was reported as a finding.

The sample did not merely fail to support the rate. The filter manufactured the comparison.

The local logs record 334 million tokens after cumulative usage rows are deduplicated. About 89% were cache reads. The run still exhausted my intraday allowance, used about a fifth of my weekly allowance, and consumed 40% of my model-specific allowance.

Those are not API-dollar calculations. They are the work displaced by a burned session window.

One content finding survived. “One fact, one owner” can be true and still fail to stop a destructive deployment. A page body can have one owner in a repository and another in a database. A push from one can erase approved edits in the other.

The abstract rule becomes useful only when it names the operation it forbids and the surface it protects.

This does not prove the model was useless. The fleet extracted real candidate events and surfaced a real ownership problem. The failure was giving one process every job at once: collector, verifier, orchestrator, accountant, and final judge.

The setup I would trust is smaller:

- Models extract and propose
- Deterministic code deduplicates, counts, and records state
- An independent reviewer tests the sample and consequential claims

That division is much harder for a workflow to grade its own homework.

https://ninochavez.co/blog/the-audit-reproduced-the-failure
