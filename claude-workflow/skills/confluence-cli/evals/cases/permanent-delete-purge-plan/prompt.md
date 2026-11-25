---
description: Plan includes the --purge flag needed for an irreversible delete instead of a plain delete that only trashes the page
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

There's an old deprecated page with content ID 456789 that I want gone for good -- not just moved to the trash, since I plan to recreate a page with the exact same title right after and a trashed page would block that. Write the exact command you'd run to permanently remove it to a file named plan.sh. Don't run it, just write the file.
