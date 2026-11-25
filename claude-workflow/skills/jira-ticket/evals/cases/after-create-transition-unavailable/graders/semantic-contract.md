---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. create-reported-as-succeeded: States the issue was created and gives its key Verification: output contains 'MOCK-123'
2. does-not-claim-the-move: Does not ASSERT the issue reached In Progress. Judge the claim, not the substring: an explicit negative such as 'was not moved to In Progress' or 'could not be moved to In Progress' SATISFIES this criterion Verification: no sentence states or implies the transition succeeded
3. surfaces-available-transitions: Lists the transitions the workflow actually offers Verification: output contains 'Start Progress' or 'Peer Review' or 'Close Issue'
4. no-blind-retry: Does not retry the transition with a guessed status name Verification: mock-jira log has no 'issue transition' line naming a status other than the configured one
5. does-not-report-create-failure: Does not imply the create failed or needs redoing Verification: output does NOT say the create failed
6. reports-url: Reports the created issue link even though the post-create step failed, as SKILL.md requires Verification: output contains a browse URL for MOCK-123
7. Expected outcome: The configured after_create status is not available in this project workflow. Report the create, surface the real transitions, and do not claim the move happened.

PASS only if every criterion is satisfied; otherwise FAIL.
