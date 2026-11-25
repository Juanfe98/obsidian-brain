---
type: regex
pattern: document\s+update\s+12345\s+--content
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
