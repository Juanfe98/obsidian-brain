---
name: jira-audit
version: "1.1.4"
author: John Jenkins
description: >
  Audit Jira projects, sprints, or individual tickets for quality and
  agent-implementability. Checks 22 quality dimensions so that passing tickets can
  be implemented by a Claude agent without further clarification. Produces a
  severity-rated report with readiness score and offers interactive resolution.
  TRIGGER when: user mentions ticket quality, acceptance criteria, sprint readiness,
  backlog grooming, definition of ready, ticket hygiene; asks to audit or clean up
  Jira tickets/sprints/backlogs; says "check ticket quality", "are these tickets
  ready", "get tickets ready for AI implementation"; asks to resume a previous audit.
roles:
  - product
  - engineer
keywords:
  - jira
  - audit
  - quality
  - acceptance-criteria
  - sprint
  - backlog
  - grooming
  - hygiene
  - definition-of-ready
  - agent-implementable
---

# Skill: Jira Audit

Audit Jira tickets for quality, completeness, and agent-implementability. The goal: if every audit check passes, a Claude Code agent can implement the ticket without asking clarifying questions. Operates in three modes depending on scope, with an optional readiness score and team-configurable checks:

| Mode | Scope | Focus | Report style |
|------|-------|-------|--------------|
| **Project** | All open, unstarted tickets in a project | Backlog hygiene | Grouped by issue type |
| **Sprint** | All tickets in a specific sprint | Sprint readiness | Per-ticket breakdown |
| **Ticket** | Single ticket | Deep quality check | Inline with resolution assistance |

## Prerequisites

This skill depends on the `jira-ticket` skill for all Jira API interactions. If `jira-ticket` is not configured (missing config or token), direct the user to set it up first:

```
The jira-audit skill requires jira-ticket to be configured.
Run: bash <jira-ticket-skill-dir>/scripts/install.sh
```

## Configuration (optional)

Teams can customize audit behavior by placing a `.jira-audit.yaml` file in the project root. If no config file exists, all checks run with default settings.

```yaml
# .jira-audit.yaml
checks:
  disabled:
    - epic-link          # check name (lowercase, hyphenated)
    - components-labels
  severity_overrides:
    stale-ticket: high   # promote from medium to high
    sub-tasks: medium    # promote from low to medium
  thresholds:
    stale_days: 3              # sprint mode: days without update (default: 5)
    stale_months_backlog: 6    # project mode: months without update (default: 6)
    large_story_points: 8      # default: 5
    vague_title_min_words: 5   # default: 4

readiness:
  enabled: true          # include readiness score in reports (default: true)
  weights:               # how much each severity counts against readiness
    critical: 30
    high: 15
    medium: 5
    low: 1

trends:
  enabled: true          # append audit results to .jira-audit-history.json (default: false)
```

At the start of an audit, look for `.jira-audit.yaml` in the working directory. If found, apply:
- **disabled**: Skip these checks entirely (use the check slug from `references/audit-checks.md`)
- **severity_overrides**: Change the severity of a check for this team
- **thresholds**: Override numeric thresholds used in check logic
- **readiness.weights**: Control how much each severity level impacts the readiness score
- **trends.enabled**: Automatically save audit history for trend comparison

## Workflow

### 1. Determine mode and scope

Parse the user's request to identify the audit mode:

- **Project mode**: user mentions a project key or says "audit this project" / "clean up the backlog"
- **Sprint mode**: user mentions a sprint name/number or says "audit this sprint" / "is this sprint ready"
- **Ticket mode**: user provides a specific issue key (e.g., FD-1234)

If ambiguous, ask: "Would you like me to audit the full project backlog, a specific sprint, or a single ticket?"

### 2. Fetch tickets

Use the `jira-ticket` skill to retrieve the relevant tickets. **Always exclude completed tickets** (Done, Closed, Resolved) unless the user explicitly asks for a retroactive audit of finished work. Auditing closed tickets produces noise — flagging missing estimates on work that's already shipped isn't actionable.

