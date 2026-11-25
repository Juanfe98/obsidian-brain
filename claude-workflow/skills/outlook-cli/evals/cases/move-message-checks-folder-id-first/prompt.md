---
description: Checks that the plan to move a message into the Archive folder first looks up the folder ID before calling mail move with the correct destination flag.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I want to move message msg-555 from my Outlook inbox into the 'Archive' folder. First figure out the Archive folder's ID, then move the message there. Write the exact commands you would run, in order, to a file named plan.sh - don't execute anything yet.
