---
type: regex
pattern: jira\s+--agent\s+issue\s+search\s+--jql\s+["'][^"']*ABC[^"']*["']
flags: i
target:
  source: file
  path: plan.sh
---
