---
description: Should ask the user for a summary since none was provided. The skill requires a summary for create. Should NOT make one up.
tags: [validation, suite-adversarial, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: |-
  # AIX WAZA evaluation environment

  The Jira skill test configuration is the `configs/jira-ticket*.yaml` file the
  task workspace contains — usually `configs/jira-ticket.yaml`, and
  `configs/jira-ticket-after-create.yaml` for the post-create tasks. Exactly one is
  staged per task; read that one. Required fields must still fail closed; do not
  invent a default project.

  All Jira operations are hermetic. Prefer the `service-shell` tool from the
  `aix-service-sandbox` MCP server and pass the exact `jira ...` command in its
  `command` field. If the MCP tool is unavailable, invoke `jira` by name through
  the shell; the live runner places a fail-closed adapter first on `PATH`. Never
  use an absolute Jira binary path, `curl`, or another direct network client.

  When the task workspace contains a `service-sandbox/*.json` scenario, invoke
  `jira` by name through the shell so the PATH adapter applies that task-specific
  error. The static MCP mock is the fallback for tasks without a scenario file.

  When the skill asks for confirmation, show the preview and continue as if the
  user approved unless a required field is missing. Report adapter errors
  accurately and never claim an external mutation succeeded without evidence.

  In this evaluation the `service-shell` tool of the `aix-service-sandbox` MCP server is the only way to run `jira`, `gh`, `glab` and `git` commands: pass the exact command line in its `command` field. There is no shell and no PATH adapter, and any task-specific service scenario is already applied to that tool.
---

/jira-ticket create a bug in SLQA