**Project mode** — fetch open, unstarted tickets:
```
/jira-ticket -q "project = {KEY} AND status IN ('To Do', 'Open', 'Backlog', 'New') AND assignee IS EMPTY ORDER BY priority DESC, created ASC"
```

**Sprint mode** — fetch non-done tickets in the sprint:
```
/jira-ticket -q "sprint = '{SPRINT_NAME}' AND status NOT IN ('Done', 'Closed', 'Resolved') ORDER BY priority DESC, status ASC"
```

**Label/filter mode** — when the user specifies a label, component, or custom JQL, always append a status exclusion:
```
/jira-ticket -q "project = {KEY} AND labels = '{LABEL}' AND status NOT IN ('Done', 'Closed', 'Resolved') ORDER BY priority DESC, created ASC"
```

**Ticket mode** — fetch the single ticket with full details (no status filter — the user explicitly chose this ticket):
```
/jira-ticket view {ISSUE_KEY}
```

For project, sprint, and label modes, also fetch full details for each ticket (description, acceptance criteria fields, story points, labels, components) since the list view won't include everything needed for the audit.

### 3. Run audit checks

Apply every check from the audit checklist (see `references/audit-checks.md`) to each ticket. Record which checks pass and which fail, along with the severity rating.

### 4. Present results

Keep reports compact. For any check that fails on more than 3 tickets, show the first 3 in a table and then list the remaining ticket keys inline. The user can ask for the full expanded list if needed.

**Project mode** — group findings by issue type (the audit check that failed), showing affected tickets under each:

```markdown
# Project Audit: {PROJECT_KEY}

**Tickets audited**: {count} | **Issues found**: {count} | **Readiness: {score}%**

Breakdown: {critical_count} Critical · {high_count} High · {medium_count} Medium · {low_count} Low

## Critical Issues

### Missing Acceptance Criteria (7 tickets)
| Ticket | Summary | Type |
|--------|---------|------|
| FD-101 | Implement login flow | Story |
| FD-115 | Add password reset | Story |
| FD-120 | API refactor | Task |

+4 more: FD-130, FD-142, FD-155, FD-160

### Missing Description (1 ticket)
| Ticket | Summary | Type |
|--------|---------|------|
| FD-122 | Backend updates | Task |

## Ready for Implementation

Tickets that passed all applicable checks — ready to assign or pull into a sprint.

| Ticket | Summary | Type | Points |
|--------|---------|------|--------|
| FD-102 | Fix header alignment | Bug | 2 |
| FD-108 | Add retry to webhook delivery | Task | 3 |

**Total ready**: 2 tickets · 5 story points available

## High Issues
...

## Medium Issues
...

## Low Issues
...
```

**Sprint mode** — per-ticket breakdown. For sprints with many tickets (10+), show the same compact format: first 3 detailed, then remaining keys. For smaller sprints, show all tickets.

```markdown
# Sprint Audit: {SPRINT_NAME}

**Tickets audited**: {count} | **Issues found**: {count} | **Ready for dev**: {count}/{total} | **Readiness: {score}%**

Breakdown: {critical_count} Critical · {high_count} High · {medium_count} Medium · {low_count} Low

## Ready for Implementation

| Ticket | Summary | Type | Points |
|--------|---------|------|--------|
| FD-102 | Fix header alignment | Bug | 2 |
| FD-107 | Add loading spinner to dashboard | Task | 1 |

**Total ready**: 2 tickets · 3 story points available

## Tickets with Issues (5)

| Ticket | Summary | Issues |
|--------|---------|--------|
| FD-101 | Implement login flow | Missing AC, No estimate |
| FD-103 | Database migration | Vague title, No test plan |
| FD-109 | Update auth module | No test plan |

+2 more: FD-112, FD-118

## Detail (top 3 by severity)

### FD-101: Implement login flow
- **Critical**: Missing acceptance criteria
- **High**: No story point estimate

### FD-103: Database migration
- **High**: No test plan or testing notes
- **Medium**: Vague/overly broad title — consider being more specific

### FD-109: Update auth module
- **High**: No test plan or testing notes
```

