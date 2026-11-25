---
description: Checks that a plan to add a conditional format rule falls back to sheet batch-update with addConditionalFormatRule.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

In the Google Sheet 1AbCdEfGhIjK, color the cells in C2:C50 of the first tab red when their value is below 0. Write the exact commands that you would run. If a command needs a JSON request body, put that JSON inside plan.sh. Save the commands to a file called plan.sh, one per line, without running anything.
