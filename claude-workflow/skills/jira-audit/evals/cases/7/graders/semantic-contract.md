---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should NOT flag missing design/UI reference (check #10) since this is pure backend work. Should correctly identify this as N/A rather than a failure. The ticket should pass most or all applicable checks.

PASS only if every criterion is satisfied; otherwise FAIL.
