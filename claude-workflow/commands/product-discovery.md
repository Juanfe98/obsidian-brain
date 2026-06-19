# Product Discovery

Create a discovery plan to validate whether a product problem is real before building.

Use this after `/product-idea` or whenever the user needs to test assumptions through interviews, research, prototypes, landing pages, or concierge/manual validation.

## Workflow

1. Read the product hypothesis or user-provided idea.
2. Identify the riskiest assumptions.
3. Rank assumptions by how fatal they are if false.
4. Propose discovery methods for each assumption.
5. Draft interview questions or research tasks.
6. Define evidence that would validate or invalidate the idea.
7. Define a lightweight decision checkpoint: proceed, pivot, or stop.
8. Do not design the full solution yet.

## Discovery Rules

- Validate the problem before validating the solution.
- Do not ask leading questions like "Would you use this app?".
- Ask about past behavior: "Tell me about the last time this happened.".
- Prefer evidence of pain, frequency, existing workaround, cost, urgency, and willingness to change.
- Separate interview findings from opinions and assumptions.

## Output

Return a Discovery Plan:

1. Assumptions to validate
2. Recommended validation methods
3. Interview/research questions
4. Target participants or research sources
5. Evidence to collect
6. Success/kill criteria
7. Timeline or next actions
8. Recommended next step

## Optional Persistence

If the user asks to save the result, create or update:

```txt
product/discovery-plan.md
product/discovery-notes.md
```

Ask before creating files unless the user explicitly requested persistence.
