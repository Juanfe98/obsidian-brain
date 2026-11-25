---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. Expected outcome: The skill should flag check #22 (Bug: Missing Reproduction Details) as High severity — missing steps to reproduce, no explicit expected vs actual behavior section, incomplete environment info. Should also flag missing AC. Should ask specific questions: exact Safari version, OS, steps to trigger, what error appears in console. Should NOT attempt to draft reproduction steps without asking since the description is too vague to infer a reliable sequence.

PASS only if every criterion is satisfied; otherwise FAIL.
