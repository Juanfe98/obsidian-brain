---
description: Checks that the agent writes the automatic pat-manager login confluence command (not the Data Center --dc variant) to plan.sh for terminal Cloud authentication.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I just set up a new laptop and need to authenticate the terminal-based Confluence CLI against our default Cloud site so I can start running searches from Claude Code. Write the exact command you'd run to a file called plan.sh - don't run it, I just want to review it first.
