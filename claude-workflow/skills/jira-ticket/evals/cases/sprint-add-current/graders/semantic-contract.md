---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. lists-sprints-first: Calls jira sprint list to find the active sprint Verification: mock-jira log contains 'sprint list'
2. sprint-list-before-add: Sprint list happens before sprint add in the mock log Verification: mock-jira log shows 'sprint list' appearing before 'sprint add'
3. uses-correct-sprint-id: Uses sprint ID 100 (the active sprint from mock output) Verification: mock-jira log line for 'sprint add' contains '100'
4. adds-correct-issue: Adds SLQA-100 to the sprint Verification: mock-jira log line for 'sprint add' contains 'SLQA-100'
5. Expected outcome: Must resolve the current sprint ID first via jira sprint list, identify the active sprint (ID 100), then run jira sprint add 100 SLQA-100.

PASS only if every criterion is satisfied; otherwise FAIL.
