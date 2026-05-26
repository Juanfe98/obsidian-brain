# Skills

Reusable expertise lenses and specialized workflows for Claude Code.

## Core review skills

| Skill | Type | Use when | Notes |
|---|---|---|---|
| `senior-engineer-reviewer` | Global | Reviewing code, plans, diffs, architecture choices, and implementation tradeoffs | High-signal engineering review; separates must-fix from optional. |
| `web-ui-reviewer` | Global | Reviewing or implementing frontend, React, browser, accessibility, or UI behavior changes | Focuses on states, semantics, keyboard behavior, rendering, and frontend tests. |

## GitHub / PR skills

| Skill | Type | Use when | Notes |
|---|---|---|---|
| `github-code-reviewer` | Global | Reviewing a GitHub PR by number or URL | Preview-only by default. Posts comments only with `--post` or explicit approval. |
| `pr-description` | Global | Generating a PR description from the current branch diff | Produces description, changes, breaking changes, and QA steps. Folder: `pr-description-generator`. |

## Content / interview skills

| Skill | Type | Use when | Notes |
|---|---|---|---|
| `interview-challenge-creator` | Personal/global | Creating HackerRank/LeetCode-style interview challenges | Saves generated challenges to `./challenges/`. |
| `se-hub-new-module` | Project-specific | Adding a module to the SE Hub academy project | Keep only if you intentionally want project-specific skills versioned in this global setup repo. |

## Skill conventions

Every skill should include YAML frontmatter with at least:

```yaml
---
name: skill-name
description: Short trigger/use-case description.
---
```

Add these fields when useful:

```yaml
allowed-tools: Read, Glob, Grep, Bash(...)
argument-hint: <expected arguments>
disable-model-invocation: true
```

Guidelines:

- Keep global skills technology-agnostic unless intentionally specialized.
- Put repo-specific skills in this repo only when you want them versioned as part of your personal Claude setup.
- Prefer high-signal, low-noise skill behavior.
- Avoid skills that install dependencies or have broad side effects unless they are clearly documented and intentionally kept.
