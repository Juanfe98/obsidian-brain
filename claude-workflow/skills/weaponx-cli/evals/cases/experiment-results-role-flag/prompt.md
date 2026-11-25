---
description: Checks that the plan pulls experiment results filtered to specific metric tiers using the exact --role flag with comma-separated values, excluding tiers not requested.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

In weaponx, for experiment 22222222-2222-2222-2222-222222222222 I only care about the alliance and primary tier metrics in the results, not guardrail metrics. Write the exact command to a file named plan.sh (don't run anything) to pull just those results.
