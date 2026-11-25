---
type: regex
pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
