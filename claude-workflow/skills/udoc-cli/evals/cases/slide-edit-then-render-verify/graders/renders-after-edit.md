---
type: regex
pattern: (?:^|\n)[^\n#]*slide\s+edit(?:[\s\S]*\n)?[^\n#]*slide\s+render(?:[^\n#]|\\\n)*--page(?:=|[ \t]+)3\b
flags: is
target:
  source: file
  path: plan.sh
---
