---
description: Checks that a plan for k8s CPU metrics includes the required --query flag with correct Datadog query language syntax.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I want to check average CPU usage across the 'prod' Kubernetes cluster in Datadog. Write to plan.sh the exact CLI command to query this metric (do not run it).
