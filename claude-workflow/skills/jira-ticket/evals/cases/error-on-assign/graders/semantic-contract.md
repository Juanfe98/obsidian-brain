---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. surfaces-error-message: The error message from jira CLI is shown to the user Verification: output contains 'does not exist' or 'not found' or references the error about the user
2. does-not-report-success: Does not claim the assignment succeeded Verification: output does NOT contain 'assigned successfully' or 'OK'
3. suggests-fix: Suggests verifying the user email or checking the username Verification: output suggests verifying the email, checking the username, or trying a different identifier
4. Expected outcome: The jira CLI returns a user-not-found error. Skill should surface the error and suggest verifying the email or username.

PASS only if every criterion is satisfied; otherwise FAIL.
