---
description: Plan uses search query, person get --uuid, and org chart --person-id in the correct three-step sequence
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm trying to locate a colleague named Jordan Lee, pull up their full profile details, and see where they sit in the org chart. Write the exact sequence of CLI commands to plan.sh, without running them, that would: 1) search for Jordan Lee, 2) fetch their full person details using the UUID returned by the search (use <uuid> as a placeholder), and 3) show the org chart centered on that person. Just write plan.sh, do not execute anything.
