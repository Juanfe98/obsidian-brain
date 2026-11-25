---
description: Writes the exact aix-proto publish command with the correct slug to plan.sh for a persistent, linkable internal status board.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Write to plan.sh, without running it, the exact command I should use to publish an internal team status board that tracks our service's build health metrics. Only public, non-sensitive build numbers are shown. It needs to stay up over time and be linkable so other teams can bookmark the URL. Use the slug build-health.
