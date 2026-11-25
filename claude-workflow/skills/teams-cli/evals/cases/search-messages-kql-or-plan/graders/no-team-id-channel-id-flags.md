---
type: regex
pattern: --team-id|--channel-id
flags: i
match: not_contains
target:
  source: file
  path: plan.sh
---
