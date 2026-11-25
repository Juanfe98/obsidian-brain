---
type: regex
pattern: (?:^|\n)[^\n#]*slide\s+get(?:[\s\S]*\n)?[^\n#]*slide\s+batch-update(?:[^\n#]|\\\n)*--(?:file|requests)
flags: is
target:
  source: file
  path: plan.sh
---
