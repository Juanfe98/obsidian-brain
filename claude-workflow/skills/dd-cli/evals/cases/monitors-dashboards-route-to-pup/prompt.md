---
description: Checks that the agent routes a monitors/dashboards request to pup instead of the gap-commands CLI, which does not cover them.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I need to check our active Datadog monitors and dashboards for my service to see which alerts are firing. What tool or command should I use for that?
