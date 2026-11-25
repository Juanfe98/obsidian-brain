---
type: regex
pattern: --channel\s+C-200
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
