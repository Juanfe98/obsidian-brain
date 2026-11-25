---
description: "Complete audit checklist (22 checks) with severity ratings, pass/fail criteria, and examples for each quality check applied to Jira tickets. Checks are thorough enough that a passing ticket can be implemented by a Claude agent without further clarification."
---

# Audit Checks Reference

Each check has a severity, a description of what it verifies, and criteria for pass/fail. Apply all checks to every ticket unless noted otherwise (some checks are type-specific). Each check also has a slug (lowercase, hyphenated) used in config files and session state.

The goal: if every check passes, a Claude Code agent given only the ticket contents and access to the codebase can implement the work without asking clarifying questions.

## Severity Levels

| Severity | Meaning | Action |
|----------|---------|--------|
| **Critical** | Ticket cannot be worked without this | Must resolve before development starts |
| **High** | Significant risk of rework or miscommunication | Should resolve before sprint commitment |
| **Medium** | Reduces clarity but work could proceed | Resolve when convenient |
| **Low** | Nice-to-have for consistency and traceability | Address during grooming |

---

## Critical Checks

### 1. Missing Acceptance Criteria

**Severity**: Critical
**Slug**: `missing-ac`
**Applies to**: Story, Task, Bug

A ticket without acceptance criteria cannot be verified as complete. Developers don't know when they're done, and QA can't write tests.

**Pass**: The ticket has explicit, testable conditions for completion — either in a dedicated "Acceptance Criteria" section of the description, in a custom field, or clearly delineated in the body.

**Fail**: No acceptance criteria found, or criteria are just a restatement of the summary (e.g., "The feature works as expected").

**Resolution**: Draft specific, testable criteria based on the ticket summary, description, and any linked context. Format as a bulleted list in Jira markup.

---

### 2. Missing or Inadequate Description

**Severity**: Critical
**Slug**: `missing-description`
**Applies to**: Story, Task, Bug

A one-line or empty description forces developers to hunt for context elsewhere.

**Pass**: Description provides enough context for someone unfamiliar with the work to understand what needs to be done, why, and any constraints. For bugs: includes reproduction steps.

**Fail**:
- Description is empty
- Description is fewer than 2 sentences and doesn't link to external documentation
- Description is just a copy of the summary
- For bugs: no reproduction steps

**Resolution**: Draft a fuller description incorporating context from the summary, linked tickets, and any apparent intent. Ask the user to confirm or expand.

---

### 3. No Technical Context

**Severity**: Critical
**Slug**: `no-technical-context`
**Applies to**: Story, Task

An implementing agent needs to know where in the codebase to work. Without a pointer to the relevant service, module, or area, the agent either guesses wrong or wastes significant time exploring.

**Pass**: The ticket identifies at least one of:
- A service, module, or component name (e.g., "auth service", "notification-worker")
- A file path or directory (e.g., "`src/services/notifications/`")
- A repository name (if multi-repo)
- An architectural layer (e.g., "API gateway", "database migration", "React frontend")

**Fail**: The ticket describes what to build but gives no indication of where it lives in the codebase. Generic references like "the backend" or "the app" don't count.

**Resolution**: Based on the ticket summary and description, suggest the likely area of the codebase. If the project has components configured in Jira, recommend setting one. Ask the user to confirm or specify the correct location.

---

## High Checks

### 4. No Story Point Estimate

**Severity**: High
**Slug**: `no-estimate`
**Applies to**: Story, Task, Spike

Unestimated tickets make sprint planning unreliable and velocity tracking meaningless.

**Pass**: Story points field (or equivalent custom field) has a value > 0.

**Fail**: Story points are null, 0, or the field is absent.

**Resolution**: Suggest an estimate based on the apparent complexity, noting that the team should confirm during planning. Flag it rather than auto-assigning.

---

### 5. Missing Test Plan

**Severity**: High
**Slug**: `no-test-plan`
**Applies to**: Story, Task, Bug

No testing notes means QA has to reverse-engineer what to verify, and an implementing agent won't know what test cases to write.

