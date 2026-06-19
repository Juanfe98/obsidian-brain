# Claude Code Setup

Git-controlled source of truth for my Claude Code setup.

The active Claude Code runtime lives in `~/.claude/`. This repository is the version-controlled copy used to review, evolve, and reinstall that setup safely.

## Structure

```txt
CLAUDE.md          Global Claude instructions
commands/          Slash command workflows
skills/            Reusable Claude skills
scripts/           Sync/install helper scripts
templates/         Templates for repo-specific Claude and product artifacts
docs/              Workflow maps and reference docs
*.md               Workflow documentation and diagrams
```

## Source of truth

After initial import, prefer making intentional changes in this repository first.

Recommended flow:

```txt
Edit/review in this repo
→ commit changes
→ install to ~/.claude with ./scripts/install-to-claude.sh
```

Use `sync-from-claude.sh` only when you intentionally changed the live `~/.claude/` setup and want to import those changes back into git control.

## Sync from local Claude setup

From this directory:

```bash
./scripts/sync-from-claude.sh
```

Equivalent manual commands:

```bash
cp ~/.claude/CLAUDE.md ./CLAUDE.md
rsync -a --delete ~/.claude/commands/ ./commands/
rsync -a --delete ~/.claude/skills/ ./skills/
```

## Install to Claude setup

From this directory:

```bash
./scripts/install-to-claude.sh
```

Equivalent manual commands:

```bash
cp ./CLAUDE.md ~/.claude/CLAUDE.md
rsync -a --delete ./commands/ ~/.claude/commands/
rsync -a --delete ./skills/ ~/.claude/skills/
```

Review diffs before syncing in either direction. Both scripts ask for confirmation because they overwrite `CLAUDE.md`, `commands/`, and `skills/` in the destination.

## Review checklist before install

Before running `./scripts/install-to-claude.sh`, check:

```bash
git status --short
git diff -- .
```

Verify:

- command filenames match documented slash commands
- skill folder names match skill frontmatter names where practical
- no runtime/cache/history files are included
- no secrets, credentials, or private environment details are included
- `github-code-reviewer` remains preview-only unless `--post` or explicit approval is provided
- sync/install scripts still pass `bash -n scripts/*.sh`

## Workflow modes

```txt
Onboarding Mode    New repo → product/domain/architecture understanding
Product Mode       Raw idea → MVP-ready requirements
Spec-Driven Mode   Clear non-trivial requirements → plan/tasks/implementation
Direct Mode        Small clear engineering tasks
```

Onboarding Mode uses:

```txt
/repo-onboarding
```

Product Mode uses:

```txt
/product-idea
/product-discovery
/product-brief
/product-requirements
```

See:

- `docs/workflow-flows.md` for the concise workflow maps and Mermaid diagrams
- `claude-code-product-mode-workflow.md` for the full product workflow

## Project-specific setup

Use `templates/project-CLAUDE.md` as a starting point for repository-specific `CLAUDE.md` files.

Rule of thumb:

```txt
Global CLAUDE.md = how Claude should work everywhere
Project CLAUDE.md = how this repository works
```