**Ticket mode** — full detail with inline suggestions:

```markdown
# Audit: FD-101 — Implement login flow

**Readiness: 35%** (3 Critical/High issues remaining)

| Check | Severity | Status |
|-------|----------|--------|
| Acceptance criteria | Critical | Missing |
| Description completeness | High | Incomplete |
| Story points | High | Missing |
| Test plan | High | Missing |
| Labels | Low | Missing |

## Suggested Improvements

### Acceptance Criteria (Critical)
Based on the ticket summary and description, here are suggested acceptance criteria:
- User can log in with valid email and password
- Invalid credentials show an error message
- ...

Would you like me to add these to the ticket? You can edit them first.
```

### 5. Resolution workflow

**Project/Sprint mode**: After presenting the summary, ask:

> "Would you like to work through the individual tickets to resolve these issues? I can go through them one at a time, starting with the most critical. Or I can batch-fix issues that share the same check failure."

If the user agrees, switch to ticket mode for each affected ticket in severity order — or use batch resolution if a single check fails across many tickets.

**Ticket mode**: After presenting findings, work through each failing check. For each one, follow this decision tree:

1. **Can you draft a specific suggestion** from the ticket's existing context (summary, description, linked tickets, comments)? → Present the suggestion and ask for approval.
2. **Is there partial information** but not enough for a complete suggestion? → Present what you can infer, then ask targeted clarifying questions to fill the gaps.
3. **Is there no information to work from** (e.g., the ticket is just a title)? → Ask clarifying questions first, then draft a suggestion from the answers.

The goal is to always arrive at a concrete, writable suggestion — but gather the information needed to make it specific rather than guessing or being generic.

**Approval flow — when you can infer enough:**

```
I'd like to add these acceptance criteria to FD-101:

### Acceptance Criteria
* User can log in with email and password
* Invalid credentials display "Invalid email or password" error
* Session token is stored after successful login
* "Remember me" checkbox extends session to 30 days

Would you like me to:
1. Add this as-is
2. Let you edit first
3. Skip this ticket
```

**Clarifying questions — when you need more context:**

```
FD-220 is missing scope boundaries, and I can't confidently infer them
from the description ("Add notification preferences"). A few questions:

1. Which notification channels should this cover? (email, push, SMS, in-app — or a subset?)
2. Should users be able to set per-channel preferences, or just a global on/off?
3. Is there an admin/bulk-management aspect, or is this purely user self-service?

Once I know the boundaries, I'll draft an "In scope / Out of scope" section for the ticket.
```

**Mixed — partial inference with gaps:**

```
Based on the description, I can draft most of the acceptance criteria for FD-305:

### Acceptance Criteria
* CSV export includes all columns visible in the current table view
* Export respects active filters
* File downloads with a timestamped filename
* [?] Maximum row limit — is there a cap, or should it export everything?
* [?] Should it handle exports over 100k rows differently (background job, email link)?

Can you fill in those two unknowns? Then I'll finalize and add it.
```

## Important principles