**Pass**: Ticket includes a "Test Plan", "Testing Notes", "QA Notes" section or field — or acceptance criteria are written in a testable format with clear verification steps.

**Fail**: No mention of how to verify the work, and acceptance criteria (if present) aren't written as testable assertions.

**Resolution**: Draft testing notes that cover the happy path, key edge cases, and any regression concerns. Use a numbered list so QA can follow it step-by-step.

---

### 6. Vague or Overly Broad Title

**Severity**: High
**Slug**: `vague-title`
**Applies to**: All types

Titles like "API changes" or "Fix bug" provide no signal in sprint boards or search results.

**Pass**: Summary is specific enough to distinguish this ticket from others. Includes the component or area and the action being taken.

**Fail**:
- Fewer than 4 words
- Entirely generic (e.g., "Update code", "Fix issue", "Changes needed")
- So broad it could apply to dozens of tickets (e.g., "Backend improvements")

**Resolution**: Suggest a more specific title based on the description content. Preserve the user's intent but add specificity.

---

### 7. No Assignee (Sprint tickets only)

**Severity**: High
**Slug**: `no-assignee`
**Applies to**: All types, only in Sprint mode

Tickets in a sprint without an assignee risk being orphaned during the sprint.

**Pass**: Assignee field is populated.

**Fail**: Assignee is empty/unassigned for a ticket in an active or upcoming sprint.

**Resolution**: Flag for the user. Don't suggest an assignee — that's a team decision.

---

### 8. No Scope Boundaries

**Severity**: High
**Slug**: `no-scope-boundaries`
**Applies to**: Story, Task

Without explicit scope constraints, an implementing agent will over-build. "Add authentication" could mean a full OAuth2 flow or a simple token check — without boundaries, the agent picks the most complete interpretation.

**Pass**: The ticket includes at least one of:
- An explicit "Out of scope" or "Not included" list
- Constraining language that limits the work (e.g., "only for the REST API, not GraphQL", "single-tenant only for now")
- A clear statement of the minimal viable implementation

**Fail**: The ticket describes a feature or change with no indication of where to stop. This is especially problematic for tickets that could reasonably be interpreted at multiple levels of ambition.

**Resolution**: Based on the ticket description and typical team patterns, suggest scope boundaries. Frame as "In scope" / "Out of scope" sections. Ask the user to confirm or adjust.

---

### 9. Missing API or Interface Contract

**Severity**: High
**Slug**: `missing-api-contract`
**Applies to**: Story, Task (only when the ticket involves integration, API work, or cross-service communication)

An implementing agent can't build a client without knowing the server's contract, and can't build an endpoint without knowing what consumers expect.

**Pass**: For tickets involving APIs or integrations, the ticket specifies at least:
- Endpoint paths or method signatures
- Request/response shapes (even informal: "takes a user ID, returns a list of orders")
- Expected status codes or error responses

For non-API tickets, this check is N/A.

**Fail**: The ticket mentions integration with another service, API, or system but provides no contract details — just "integrate with the payment service" or "call the notification API."

**Resolution**: If the external API exists, reference its documentation. If the ticket is defining a new API, draft the contract based on the described behavior. Present for confirmation.

---

### 10. No Design or UI Reference

**Severity**: High
**Slug**: `no-design-reference`
**Applies to**: Story, Task (only when the ticket involves user-facing UI changes)

An implementing agent cannot produce correct UI from vague descriptions. Without a visual reference or detailed behavioral specification, the result will be a guess.

**Pass**: For tickets involving UI, the ticket includes at least one of:
- A link to a mockup, wireframe, or design file (Figma, Sketch, etc.)
- A screenshot of the desired state or a similar existing UI to reference
- A detailed behavioral description of the UI (layout, interactions, states, responsive behavior)

For non-UI tickets, this check is N/A.

**Fail**: The ticket involves UI work but only says things like "add a settings page" or "make it look good" without specifying layout, content, or behavior.

**Resolution**: Ask whether a design exists that should be linked. If not, help the user articulate the UI requirements: what elements appear, how they're arranged, what interactions are supported, and what states exist (empty, loading, error, populated).

---

