---
description: Checks that a create-issue plan uses Markdown heading syntax for the description on Cloud rather than legacy Jira wiki markup.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

We're on Atlassian Cloud. Write to plan.sh, without running it, the exact command to create a new Story in project ABC titled 'Improve checkout speed' whose description has a level-2 heading called 'Goal' followed by two bullet points. Use our agent-friendly Jira command-line tool.
