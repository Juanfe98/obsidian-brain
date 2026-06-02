# Commands

Slash command workflows for the Git-controlled Claude setup.

## Command Edit Capability

| Category | Commands | Edit behavior |
|---|---|---|
| Read-only / advisory | `/workflow-router`, `/explain-code`, `/review-diff`, `/spec-review`, `/spec-plan-review`, `/spec-task-review`, `/spec-status`, `/product-idea`, `/product-discovery`, `/product-brief`, `/product-requirements` | Do not edit files unless the user explicitly asks to persist an artifact or apply a specific change. |
| Implementation-capable | `/direct`, `/debug-failure`, `/spec-implement-task` | May edit files after required exploration, readiness checks, approval rules, and scoped plan. |
| Session / handoff | `/close-session`, `/spec-close` | Summary-only by default. May persist session notes only with explicit approval. |

When in doubt, treat a command as read-only and ask before editing.

## Workflow Routing

| Command | Use when | Output / behavior |
|---|---|---|
| `/workflow-router` | You are unsure which workflow to use | Classifies the request, assesses scope/risk, and recommends the safest next command without editing files. |

## Product Mode

| Command | Use when | Output / behavior |
|---|---|---|
| `/product-idea` | You have a raw product idea | Frames target user, problem, alternatives, value proposition, assumptions, and MVP direction. |
| `/product-discovery` | You need to validate the problem or assumptions | Creates discovery plan, interview/research questions, evidence criteria, and proceed/pivot/stop criteria. |
| `/product-brief` | You need to define the MVP before requirements | Produces MVP goal, scope, non-goals, user journey, UX states, success metrics, and risks. |
| `/product-requirements` | You need requirements ready for Spec Kit | Produces functional requirements, acceptance criteria, UX states, edge cases, learning signals, and a suggested `/speckit.specify` prompt. |

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
| `/spec-status` | Resuming or checking an in-progress Spec Kit feature | Read-only status snapshot of tasks, validation, blockers, risks, and recommended next task. |
| `/spec-implement-task` | Implementing exactly one Spec Kit task | Reads artifacts, implements selected task only, validates, self-reviews, reports task completion readiness. |
| `/spec-close` | Pausing/ending a spec-driven session or preparing a PR | Summarizes completed/remaining tasks, validation, decisions, risks, next steps, and optional PR draft. |

## Operating rules

- Use `/workflow-router` when the safest workflow is unclear.
- Prefer Product Mode when the idea, target user, problem, or MVP is unclear.
- Prefer `/direct` for small, clear, low-risk work.
- Prefer Spec Kit commands for clear but non-trivial, multi-step, high-risk, or acceptance-criteria-driven work.
- Use `/review-diff` before committing or opening a PR.
- Use `/close-session` when switching context or preserving decisions.
