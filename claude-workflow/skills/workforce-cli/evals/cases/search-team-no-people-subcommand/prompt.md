---
description: Plan for finding everyone on a named team uses search query rather than a nonexistent people subcommand
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Please write to plan.sh the exact command to look up everyone on the team called 'Ad Decisioning'. Do not run it, just write the command to plan.sh.
