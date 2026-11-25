---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. uses-move-not-edit: Routes to issue move, not issue edit Verification: mock-jira log contains 'issue move' and does NOT contain 'issue edit'
2. state-is-in-review: The target state is 'In Review' as a single arg Verification: mock-jira log contains 'In Review' (quoted as single arg)
3. Expected outcome: Should interpret as a move (transition) to 'In Review', not an edit. Uses jira issue move.

PASS only if every criterion is satisfied; otherwise FAIL.
