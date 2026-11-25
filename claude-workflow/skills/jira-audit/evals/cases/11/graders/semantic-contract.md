---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should FAIL check #1 (Acceptance Criteria) even though AC text is technically present. The criteria 'works as expected and handles all cases properly' is a restatement of the summary, not testable, and provides no specific conditions. Should flag this and suggest concrete, testable criteria.

PASS only if every criterion is satisfied; otherwise FAIL.
