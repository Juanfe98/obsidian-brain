---
type: regex
pattern: datadog\s+--agent\s+pipeline\s+delete\s+pipe-12345
flags: i
target:
  source: file
  path: plan.sh
---
