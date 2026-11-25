---
type: regex
pattern: gh\s+auth\s+login\s+--hostname\s+github\.bamtech\.co
flags: i
target:
  source: file
  path: plan.sh
---
