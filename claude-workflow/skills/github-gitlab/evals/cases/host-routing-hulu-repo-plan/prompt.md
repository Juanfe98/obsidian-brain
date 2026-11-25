---
description: Checks that the agent infers the github-hulu pat-manager host and the unvrs_gh gateway tool when planning to list PRs for a Hulu repo.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I need to check open pull requests for the analytics-service repo, which lives in our Hulu GitHub Enterprise org. Before you call anything, write into plan.sh the exact gateway tool name, the host selector value, and the API path you'd use to list its open pull requests. Just write the plan, don't invoke any tool yet.
