---
description: Checks the agent uses typed search documents filters like --name-contains and --modified-after instead of a raw query string in plan.sh.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I need to find all our Google Docs whose title contains "roadmap" and that were modified on or after January 1, 2026. Write the exact command to a file named plan.sh that performs this search using the document CLI's structured filters (not a hand-written raw query string). Don't run it — just write the file.
