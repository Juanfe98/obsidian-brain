---
description: 'The skill should flag check #22 (Bug: Missing Reproduction Details) as High severity — missing steps to reproduce, no explicit expected vs actual behavior section, incomplete environment info. Should also flag missing AC. Should ask specific questions: exact Safari version, OS, steps to trigger, what error appears in console. Should NOT attempt to draft reproduction steps without asking since the description is too vague to infer a reliable sequence.'
tags: [train, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Audit FD-3300. It's a Bug titled 'Login fails silently on Safari 17 when cookies are blocked' with a description: 'Users on Safari 17 with third-party cookies disabled see a blank screen after clicking Login. No error is shown.' No steps to reproduce, no expected/actual behavior section, no environment details beyond 'Safari 17', no acceptance criteria. Priority P2, assigned, has labels.
