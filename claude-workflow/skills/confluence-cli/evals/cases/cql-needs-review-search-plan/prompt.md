---
description: Plan uses the exact `search query --cql` subcommand with a labeled CQL filter and a --limit flag rather than a nonexistent search flag form
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I want to find every page in the DEV space that's tagged with the label "needs-review" so we can go through them later, capped at 10 results. Write the exact CLI command you would run for this to a file named plan.sh. Do not execute anything, just write the file.
