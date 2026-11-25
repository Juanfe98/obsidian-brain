---
description: "Session persistence workflow for resuming large audit sessions across conversations. Read this when the user asks to resume an audit or when a resolution workflow spans 10+ tickets."
---

# Session Persistence

Large audits (especially resolution workflows across 10+ tickets) may span multiple sessions. To support resuming:

**Saving state**: When the user pauses or ends a session mid-resolution, write the current audit state to `.jira-audit-state.json` in the working directory:

```json
{
  "session_id": "audit-2026-05-05T14:30:00Z",
  "mode": "sprint",
  "scope": "Sprint 47",
  "project_key": "FD",
  "started_at": "2026-05-05T14:30:00Z",
  "last_updated": "2026-05-05T15:45:00Z",
  "tickets_audited": 18,
  "tickets_resolved": 7,
  "readiness_score": 72,
  "remaining": [
    {"key": "FD-115", "issues": ["missing-ac", "no-test-plan"]},
    {"key": "FD-122", "issues": ["no-scope-boundaries"]}
  ],
  "resolved": [
    {"key": "FD-101", "issues_fixed": ["missing-ac", "no-estimate"]},
    {"key": "FD-103", "issues_fixed": ["vague-title"]}
  ]
}
```

**Resuming**: When the user asks to resume an audit (e.g., "continue the audit", "pick up where we left off"), look for `.jira-audit-state.json`. If found, load the state and continue with the next unresolved ticket:

> "Found a previous audit session for Sprint 47 (started 2026-05-05). You've resolved 7/18 tickets so far (readiness: 72%). Next up: FD-115 (Missing AC, No test plan). Continue?"

**Completing**: When all issues are resolved or the user explicitly finishes, delete the state file and present a final summary comparing the before/after readiness scores.
