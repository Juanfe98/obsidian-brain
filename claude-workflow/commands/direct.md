# Direct Mode

Use this command for small, clear, low-risk engineering tasks.

Examples:

- small bug fix
- failing test investigation
- focused refactor
- missing test
- small UI/backend change
- code explanation

## Workflow

1. Read the user request carefully.
2. Check `git status --short`.
3. Inspect only the files relevant to the task.
4. Do not edit files yet.
5. Explain:
   - current behavior
   - likely root cause, if applicable
   - smallest safe plan
   - files likely affected
   - validation needed
6. Decide if the task is still small:
   - If yes, continue Direct Mode.
   - If no, recommend moving to Spec Kit or a structured workflow.
7. Wait for approval before editing when approval is required.
8. Implement only the approved scope.
9. Add or update focused tests if behavior changes.
10. Run targeted validation.
11. Self-review the diff.
12. Fix only must-fix issues.
13. Confirm the task meets the Direct Mode definition of done.
14. Summarize:

- files changed
- what changed
- validation run
- risks or follow-ups

## Approval Before Editing

Approval is required before editing when:

- The change affects more than one file.
- Expected behavior is ambiguous.
- Public APIs, types, schemas, contracts, or data models may change.
- Dependencies, lockfiles, generated files, CI/CD, environment, or config files may change.
- Tests need significant rewriting instead of focused updates.
- The fix requires a larger refactor or architecture decision.
- The change may affect user-facing behavior beyond the requested scope.

For obvious, low-risk single-file fixes, proceed after explaining the plan unless the user requested approval first.

## Definition of Done

Direct Mode is done only when:

- The scoped change is implemented.
- Targeted validation was run, or the reason it was not run is documented.
- The diff was self-reviewed for scope creep, obvious bugs, and missing tests.
- No unrelated changes were introduced.
- The final summary includes changed files, validation, and risks/follow-ups.

## Rules

- Keep changes minimal.
- Do not perform unrelated refactors.
- Do not implement adjacent improvements.
- Do not install dependencies without approval.
- Do not modify public APIs/contracts unless explicitly required.
- Do not edit secrets or environment files.
- Do not claim validation passed unless commands were actually run.
