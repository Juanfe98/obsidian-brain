---
type: regex
pattern: (?:^|\n)[^\n#]*sheet\s+describe(?:[\s\S]*\n)?[^\n#]*sheet\s+read-range
flags: is
target:
  source: file
  path: plan.sh
---
