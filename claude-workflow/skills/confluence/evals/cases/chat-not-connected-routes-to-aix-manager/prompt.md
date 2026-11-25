---
description: Checks that for a not-connected error in chat, the agent routes the user to Home in AIX Manager and a new Cowork session rather than a terminal command.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm chatting with you right here (no terminal open) and I tried to search our wiki, but the tool told me Confluence isn't connected for my account. What should I do to fix this?
