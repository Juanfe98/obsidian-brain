---
type: regex
pattern: datadog\s+--agent\s+k8s\s+metrics\s+--query\s+"?avg:kubernetes\.cpu\.usage\{cluster:prod\}"?
flags: i
target:
  source: file
  path: plan.sh
---
