---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. reads-config: Reads the staged jira-ticket config before building the command Verification: trajectory shows a read of the staged configs/jira-ticket-after-create.yaml
2. preview-mentions-transition: The draft preview shown before executing says the new issue will be moved to In Progress Verification: output contains 'In Progress' in the pre-execution preview, not only after the create
3. create-executed: Runs jira issue create Verification: mock-jira log contains 'issue create'
4. transition-executed: Runs jira issue transition after the create Verification: mock-jira log contains 'issue transition'
5. correct-ordering: Create happens before the transition Verification: mock-jira log shows 'issue create' before 'issue transition'
6. uses-created-key: The transition targets MOCK-123 (the key returned by the mock create), not a made-up key Verification: mock-jira log line for 'issue transition' contains 'MOCK-123'
7. transitions-to-configured-status: The transition target is the configured status In Progress Verification: mock-jira log line for 'issue transition' contains 'In Progress'
8. reports-url: Reports the created issue link Verification: output contains 'MOCK-123' and a browse URL
9. Expected outcome: Config declares after_create.transition_to. The skill must create the issue, then transition the CREATED key to that status, and report the issue link.

PASS only if every criterion is satisfied; otherwise FAIL.
