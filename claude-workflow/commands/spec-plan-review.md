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
2. Main risks
3. Suggested plan improvements
4. Over-engineered or unnecessary parts
5. Missing validation/testing details
6. Whether it is safe to proceed to `/speckit.tasks`
