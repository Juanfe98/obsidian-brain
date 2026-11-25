---
type: regex
pattern: --role\s+[a-z,]*guardrail
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
