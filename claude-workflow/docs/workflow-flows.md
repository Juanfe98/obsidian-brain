# Claude Workflow Flows

Concise map of the common Claude workflow paths in this setup.

## Workflow Selection

Start with `/workflow-router` when the safest workflow is unclear.

```mermaid
flowchart TD
    A[User request] --> B["/workflow-router"]
    B --> C{Request type?}
    C -->|New or unfamiliar repo| O[Onboarding Mode]
    C -->|Vague idea / MVP unclear| P[Product Mode]
    C -->|Small clear engineering task| D["/direct"]
    C -->|Concrete failure output| F["/debug-failure"]
    C -->|Understand code only| E["/explain-code"]
    C -->|Review current diff| R["/review-diff"]
    C -->|Non-trivial feature / high risk| S[Spec-Driven Mode]
    C -->|End or handoff session| X["/close-session or /spec-close"]
```

## Onboarding Mode Flow

Use when joining or revisiting an unfamiliar repository and you need product, domain, and architecture context before changing code.

```mermaid
flowchart TD
    A[New or unfamiliar repo] --> B["/repo-onboarding"]
    B --> C[Inspect README docs configs and entry points]
    C --> D[Infer product purpose and users]
    D --> E[Map domain concepts and workflows]
    E --> F[Map architecture modules and boundaries]
    F --> G[Map data flows tests and operations]
    G --> H[Separate facts assumptions and unknowns]
    H --> I[Recommend next reading and workflow]
    I --> J{Need implementation or planning?}
    J -->|Small clear task| K["/direct"]
    J -->|Non-trivial feature| L[Spec-Driven Mode]
    J -->|Vague product idea| M[Product Mode]
    J -->|No| N[Stop with onboarding summary]
```

## Product Mode Flow

Use when the problem, user, value proposition, or MVP scope is unclear.

```mermaid
flowchart TD
    A[Raw idea] --> B["/product-idea"]
    B --> C[Product Hypothesis]
    C --> D{Need discovery?}
    D -->|Yes| E["/product-discovery"]
    D -->|No| F["/product-brief"]
    E --> F["/product-brief"]
    F --> G["/product-requirements"]
    G --> H{Product to Spec handoff ready?}
    H -->|No| I["Refine brief / discovery"]
    I --> F
    H -->|Yes| J["/speckit.specify prompt"]
    J --> K[Spec-Driven Mode]
```

## Direct Mode Flow

Use for small, clear, low-risk engineering tasks.

```mermaid
flowchart TD
    A["/direct request"] --> B[Check git status]
    B --> C[Explore relevant files only]
    C --> D["Explain current behavior / root cause"]
    D --> E[Plan: scope + risk + architecture impact + validation]
    E --> F{Definition of Ready met?}
    F -->|No| G["Clarify / investigate / escalate"]
    G --> E
    F -->|Yes| H{Still Direct Mode?}
    H -->|No| I[Recommend Spec Kit]
    H -->|Yes| J{Approval required?}
    J -->|Yes| K[Ask scoped approval]
    K --> L{Approved?}
    L -->|No| M[Stop or revise scope]
    L -->|Yes| N[Implement approved scope only]
    J -->|No| N
    N --> O[Run targeted validation]
    O --> P[Self-review diff]
    P --> Q{Must-fix issues?}
    Q -->|Yes| N
    Q -->|No| R[Final summary]
```

## Debug Failure Flow

Use when there is concrete failing test/build/typecheck/lint/runtime output.

```mermaid
flowchart TD
    A["/debug-failure + failure output"] --> B[Check git status]
    B --> C[Inspect smallest relevant files]
    C --> D[Classify failure cause]
    D --> E{Cause?}
    E -->|Implementation bug| F[Fix implementation]
    E -->|Test bug / outdated expectation| G[Explain test issue]
    E -->|Config / environment| H["Report setup/config fix"]
    E -->|Unclear expected behavior| I[Ask human confirmation]
    G --> J{Change test?}
    J -->|Yes, justified| K[Preserve test intent]
    J -->|No| F
    F --> L[Re-run failing command]
    K --> L
    H --> L
    L --> M[Summarize root cause, fix, validation]
```

Test safety rule: do not delete, skip, weaken, broaden assertions, over-mock, or update snapshots blindly just to make failures pass.

## Spec-Driven Flow

Use for non-trivial, high-risk, multi-step, architecture-sensitive, or acceptance-criteria-driven work.

