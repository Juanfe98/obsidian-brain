---
description: Checks that the agent tells the user to provision the managed browser via pat-manager doctor instead of installing Playwright manually before running auth login.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Our Workforce CLI session expired and I need to log back in through SSO, but our corporate network blocks direct browser downloads. What's the right way to get set up so the login command will work, and what should I avoid doing to get there?
