---
description: Checks that the plan file uses the --agent flag, issue search subcommand with a quoted --jql containing the project key, and an explicit --limit.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Write to plan.sh, without running it, the exact command to find all open issues in project ABC assigned to me, limited to 10 results, using our agent-friendly Jira command-line tool.
