# Spec Implement Task

Implement exactly one task from a Spec Kit task list.

## Purpose

Use this command instead of blindly implementing the whole spec.

The goal is to keep Claude Code implementation controlled, scoped, validated, and reviewable.

## Required Input

The user should provide:

- feature/spec folder or current active feature
- task ID or task name

Example:

`/spec-implement-task T003 from specs/001-product-filter`

## Workflow

1. Locate the requested Spec Kit feature folder.
2. Read `.specify/memory/constitution.md` if it exists.
3. Read `CLAUDE.md` if it exists.
4. Read the feature `spec.md`.
5. Read the feature `plan.md`.
6. Read the feature `tasks.md`.
7. Locate the requested task.
8. Summarize the task scope in plain language.
9. Explore only the files relevant to this task.
10. Propose a small implementation plan.
11. If the task scope is unclear, too broad, or risky, stop and ask for clarification.
12. Implement only the selected task.
13. Add or update tests required by this task.
14. Run targeted validation.
15. Self-review the diff.
16. Fix only must-fix issues.
17. Confirm the task meets the Spec Kit task definition of done.
18. Summarize the result.

## Definition of Done

A Spec Kit task is done only when:

- The selected task, and only that task, is implemented.
- Required tests or validation were run, or the reason they were not run is documented.
- The diff was self-reviewed against the spec, plan, task, and constitution.
- No adjacent tasks or unrelated refactors were included.
- Any task status update is justified by implementation and validation results.
- Remaining risks, follow-ups, or skipped validation are documented.

Do not mark the task complete if any required condition is missing. Instead, explain what remains.

## Task Status Updates

Only update `tasks.md` or mark a task complete when the selected task meets the definition of done.

When updating task status:

- Update only the selected task line or checkbox.
- Do not mark adjacent, dependent, or follow-up tasks complete.
- Do not rewrite task descriptions unless explicitly asked.
- Preserve task IDs, ordering, and existing formatting.
- If validation was skipped or failed, do not mark the task complete unless the user explicitly accepts that risk.
- Mention the exact task status change in the final summary.

If the task cannot be marked complete, report the blocker and the safest next action.

## Rules

- Implement only the selected task.
- Do not implement adjacent tasks.
- Do not perform unrelated refactors.
- Do not add dependencies without approval.
- Do not modify public APIs/contracts unless the selected task requires it.
- Do not edit secrets or environment files.
- Do not claim validation passed unless commands were actually run.
- If implementation reveals the task is too large, stop and recommend splitting it.

## Validation

Run the smallest relevant validation first, such as:

- targeted test file
- relevant unit/integration test
- typecheck
- lint
- build check

Infer commands from the repository.

## Output

Return:

1. Task implemented
2. Files changed
3. Tests or validation run
4. Any scope changes avoided
5. Risks or follow-ups
6. Whether the task can be marked complete
