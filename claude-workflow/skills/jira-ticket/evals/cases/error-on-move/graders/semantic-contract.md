---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. surfaces-error-message: The error message from jira CLI is shown to the user Verification: output contains 'not available' or 'transition' or references the error
2. shows-available-transitions: Mentions the available transitions from the error (In Review, Blocked) Verification: output contains 'In Review' or 'Blocked' or 'available transitions'
3. does-not-report-success: Does not claim the move succeeded Verification: output does NOT contain 'moved successfully' or 'moved to Done'
4. Expected outcome: The jira CLI returns a transition error. Skill should surface the error, show the available transitions, and let the user pick one.

PASS only if every criterion is satisfied; otherwise FAIL.
