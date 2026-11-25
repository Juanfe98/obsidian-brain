---
description: Checks that a plan to delete a log pipeline includes the required --allow-writes flag since the CLI is read-only by default.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

We need to remove an old log processing pipeline with ID pipe-12345 in Datadog. Write to plan.sh the exact CLI command that would delete this pipeline (do not run it).
