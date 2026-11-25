---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. config-has-type-default: Config is updated with type: Story under defaults Verification: config-after.yaml contains 'type:' with value 'Story' or the config was written with type before it was overridden by the create
2. config-has-project-default: Config is updated with project: SLQA under defaults Verification: config-after.yaml contains 'project: SLQA' under defaults
3. create-uses-bug-not-story: Create uses -t Bug (user override), not -t Story (the default) Verification: mock-jira log line for 'issue create' contains '-t Bug'
4. draft-project-bold: In the draft preview, SLQA is shown in bold (comes from default) Verification: output contains **SLQA** (bold markdown) in the draft preview
5. draft-type-not-bold: In the draft preview, Bug is NOT in bold (user-specified override) Verification: output shows Bug without ** bold markers in the draft preview
6. draft-priority-not-bold: In the draft preview, High priority is NOT in bold (user-specified, no default) Verification: output shows High without ** bold markers in the draft preview
7. overridden-default-not-shown: The overridden Story default does not appear in the draft preview Verification: output draft preview does not mention Story
8. Expected outcome: Three-step: set type default to Story, set project default to SLQA, then create. In the draft preview, project SLQA should be bold (from default), type Bug should be regular (user override — replaces Story default), priority High should be regular (user-specified, no default). The overridden default (Story) should not appear.

PASS only if every criterion is satisfied; otherwise FAIL.
