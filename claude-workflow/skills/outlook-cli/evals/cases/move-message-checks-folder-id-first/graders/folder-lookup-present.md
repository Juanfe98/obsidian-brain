---
type: regex
pattern: outlook\s+--agent\s+folder\s+(search|list)\b
flags: i
target:
  source: file
  path: plan.sh
---
