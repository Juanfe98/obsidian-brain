---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should apply only the checks that are applicable to Sub-tasks per the applicability matrix (Description, Vague Title, No Assignee in sprint). Should NOT flag missing AC, story points, test plan, epic link, dependencies, or other checks marked 'No' for sub-tasks.

PASS only if every criterion is satisfied; otherwise FAIL.
