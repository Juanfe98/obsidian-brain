---
description: Checks that the agent's remediation plan for a 'not connected' AIX tool runs aix setup rather than guessing a fix
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

When I run the jira CLI here it just prints 'not connected' and nothing else. I don't want to poke around blindly. Write the exact commands I should run, in order, to a file named plan.sh (one command per line, don't execute anything) to diagnose and fix this connection issue.
