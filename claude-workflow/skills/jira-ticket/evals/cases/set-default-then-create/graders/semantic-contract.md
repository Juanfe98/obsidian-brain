---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. config-updated: The config file is updated with project: SLQA under defaults Verification: config-after.yaml contains 'project: SLQA' under defaults
2. config-written-before-create: The config Write happens before the jira issue create Bash call in tool-calls.txt Verification: tool-calls.txt shows a Write to the config file appearing before a Bash call containing 'issue create'
3. create-uses-project: The create command includes -p SLQA Verification: mock-jira log line for 'issue create' contains '-p SLQA'
4. create-uses-bug-type: The create command specifies Bug type Verification: mock-jira log line for 'issue create' contains '-t Bug'
5. create-uses-no-input-raw: The create command includes --no-input and --raw flags Verification: mock-jira log line for 'issue create' contains '--no-input' and '--raw'
6. shows-draft-preview: The skill shows a preview of the issue before creating it Verification: output contains a preview/summary of the issue to be created
7. draft-bolds-defaults: In the draft preview, SLQA (from the just-set default) should be bold, while Bug (user-specified) should be regular weight Verification: output draft preview shows **SLQA** in bold and Bug without bold formatting
8. no-phantom-flags: The create command only includes flags for fields the user specified or that come from config defaults. No invented flags like -y (priority) unless the user asked for it or config sets it. Verification: mock-jira log line for 'issue create' does not contain -y or --priority (user said nothing about priority and config has no default priority)
9. Expected outcome: First updates the config file to set defaults.project to SLQA. Then creates an issue using -p SLQA (from the newly set default), -t Bug, and an appropriate summary. Shows a draft preview before executing the create. Create command must include --no-input and --raw flags.

PASS only if every criterion is satisfied; otherwise FAIL.
