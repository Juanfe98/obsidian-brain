---
description: "Trend tracking workflow for saving audit results over time and presenting deltas. Read this when the user asks about audit trends, wants to compare audits, or when trends.enabled is true in config."
---

# Trend Tracking

After each audit, append a summary to `.jira-audit-history.json` so teams can track improvement over time. This is opt-in — only write history if `trends.enabled` is true in `.jira-audit.yaml`, the history file already exists, or the user asks for trend tracking.

## History format

```json
{
  "audits": [
    {
      "date": "2026-05-05T14:30:00Z",
      "mode": "project",
      "scope": "VODOX (vodox-be)",
      "tickets_audited": 26,
      "readiness_score": 52,
      "issues_by_severity": {"critical": 8, "high": 38, "medium": 56, "low": 10},
      "ready_count": 4,
      "ready_points": 6,
      "top_failing_checks": ["missing-ac", "no-estimate", "no-test-plan"]
    },
    {
      "date": "2026-05-12T10:00:00Z",
      "mode": "project",
      "scope": "VODOX (vodox-be)",
      "tickets_audited": 26,
      "readiness_score": 68,
      "issues_by_severity": {"critical": 3, "high": 22, "medium": 48, "low": 8},
      "ready_count": 9,
      "ready_points": 18,
      "top_failing_checks": ["no-test-plan", "no-estimate", "components-labels"]
    }
  ]
}
```

## Presenting trends

When history exists, include a delta in the report header:

```
**Readiness: 68%** (↑16% from last audit on 2026-05-05)
**Ready for dev**: 9 tickets · 18 pts (↑5 tickets, ↑12 pts)
```

Compare against the most recent previous audit with the same scope. If the scope changed (different label filter, different project), note that the comparison may not be apples-to-apples.

## Enabling

If the user asks to track trends, create `.jira-audit-history.json` with an empty `audits` array. Subsequent audits will append automatically.

Alternatively, set `trends.enabled: true` in `.jira-audit.yaml` to always track.
