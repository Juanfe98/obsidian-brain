---
type: regex
pattern: (?:^|\n)[^\n#]*sheet\s+read-range(?:[^\n#]|\\\n)*--range(?:=|[ \t]+)[^\n#]*?[A-Z]*\d+:[A-Z]*\d+
flags: is
target:
  source: file
  path: plan.sh
---
