---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. create-executed: Actually runs jira issue create Verification: mock-jira log contains 'issue create'
2. create-has-summary: Create includes a summary about dark mode Verification: mock-jira log line for 'issue create' contains '-s'
3. assignment-happens: The issue gets assigned — either via -a on create or a separate issue assign call Verification: mock-jira log contains '-a' on the create line OR contains a separate 'issue assign' call
4. resolves-me: Resolves 'me' to the actual user — via jira me, $(jira me), or the resolved email Verification: mock-jira log contains 'me' command or the create/assign line contains 'mock.user@company.com'
5. create-before-assign: If using separate assign, it happens after create (needs the key) Verification: mock-jira log shows 'issue create' appearing before 'issue assign' (if assign is separate)
6. Expected outcome: Two-step: create the issue first, extract the key from output, then assign it using jira me to resolve the user. Alternatively, may use -a flag on create to assign inline.

PASS only if every criterion is satisfied; otherwise FAIL.
