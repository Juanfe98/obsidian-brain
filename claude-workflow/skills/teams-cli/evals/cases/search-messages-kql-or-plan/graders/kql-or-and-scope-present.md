---
type: regex
pattern: search\s+messages[\s\S]*--query[\s\S]*deployment\s+OR\s+outage[\s\S]*--team\s[\s\S]*--channel\s
target:
  source: file
  path: plan.sh
---
