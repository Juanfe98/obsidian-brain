---
description: Checks that the plan raises --limit to get more rows in one call rather than using --offset to page through the by-metric report.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Using weaponx, the by-metric report for metric 33333333-3333-3333-3333-333333333333 only showed 25 rows and we need up to 200 rows returned in a single call, not paged through in batches of 25. Write the exact command to a file named plan.sh (don't run it) to get all 200 rows at once.
