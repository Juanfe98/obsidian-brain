---
description: Checks that the plan file transitions ABC-123 with 'issue transition ABC-123 --to Resolved --resolution Done'.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Write to plan.sh, without running it, the exact command to transition ticket ABC-123 to status 'Resolved' with resolution 'Done', using our agent-friendly Jira command-line tool.
