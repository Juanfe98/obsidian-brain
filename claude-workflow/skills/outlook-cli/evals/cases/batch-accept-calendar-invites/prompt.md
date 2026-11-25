---
description: Checks the agent writes a single calendar respond command with comma-separated event IDs rather than one command per invite.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I have three pending calendar invites with event IDs evt-101, evt-102, and evt-103, and I want to accept all of them. Write the exact command you'd run to a file named plan.sh, without executing anything now.
