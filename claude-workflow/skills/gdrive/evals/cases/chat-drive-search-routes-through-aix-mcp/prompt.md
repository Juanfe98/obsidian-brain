---
description: Checks that a Google Drive search request from Claude Desktop chat is routed through aix-mcp:search_tools then aix-mcp:run_tool naming the gdrive_search_query meta-tool, not a generic API call.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I'm chatting with you right now in Claude Desktop (no terminal available) and my Google Drive account is already connected. Before you actually do anything, walk me through the exact tool calls you would make, step by step, to find a file named 'Q4 Planning Deck' in my Drive.
