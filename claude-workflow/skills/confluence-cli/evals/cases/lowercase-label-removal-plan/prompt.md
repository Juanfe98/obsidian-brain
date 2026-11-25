---
description: Plan removes a label using the server-stored lowercase name even though the label was originally added in mixed case
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Last week we tagged page 12345678 with the label "Needs-Review". Now that the review is done, we want that label removed. Write the exact command to run for this to a file named plan.sh. Don't execute it, just write the file.
