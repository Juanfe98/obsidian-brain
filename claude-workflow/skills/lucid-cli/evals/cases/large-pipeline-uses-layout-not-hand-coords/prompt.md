---
description: For a 14-step pipeline diagram the agent's plan uses the deterministic topology layout command (not hand-placed coordinates) before creating the document
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I need a flowchart with 14 steps and their connectors for an order-processing pipeline (receive order, validate, check inventory, reserve stock, charge payment, handle payment failure, ship, notify customer, update inventory, close order, refund path, audit log, archive, done). Before creating anything, write the exact CLI commands you would run, in order, to a file named plan.sh. Do not run them, and do not hand-compute any shape coordinates yourself.