```mermaid
flowchart TD
    A[Clear non-trivial requirement] --> B{Constitution exists?}
    B -->|No| C["/speckit.constitution"]
    B -->|Yes| D["/speckit.specify"]
    C --> D
    D --> E["/speckit.clarify + checklist"]
    E --> F["/spec-review"]
    F --> G{Spec quality?}
    G -->|Major gaps / Blocked| D
    G -->|Ready / Minor gaps| H["/speckit.plan"]
    H --> I["/spec-plan-review"]
    I --> J{Plan quality?}
    J -->|Major gaps / Blocked| H
    J -->|Ready / Minor gaps| K["/speckit.tasks"]
    K --> L["/spec-task-review"]
    L --> M{Tasks ready?}
    M -->|No| K
    M -->|Yes| N["/speckit.analyze"]
    N --> O{Artifacts aligned?}
    O -->|No| P["Refine spec / plan / tasks"]
    P --> N
    O -->|Yes| Q[Task-by-task implementation]
```

## Spec Task Implementation Loop

Use `/spec-implement-task` for exactly one task at a time.

```mermaid
flowchart TD
    A[Select one task] --> B[Read constitution + spec + plan + tasks]
    B --> C[Locate selected task]
    C --> D[Summarize task scope]
    D --> E[Explore relevant files only]
    E --> F[Classify risk + architecture impact]
    F --> G{Definition of Ready met?}
    G -->|No| H["Clarify / split task / refine artifacts"]
    H --> D
    G -->|Yes| I[Propose scoped task plan]
    I --> J{Approval required?}
    J -->|Yes| K[Ask scoped approval]
    K --> L{Approved?}
    L -->|No| M[Stop or revise]
    L -->|Yes| N[Implement selected task only]
    J -->|No| N
    N --> O[Add/update task-required tests]
    O --> P[Run targeted validation]
    P --> Q["Self-review against spec/plan/task/constitution"]
    Q --> R{Definition of Done met?}
    R -->|No| S[Fix within task scope or report blocker]
    S --> P
    R -->|Yes| T[Provide completion evidence]
    T --> U{Can mark task complete?}
    U -->|Yes| V[Update selected task status only]
    U -->|No| W["Report missing evidence/blocker"]
    V --> X[Final summary]
    W --> X
```

## Spec Resume / Close Flow

Use `/spec-status` to resume. Use `/spec-close` to pause, hand off, or prepare PR information.

```mermaid
flowchart TD
    A[Spec work in progress] --> B{Need status or handoff?}
    B -->|Resume/check progress| C["/spec-status"]
    C --> D[Read artifacts + git status]
    D --> E["Report completed/in-progress/remaining tasks"]
    E --> F["Recommend next task/command"]
    B -->|Pause/end session| G["/spec-close"]
    G --> H[Summarize tasks, decisions, validation, risks]
    H --> I{Persist session notes?}
    I -->|No| J[Summary only]
    I -->|Yes, approved| K[Update/create session summary using template]
```

## Review / PR Flow

Use review commands when no implementation should happen by default.

```mermaid
flowchart TD
    A[Current diff or PR prep] --> B["/review-diff"]
    B --> C["Must fix / Should fix / Optional"]
    C --> D{Must-fix issues?}
    D -->|Yes| E["Use /direct or /spec-implement-task for scoped fixes"]
    D -->|No| F[PR-ready summary or close session]
    F --> G["/close-session or /spec-close"]
```

## Command Edit Capability

| Category               | Commands                                                                                                                                                                 | Edit behavior                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Read-only / advisory   | `/workflow-router`, `/repo-onboarding`, `/explain-code`, `/review-diff`, `/spec-review`, `/spec-plan-review`, `/spec-task-review`, `/spec-status`, Product Mode commands | No edits unless user explicitly asks to persist/apply something.                    |
| Implementation-capable | `/direct`, `/debug-failure`, `/spec-implement-task`                                                                                                                      | May edit only after exploration, readiness checks, approval rules, and scoped plan. |
| Session / handoff      | `/close-session`, `/spec-close`                                                                                                                                          | Summary-only by default; persistence requires explicit approval.                    |

## Core Guardrails

- Check `git status --short` before editing.
- Treat existing modified/untracked files as user work.
- Prefer read-only inspection before mutation.
- Use the smallest safe plan.
- Classify risk: Low / Medium / High.
- Classify architecture impact: None / Low / Significant.
- Run targeted validation and report actual results.
- Do not mark Spec Kit tasks complete without completion evidence.
- Do not persist session notes without explicit approval.
