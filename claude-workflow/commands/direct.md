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
   - risk level: Low / Medium / High
   - architecture impact: None / Low / Significant
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
- risk level
- architecture impact
- validation run
- risks or follow-ups

## Definition of Ready

Direct Mode is ready for implementation only when:

- expected behavior is clear
- current behavior or root cause is understood enough to make a safe change
- scope is localized, low risk, and still fits Direct Mode
- files likely affected are identified
- validation approach is known
- approval has been obtained when required

If any readiness condition is missing, stop and ask for clarification, continue investigation, or recommend a more structured workflow.

## Escalate Out of Direct Mode

Stop and recommend Spec Kit or a structured workflow when:

- acceptance criteria are needed
- requirements or expected behavior are unclear
- the change is likely to touch multiple modules or broad user flows
- public APIs, types, schemas, contracts, or data models may change
- architecture, state ownership, data flow, or UX behavior needs a decision
- new loading, error, empty, permission, or accessibility states need definition
- the fix becomes larger than the original focused task
- validation requires broad integration testing rather than a targeted check
- the implementation cannot be described as one small safe plan

When escalation is needed, summarize what was learned, why Direct Mode is no longer appropriate, and the recommended next workflow.

## Risk Classification

Classify the task before implementation:

- Low: localized, reversible, clear behavior, no public contract changes, targeted validation available
- Medium: multiple files, user-facing behavior, moderate integration risk, non-trivial tests, or meaningful state/data-flow changes
- High: public APIs/contracts, schemas, data models, migrations, security/privacy, permissions, dependencies, CI/CD, architecture, broad refactors, or unclear requirements

Risk handling:

- Low risk: proceed after exploration and any required approval
- Medium risk: require an explicit scoped plan, approval before editing, and targeted validation plus any relevant type/lint checks
- High risk: recommend Spec Kit or a structured workflow unless the user explicitly confirms the constrained scope

## Architecture Decision Checkpoint

Before implementation, classify architecture impact:

- None: follows existing patterns and does not change boundaries, ownership, contracts, dependencies, or data flow
- Low: small extension of an existing pattern with no new architectural direction
- Significant: introduces or changes abstractions, module boundaries, state ownership, data flow, public APIs/contracts, schemas, dependencies, tooling, migrations, or cross-cutting behavior

Check:

- Does this introduce a new abstraction, layer, service, helper pattern, or framework usage?
- Does this change state ownership, data flow, persistence, or responsibility boundaries?
- Does this change public APIs, schemas, contracts, data models, or migrations?
- Does this add dependencies, tooling, generated files, CI/CD, or configuration changes?
- Does this mix feature work with refactoring or architectural cleanup?
- Does this diverge from existing project conventions?

If architecture impact is significant, stop and ask for approval or recommend Spec Kit before implementation.

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

## Validation Plan

Before implementation, identify the smallest relevant validation plan:

- Targeted test:
- Typecheck:
- Lint:
- Build:
- Manual QA:
- Skipped validation and why:

Only include checks that are relevant to the scoped change. If validation cannot be run, explain why and suggest what the human should run.

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
