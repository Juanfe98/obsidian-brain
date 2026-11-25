---
type: regex
pattern: outlook\s+--agent\s+mail\s+draft\b[^\n]*--html
flags: i
target:
  source: file
  path: plan.sh
---
