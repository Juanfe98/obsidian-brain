---
description: Checks that the agent writes the exact confluence CLI --agent search query/--cql and page get commands to plan.sh for a terminal search-then-read task.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm in my Claude Code terminal and need to check Confluence for any pages in the ENG space that were modified in the last week, then open the most relevant one to read its full content. Please write the exact command-line commands you would run for this to a file named plan.sh - don't execute anything, just write the commands so I can review them first.
