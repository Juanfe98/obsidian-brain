---
description: Checks that a request for the full command and flag reference is routed to `teams agent schema` instead of an invented list.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm in a Claude Code terminal with a Teams CLI available. Before I run anything, I want the complete list of every command and flag the CLI supports, especially for pulling a meeting transcript. Where should I look to get the authoritative full reference instead of you just listing what you remember?
