---
description: Checks that a plan to set a single cell uses sheet write-range instead of the raw sheet batch-update passthrough.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

In the Google Sheet 1AbCdEfGhIjK, set cell B2 on the tab "Budget" to 42. Write the exact command that you would run. Save it to a file called plan.sh, without running anything.
