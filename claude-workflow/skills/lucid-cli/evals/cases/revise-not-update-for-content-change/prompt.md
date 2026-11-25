---
description: Adding a shape to an existing document's content routes to document revise rather than document update, which cannot write content
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

There's an existing Lucid document with ID 12345 that I created a few weeks ago. I need to add a new shape to its content. Write the exact command you would run to make that change, to a file named plan.sh, without running it, and briefly explain why that's the right command instead of just updating the document.
