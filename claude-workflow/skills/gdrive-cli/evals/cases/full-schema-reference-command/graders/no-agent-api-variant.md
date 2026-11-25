---
type: regex
pattern: --agent\s+api
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
