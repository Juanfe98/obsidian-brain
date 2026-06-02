# Spec Status

Summarize the current state of a Spec Kit feature without editing files.

## Purpose

Use this command when resuming spec-driven work, switching context, or deciding the safest next task.

The goal is to understand where the feature stands before continuing implementation.

Unlike `/spec-close`, this command is read-only and focused on current status. It does not close a session, persist notes, draft a PR summary by default, or update task status.

## When To Use

Use `/spec-status` when:

- you are returning to an in-progress Spec Kit feature
- you need to know which tasks are complete and which remain
- you want to identify the safest next task
- you want to check current git state before continuing
- you need a quick snapshot of validation, risks, blockers, and artifacts

Use `/spec-close` instead when:

- you are ending or pausing a work session
- you want a handoff summary
- you want to optionally persist session notes
- you are preparing a PR summary

## Workflow

1. Locate the active Spec Kit feature folder or use the feature folder provided by the user.
2. Read `.specify/memory/constitution.md` if it exists.
3. Read the feature `spec.md`.
4. Read the feature `plan.md`.
5. Read the feature `tasks.md`.
6. Check `git status --short`.
7. Inspect the current diff only if needed to understand task progress.
8. Identify completed, in-progress, blocked, and remaining tasks.
9. Identify apparent validation status from available notes, task markers, or recent context.
10. Identify risks, blockers, unclear requirements, or drift from the spec/plan.
11. Recommend the safest next command or task.
12. Do not edit files.

## Review Focus

Check:

- active feature/spec folder
- current branch and git state, if available
- completed tasks
- remaining tasks
- tasks that appear partially implemented but not marked complete
- validation evidence or missing validation
- blockers or unclear requirements
- risks from current diff, if inspected
- whether the next task is ready for `/spec-implement-task`

## Output

Return:

1. Feature/spec name and path
2. Git status summary
3. Completed tasks
4. In-progress or partially implemented tasks
5. Remaining tasks
6. Blockers or unclear decisions
7. Validation status / missing validation
8. Risks or drift from spec/plan
9. Recommended next task
10. Suggested next command

## Rules

- Do not edit files.
- Do not mark tasks complete.
- Do not create or update session summaries.
- Do not draft a PR summary unless explicitly requested.
- If the active feature is unclear, ask the user to choose the feature folder.
- If task status cannot be determined from artifacts, say so instead of guessing.
