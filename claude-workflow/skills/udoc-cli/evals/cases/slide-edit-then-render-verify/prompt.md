---
description: Checks that a plan to change text on a slide uses slide edit with a revision and then renders the slide to check it.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

In the Google Slides deck 1AbCdEfGhIjK, replace the text "Q2" with "Q3" and then check how slide 3 looks. Write the exact commands, in order, that you would run. Save them to a file called plan.sh, one per line, without running anything.
