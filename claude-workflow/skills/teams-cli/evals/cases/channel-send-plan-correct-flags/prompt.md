---
description: Checks that the written plan uses --team-id, --channel-id, --content and --subject on channel send rather than the common --channel mistake.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

We need to post a status update to the 'Releases' channel in our 'Growth Life Orchestrator' team, but don't send anything yet -- just prepare it. Write the exact command line to plan.sh that would post a message with the content 'Deployment finished successfully' and the subject 'Weekly Update' to team ID T-100 and channel ID C-200, using the CLI's structured agent-friendly output. Do not execute it, just save the command to the file.
