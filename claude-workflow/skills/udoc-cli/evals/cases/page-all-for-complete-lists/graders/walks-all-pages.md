---
type: regex
pattern: ^(?=[^\n#]*--page-all)(?=[^\n#]*(?:folder\s+list|search\s+documents[^\n#]*--in-folder))
flags: im
target:
  source: file
  path: plan.sh
---
