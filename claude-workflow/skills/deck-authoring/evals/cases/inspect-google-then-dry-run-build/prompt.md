---
description: Checks that a plan to build a native Google Slides deck inspects the template, previews with build-google --dry-run, then builds for real.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Build a native Google Slides deck from the approved Google template for apps.disney.com in dark mode, using the plan file google-plan.json. Write the exact commands, in order, that you would run. Save them to a file called plan.sh, one per line, without running anything.
