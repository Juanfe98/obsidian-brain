---
type: regex
pattern: mail\s+send\b
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
