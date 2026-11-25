---
description: 'The skill should exclude the 2 Done tickets and only audit the 16 non-completed tickets. Should use the label/filter mode JQL with status exclusion (AND status NOT IN (''Done'', ''Closed'', ''Resolved'')). Should NOT include the Done tickets in the report, readiness score calculation, or issue counts. The report header should say ''Tickets audited: 16'' not ''18''.'
tags: [heldout, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Audit the PLAT project backlog filtered by the 'payments' label. There are 18 tickets total: 12 are Open/To Do, 4 are In Progress, and 2 are Done. All have the 'payments' label.
