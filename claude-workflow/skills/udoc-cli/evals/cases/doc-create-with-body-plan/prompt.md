---
description: Checks the agent creates a doc with one doc create --title --body call in plan.sh and does not follow it with doc update.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I want to create a new Google Doc titled "Meeting Notes" that starts with the body text "Agenda: budget review". Write the exact commands, one per line, to a file named plan.sh that would accomplish this using the document CLI. Don't run them — just write the file.
