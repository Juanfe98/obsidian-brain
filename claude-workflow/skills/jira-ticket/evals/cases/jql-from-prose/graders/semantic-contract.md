---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. jql-has-project: Generated JQL includes project = SLQA Verification: output or mock-jira log contains 'project = SLQA'
2. jql-has-bug-type: Generated JQL filters for Bug type (issuetype is the correct JQL field name) Verification: output contains 'issuetype = Bug' or 'type = Bug'
3. jql-has-priority: Generated JQL filters for High priority Verification: output contains 'priority = High'
4. jql-has-current-user: Generated JQL uses currentUser() for assignee Verification: output contains 'currentUser()'
5. shows-query-before-running: The skill shows the JQL query to the user before executing Verification: assistant output displays the JQL query text BEFORE the tool-calls.txt shows a Bash call to jira issue list
6. uses-issue-list-with-jql: Executes via jira issue list -q, not jira issue search or other Verification: mock-jira log contains 'issue list' with -q flag
7. uses-plain-no-truncate: Uses --plain --no-truncate flags for readable output Verification: tool-calls.txt Bash command contains '--plain' and '--no-truncate'
8. Expected outcome: Generates JQL like: project = SLQA AND issuetype = Bug AND priority = High AND assignee = currentUser() ORDER BY updated DESC. Shows query for confirmation, then executes jira issue list -q"..."

PASS only if every criterion is satisfied; otherwise FAIL.
