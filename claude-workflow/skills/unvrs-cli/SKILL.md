---
name: unvrs-cli
version: 0.59.0
description: >
  Unified CLI dispatcher for agent-friendly tools. Use when user mentions: unvrs, universal, skills, discovery.
metadata:
  generated: true
  requires:
    bins: ["unvrs"]
---

# Unified CLI dispatcher for agent-friendly tools

## Quick Reference

```bash
# Tool Discovery
unvrs --list
unvrs --help
unvrs --version

# Skills Management
unvrs skills install
unvrs skills install --target claude-code
unvrs skills install --target cursor
unvrs skills install --target codex
unvrs skills list

# Plugin Installation
unvrs install databricks
unvrs install nexus
unvrs install terraform
unvrs install gh
unvrs install --force databricks

# Dispatching Tools
unvrs jira --agent issue search --jql "assignee = currentUser()"
unvrs confluence --agent page get 12345
unvrs datadog --agent monitor list --limit 10
unvrs databricks clusters list --output json

# Runbooks
unvrs run playbook.yaml
unvrs run playbook.yaml --var ENV=staging --var LIMIT=10
unvrs run playbook.yaml --dry-run
unvrs run playbook.yaml --info

# Updating
aix update

```

## Authentication

- Method: None (dispatcher)
- Setup: unvrs is pre-installed with cli-universe

## Workflows

### First-time setup

```bash
unvrs --list
unvrs skills install
unvrs install databricks
```

### Discover and dispatch

```bash
unvrs --list
unvrs jira --help
unvrs jira --agent issue search --jql "project = PROJ" --limit 5
```

## Tips

- Use unvrs --list to see all available tools and their install status
- Run unvrs skills install to set up agent skills for auto-detected coding agents
- Use --target to install skills for a specific agent: claude, cursor, vscode, copilot, codex, opencode, claude-desktop, with claude-code an alias for claude
- Dispatch through unvrs when you don't know the tool's binary location
- Install external plugins with aix add <catalog key> from Artifactory; unvrs install handles only aws (Homebrew) and nexus (install script)
- Run aix update to update the CLI tools; unvrs does not self-update (it is installed by aix, not npm)
- Use unvrs run for executing YAML runbooks with variable substitution

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| dispatch native tools through unvrs in performance-critical loops | Direct binary invocation avoids the dispatcher overhead; unvrs exec replaces process on Unix but still has startup cost |
| install native tools via unvrs install | Native tools (jira, confluence, etc.) are built with the workspace — only external plugins can be installed |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `unvrs run`

Execute a runbook

- `<file>`: Path to the runbook YAML file
- `--var`: Set a runbook variable (KEY=VALUE)
- `--dry-run`: Show what would execute without running
- `--info`: Show runbook info without executing
- `--agent`: Agent mode (auto-confirm prompts)

### `unvrs update`

Show how to update the AIX tools (they are updated by `aix update`)

### `unvrs install`

Install an external tool plugin

- `<tool>`: Tool name to install
- `--force`: Force reinstall
