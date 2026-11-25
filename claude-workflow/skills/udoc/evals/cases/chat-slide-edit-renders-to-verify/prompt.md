---
description: Checks that a chat request to fix text on a slide is routed through udoc_slide_edit and then udoc_slide_render to verify the result.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm chatting with you right now in Claude Desktop (no terminal available) and my Google account is connected with write mode on. Before you actually do anything, walk me through the exact tool calls you would make, step by step, to change the title on slide 2 of my launch deck and check that it looks right.
