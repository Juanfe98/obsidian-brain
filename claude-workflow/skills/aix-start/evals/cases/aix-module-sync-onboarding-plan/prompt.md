---
description: Checks that the plan for first-time adoption of org/team AI standards in a repo starts with aix module sync
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Our repository has never adopted our org's or team's standard AI config through AIX modules. Write the exact commands, in the order you'd run them, to a file named plan.sh (don't execute anything) to get this repo onto our org and team standards for the first time.
