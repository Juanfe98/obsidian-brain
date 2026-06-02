# Claude Code Product Mode Workflow

## Purpose

Product Mode turns a vague idea into an MVP-ready product definition before engineering starts.

Use Product Mode when you have:

- a raw idea
- an unclear target user
- an unclear problem
- uncertainty about MVP scope
- assumptions that need validation
- a product concept that is not ready for Spec Kit

Do not use Product Mode for small code changes. Use Direct Mode for those.

---

## High-Level Philosophy

Engineering asks:

```txt
How should we build this correctly?
```

Product asks first:

```txt
Should this exist?
For whom?
What problem does it solve?
What is the smallest version that proves value?
How will we know it worked?
```

Product Mode exists to prevent building too much too early.

---

## Workflow

```txt
Idea
→ Product Hypothesis
→ Discovery Plan
→ MVP Product Brief
→ MVP Requirements
→ Spec Kit
→ Engineering Execution
```

---

## Commands

### `/product-idea`

Frames a raw idea into a Product Hypothesis.

Output:

- raw idea
- target user
- problem statement
- current alternatives
- value proposition
- riskiest assumptions
- MVP direction
- open questions

### `/product-discovery`

Creates a plan to validate the problem and assumptions before building.

Output:

- assumptions to validate
- validation methods
- interview/research questions
- evidence needed
- proceed/pivot/stop criteria

### `/product-brief`

Turns validated discovery or a clear hypothesis into an MVP Product Brief.

Output:

- target user
- problem statement
- Jobs To Be Done
- MVP goal
- in scope
- out of scope
- user journey
- UX states
- success metrics
- risks

### `/product-requirements`

Converts the MVP brief into requirements ready for Spec Kit.

Output:

- functional requirements
- acceptance criteria
- UX states
- edge cases
- analytics / learning signals
- non-goals
- suggested `/speckit.specify` prompt

---

## Product Artifacts

Product Mode may create these files when the user asks to persist them:

```txt
product/product-hypothesis.md
product/discovery-plan.md
product/discovery-notes.md
product/mvp-brief.md
product/mvp-requirements.md
```

Templates live in:

```txt
templates/product-hypothesis.md
templates/discovery-plan.md
templates/mvp-brief.md
templates/mvp-requirements.md
```

---

## Relationship With Existing Modes

```txt
Product Mode:
Should we build it? For whom? What MVP?

Spec-Driven Mode:
What exactly should we build? How should we break it down?

Direct Mode:
How do we safely complete this small task?
```

Decision rule:

```txt
If the idea is vague, use Product Mode.
If the product requirements are clear and non-trivial, use Spec Kit.
If the code change is small and clear, use Direct Mode.
```
