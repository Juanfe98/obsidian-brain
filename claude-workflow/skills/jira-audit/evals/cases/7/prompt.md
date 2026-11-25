---
description: 'The skill should NOT flag missing design/UI reference (check #10) since this is pure backend work. Should correctly identify this as N/A rather than a failure. The ticket should pass most or all applicable checks.'
tags: [validation, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Audit PLAT-612. It's a Task titled 'Add database index on users.email for login query performance' with a description explaining the slow query, which table and column to index, the expected improvement from 800ms to <50ms, and references the query in src/repositories/user-repository.ts line 47. Has AC, test plan, 2 story points, assigned. No UI involved at all.
