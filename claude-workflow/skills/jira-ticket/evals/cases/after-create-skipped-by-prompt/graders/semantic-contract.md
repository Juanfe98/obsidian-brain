---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. reads-config: Reads the staged jira-ticket config before building the command Verification: trajectory shows a read of the staged configs/jira-ticket-after-create.yaml
2. create-executed: Runs jira issue create Verification: mock-jira log contains 'issue create'
3. no-transition: Does NOT run any transition — the prompt's "don't move it" overrides the configured after_create step Verification: mock-jira log contains no 'issue transition' line
4. names-the-skipped-step: States that the configured move to In Progress was skipped, rather than silently omitting it. Judge the claim, not the substring: "left in its initial status, not moved to In Progress as your config would" SATISFIES this; a response that never mentions the configured step FAILS Verification: output says the configured post-create move was not performed
5. does-not-claim-the-move: Does not ASSERT the issue reached In Progress Verification: no sentence states or implies the transition succeeded
6. config-not-rewritten: Does not edit or rewrite the staged config — a one-off prompt override is not a settings change Verification: trajectory shows no write or edit of configs/jira-ticket-after-create.yaml, and no settings update that drops after_create
7. reports-url: Reports the created issue link Verification: output contains 'MOCK-123' and a browse URL
8. Expected outcome: A one-off "don't move it" overrides after_create.transition_to for this create only — the issue is created, no transition runs, the skipped move is named, and the config is left untouched.

PASS only if every criterion is satisfied; otherwise FAIL.
