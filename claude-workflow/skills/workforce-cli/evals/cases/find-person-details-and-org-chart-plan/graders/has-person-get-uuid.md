---
type: regex
pattern: workforce\s+--agent\s+person\s+get\s+--uuid\s+\S+
flags: i
target:
  source: file
  path: plan.sh
---
