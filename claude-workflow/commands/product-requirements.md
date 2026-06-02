# MVP Product Requirements

Convert an MVP product brief into product requirements that are ready for Spec Kit or engineering planning.

Use this after `/product-brief` when the product direction is clear enough to define acceptance criteria.

## Workflow

1. Read the MVP brief or user-provided context.
2. Extract functional requirements.
3. Define acceptance criteria for each requirement.
4. Define UX states and edge cases.
5. Define analytics or learning signals if relevant.
6. Define non-goals and scope boundaries.
7. Identify unresolved product questions.
8. Recommend whether to proceed to Spec Kit.
9. Do not implement code.

## Requirements Rules

- Requirements describe user behavior and product outcomes, not implementation details.
- Acceptance criteria should be testable.
- Include edge cases that affect user trust, correctness, or the MVP learning goal.
- Keep non-goals explicit to prevent scope creep.
- If requirements are ambiguous, ask questions instead of inventing product decisions.

## Product → Spec Handoff Checklist

The requirements are ready for Spec Kit only when:

- target user is clear
- problem statement is clear
- MVP goal is clear
- functional requirements are testable
- acceptance criteria are defined for each important requirement
- UX states are defined, including empty, loading, error, success, first-use, and repeat-use when relevant
- edge cases that affect trust, correctness, or learning goals are defined
- non-goals and out-of-scope behavior are explicit
- success metrics or learning signals are identified
- unresolved product questions are listed
- suggested `/speckit.specify` prompt is included when ready

If any required handoff item is missing, do not recommend proceeding to Spec Kit yet. Ask focused questions or recommend returning to `/product-discovery` or `/product-brief`.

## Output

Return MVP Requirements:

1. Product context
2. Functional requirements
3. Acceptance criteria
4. UX states
5. Edge cases
6. Analytics / learning signals
7. Non-goals
8. Open questions
9. Product → Spec handoff checklist result
10. Readiness verdict: Ready for `/speckit.specify` / Needs refinement
11. Suggested `/speckit.specify` prompt, if ready

## Optional Persistence

If the user asks to save the result, create or update:

```txt
product/mvp-requirements.md
```

Ask before creating files unless the user explicitly requested persistence.
