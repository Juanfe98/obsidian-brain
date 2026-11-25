---
type: regex
pattern: datadog\s+--agent\s+k8s\s+workload-health\s+--cluster\s+checkout-prod\s+--namespace\s+billing
flags: i
target:
  source: file
  path: plan.sh
---
