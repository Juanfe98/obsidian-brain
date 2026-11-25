---
description: Checks the agent knows to use --keep-html to retrieve a draft's raw body and to check requestedContentType rather than body.contentType when confirming an HTML draft was stored correctly.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I just created an HTML-formatted draft email using the Outlook command-line tool. Two things: (1) write the exact follow-up command I'd run to pull back the raw HTML body from that draft, to a file named plan.sh, without running anything now, and (2) in your chat reply, tell me exactly which field in the CLI's JSON output I should check to confirm the draft was actually stored as HTML rather than plain text, since I've heard the obvious-looking field can be misleading.
