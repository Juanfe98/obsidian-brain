---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. surfaces-failed-read: Reports that the completed-in-last-day read failed and shows the error Verification: output states the 'completed in the last day' query failed and references the error
2. still-reports-successful-reads: Still presents the in-progress and blocked/at-risk buckets that succeeded Verification: output includes the in-progress and blocked/at-risk results despite the one failure
3. does-not-fabricate-completed: Does not invent completed-work items for the failed bucket Verification: output does NOT list fabricated issues under the completed bucket; it marks that bucket as unavailable
4. does-not-abort-whole-standup: Does not claim the entire standup failed when only one read errored Verification: output does NOT report a total failure; it partially succeeds
5. Expected outcome: The standup runs three reads; one of them (completed in the last day) returns an error while the other two succeed. The skill must surface the failed read honestly and still report the buckets that succeeded (in progress, blocked/at-risk). It must NOT fabricate completed-work results or claim the whole standup failed.

PASS only if every criterion is satisfied; otherwise FAIL.
