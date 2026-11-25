---
description: Checks that the plan uses the safe typed --eq flag for an equality filter instead of a hand-written formula string.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

We track work in Airtable. There's a base named "Product Roadmap" with a table called "Tasks". I need to see all Tasks records where the Status field equals "Active", using the CLI's safe typed filtering instead of a hand-written formula. Write the exact command you'd run to plan.sh — don't run it, just write it there.
