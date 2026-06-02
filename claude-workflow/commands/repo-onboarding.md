# Repo Onboarding

Understand a new or unfamiliar repository from product, domain, architecture, and engineering perspectives before making changes.

## Purpose

Use this command when joining a new repo, returning to an unfamiliar codebase, or needing a broad engineer/product understanding before planning work.

The goal is to answer:

- What problem does this repo solve?
- Who are the users or customers?
- What are the main product/domain workflows?
- How is the system structured technically?
- Where are the important files, risks, and unknowns?
- What should an engineer read or do next?

This command is read-only by default.

Do not use `/repo-onboarding` as a substitute for targeted exploration in Direct or Spec workflows. Use it only when broad repository/product/domain understanding is the user's explicit goal or the repository context itself is the task.

## Workflow

1. Check `git status --short`.
2. Inspect high-signal repository entry points first:
   - `README*`
   - package/build/config files
   - docs
   - app/server entry points
   - routes/controllers/pages
   - tests
   - deployment/config examples, excluding secrets
3. Identify product purpose, target users, and the problem being solved from available evidence.
4. Map key domain concepts, business rules, roles, and user journeys.
5. Map the technical stack, architecture, module boundaries, and important directories.
6. Trace the most important data/request/user flows at a high level.
7. Identify integrations, persistence, auth, deployment, and operational concerns when visible.
8. Identify testing strategy and validation commands from repository evidence.
9. Separate facts from assumptions and unknowns.
10. Identify risks, confusing areas, hotspots, and likely onboarding gaps.
11. Recommend next files to read and next workflow command if work is requested.
12. Optionally suggest repo-specific `CLAUDE.md` additions, but do not write them unless explicitly asked.

## Review Focus

### Product and domain

- product purpose
- target users/customers
- core problem and value proposition
- main workflows or user journeys
- domain entities and vocabulary
- business rules and important edge cases
- success/failure states that affect user trust

### Engineering

- tech stack and package manager
- app entry points
- key modules/directories
- architecture and boundaries
- state/data ownership
- APIs/contracts/schemas, if visible
- persistence and integrations
- auth/security/privacy concerns
- tests and validation strategy
- deployment/configuration signals

## Output

Return:

1. Repository/product summary
2. Target users or customers
3. Problem solved and value proposition
4. Main workflows / user journeys
5. Domain concepts and business rules
6. Tech stack and runtime
7. Architecture overview
8. Important directories and files
9. Key data/request/user flows
10. Testing and validation strategy
11. Integrations, deployment, and operational notes
12. Risks, unknowns, and assumptions
13. Recommended next reading
14. Suggested next workflow command
15. Optional repo-specific `CLAUDE.md` suggestions

## Rules

- Do not edit files.
- Do not recommend or run this command just because Claude lacks local context for a normal implementation task.
- Do not use this command as a substitute for targeted file inspection in `/direct` or `/spec-implement-task`.
- Do not create diagrams, summaries, or repo-specific `CLAUDE.md` files unless explicitly asked.
- Do not inspect secrets or environment values.
- Treat discovered product/domain conclusions as evidence-based; label uncertain conclusions as assumptions.
- Prefer high-signal files over exhaustive repository traversal.
- If the repo is too large, summarize the first pass and recommend focused follow-up areas.
