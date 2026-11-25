---
type: regex
pattern: workforce\s+--agent\s+people\b
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
