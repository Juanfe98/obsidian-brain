---
type: regex
pattern: ^(?:(?:(?!build-google)[^\n#])*(?:#[^\n]*)?\n)*(?:(?!build-google)[^\n#])*inspect-google(?:[\s\S]*\n)?[^\n#]*build-google
flags: is
target:
  source: file
  path: plan.sh
---
