---
description: A ticket-mode audit showing a pass/fail table for all checks, followed by specific suggestions for each failing check (e.g., drafted acceptance criteria, test plan), with approval prompts before making any changes
tags: [train, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Can you take a look at FD-2847 and help me get it ready for development? It was flagged as incomplete in our last grooming session.
