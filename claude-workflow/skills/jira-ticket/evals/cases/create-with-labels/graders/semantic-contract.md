---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. create-executed: Runs jira issue create Verification: mock-jira log contains 'issue create'
2. has-both-labels: Both labels appear as separate -l flags Verification: tool-calls.txt Bash command for issue create contains '-l backend' and '-l security' (or '-l' appearing twice)
3. labels-are-repeatable: Labels use separate -l flags, not comma-separated in one flag Verification: tool-calls.txt Bash command for issue create does NOT contain '-l backend,security' or '-l "backend security"'
4. has-custom-field: Maps 3 points to --custom story-points=3 Verification: mock-jira log line for 'issue create' contains '--custom' and 'story-points=3'
5. Expected outcome: Should use -l backend -l security (repeatable flag, one per label). Also maps points to --custom story-points=3.

PASS only if every criterion is satisfied; otherwise FAIL.
