---
description: Routes a markdown plan that several teammates will review to an aix-proto doc app instead of the in-conversation Artifact tool.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I wrote a migration plan in markdown. This is the whole thing:

# Build cache migration plan
1. Move the build cache from the shared volume to object storage.
2. Run both caches side by side for one week.
3. Cut over and retire the shared volume.

It only has public, non-sensitive build numbers in it. Four teammates need to read it and leave comments on it this week. Where should I put it for them to review?
