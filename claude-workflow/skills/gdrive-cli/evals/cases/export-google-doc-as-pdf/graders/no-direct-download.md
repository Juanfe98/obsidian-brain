---
type: regex
pattern: file\s+download
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
