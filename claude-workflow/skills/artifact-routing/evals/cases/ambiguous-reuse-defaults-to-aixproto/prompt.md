---
description: When it is unclear whether the audience will revisit the content later, defaults the routing decision to aix-proto rather than the built-in artifact tool.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I made a quick design mock for a new checkout flow and want to share it with a coworker for feedback. I'm honestly not sure if she'll just glance at it once in our chat or want to keep coming back to it over the next few weeks. Where should this go?
