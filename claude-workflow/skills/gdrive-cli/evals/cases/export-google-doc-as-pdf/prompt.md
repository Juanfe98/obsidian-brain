---
description: Plan for saving a Google Doc as PDF uses file export with --mime-type application/pdf instead of a direct download.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I found a Google Doc called 'Design Doc' in my Drive and I want to save a local copy of it as a PDF file. Write the exact command to do this to a file called plan.sh, without running it yet.
