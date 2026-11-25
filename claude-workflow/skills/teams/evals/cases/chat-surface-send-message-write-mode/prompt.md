---
description: Checks that from Claude Desktop chat the agent routes sending a Teams reply through AIX Manager write-mode instead of a terminal auth command.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm working in Claude Desktop chat, no terminal access here. I want to actually send a reply to the last message in my Microsoft Teams chat with a coworker, not just draft it. Writes seem to be disabled right now. Walk me through exactly what I need to do to get this reply sent.
