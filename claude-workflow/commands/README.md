# Commands

Slash command workflows for the Git-controlled Claude setup.

## Daily Direct Mode

| Command | Use when | Output / behavior |
|---|---|---|
| `/direct` | Small, clear, low-risk engineering tasks | Explores first, proposes minimal plan, implements focused scope, validates, self-reviews, summarizes. |
| `/debug-failure` | A test/build/typecheck/lint/runtime failure has concrete output | Finds root cause, proposes smallest fix, reruns targeted failing validation. |
| `/review-diff` | Reviewing current uncommitted diff before commit/PR | High-signal senior review; does not edit unless explicitly asked. |
| `/explain-code` | Understanding a code path without edits | Traces flow, responsibilities, dependencies, risks. |
| `/close-session` | Ending a task/session | Summarizes work and asks before persisting session notes. |

## Spec-Driven Workflow

| Command | Use when | Output / behavior |
|---|---|---|
| `/spec-review` | After `/speckit.specify` / clarify / checklist | Reviews spec quality before technical planning. |
| `/spec-plan-review` | After `/speckit.plan` | Reviews technical plan before tasks. |
| `/spec-task-review` | After `/speckit.tasks` | Reviews whether tasks are small, ordered, testable, and safe. |
| `/spec-implement-task` | Implementing exactly one Spec Kit task | Reads artifacts, implements selected task only, validates, self-reviews, reports task completion readiness. |
| `/spec-close` | Closing a spec-driven session or preparing a PR | Summarizes completed/remaining tasks, validation, decisions, risks, and PR draft. |

## Operating rules

- Prefer `/direct` for small, clear, low-risk work.
- Prefer Spec Kit commands for unclear, multi-step, high-risk, or acceptance-criteria-driven work.
- Use `/review-diff` before committing or opening a PR.
- Use `/close-session` when switching context or preserving decisions.
