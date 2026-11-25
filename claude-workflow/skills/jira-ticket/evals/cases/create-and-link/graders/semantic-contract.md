---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. create-executed: Runs jira issue create Verification: mock-jira log contains 'issue create'
2. link-executed: Runs jira issue link Verification: mock-jira log contains 'issue link'
3. create-before-link: Create happens before link (need the key first) Verification: mock-jira log shows 'issue create' before 'issue link'
4. link-uses-created-key: The link command uses MOCK-123 (the created issue key) as the source Verification: mock-jira log line for 'issue link' contains 'MOCK-123'
5. link-targets-slqa-200: The link command targets SLQA-200 Verification: mock-jira log line for 'issue link' contains 'SLQA-200'
6. correct-link-type: Uses 'Blocks' link type Verification: mock-jira log line for 'issue link' contains 'Blocks'
7. Expected outcome: Two-step: create the issue, extract the key, then link it to SLQA-200 with 'Blocks' link type. Must use the created issue's key as the source.

PASS only if every criterion is satisfied; otherwise FAIL.
