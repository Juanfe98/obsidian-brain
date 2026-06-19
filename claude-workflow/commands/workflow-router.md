# Workflow Router

Classify a user request and recommend the safest workflow before implementation begins.

## Purpose

Use this command when it is unclear whether a request belongs in Onboarding Mode, Product Mode, Direct Mode, Debug Failure, Review, Spec-Driven Workflow, or session closing.

The goal is to prevent starting with the wrong workflow, especially when a request looks small but actually needs product clarification, acceptance criteria, broader planning, or stronger validation.

## Workflow

1. Read the user request carefully.
2. Check `git status --short` when working inside a repository.
3. Identify the request type:
   - new or unfamiliar repository onboarding
   - raw product idea
   - product discovery / MVP shaping
   - small clear engineering task
   - failing test/build/typecheck/lint/runtime issue
   - code explanation
   - diff/PR review
   - non-trivial feature or risky change
   - session close / handoff
4. Assess scope and risk.
5. Identify missing context or artifacts.
6. Recommend exactly one primary workflow command.
7. Recommend optional supporting commands only when useful.
8. Do not edit files or implement code.

## Routing Rules

Recommend `/repo-onboarding` when:

- the user is new to a repository or team
- the user asks to understand the repo from product, domain, and engineering perspectives
- the product purpose, business problem, domain concepts, or architecture are unclear and broad understanding is the explicit goal
- the user needs a broad read-only codebase map before deciding what work to do
- the user asks what to read first or how to become productive in the repo

Do not recommend `/repo-onboarding` just because Claude lacks context for a normal implementation task. For Direct or Spec workflows, prefer targeted exploration of relevant files.

Recommend Product Mode when:

- the idea is vague
- the target user or problem is unclear
- MVP scope is undefined
- assumptions need validation
- the user is asking what should be built, not how to build it

Recommend `/direct` when:

- the task is small, clear, and low risk
- expected behavior is known
- the change is likely localized
- no new acceptance criteria or architecture decisions are needed

Recommend `/debug-failure` when:

- the user provides a concrete failing command, error output, stack trace, or broken runtime behavior
- the goal is to explain and fix a specific failure

Recommend `/explain-code` when:

- the user wants understanding only
- no edits are requested
- the task is about tracing code, architecture, data flow, or responsibilities

Recommend `/review-diff` when:

- the user wants review of current uncommitted changes
- the goal is PR readiness, risk assessment, or scope creep detection

Recommend Spec-Driven Workflow when:

- the work needs acceptance criteria
- requirements are unclear or product behavior needs definition
- multiple modules or files are likely affected
- public APIs, schemas, data models, contracts, architecture, or UX flows may change
- the work is risky, multi-step, or likely to be resumed later

Recommend `/close-session` or `/spec-close` when:

- the user wants to end a working session
- the user wants a handoff summary
- the user wants completed work, validation, risks, and next steps summarized

## Risk Levels

Classify risk as:

- Low: localized, reversible, clear behavior, targeted validation available
- Medium: multiple files, user-facing behavior, non-trivial tests, moderate integration risk
- High: public contracts, data/schema changes, security/privacy, architecture, migrations, broad refactors, unclear requirements

## Output

Return:

1. Recommended workflow command
2. Reasoning
3. Request type
4. Risk level: Low / Medium / High
5. Scope assessment: Small / Medium / Large / Unclear
6. Required context or artifacts
7. Approval needed before editing: Yes / No / Not applicable
8. Suggested next command
9. Clarifying questions, if needed

## Rules

- Do not implement code.
- Do not edit files.
- Do not create specs or product artifacts unless the user explicitly asks.
- If uncertain, prefer the safer workflow.
- If requirements are unclear, ask questions instead of inventing behavior.
