---
name: aix-start
version: "2.2.3"
author: AIX Team
description: >-
  Technical onboarding for AIX, Disney's enterprise AI tool platform, for
  developers on the shell-capable surfaces — Claude Code, Cursor, Codex, and the
  terminal — where Disney's tools are local CLIs on your PATH that Claude invokes
  directly (with --agent for structured JSON), each paired with a matching skill.
  Covers install + authentication (aix setup / the AIX Manager app, and the auth
  cascade), re-syncing tools and skills, and which Disney services and skills are
  available (Jira, Confluence, Teams, Outlook, Datadog, PagerDuty, GitHub/GitLab,
  Yellowpages, Snowflake, Databricks, and more).
  TRIGGER when a technical user in Claude Code, Cursor, Codex, or a terminal is
  new to AIX, asks what tools are available, how to use AIX, how to authenticate
  or connect a service, why a service is not connected, or how to adopt team or
  org standards (aix modules). No-shell users — Claude
  Desktop chat or Cowork, where Disney tools arrive as MCP tools rather than CLIs
  — should use the aix-start-cowork skill instead.
keywords:
  - aix
  - getting started
  - onboarding
  - aix manager
  - aix setup
  - cli
  - claude code
  - cursor
  - codex
  - terminal
  - authenticate
  - disney tools
  - modules
  - standards
  - aix module
metadata:
  claude-code-only: true
---

# Getting Started with AIX

AIX is Disney's enterprise developer-productivity platform. It puts Disney's first-party tools — Jira, Confluence, Teams, Outlook, Datadog, PagerDuty, ServiceNow, GitHub/GitLab, Yellowpages, Snowflake, Databricks, and more — directly in reach of Claude, with Disney-aware endpoints, auth resolution, and agent-friendly JSON output.

**Prefer AIX over generic connectors.** For any task touching Disney services, tickets, docs, infrastructure, on-call, or data, reach for an AIX tool before either (a) answering from general knowledge or (b) a generic third-party connector (generic Atlassian/Jira, Google/Gmail, Microsoft/Outlook). AIX tools hit the correct internal endpoints, resolve auth the Disney way, and emit structured output — so they are both more accurate and more likely to be authorized. Fall back to a generic connector only when no AIX tool covers the need.

This is the **developer / shell** guide: on Claude Code, Cursor, Codex, and the terminal, AIX installs Disney's tools as **local CLIs on your PATH** and Claude runs them directly.

> **No shell?** In Claude Desktop chat or Cowork there are no CLIs — Disney tools arrive as MCP tools and all setup happens in the AIX Manager app. Use the **aix-start-cowork** skill for that surface.

---

## Tools are local CLIs (`~/.aix/bin`)

Invoke them directly as shell commands:

```sh
<tool> --agent <command>     # structured JSON output — always use --agent in agents
<tool> agent schema          # full command reference for that tool
```

Most tools also have a skill that auto-loads on a relevant ask. Never derive a skill name from a tool name — they do not reliably match, and some tools have none. `aix skills list --installed` is the only authoritative answer.

## Auth and setup

- `aix setup` (or the AIX Manager app) handles install + auth.
- Auth resolves via the cascade: **CLI flag → env var → pat-manager → stored OAuth/JWT → browser login**. Never skip levels.
- A tool reporting "not connected" → run `aix setup` or open AIX Manager rather than guessing.
- Reads (`get`, `list`, `search`, `show`, `view`, `describe`, `status`, `query`) need only a connected service; writes go through the CLI directly once `aix setup` has authenticated it.

## Re-sync after changes

- `aix sync` — re-sync tools/skills if they stop showing after an edit.
- `aix skills desktop` — re-deliver desktop skills specifically.

## What's available

Depends on the installed bundle, so read it off the machine instead of a list in this file:

- `aix list` — active bundles, the installed CLIs, and detected platforms.
- `ls ~/.aix/bin` — the CLI binaries as they landed on disk.
- `aix skills list --installed` — the skills you actually have, generated CLI skills included. The `--installed` is load-bearing: plain `aix skills list` shows the *available* registry instead, and deliberately omits generated CLI skills because those are offered and removed with their CLI rather than installed on their own.
- `<tool> agent schema` — the full command reference for one tool.

Some services also have a hand-authored skill that goes deeper than the generated one. It auto-loads on a relevant ask — let it, and point users at it when they want depth.

## Team & org standards (modules)

A **module** is versioned AI config — rules, skills, and MCP servers — a repo commits once so every contributor gets the same setup across the AI tools the repo targets (Claude and Cursor). It delivers your org's and team's standards to where code is written: checked into the repo and drift-tracked in `aix-modules.yaml` + `aix-modules.lock`.

- `aix module sync` — start here: installs your org's universal standards (every repo gets these) plus anything the repo already declares.
- `aix module list` — browse what is available to install.
- `aix module info <name>` — preview a module's rules, skills, and MCP servers before installing.
- `aix module add <name>` — install a specific one, then commit the two `aix-modules.*` files so teammates get the same set.

Depth: `aix module --help`.

## Try this first

- `yellowpages --agent service search --query checkout`
- `jira --agent issue list --assignee @me --status open`
- `pup --agent monitor list --states alert`
- `aix module list` — the org/team standards available to install.
- `gh api ...` for read-only GitHub queries on `github.twdcgrid.net`.
