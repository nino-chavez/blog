An agent audit I commissioned declared verification complete: 119 of 118 findings.

That was not a typo. Stopped and restarted runs had written duplicate rows into a journal. The workflow counted those attempts as completed findings.

The impossible count exposed the bookkeeping error. The verification filter did something worse.

Reader agents had already labeled candidate events according to whether an operating packet would have prevented them. The verification filter selected every event in the “would prevent” bucket. That bucket was audited at 100%. The comparison buckets were audited at 28% and 25%.

The fully checked bucket shrank from 44 candidates to 35. The lightly checked buckets mostly kept their original labels. Then the relative size of all three buckets was reported as a finding.

The sample did not merely fail to support the rate. The filter manufactured the comparison.

The local logs record 334 million tokens after cumulative usage rows are deduplicated. About 89% were cache reads. That is not an API bill. It is a record of a run that exhausted my intraday allowance before the sampling error was found.

Thirty-five directly verified events still survive. That is a floor, not a rate. The fleet produced useful candidates. It did not produce a trustworthy verdict.

The next audit gets three separate owners:

- Models extract candidates
- Code deduplicates and counts attempts
- An independent reviewer tests the sample and consequential claims

The process that designs the verification filter does not get to certify the rate that filter produces.

That is the part the first audit could not check about itself.

The full evidence and the receipt shape are in the first comment.

--- first-comment ---
https://ninochavez.co/blog/the-audit-reproduced-the-failure
