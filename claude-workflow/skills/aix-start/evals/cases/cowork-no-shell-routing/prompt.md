---
description: Checks that a no-shell Claude Desktop chat / Cowork user asking to get started with AIX is routed to the dedicated no-shell skill rather than shell CLI instructions
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm chatting with Claude in the Desktop app, not a terminal or IDE — there's no shell here at all. I want to get started using Disney's AIX platform and its tools from this chat. How should I proceed?
