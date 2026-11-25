---
description: Checks that the agent explains workspaces cannot be enumerated via the API and points to finding the wsp id in the browser address bar instead of fabricating a working list command.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Can you give me the exact Airtable CLI command to list all the workspaces in my account so I can grab their ids?
