---
type: regex
pattern: jira\s+--agent\s+issue\s+transition\s+ABC-123\s+--to\s+["']?Resolved["']?\s+--resolution\s+["']?Done["']?
flags: i
target:
  source: file
  path: plan.sh
---
