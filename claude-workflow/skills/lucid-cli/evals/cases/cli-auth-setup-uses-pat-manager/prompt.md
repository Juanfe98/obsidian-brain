---
description: The authentication setup plan uses pat-manager login for the Lucid CLI rather than a generic invented login command
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Before I start creating diagrams with the Lucid command-line tool, how do I set up authentication? Write the exact setup command(s) you would run to a file named plan.sh, without running them.
