---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. correct-subcommand: Uses 'issue move' not 'issue edit' or other subcommand Verification: mock-jira log contains 'issue move'
2. correct-issue-key: Targets SLQA-100 Verification: mock-jira log line for 'issue move' contains 'SLQA-100'
3. state-is-single-arg: The state 'In Progress' is passed as a single quoted argument, not two separate args Verification: mock-jira log line for 'issue move' contains 'In Progress' (with surrounding single quotes, meaning it was one arg)
4. Expected outcome: Executes: jira issue move SLQA-100 "In Progress"

PASS only if every criterion is satisfied; otherwise FAIL.
