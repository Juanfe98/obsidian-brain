# Spec Task Review

Review the generated task list before implementation.

## Purpose

Use this command after `/speckit.tasks` and before implementing.

The goal is to ensure tasks are small, ordered, executable, testable, and safe for task-by-task Claude Code implementation.

## Workflow

1. Locate the active Spec Kit feature folder.
2. Read `.specify/memory/constitution.md` if it exists.
3. Read the feature `spec.md`.
4. Read the feature `plan.md`.
5. Read the feature `tasks.md`.
6. Do not edit files unless explicitly asked.

## Review Focus

Check whether tasks are:

- small enough to implement individually
- ordered correctly
- clear and executable
- mapped to the spec requirements
- aligned with the technical plan
- testable
- reviewable
- free of unrelated refactors
- safe to implement one at a time

## Red Flags

Call out:

- tasks that are too large
- tasks that mix unrelated concerns
- missing test tasks
- missing validation tasks
- tasks that require unclear product decisions
- tasks that depend on future tasks incorrectly
- tasks that modify too many files at once
- tasks that should be split
- tasks that are not aligned with the spec or plan

## Output

Return:

1. Task readiness verdict: Ready / Needs refinement
2. Tasks that should be split
3. Missing tasks
4. Risky tasks
5. Suggested implementation order
6. Whether task-by-task implementation can start
