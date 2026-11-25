---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. asks-for-summary: The skill asks the user to provide a summary Verification: output contains a question or prompt asking for a summary
2. no-create-executed: Does not execute jira issue create without a summary Verification: mock-jira log does not contain 'issue create'
3. Expected outcome: Should ask the user for a summary since none was provided. The skill requires a summary for create. Should NOT make one up.

PASS only if every criterion is satisfied; otherwise FAIL.
