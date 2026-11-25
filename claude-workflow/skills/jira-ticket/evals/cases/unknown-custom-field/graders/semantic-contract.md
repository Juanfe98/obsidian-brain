---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. does-not-guess-field-key: Does not invent a customfield_NNNNN key for 'team' Verification: mock-jira log does not contain 'customfield_' for any field other than story-points (customfield_10047)
2. acknowledges-unknown-field: Mentions that 'team' is not a known/mapped custom field Verification: output mentions that team is not mapped, not recognized, or asks how to handle it
3. Expected outcome: The 'team' field is not in config custom_fields. Skill should either ask the user how to map it, or note that it can't map 'team' and proceed without it. Should NOT guess a custom field key.

PASS only if every criterion is satisfied; otherwise FAIL.
