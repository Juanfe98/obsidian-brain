---
description: Checks that the plan lists experiments for the team to resolve the UUID before requesting results, rather than fabricating a UUID for the named experiment.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

Using weaponx, get the experiment results for the 'Checkout Redesign' experiment on the growth team. Write the exact commands, in order, to a file named plan.sh without running them.
