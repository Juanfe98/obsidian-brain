---
type: regex
pattern: --agent\s+channel\s+send[\s\S]*--team-id\s+T-100[\s\S]*--channel-id\s+C-200[\s\S]*--content[\s\S]*--subject
flags: i
target:
  source: file
  path: plan.sh
---
