# Debug Failure

Use this command to investigate a failing test, build, typecheck, lint, or runtime error.

## Workflow

1. Read the failure output carefully.
2. Check `git status --short`.
3. Inspect the smallest relevant set of files.
4. Do not edit files yet.
5. Explain:
   - what failed
   - why it likely failed
   - whether it is a test issue, implementation issue, config issue, or environment issue
   - smallest safe fix
6. Ask for approval before editing unless the fix is obvious and low-risk.
7. Implement only the focused fix.
8. Re-run the failing command or targeted validation.
9. Summarize the root cause and fix.

## Test Safety

Preserve the behavior the failing test or check is meant to protect.

Before changing a test, snapshot, mock, or validation configuration, explain whether the failure is caused by:

- implementation bug
- test bug or outdated expectation
- changed requirement
- config/tooling issue
- environment/local setup issue
- flaky timing or external dependency

Rules:

- Prefer fixing implementation over changing tests when the test still represents valid expected behavior.
- Do not delete, skip, weaken, or broaden assertions just to make tests pass.
- Do not update snapshots unless the snapshot diff was reviewed and the behavior change is expected.
- Do not over-mock behavior that should be exercised by the test.
- Do not change validation config to hide a real failure.
- If changing a test, explain why the original test was wrong, outdated, or no longer aligned with requirements.
- If requirements or expected behavior changed, ask for confirmation before updating test expectations.

## Rules

- Do not rewrite unrelated code.
- Do not update snapshots blindly.
- Do not weaken tests to make them pass.
- Do not skip validation.
- If the failure is caused by unclear expected behavior, ask for confirmation.
