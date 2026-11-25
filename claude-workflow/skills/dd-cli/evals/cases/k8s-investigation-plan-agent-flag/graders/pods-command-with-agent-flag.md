---
type: regex
pattern: datadog\s+--agent\s+k8s\s+pods\s+--cluster\s+checkout-prod
flags: i
target:
  source: file
  path: plan.sh
---
