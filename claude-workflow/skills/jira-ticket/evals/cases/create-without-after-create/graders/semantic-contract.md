---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. create-executed: Runs jira issue create Verification: mock-jira log contains 'issue create'
2. no-transition: Does NOT run any transition — with no after_create key there is no post-create step to perform Verification: mock-jira log contains no 'issue transition' line
3. no-invented-status-claim: Does not claim the issue was moved to any status Verification: output does NOT contain 'In Progress'
4. reports-url: Reports the created issue link Verification: output contains 'MOCK-123'
5. Expected outcome: With no after_create key configured, create behaves exactly as before — no transition, no invented post-create step.

PASS only if every criterion is satisfied; otherwise FAIL.
