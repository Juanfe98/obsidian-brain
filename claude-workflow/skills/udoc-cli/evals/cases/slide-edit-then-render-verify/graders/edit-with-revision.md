---
type: regex
pattern: (?:^|\n)[^\n#]*slide\s+edit(?:[^\n#]|\\\n)*--revision(?:=|[ \t]+)[^\s#]
flags: is
target:
  source: file
  path: plan.sh
---
