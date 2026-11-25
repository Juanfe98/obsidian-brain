---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. uses-assign-subcommand: Routes to issue assign (unassign is done via assign with 'x') Verification: mock-jira log contains 'issue assign'
2. uses-x-for-unassign: Passes 'x' as the assignee value to unassign Verification: mock-jira log line for 'issue assign' contains 'x'
3. correct-issue-key: Targets SLQA-100 Verification: mock-jira log line for 'issue assign' contains 'SLQA-100'
4. Expected outcome: Should use jira issue assign SLQA-100 x — the skill specifies 'x' for unassign.

PASS only if every criterion is satisfied; otherwise FAIL.
