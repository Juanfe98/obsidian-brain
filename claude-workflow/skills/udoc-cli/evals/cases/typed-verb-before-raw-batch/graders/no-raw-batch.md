---
type: regex
pattern: sheet\s+batch-update
flags: is
match: not_contains
target:
  source: file
  path: plan.sh
---
