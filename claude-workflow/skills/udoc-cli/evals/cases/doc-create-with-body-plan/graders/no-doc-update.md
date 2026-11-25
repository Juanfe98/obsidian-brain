---
type: regex
pattern: doc\s+update
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
