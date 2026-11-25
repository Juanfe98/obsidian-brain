---
type: regex
pattern: --agent\s+schema
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
