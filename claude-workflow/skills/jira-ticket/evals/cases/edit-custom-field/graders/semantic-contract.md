---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. uses-edit-not-create: Routes to issue edit, not issue create Verification: mock-jira log contains 'issue edit' and does NOT contain 'issue create'
2. correct-issue-key: Targets SLQA-100 Verification: mock-jira log line for 'issue edit' contains 'SLQA-100'
3. uses-custom-field: Maps points to --custom story-points=5 Verification: mock-jira log line for 'issue edit' contains '--custom' and 'story-points=5'
4. Expected outcome: Should route to jira issue edit (not create) with --custom story-points=5. Must map 'points' to the story-points custom field from config.

PASS only if every criterion is satisfied; otherwise FAIL.
