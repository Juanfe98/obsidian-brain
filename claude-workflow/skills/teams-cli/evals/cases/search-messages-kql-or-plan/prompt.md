---
description: Checks that the written plan uses search messages with --query, uppercase OR to combine terms, and --team/--channel (not --team-id/--channel-id).
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Before running anything, write to plan.sh the exact command to search Teams messages for anything about a deployment or an outage, scoped to the team 'Growth Life Orchestrator' and channel 'releases'. Combine 'deployment' and 'outage' as alternatives in a single search instead of running two separate searches. Save the command to the file without executing it.
