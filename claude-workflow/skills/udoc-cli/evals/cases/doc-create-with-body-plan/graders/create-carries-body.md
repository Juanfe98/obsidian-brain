---
type: regex
pattern: doc\s+create(?=(?:"(?:[^"\\\n]|\\[^\n])*"|'[^'\n]*'|\\\n|\\[^\n]|[^\n;&|#"'\\])*?--title(?:\s+|=)['"]?Meeting Notes)(?=(?:"(?:[^"\\\n]|\\[^\n])*"|'[^'\n]*'|\\\n|\\[^\n]|[^\n;&|#"'\\])*?--body(?:\s+|=)['"]?Agenda)
flags: i
target:
  source: file
  path: plan.sh
---
