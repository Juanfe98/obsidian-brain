---
description: Plan for a multi-stage pipeline diagram uses the offline topology-to-layout command and lints before creating, instead of hand-placing coordinates
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I want to diagram a data pipeline with 12 processing stages and the dependency edges between them for a Lucidchart board. Rather than hand-placing coordinates for that many shapes, write the exact sequence of CLI commands you would run to turn a topology spec into a laid-out diagram, lint the geometry, and then create the document. Write these commands, in order, to a file named plan.sh. Do not run them.
