# Spec Review

Review the current Spec Kit feature specification before technical planning.

## Purpose

Use this command after `/speckit.specify` and before `/speckit.plan`.

The goal is to verify that the feature spec is clear, complete, product-focused, and aligned with the project constitution.

## Workflow

1. Locate the active Spec Kit feature folder.
2. Read `.specify/memory/constitution.md` if it exists.
3. Read the feature `spec.md`.
4. Review the spec as a senior software engineer/product-minded engineer.
5. Do not edit files unless explicitly asked.

## Review Focus

Check whether the spec clearly defines:

- User problem
- User goals
- Functional requirements
- Acceptance criteria
- UX states
- Edge cases
- Out-of-scope items
- Assumptions
- Dependencies
- Accessibility expectations, if UI is involved
- Error/loading/empty states, if applicable

## Red Flags

Call out:

- vague requirements
- missing acceptance criteria
- unclear user behavior
- implementation details that belong in the plan
- missing edge cases
- missing out-of-scope boundaries
- conflicts with the constitution
- requirements that are too broad for one feature

## Output

Return:

1. Spec readiness verdict: Ready / Needs refinement
2. Missing or unclear requirements
3. Suggested refinements
4. Questions for the human
5. Whether it is safe to proceed to `/speckit.plan`
