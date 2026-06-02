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
10. Classify task risk: Low / Medium / High.
11. Propose a small implementation plan.
12. If the task scope is unclear, too broad, or risky, stop and ask for clarification.
13. Implement only the selected task.
14. Add or update tests required by this task.
15. Run targeted validation.
16. Self-review the diff.
17. Fix only must-fix issues.
18. Confirm the task meets the Spec Kit task definition of done.
19. Summarize the result.

## Definition of Ready

A Spec Kit task is ready for implementation only when:

- the selected task exists in `tasks.md`
- the task maps clearly to the feature `spec.md` and `plan.md`
- the task scope is small, clear, and independently implementable
- required context and likely affected files are identified
- the validation approach is known
- no unresolved product, architecture, API, schema, contract, or data-model question blocks the task
- approval has been obtained when required

If any readiness condition is missing, do not implement. Ask for clarification, recommend splitting the task, or return to spec/plan/task refinement.

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

## Risk Classification

Classify the selected task before implementation:

- Low: localized, reversible, clear behavior, no public contract changes, targeted validation available
- Medium: multiple files, user-facing behavior, moderate integration risk, non-trivial tests, or meaningful state/data-flow changes
- High: public APIs/contracts, schemas, data models, migrations, security/privacy, permissions, dependencies, CI/CD, architecture, broad refactors, or unclear requirements

Risk handling:

- Low risk: implement task-by-task after readiness checks and any required approval
- Medium risk: require explicit scoped plan, approval before editing, and targeted validation plus relevant type/lint checks
- High risk: stop and confirm the task is correctly scoped; recommend splitting or returning to spec/plan/task refinement when needed

## Validation

Before implementation, identify the smallest relevant validation plan for the selected task:

- Targeted test:
- Typecheck:
- Lint:
- Build:
- Manual QA:
- Skipped validation and why:

Run the smallest relevant validation first, such as:

- targeted test file
- relevant unit/integration test
- typecheck
- lint
- build check

Infer commands from the repository. Only include checks that are relevant to the selected task. If validation cannot be run, explain why and suggest what the human should run.

## Output

Return:

1. Task implemented
2. Risk level: Low / Medium / High
3. Files changed
4. Tests or validation run
5. Any scope changes avoided
6. Risks or follow-ups
7. Whether the task can be marked complete
