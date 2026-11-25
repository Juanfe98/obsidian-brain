---
description: 'The skill should recognize this is ambiguous — it''s not clearly a project audit, sprint audit, or single ticket audit. Could mean: audit FD-2847 itself, audit FD-2847 and its sub-tasks, or audit linked/blocking tickets. Should ask for clarification on the intended scope before proceeding.'
tags: [train, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Can you check if the tickets related to FD-2847 are ready?