## Medium Checks

### 11. Missing Components or Labels

**Severity**: Medium
**Slug**: `components-labels`
**Applies to**: All types

Components and labels enable filtering, reporting, and team routing. Tickets without them get lost in large backlogs.

**Pass**: At least one component OR at least one label is set.

**Fail**: Both components and labels are empty.

**Resolution**: Suggest relevant components/labels based on the ticket content and what exists in the project. Show the suggestion and ask for confirmation.

---

### 12. No Linked Dependencies

**Severity**: Medium
**Slug**: `no-dependencies`
**Applies to**: Story, Task

Tickets that depend on or block other work should be explicitly linked so planning accounts for ordering.

**Pass**: The ticket either has dependency links OR explicitly states "no dependencies" in its description.

**Fail**: No inward or outward links of type "blocks", "is blocked by", "depends on", or "is depended on by" — and no explicit statement of independence. Only flag this if the ticket's description implies dependencies (mentions other features, APIs, or tickets).

**Resolution**: If the description mentions related work, suggest creating links. If unclear, ask whether the ticket has dependencies.

---

### 13. Missing Priority

**Severity**: Medium
**Slug**: `missing-priority`
**Applies to**: All types

Tickets with no priority (or default "Medium" that was never explicitly set) make it hard to triage.

**Pass**: Priority is set to something other than the Jira default, OR the ticket is explicitly triaged.

**Fail**: Priority appears to be the Jira default and the ticket has never been moved through a triage workflow. (This is hard to detect definitively — flag only when priority is the default AND the ticket lacks other signs of grooming like estimates or AC.)

**Resolution**: Ask the user what priority is appropriate. Don't guess.

---

### 14. Stale Ticket

**Severity**: Medium
**Slug**: `stale-ticket`
**Applies to**: All types

Stale tickets waste planning capacity and clutter backlogs. The definition of "stale" differs by mode.

**Sprint mode** — a ticket in an active sprint that hasn't been updated in N days may be stuck, blocked, or abandoned.

**Pass**: Ticket was updated (status change, comment, or field edit) within the threshold (default: 5 days, configurable via `stale_days`).

**Fail**: Last update exceeds the threshold and the ticket is not in a "Done" status.

**Project mode** — a ticket in the backlog that hasn't been touched in months, or that references dead infrastructure, is likely abandoned.

**Pass**: Ticket was updated within the threshold (default: 6 months, configurable via `stale_months_backlog`) AND does not exhibit deep staleness signals.

**Fail** (any of the following):
- Last update exceeds the `stale_months_backlog` threshold
- Ticket contains URLs to archived or unreachable domains (old GitHub Enterprise instances, shutdown services)
- Ticket references repos that have been archived or renamed
- Ticket links to Slack/Teams threads older than 6 months (context has likely rotted)
- Ticket has a "CLONE" prefix but was never differentiated from the original (likely an orphaned duplicate)
- Ticket mentions tools or services the team no longer uses

**Resolution**:
- Sprint mode: Flag for attention. Suggest the user check whether the ticket is blocked, should be removed from the sprint, or needs reassignment.
- Project mode: Present as a "Potentially Stale" list with the staleness signal for each ticket. Recommend the user review with the team to close, update, or confirm still relevant.

---

### 15. No Error Handling Requirements

**Severity**: Medium
**Slug**: `no-error-handling`
**Applies to**: Story, Task

Without explicit error handling expectations, an implementing agent defaults to generic behavior that may not match team standards — swallowing errors, showing wrong HTTP codes, or retrying when it shouldn't.

**Pass**: The ticket specifies how failures should be handled for at least the primary failure modes:
- What to show the user on error (toast, error page, inline message)
- HTTP status codes for API errors
- Retry/fallback behavior
- Logging expectations

**Fail**: The ticket describes happy-path behavior but says nothing about what happens when things go wrong — and the feature has obvious failure modes (network calls, user input validation, external service integration).

**Resolution**: Identify the likely failure modes based on the ticket description and suggest error handling for each. Frame as: "When X fails, the system should Y." Ask the user to confirm.

---

