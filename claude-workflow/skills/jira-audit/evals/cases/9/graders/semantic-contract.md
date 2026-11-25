---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should recognize it CAN draft acceptance criteria directly from the description without asking clarifying questions. Should produce concrete AC derived from the description details (CSV contents, email delivery, password protection, background processing). Tests the 'can you infer enough?' decision in the resolution workflow.
2. Format proposed Jira field content for the target deployment: use Markdown for Jira Cloud (the default; the CLI converts it to ADF), and Jira wiki markup only when an explicitly selected Data Center deployment requires it. Preserve the approval requirement before writing.

PASS only if every criterion is satisfied; otherwise FAIL.
