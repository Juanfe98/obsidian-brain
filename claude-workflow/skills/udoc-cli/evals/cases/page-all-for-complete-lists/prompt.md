---
description: Checks that a plan to list every file in a folder walks all pages with --page-all.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

List every file in the Google Drive folder 1AbCdEfGhIjK, including all of its pages of results, so the list is complete. Write the exact command that you would run. Save it to a file called plan.sh, without running anything.
