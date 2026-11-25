---
description: 'Report should include a readiness score (around 70-75%), a ''Ready for Implementation'' section listing the 4 passing tickets with their types and points (total: 11 pts available), and a compact ''Tickets with Issues'' section showing the first 3 problem tickets in detail with ''+5 more'' for the rest. The report should NOT list all 8 failing tickets in full tables for each check — should use the compact format (3 shown + keys for the rest).'
tags: [train, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Run a sprint audit for PLAT Sprint 22. It has 12 tickets: 4 pass all checks completely (PLAT-400 Bug 2pts, PLAT-405 Task 3pts, PLAT-410 Story 5pts, PLAT-412 Task 1pt), and 8 have issues — 5 are missing story points, 3 are missing acceptance criteria, 2 are missing test plans, and 6 are missing components. All tickets have descriptions and are assigned.
