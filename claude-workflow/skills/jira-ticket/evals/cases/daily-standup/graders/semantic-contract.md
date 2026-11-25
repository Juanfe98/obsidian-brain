---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. queries-in-progress: Runs an issue search for the user's in-progress work Verification: mock-jira log contains an 'issue search' whose --jql references 'In Progress' and 'currentUser'
2. queries-completed-last-day: Runs an issue search for work completed in the last day Verification: mock-jira log contains an 'issue search' whose --jql references 'status changed to' and 'after -1d'
3. queries-blocked-at-risk: Runs an issue search for blocked or at-risk work Verification: mock-jira log contains an 'issue search' whose --jql references 'Blocked' or the 'at-risk' label
4. reads-are-bounded: Every standup search is token-bounded with --limit and selects --fields Verification: each 'issue search' log line for the standup contains '--limit' and '--fields'
5. resolves-current-user: Defaults to the current user (no explicit assignee given) Verification: the standup --jql uses 'currentUser()' rather than a hardcoded username
6. groups-output-in-three-buckets: Presents the summary grouped into In progress / Completed / Blocked or at risk Verification: output groups results under in-progress, completed, and blocked/at-risk headings
7. Expected outcome: Runs three bounded jira --agent issue search reads for the current user — in progress, completed in the last day, and blocked/at-risk — then synthesizes a standup summary grouped into those three buckets. Does not fabricate issues; each read carries a --limit and --fields.

PASS only if every criterion is satisfied; otherwise FAIL.
