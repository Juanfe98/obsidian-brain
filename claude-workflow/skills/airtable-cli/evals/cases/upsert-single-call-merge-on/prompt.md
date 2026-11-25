---
description: Checks that a large keyed sync is planned as one record upsert call with --merge-on rather than batched create calls.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I have a big customer sync: 200 records need to end up in the Customers table of the CRM base, matched by their Email field — update the record if that email already exists, otherwise create it. Write the exact single command you would run to perform this whole sync in one shot to plan.sh (don't run it).
