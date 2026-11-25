---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: A ticket-mode audit showing a pass/fail table for all checks, followed by specific suggestions for each failing check (e.g., drafted acceptance criteria, test plan), with approval prompts before making any changes
2. Format proposed Jira field content for the target deployment: use Markdown for Jira Cloud (the default; the CLI converts it to ADF), and Jira wiki markup only when an explicitly selected Data Center deployment requires it. Preserve the approval requirement before writing.

PASS only if every criterion is satisfied; otherwise FAIL.
