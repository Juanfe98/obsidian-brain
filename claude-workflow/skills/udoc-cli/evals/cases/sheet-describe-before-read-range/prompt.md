---
description: Checks that a plan to read from an unfamiliar spreadsheet describes it first and then reads a bounded range.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I need the first rows of data from the Google Sheet 1AbCdEfGhIjK, but I do not know its tabs or layout. Write the exact commands, in order, that you would run. Save them to a file called plan.sh, one per line, without running anything.
