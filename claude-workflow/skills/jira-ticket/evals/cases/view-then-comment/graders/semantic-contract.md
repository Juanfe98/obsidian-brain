---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. view-executed: Runs jira issue get (or its alias issue view) to check the issue Verification: mock-jira log contains 'issue get' or 'issue view'
2. comment-executed: Runs jira comment add Verification: mock-jira log contains 'comment add'
3. view-before-comment: View happens before comment in the mock log Verification: mock-jira log shows 'issue get' or 'issue view' before 'comment add'
4. comment-on-correct-issue: Comment targets SLQA-100 Verification: mock-jira log line for 'comment add' contains 'SLQA-100'
5. comment-has-body: Comment includes a --body flag with text about starting work Verification: tool-calls.txt Bash command for 'comment add' contains '--body'
6. Expected outcome: Two-step: view the issue first, then add a comment. The comment text should reflect what the user said, using Jira markup if applicable.

PASS only if every criterion is satisfied; otherwise FAIL.
