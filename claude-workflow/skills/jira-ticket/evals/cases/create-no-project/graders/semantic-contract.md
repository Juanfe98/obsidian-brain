---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. reads-config: The skill reads the config file before doing anything Verification: tool-calls.txt contains a Read of ~/.config/jira-ticket/jira-ticket.yaml
2. asks-for-project: The skill asks the user for a project rather than guessing or omitting it Verification: output contains a question asking which project to use
3. no-jira-create-executed: No jira issue create command is executed without a project Verification: mock-jira log does not contain 'issue create'
4. Expected outcome: Skill should notice no default project is configured and no project was specified. It must ask the user which project to use before building the create command. Should NOT proceed to execute jira issue create without a project.

PASS only if every criterion is satisfied; otherwise FAIL.
