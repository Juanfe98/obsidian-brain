# Spec Close

Close or summarize the current Spec Kit feature work.

## Purpose

Use this command when finishing a spec-driven work session or preparing for a PR.

The goal is to summarize progress, validation, remaining tasks, and risks.

## Workflow

1. Locate the active Spec Kit feature folder.
2. Read `tasks.md`.
3. Check `git status --short`.
4. Inspect the current diff if relevant.
5. Identify completed and remaining tasks.
6. Summarize important implementation decisions.
7. Summarize validation run.
8. Identify risks and follow-ups.
9. If `docs/ai/session-summary.md` exists, update it.
10. If no session summary file exists, ask before creating one.

## Output

Return:

1. Feature/spec name
2. Completed tasks
3. Remaining tasks
4. Files changed
5. Important decisions
6. Validation run
7. Risks or follow-ups
8. Suggested next task
9. PR summary draft, if the feature is ready
