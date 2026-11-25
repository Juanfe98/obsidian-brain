---
type: regex
pattern: workforce\s+--agent\s+search\s+query\s+--query\s+["']?Ad Decisioning["']?
flags: i
target:
  source: file
  path: plan.sh
---
