---
type: regex
pattern: mail\s+move\b[^\n]*--destination-id\b
flags: i
target:
  source: file
  path: plan.sh
---
