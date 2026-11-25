---
type: regex
pattern: people\s+search
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
