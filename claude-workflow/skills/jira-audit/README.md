# Jira Audit

Audit Jira tickets for quality, completeness, and agent-implementability — so every ticket that passes is ready to be picked up by a developer or a Claude Code agent without further clarification.

## The Problem

Incomplete tickets create a hidden tax on every sprint:

- Developers stop mid-implementation to ask clarifying questions
- QA can't write test cases without acceptance criteria
- AI agents hallucinate scope or get stuck when tickets lack technical context
- Sprint planning is unreliable when half the backlog hasn't been properly groomed
- Rework spikes when "what to build" was never clearly defined

Most teams have a definition of ready, but enforcing it manually during grooming is tedious and inconsistent. Issues slip through, and the cost surfaces later as blocked work, scope creep, and missed deadlines.

## What This Skill Does

Jira Audit runs 22 quality checks across four severity levels against your tickets, then helps you fix what's broken — interactively, with specific suggestions rather than generic "add more detail" feedback.

### Three Modes

| Mode | Use when... | Output |
|------|-------------|--------|
| **Project** | Cleaning up a backlog before planning | Report grouped by issue type, focusing on open/unstarted tickets |
| **Sprint** | Checking readiness before a sprint starts | Per-ticket breakdown with readiness score and ready-for-dev list |
| **Ticket** | Getting a single ticket implementation-ready | Full audit with inline suggestions and interactive resolution |

### What Gets Checked

**Critical** — ticket cannot be worked without these:
- Acceptance criteria
- Adequate description
- Technical context (which service/module/area of the codebase)

**High** — significant risk of rework:
- Story point estimate
- Test plan
- Specific title
- Assignee (sprint tickets)
- Scope boundaries (in scope / out of scope)
- API or interface contract (for integration work)
- Design or UI reference (for frontend work)
- Bug reproduction details (steps, expected/actual, environment)

**Medium** — reduces clarity:
- Components or labels
- Linked dependencies
- Priority
- Stale tickets (sprint: time-based; project: dead URLs, archived repos, old threads)
- Error handling requirements
- Affected files or areas
- Edge cases
- Environment or config requirements

**Low** — nice-to-have:
- Sub-tasks for large stories
- Epic link
- Duplicate detection

## How to Use

### Audit a project backlog

```
/jira-audit Audit the FD project backlog
```

or naturally:

```
Help me clean up the open tickets in PLAT before our next planning session
```

### Audit a sprint

```
/jira-audit Check if Sprint 47 is ready
```

or:

```
Are the tickets in our current sprint ready for development?
```

### Audit a single ticket

```
/jira-audit Check FD-2847
```

or:

```
Help me get FD-2847 ready for implementation
```

### Resolution workflow

After presenting the audit report, the skill offers to work through failing tickets interactively. For each issue it either:

1. **Drafts a specific suggestion** when it can infer enough from the ticket context
2. **Asks targeted clarifying questions** when it needs more information to make a useful suggestion
3. **Presents a partial draft with gaps marked** when some information is available but not all

All changes require your explicit approval before anything is written to Jira.

### Batch resolution

When the same check fails on many tickets (e.g., 14 tickets missing components), the skill offers to fix them all at once instead of cycling through individually.

### Sprint planning integration

After the audit surfaces tickets that are "ready for implementation," you can ask for sprint-filling recommendations:

```
I need 8 more points for Sprint 48
```

The skill will suggest combinations of ready tickets that fit your capacity target.

### Readiness score

Every report includes a readiness percentage weighted by severity, so you can track improvement over time ("Sprint 48 readiness: 72%, up from 52%").

### Trend tracking

Optionally save audit results to `.jira-audit-history.json` for cross-audit comparison. Enable via `.jira-audit.yaml` or by asking "track trends for this project."

### Ticket template recommendation

When >50% of tickets fail the same check, the skill suggests a Jira ticket template to prevent the issue at the source rather than fixing it per-ticket.

### Session persistence

Large resolution workflows (10+ tickets) save state to `.jira-audit-state.json` so you can resume across sessions.

## Configuration

Teams can customize audit behavior with a `.jira-audit.yaml` file in the project root:

- Disable specific checks
- Override severity levels
- Set custom thresholds (stale days, large story points, etc.)
- Control readiness score weights
- Enable trend tracking
- Define custom issue types with their own check sets

See `.jira-audit.example.yaml` for all available options, or run the installer to copy it into your project.

## Supported Issue Types

The skill has built-in check matrices for: **Story**, **Task**, **Bug**, **Spike**, **Sub-task**, and **Epic**. Spike tickets use a reduced check set (9 checks focused on scope boundaries and time-boxing rather than implementation detail). Custom types can be defined in `.jira-audit.yaml`.

## Prerequisites

This skill requires the `jira-ticket` skill to be installed and configured.

```bash
# Install jira-audit (verifies jira-ticket dependency, copies example config)
bash skills/jira-audit/scripts/install.sh

# If jira-ticket isn't set up yet:
bash skills/jira-ticket/scripts/install.sh
```

The `jira-ticket` installer handles token setup, deployment detection (Cloud vs. Server), and dependency installation. The `jira-audit` installer verifies the dependency is in place and optionally copies the example config file.

## Example Session

```
User: Audit the current sprint for PLAT

Agent: # Sprint Audit: PLAT Sprint 12

      Tickets audited: 8 | Issues found: 14 | Ready for dev: 3/8 | Readiness: 64%

      Breakdown: 2 Critical · 5 High · 6 Medium · 1 Low

      ## Ready for Implementation

      | Ticket  | Summary              | Type  | Points |
      |---------|----------------------|-------|--------|
      | PLAT-91 | Fix login timeout    | Bug   | 2      |
      | PLAT-95 | Update error codes   | Task  | 1      |
      | PLAT-96 | Add retry to webhook | Task  | 3      |

      Total ready: 3 tickets · 6 story points available

      ## All Tickets

      | Ticket  | Summary                    | Status | Issues                          |
      |---------|----------------------------|--------|---------------------------------|
      | PLAT-90 | Add export feature         | To Do  | Missing AC, No scope boundaries |
      | PLAT-91 | Fix login timeout          | To Do  | None ✓                          |
      | PLAT-92 | Notification preferences   | To Do  | Missing AC, No test plan        |
      ...

      Would you like to work through the individual tickets? I can start
      with the most critical issues, or batch-fix the 4 tickets missing
      components.

User: Yes, start with PLAT-90

Agent: PLAT-90 is missing acceptance criteria and scope boundaries. The
      description says "Add CSV/PDF export to the reports page" but doesn't
      specify limits. A few questions:

      1. Should both CSV and PDF be in this ticket, or should we split them?
      2. Is there a row limit for exports (e.g., max 10k rows)?
      3. Which reports page — the admin dashboard or the user-facing analytics?

      Once you answer, I'll draft the AC and scope section.
```