### 16. Missing Affected Files or Areas

**Severity**: Medium
**Slug**: `missing-affected-files`
**Applies to**: Story, Task

Even a rough pointer to the relevant files or directories saves an implementing agent from exploring the entire codebase. This is distinct from check 3 (Technical Context) — that check ensures the service/module is named; this one asks for more specific file-level guidance.

**Pass**: The ticket mentions specific files, directories, or patterns to modify — or the codebase area is unambiguous from the component/service name (small services with obvious structure).

**Fail**: The ticket identifies a service (passing check 3) but that service is large or complex, and no further guidance narrows down which files are involved.

**Resolution**: If you can infer likely files from the description and known project structure, suggest them. Otherwise, ask the user to list the key files or directories that will be touched.

---

### 17. No Edge Cases Identified

**Severity**: Medium
**Slug**: `no-edge-cases`
**Applies to**: Story, Task, Bug

Agents handle happy paths well but miss edge cases without guidance. Explicitly listing known edge cases prevents incomplete implementations.

**Pass**: The ticket mentions at least one edge case, boundary condition, or "what about" scenario — either in the description, acceptance criteria, or test plan. Examples: "handle empty list", "timeout after 30s", "max 100 items", "works when user has no profile photo."

**Fail**: The ticket describes only the happy path with no mention of boundary conditions, empty states, concurrent access, rate limits, or null/missing data scenarios — and the feature obviously has them.

**Resolution**: Based on the feature described, suggest likely edge cases. Present as a bulleted list for the user to confirm, modify, or extend. Add confirmed edge cases to the acceptance criteria.

---

### 18. Missing Environment or Config Requirements

**Severity**: Medium
**Slug**: `missing-env-config`
**Applies to**: Story, Task

If a feature requires new environment variables, feature flags, config entries, or infrastructure changes, an implementing agent won't know to create them unless told.

**Pass**: Either:
- The ticket lists any new config/env vars/feature flags needed
- The ticket explicitly states no new configuration is required
- The feature clearly doesn't need any (pure refactor, UI-only change with no new toggles)

**Fail**: The ticket introduces behavior that likely needs runtime configuration (new service integrations, toggleable features, environment-specific behavior) but doesn't mention what config is needed.

**Resolution**: Identify likely configuration needs (API keys, feature flags, timeout values, URLs) and suggest them. Ask the user to confirm names, default values, and which environments need them.

---

## Low Checks

### 19. Missing Sub-tasks (for large stories)

**Severity**: Low
**Slug**: `sub-tasks`
**Applies to**: Story with estimate >= 5 points

Large stories benefit from being broken into sub-tasks for progress tracking.

**Pass**: The ticket has sub-tasks, OR its estimate is < 5 points.

**Fail**: Estimate is >= 5 points and there are no sub-tasks.

**Resolution**: Suggest breaking the story into sub-tasks based on the description and acceptance criteria. Present as a proposal for the user to refine.

---

### 20. No Epic Link

**Severity**: Low
**Slug**: `epic-link`
**Applies to**: Story, Task

Tickets without an epic link are harder to track in roadmap views and release planning.

**Pass**: The ticket is linked to an epic (via Epic Link field or parent).

**Fail**: No epic association.

**Resolution**: If the project has a small number of active epics, suggest the most likely one. Otherwise, flag for the user to assign.

---

### 21. Duplicate or Near-Duplicate Tickets

**Severity**: Low
**Slug**: `duplicates`
**Applies to**: All types, Project and Sprint mode

Multiple tickets with very similar summaries or descriptions create confusion about what's actually in scope.

**Pass**: No other ticket in the same project has a substantially similar summary (> 80% word overlap after removing stop words).

**Fail**: Another open ticket has a very similar summary.

**Resolution**: Present the potential duplicate pair and ask the user whether they should be merged, linked, or are legitimately distinct.

---

### 22. Bug: Missing Reproduction Details

**Severity**: High
**Slug**: `missing-repro-details`
**Applies to**: Bug only

