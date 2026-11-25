---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should offer batch resolution since the same check fails on 12 tickets (well above the 5-ticket threshold) and the fix is uniform (adding a component). Should propose adding 'core-api' to the 8 API tickets and 'core-web' to the 4 frontend tickets — presenting the full list for confirmation. Should also trigger the ticket template recommendation since >50% (80%) of tickets fail the same check. Should NOT attempt to fix these one at a time.

PASS only if every criterion is satisfied; otherwise FAIL.
