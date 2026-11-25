---
description: Checks that the plan lists recordings via --thread-id then fetches the transcript by the exact --recording-id rather than reusing the thread or date alone.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I need the transcript from last week's 'Sprint Planning' meeting recording. Without running anything, write to plan.sh the sequence of commands to list the meeting thread's recordings using the meeting thread ID, and then fetch the transcript using the exact recording ID returned by that call (not just the thread ID or a date) so we get that one specific recording's transcript.
