---
type: regex
pattern: --eq\s+["']?Status=Active["']?
flags: i
target:
  source: file
  path: plan.sh
---
