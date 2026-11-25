---
type: regex
pattern: (?:^|\n)[^\n#]*(?:requiredRevisionId|slide\s+batch-update(?:[^\n#]|\\\n)*--revision(?:=|[ \t]+)[^\s#])
flags: is
target:
  source: file
  path: plan.sh
---
