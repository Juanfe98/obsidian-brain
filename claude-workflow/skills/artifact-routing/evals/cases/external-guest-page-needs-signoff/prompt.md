---
description: Routes a persistent, linkable guest-facing preview page to aix-proto and flags that brand/legal sign-off is required before it goes live.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

We're finishing a marketing preview page meant for external guests to view before our public launch. A few stakeholders need a stable link they can come back to over the next few weeks to check on it. Where should this page go, and is there anything else I need before it's live?
