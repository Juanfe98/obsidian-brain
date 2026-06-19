# Project Claude Instructions

Use this file as a repo-specific `CLAUDE.md` template. Keep global work habits in the global `CLAUDE.md`; keep only project-specific facts and constraints here.

## Project Overview

- Project name:
- Purpose:
- Primary users:
- Important product/domain concepts:

## Tech Stack

- Language(s):
- Framework(s):
- Runtime:
- Package manager:
- Database/storage:
- Testing tools:
- Build/deploy tools:

## Common Commands

Install dependencies:

```bash
# example: pnpm install
```

Run app locally:

```bash
# example: pnpm dev
```

Run targeted tests:

```bash
# example: pnpm test -- path/to/file.test.ts
```

Run all tests:

```bash
# example: pnpm test
```

Typecheck:

```bash
# example: pnpm typecheck
```

Lint/format:

```bash
# example: pnpm lint
```

Build:

```bash
# example: pnpm build
```

## Repository Structure

```txt
# Describe important directories and ownership here.
# src/
# tests/
# docs/
```

## Architecture and Patterns

- Follow these project patterns:
- Prefer these abstractions:
- Avoid these anti-patterns:
- Important boundaries/layers:
- State/data ownership rules:

## Testing Strategy

- Unit test location/pattern:
- Integration test location/pattern:
- E2E test location/pattern:
- Preferred test utilities:
- When to add regression tests:
- Validation expected before PR:

## UI / Design System Rules

- Component library/design system:
- Accessibility expectations:
- Loading/error/empty/success state requirements:
- Styling conventions:
- Browser support constraints:

## API / Data Contract Rules

- API/client patterns:
- Schema or contract location:
- Backward compatibility expectations:
- Migration rules:
- Error handling conventions:

## Security and Privacy Constraints

- Sensitive files or directories:
- Data that must not be logged:
- Authentication/authorization rules:
- Secret handling rules:

## Do Not Change Without Approval

- Public APIs/contracts:
- Database schemas/migrations:
- Dependencies or lockfiles:
- CI/CD or deployment config:
- Generated files:
- Environment/secret files:
- Large cross-cutting refactors:

## Validation Expectations

For small changes, run the most targeted relevant command first.

Before final summary, report:

- Commands actually run
- Whether they passed or failed
- Any unrelated failures
- Any validation skipped and why

## Project-Specific Notes

- Known flaky tests:
- Known local setup issues:
- Important external services:
- Useful links/docs:
