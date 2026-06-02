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

## Traceability Check

Verify that the task list has clear traceability across artifacts:

```txt
spec requirement / acceptance criterion
→ plan item / technical approach
→ implementation task
→ validation task or validation method
```

Check for:

- every important spec requirement or acceptance criterion has at least one implementation task
- every implementation task maps back to a spec requirement, acceptance criterion, or plan item
- user-facing behavior has validation coverage where practical
- edge cases and UX states from the spec are represented in tasks or explicitly deferred
- test, validation, or QA tasks exist for risky or user-facing behavior
- tasks do not introduce work that is outside the approved spec or plan

If traceability is unclear, call out the missing link and recommend refining `spec.md`, `plan.md`, or `tasks.md` before implementation.

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
- requirements or acceptance criteria with no implementation task
- implementation tasks with no clear requirement or plan source
- risky behavior with no validation task or validation method
- tasks that add behavior outside the approved spec or plan

## Output

Return:

1. Task readiness verdict: Ready / Needs refinement
2. Traceability findings
3. Requirements or acceptance criteria without tasks
4. Tasks without clear spec/plan source
5. Tasks that should be split
6. Missing tasks
7. Risky tasks
8. Missing validation coverage
9. Suggested implementation order
10. Whether task-by-task implementation can start
