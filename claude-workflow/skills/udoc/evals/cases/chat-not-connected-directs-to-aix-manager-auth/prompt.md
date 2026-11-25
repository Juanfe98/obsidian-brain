---
description: Checks that a not-connected udoc report in chat is answered by directing the user to Home in AIX Manager and a new Cowork session, never a terminal auth command.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm using you in Claude Desktop chat. When I asked you to read my Google Doc just now, the tool result said my Google account is not connected. What should I do to fix this?
