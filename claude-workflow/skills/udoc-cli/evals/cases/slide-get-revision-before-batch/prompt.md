---
description: Checks that a plan to refresh linked charts in a deck reads the deck revision with slide get before a guarded slide batch-update.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

The Google Slides deck 1AbCdEfGhIjK has charts linked to a Google Sheet, and the Sheet data changed. Write the exact commands, in order, that refresh those linked charts in the deck. If a command needs a JSON request body, write that JSON into a file from inside plan.sh (for example with a heredoc). Save the commands to a file called plan.sh, one per line, without running anything.
