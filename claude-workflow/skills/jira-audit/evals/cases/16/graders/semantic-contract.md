---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should exclude the 2 Done tickets and only audit the 16 non-completed tickets. Should use the label/filter mode JQL with status exclusion (AND status NOT IN ('Done', 'Closed', 'Resolved')). Should NOT include the Done tickets in the report, readiness score calculation, or issue counts. The report header should say 'Tickets audited: 16' not '18'.

PASS only if every criterion is satisfied; otherwise FAIL.
