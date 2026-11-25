---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. queries-first: Runs a JQL query or issue list to find the matching issues Verification: mock-jira log contains 'issue list'
2. query-has-filters: The query filters by project, status, assignee, and type Verification: tool-calls.txt Bash command for issue list contains 'SLQA' and 'To Do' and 'currentUser'
3. moves-results: Attempts to move at least one issue from the results Verification: mock-jira log contains 'issue move' after 'issue list'
4. moves-to-in-progress: The move target state is In Progress Verification: mock-jira log line for 'issue move' contains 'In Progress'
5. Expected outcome: Multi-step: first query for matching issues (JQL with project, status, assignee, type), then move each one individually. Should not just move one — needs to handle the list.

PASS only if every criterion is satisfied; otherwise FAIL.
