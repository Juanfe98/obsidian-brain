---
description: "Batch resolution workflow for fixing the same audit check failure across many tickets at once. Read this when a single check fails on 5+ tickets and a bulk fix is appropriate."
---

# Batch Resolution

When the same check fails across many tickets (5+), offer to fix them in bulk rather than cycling through one at a time. This is especially effective for mechanical fixes like missing labels, components, or epic links.

## When to offer batch mode

- Same check fails on 5+ tickets
- The fix is uniform or nearly uniform across all tickets (e.g., adding a label, setting a component)
- The fix doesn't require per-ticket context (unlike acceptance criteria, which must be unique to each ticket)

## Batch workflow

```
"Missing Components/Labels" fails on 14 tickets. I can batch-fix these:

Proposed action: Add component "wayfinder-be" to these tickets:
  VODOX-5764, VODOX-5408, VODOX-5414, VODOX-5411, VODOX-5394,
  VODOX-5770, VODOX-5575, VODOX-5745, VODOX-928, VODOX-3987,
  VODOX-4262, VODOX-1804, VODOX-1805, VODOX-4231

Would you like me to:
1. Apply to all 14
2. Let me review the list and remove some
3. Skip — I'll handle these individually
```

## Checks that work well in batch mode

- `components-labels` — apply a shared label or component
- `epic-link` — link a group of tickets to the same epic
- `missing-priority` — set priority for a batch of untriaged tickets
- `no-assignee` — assign a batch to the same person (if user specifies)

## Checks that should remain individual

- `missing-ac`, `missing-description`, `no-scope-boundaries` — these require per-ticket content
- `vague-title` — each title is unique

Always confirm the full list before writing. Show exactly what will change and on which tickets.
