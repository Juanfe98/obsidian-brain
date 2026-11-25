---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. correct-subcommand: Uses 'issue assign' subcommand Verification: mock-jira log contains 'issue assign'
2. correct-issue-key: Targets SLQA-200 Verification: mock-jira log line for 'issue assign' contains 'SLQA-200'
3. resolves-me-first: Calls jira me before the assign to resolve the current user Verification: mock-jira log shows a 'me' line appearing before the 'issue assign' line
4. assign-uses-resolved-email: The assign command uses the resolved email, not the literal string 'me' Verification: mock-jira log line for 'issue assign' contains 'mock.user@company.com' (not 'me')
5. Expected outcome: Resolves 'me' via jira me, then executes jira issue assign SLQA-200 with the resolved email

PASS only if every criterion is satisfied; otherwise FAIL.
