---
description: Checks that the written plan uses the exact flag get then flag audit-log subcommands with --agent for a compliance audit of a feature flag.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

We use weaponx to manage feature flags. Before flipping feature flag 11111111-1111-1111-1111-111111111111 in production, I need a compliance record of its current config and its change history. Write the exact CLI commands you'd run, in order, to a file named plan.sh without running them. Don't invent any other flag IDs.
