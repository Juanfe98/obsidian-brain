---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. surfaces-error-message: The error message from jira CLI is shown to the user Verification: output contains 'sprint' and ('not active' or 'does not exist' or 'error')
2. does-not-report-success: Does not claim the issue was added to a sprint Verification: output does NOT contain 'added to sprint' or 'added successfully'
3. Expected outcome: The jira CLI returns a sprint error. This is tricky because the error fires on sprint list, not sprint add. Skill should surface the error about the sprint and suggest checking the board or sprint configuration.

PASS only if every criterion is satisfied; otherwise FAIL.
