---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. uses-issue-link: Routes to jira issue link subcommand Verification: mock-jira log contains 'issue link'
2. correct-link-type: Uses 'is blocked by' not 'Blocks' — the direction is from SLQA-100's perspective Verification: mock-jira log contains 'is blocked by'
3. correct-issue-order: SLQA-100 is the source and SLQA-101 is the target Verification: mock-jira log shows SLQA-100 before SLQA-101
4. Expected outcome: Should use link type 'is blocked by' (not 'Blocks' — direction matters). Executes: jira issue link SLQA-100 'is blocked by' SLQA-101

PASS only if every criterion is satisfied; otherwise FAIL.
