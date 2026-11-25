---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should apply only Spike-applicable checks (Description, Story Points, Vague Title, Scope Boundaries, Components/Labels, Priority, Duplicates). Should NOT flag missing AC, test plan, technical context, error handling, edge cases, or affected files — these don't apply to Spikes. Should pass Description, Story Points, Priority, and Vague Title. May flag Scope Boundaries (no explicit 'done' criteria for the investigation) and Components/Labels (has label but no component).

PASS only if every criterion is satisfied; otherwise FAIL.
