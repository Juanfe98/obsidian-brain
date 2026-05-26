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

## Rules

- Do not rewrite unrelated code.
- Do not update snapshots blindly.
- Do not weaken tests to make them pass.
- Do not skip validation.
- If the failure is caused by unclear expected behavior, ask for confirmation.
