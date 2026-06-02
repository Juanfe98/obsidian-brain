# Spec Plan Review

Review the technical implementation plan before generating tasks.

## Purpose

Use this command after `/speckit.plan` and before `/speckit.tasks`.

The goal is to verify that the plan is technically sound, scoped, realistic, and aligned with the spec, constitution, and existing project patterns.

## Workflow

1. Locate the active Spec Kit feature folder.
2. Read `.specify/memory/constitution.md` if it exists.
3. Read the feature `spec.md`.
4. Read the feature `plan.md`.
5. Inspect relevant project files only if needed to validate the plan.
6. Do not edit files unless explicitly asked.

## Review Focus

Check:

- alignment with the spec
- alignment with the constitution
- consistency with existing project architecture
- impacted files/modules
- data flow
- state ownership
- API or contract changes
- testing strategy
- validation strategy
- accessibility concerns, if UI is involved
- performance concerns
- security/privacy concerns
- dependency or tooling changes
- migration or rollout risks

## Risk Classification

Classify the plan risk:

- Low: localized, reversible, clear behavior, no public contract changes, targeted validation available
- Medium: multiple files, user-facing behavior, moderate integration risk, non-trivial tests, or meaningful state/data-flow changes
- High: public APIs/contracts, schemas, data models, migrations, security/privacy, permissions, dependencies, CI/CD, architecture, broad refactors, or unclear requirements

Use the risk level to decide whether the plan is safe to turn into tasks, needs refinement, or should be split into smaller specs.

## Architecture Decision Checkpoint

Classify architecture impact:

- None: follows existing patterns and does not change boundaries, ownership, contracts, dependencies, or data flow
- Low: small extension of an existing pattern with no new architectural direction
- Significant: introduces or changes abstractions, module boundaries, state ownership, data flow, public APIs/contracts, schemas, dependencies, tooling, migrations, or cross-cutting behavior

Check whether the plan:

- introduces new abstractions, layers, services, helper patterns, or framework usage
- changes state ownership, data flow, persistence, or responsibility boundaries
- changes public APIs, schemas, contracts, data models, or migrations
- adds dependencies, tooling, generated files, CI/CD, or configuration changes
- mixes feature work with refactoring or architectural cleanup
- diverges from existing project conventions

If architecture impact is significant, verify that the decision is explicit, justified, aligned with the spec/constitution, and approved before proceeding to tasks.

## Quality Score

Assign one quality score:

- Ready: safe to proceed to task generation; the plan is aligned, scoped, realistic, and has sufficient validation strategy.
- Minor gaps: mostly safe to proceed, but small non-blocking refinements are recommended.
- Major gaps: do not proceed yet; important technical, validation, risk, architecture, or scope issues need refinement.
- Blocked: cannot proceed until a missing artifact, conflicting plan/spec detail, constitution issue, or human decision is resolved.

Use the quality score to make the proceed/refine/split decision explicit.

## Red Flags

Call out:

- over-engineering
- unnecessary new abstractions
- unnecessary dependencies
- unclear data flow
- missing test strategy
- risky public API/contract changes
- large refactors mixed with feature work
- implementation approach that ignores existing patterns
- plan items that should be split into separate specs

## Output

Return:

1. Plan readiness verdict: Ready / Needs refinement
2. Quality score: Ready / Minor gaps / Major gaps / Blocked
3. Risk level: Low / Medium / High
4. Architecture impact: None / Low / Significant
5. Main risks
6. Suggested plan improvements
7. Over-engineered or unnecessary parts
8. Missing validation/testing details
9. Whether it is safe to proceed to `/speckit.tasks`
