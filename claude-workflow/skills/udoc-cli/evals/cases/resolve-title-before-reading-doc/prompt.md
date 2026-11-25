---
description: Checks that a plan to read a doc known only by title resolves it to a URI before reading it, rather than guessing a search command.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Find the document titled "Q3 Planning" and get its content. I only know the title, not any ID or URL. Write the exact commands, in order, that you would run to go from that title to the document's content. Save them to a file called plan.sh, one per line, without running anything.
