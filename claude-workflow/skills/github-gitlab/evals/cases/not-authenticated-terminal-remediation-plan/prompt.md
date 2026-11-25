---
description: Checks that the agent writes both terminal remediation paths, native gh login with --hostname and a pat-manager set command, when a host reports not authenticated.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Calling the gateway against our BAMTech GitHub Enterprise host just returned 'not authenticated for github-bamtech'. We're working in this terminal-enabled coding session, so write into plan.sh the exact commands I could run to fix this — both the native gh login option and the pat-manager token option, plus a way to verify status. Don't run anything yet, just write the plan.
