---
type: regex
pattern: --label\s+"?Needs-Review"?
match: not_contains
target:
  source: file
  path: plan.sh
---
