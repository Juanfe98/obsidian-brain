---
type: regex
pattern: search\s+documents[^\n]*--name-contains\s+['"]?roadmap['"]?
flags: i
target:
  source: file
  path: plan.sh
---
