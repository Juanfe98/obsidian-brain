---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. surfaces-error-message: The error message from jira CLI is shown to the user Verification: output contains 'permission' or 'do not have permission' or references the error
2. does-not-report-success: Does not claim the issue was created or show a fake URL Verification: output does NOT contain 'MOCK-123' or 'browse/' or 'created successfully'
3. suggests-fix: Suggests a possible fix or next step (check permissions, verify project, etc.) Verification: output suggests checking permissions, verifying the project key, or contacting an admin
4. Expected outcome: The jira CLI returns a permission error. Skill should surface the error message to the user and suggest possible fixes (check permissions, verify project key). Should NOT retry or pretend the issue was created.

PASS only if every criterion is satisfied; otherwise FAIL.
