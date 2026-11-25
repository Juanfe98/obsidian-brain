---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. jql-passed-verbatim: The exact user JQL appears in the executed command, not rewritten Verification: mock-jira log or tool-calls.txt contains the original JQL: status = 'To Do' AND labels in (backend, infra) ORDER BY created ASC
2. shows-jql-before-running: The JQL is displayed to the user before execution Verification: assistant output shows the JQL query before any Bash execution
3. Expected outcome: Should pass the JQL through verbatim — not rewrite or 'improve' it. Show it for confirmation then execute.

PASS only if every criterion is satisfied; otherwise FAIL.
