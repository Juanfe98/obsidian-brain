---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. create-executed: Runs jira issue create Verification: mock-jira log contains 'issue create'
2. sprint-list-executed: Runs jira sprint list to find active sprint Verification: mock-jira log contains 'sprint list'
3. sprint-add-executed: Runs jira sprint add Verification: mock-jira log contains 'sprint add'
4. correct-ordering: Create happens first, then sprint list, then sprint add Verification: mock-jira log shows 'issue create' before 'sprint list' before 'sprint add' (or create before sprint add if sprint list is interleaved)
5. uses-created-key: Sprint add uses MOCK-123 (the key returned by mock create), not a made-up key Verification: mock-jira log line for 'sprint add' contains 'MOCK-123'
6. uses-active-sprint-id: Sprint add uses sprint ID 100 (the active sprint from mock) Verification: mock-jira log line for 'sprint add' contains '100'
7. Expected outcome: Three-step chain: create the issue (get key from output), list sprints (find active ID), sprint add. Must use the created issue's key, not a hardcoded one.

PASS only if every criterion is satisfied; otherwise FAIL.
