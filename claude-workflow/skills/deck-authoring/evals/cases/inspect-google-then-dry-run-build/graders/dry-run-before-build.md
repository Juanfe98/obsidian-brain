---
type: regex
pattern: ^(?:(?:(?!build-google)[^\n#])*(?:#[^\n]*)?\n)*(?:(?!build-google)[^\n#])*build-google(?:(?!build-google|(?<![<>])&(?!>)|;|\|)[^\n#]|\\\n)*--dry-run(?:[\s\S]*\n)?[^\n#]*build-google(?!(?:(?!build-google|(?<![<>])&(?!>)|;|\|)[^\n#]|\\\n)*--dry-run)
flags: is
target:
  source: file
  path: plan.sh
---
