---
type: regex
pattern: workforce\s+--agent\s+org\s+chart\s+--person-id\s+\S+
flags: i
target:
  source: file
  path: plan.sh
---
