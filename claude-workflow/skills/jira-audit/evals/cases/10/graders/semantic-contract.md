---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should recognize this is ambiguous — it's not clearly a project audit, sprint audit, or single ticket audit. Could mean: audit FD-2847 itself, audit FD-2847 and its sub-tasks, or audit linked/blocking tickets. Should ask for clarification on the intended scope before proceeding.

PASS only if every criterion is satisfied; otherwise FAIL.