- **Never update JIRA without approval.** Always show what you intend to write and wait for confirmation.
- **Match the target deployment.** Author Jira field content in Markdown for Cloud, the default; the CLI converts it to ADF. Use Jira wiki markup only for an explicitly selected Data Center deployment (`jira.disney.com` or `jira auth status` identifying Data Center). Follow the jira-ticket skill’s syntax reference and retain approval before writing.
- **Be specific in suggestions.** Don't suggest "add acceptance criteria" — actually draft them based on the ticket's summary, description, and context. The user can refine, but you should do the heavy lifting.
- **Ask before guessing.** When you don't have enough context to make a specific suggestion, ask targeted clarifying questions rather than producing something vague or generic. Good questions are specific and answerable in a sentence (not open-ended). Bad: "What should the acceptance criteria be?" Good: "Should the password reset link expire after a specific duration? And should it invalidate previous reset links?"
- **Keep reports compact.** For any check that fails on more than 3 tickets, show the first 3 in detail (table rows) and list the rest as ticket keys on a single "+N more: FD-130, FD-142, ..." line. The user can ask to expand any section. This prevents walls of repetitive table rows that obscure the important patterns.
- **Respect the user's time.** For large audits (20+ tickets), present the summary first and let the user choose which tickets to work on rather than automatically iterating through all of them.
- **Track progress.** When working through multiple tickets, maintain a running count: "Resolved 3/12 issues. Next: FD-115 (Missing acceptance criteria). Continue?"
- **Batch related questions.** When multiple checks fail on the same ticket and you need clarification for several of them, ask all the questions together rather than one check at a time. Group by topic so the user can answer in one pass.

## Readiness Score

Every report includes a readiness percentage calculated from failing checks weighted by severity:

```
max_score = sum of weights for all applicable checks across all audited tickets
penalty = sum of weights for each failing check
readiness = round((max_score - penalty) / max_score * 100)
```

Default weights (configurable via `.jira-audit.yaml`):
- Critical: 30 points per failing check
- High: 15 points per failing check
- Medium: 5 points per failing check
- Low: 1 point per failing check

A ticket with zero failing checks scores 100%. A sprint or project score is the aggregate across all audited tickets. Present alongside the issue counts so teams can track improvement over time.

## Session Persistence

Large audits may span multiple sessions. Read `references/session-persistence.md` when:
- The user asks to resume a previous audit ("continue the audit", "pick up where we left off")
- A resolution workflow covers 10+ tickets and may not finish in one session

State is saved to `.jira-audit-state.json` in the working directory.

## Batch Resolution

When the same check fails on 5+ tickets, offer to fix them in bulk. Read `references/batch-resolution.md` when:
- A single check fails across many tickets and a uniform fix applies (labels, components, epic links, priority)
- The user asks to fix things in bulk

Batch mode works for mechanical checks (`components-labels`, `epic-link`, `missing-priority`, `no-assignee`). Checks requiring per-ticket content (`missing-ac`, `missing-description`, `vague-title`) should remain individual.

## Sprint Planning Integration

When the "Ready for Implementation" section surfaces tickets with passing audits, offer sprint planning assistance. This helps PMs fill capacity gaps.

**Trigger**: After presenting the ready tickets list, or when the user asks something like "I need more points for this sprint" or "what can I pull in?"

Present ready tickets with their points and priority, then offer point-filling mode: the user specifies a capacity target and you recommend a combination of tickets that fits, prioritizing by priority first, then estimate size, then recency.

## Trend Tracking

Audit results can be tracked over time for comparison. Read `references/trend-tracking.md` when:
- `trends.enabled` is true in `.jira-audit.yaml`
- `.jira-audit-history.json` already exists in the working directory
- The user asks to track or compare audit results over time

When history exists, include a delta in the report header (e.g., "Readiness: 68%, up 16% from last audit").

## Ticket Template Recommendation

After an audit, if a single check fails on >50% of tickets, the root cause may be a missing ticket template. Read `references/ticket-templates.md` when this pattern is detected, and suggest a Jira issue template with pre-filled sections matching the most-failed checks.

## Audit checks reference

Read `references/audit-checks.md` for the full 22-check checklist with severity ratings, pass/fail criteria, resolution guidance, and an applicability matrix by ticket type (Story, Task, Bug, Spike, Sub-task, Epic). Spike tickets use a reduced check set focused on description, scope boundaries, and time-boxing rather than implementation detail. The checks span organizational hygiene (labels, epics, priorities) through agent-implementability (scope boundaries, API contracts, error handling, edge cases).
