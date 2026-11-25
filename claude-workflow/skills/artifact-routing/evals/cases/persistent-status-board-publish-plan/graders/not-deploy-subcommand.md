---
type: regex
pattern: aix-proto\s+deploy
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
