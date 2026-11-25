---
type: regex
pattern: search\s+--query|page\s+search\s+--cql
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
