---
description: Checks that drafting a Teams reply in chat explains write-mode must be enabled in AIX Manager before it can actually be sent.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

In this Claude Desktop chat session I'd like to reply to the last message in my Teams chat with a coworker. Please draft the reply text now, and tell me exactly what I need to do to actually get it sent to Teams.
