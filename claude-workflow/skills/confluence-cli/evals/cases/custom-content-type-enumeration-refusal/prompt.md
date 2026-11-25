---
description: Response explains no endpoint lists custom-content type keys and points to reading the type field from an existing item instead of inventing a listing command
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

We store software license records as a custom content type inside the DEV space, but nobody remembers the exact type key string anymore. Can you give me the command that lists all the custom content types available in that space so we can find it?