A bug without clear reproduction steps forces an implementing agent to guess at the failure scenario, making it impossible to verify a fix. This check specifically targets bug tickets (complementing check 2's general description requirement).

**Pass**: The bug ticket includes all four of:
- **Steps to reproduce**: A numbered sequence that reliably triggers the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What happens instead (including error messages, screenshots, or logs)
- **Environment**: Browser/OS/version, deployment environment (staging/prod), or relevant configuration

**Fail**:
- Missing any of the four elements above
- Steps are too vague to follow (e.g., "use the app and it breaks")
- "Expected" and "actual" are not clearly distinguished
- Environment info is absent when the bug could be environment-specific

**Resolution**: Draft a structured reproduction template and fill in what can be inferred from the description. For missing details, ask specific questions:
- "Can you provide the exact steps to trigger this?"
- "Which environment did this occur in?"
- "What error message or unexpected behavior did you see?"

Present as a formatted Jira markup block:

```
h3. Steps to Reproduce
# Navigate to ...
# Click ...
# Observe ...

h3. Expected Behavior
...

h3. Actual Behavior
...

h3. Environment
* Browser: ...
* OS: ...
* Environment: ...
```

---

## Check Applicability Matrix

| # | Check | Story | Task | Bug | Spike | Sub-task | Epic |
|---|-------|-------|------|-----|-------|----------|------|
| 1 | Acceptance Criteria | Yes | Yes | Yes | No | No | No |
| 2 | Description | Yes | Yes | Yes | Yes | Partial | Yes |
| 3 | Technical Context | Yes | Yes | No | No | No | No |
| 4 | Story Points | Yes | Yes | No | Yes | No | No |
| 5 | Test Plan | Yes | Yes | Yes | No | No | No |
| 6 | Vague Title | Yes | Yes | Yes | Yes | Yes | Yes |
| 7 | No Assignee (sprint) | Yes | Yes | Yes | Yes | Yes | No |
| 8 | Scope Boundaries | Yes | Yes | No | Yes | No | No |
| 9 | API/Interface Contract | If API | If API | No | No | No | No |
| 10 | Design/UI Reference | If UI | If UI | No | No | No | No |
| 11 | Components/Labels | Yes | Yes | Yes | Yes | No | Yes |
| 12 | Dependencies | Yes | Yes | No | No | No | No |
| 13 | Priority | Yes | Yes | Yes | Yes | No | No |
| 14 | Stale Ticket | Yes | Yes | Yes | Yes | Yes | No |
| 15 | Error Handling | Yes | Yes | No | No | No | No |
| 16 | Affected Files/Areas | Yes | Yes | No | No | No | No |
| 17 | Edge Cases | Yes | Yes | Yes | No | No | No |
| 18 | Environment/Config | Yes | Yes | No | No | No | No |
| 19 | Sub-tasks (large) | Yes | No | No | No | No | No |
| 20 | Epic Link | Yes | Yes | No | No | No | N/A |
| 21 | Duplicates | Yes | Yes | Yes | Yes | No | No |
| 22 | Reproduction Details | No | No | Yes | No | No | No |

## Spike Tickets

Spikes are time-boxed research or investigation tasks. Their output is knowledge (a recommendation, a proof-of-concept, or a decision document) rather than production code. Because of this, many implementation-focused checks don't apply.

**Applicable checks for Spikes**: Description, Story Points, Vague Title, No Assignee (sprint), Scope Boundaries, Components/Labels, Priority, Stale (sprint), Duplicates.

**Why these specific checks:**
- **Description** — a spike still needs to articulate what question it's answering
- **Story Points** — spikes should be time-boxed; an estimate enforces this
- **Scope Boundaries** — critical for spikes because unbounded research never finishes. The boundaries define what "done" looks like (e.g., "produce a recommendation doc comparing options A and B" vs open-ended exploration)
- **Vague Title** — "Spike" alone is meaningless; the title should state the question being investigated

**Not applicable**: Acceptance Criteria (the output is a decision, not testable behavior), Test Plan, Technical Context, API Contract, Error Handling, Edge Cases, Environment/Config, Sub-tasks, Epic Link, Dependencies, Affected Files.
