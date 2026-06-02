# Spec Close

Close or summarize the current Spec Kit feature work.

## Purpose

Use this command when ending or pausing a spec-driven work session, handing off work, or preparing a PR summary.

The goal is to summarize progress, validation, remaining tasks, decisions, risks, and the safest next step.

This command does not mean the spec must be fully complete. It is useful both when:

- the spec-driven session is paused in the middle of implementation
- the spec is ready for PR or final review

## When To Use

Use `/spec-close` when:

- you are leaving a spec-driven session and want a clean handoff
- you want to know which Spec Kit tasks are complete and which remain
- you need to preserve decisions, validation, risks, and next steps before switching context
- you are preparing a PR summary for a completed or mostly completed spec
- you want a checkpoint after implementing one or more Spec Kit tasks

Do not use `/spec-close` for ordinary small Direct Mode tasks. Use `/close-session` instead.

## Workflow

1. Locate the active Spec Kit feature folder.
2. Read `tasks.md`.
3. Check `git status --short`.
4. Inspect the current diff if relevant.
5. Identify completed and remaining tasks.
6. Summarize important implementation decisions.
7. Summarize validation run.
8. Identify risks and follow-ups.
9. If `docs/ai/session-summary.md` exists, ask before updating it unless the user explicitly requested persistence.
10. If no session summary file exists, ask before creating one.
11. Do not create, update, stage, commit, or push any session file without explicit approval.

## Persistence Rules

Default behavior is summary-only.

Only update or create a session summary file when:

- the user explicitly asked to persist the session, or
- you ask for approval and the user approves

If persistence is approved:

- prefer updating `docs/ai/session-summary.md` if it exists
- if no summary file exists, ask where to create one
- keep the update factual and concise
- do not include secrets, credentials, or private environment details

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
10. Persistence status: not requested / requested approval / updated `<path>`
