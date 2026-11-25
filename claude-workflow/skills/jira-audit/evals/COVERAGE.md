# Eval Coverage — jira-audit skill

## Overview

16 evals covering the three audit modes, edge cases, conditional check accuracy, resolution workflow judgment, false positive resistance, new check types, report formatting, and workflow features.

The WAZA live-model path runs each task as a baseline A/B: once with the skill
enabled and once with skills disabled. The deterministic `ci` task remains the
fast PR contract.

Since this skill depends on a live Jira connection via the `jira-ticket` skill, evals simulate the workflow: the agent demonstrates what JQL it would run, produces a realistic audit report, and shows the interactive resolution flow.

## Test Infrastructure

| Component | Path | Purpose |
|-----------|------|---------|
| WAZA suite | `eval.yaml` | Canonical executor/model and aggregate metrics |
| Typed tasks | `tasks/*.yaml` | Prompts, partitions, trigger/prompt graders |
| Shared runner | `scripts/skill_evals/run_live_matrix.py` | Live model plus with-skill/without-skill baseline A/B |
| CI gate | `scripts/skill_evals/gate_changed_skills.py` | Deterministic golden task and base/current regression gate |

## Eval Categories

### Category: Core Modes (IDs 1-3)

Happy-path tests for each audit mode. If these break, the skill's fundamental behavior is wrong.

| ID | Name | Mode | Key focus |
|----|------|------|-----------|
| 1 | project-backlog-audit | Project | JQL, grouped-by-issue format, severity headers |
| 2 | sprint-readiness-check | Sprint | Per-ticket breakdown, readiness count, sprint-specific checks |
| 3 | single-ticket-remediation | Ticket | Audit table, suggestions, Jira markup, approval flow |

---

### Category: Edge Cases (IDs 4-6)

Boundary conditions within modes that test the skill's judgment.

| ID | Name | What it tests |
|----|------|---------------|
| 4 | clean-ticket | Ticket passes all checks — skill should confirm readiness without inventing issues |
| 5 | bare-minimum-ticket | Ticket is just a title — skill must lean on clarifying questions, not guess |
| 6 | large-backlog | 45+ tickets — skill should summarize first and let user choose, not auto-iterate |

---

### Category: Conditional Check Accuracy (IDs 7-8)

Tests that the applicability matrix is respected — checks are skipped when they don't apply.

| ID | Name | What it tests |
|----|------|---------------|
| 7 | pure-backend-ticket | No UI work — should NOT flag missing design/UI reference (check #10) |
| 8 | sub-task-audit | Sub-task type — should skip AC, story points, test plan, epic link per matrix |

---

### Category: Resolution Workflow (IDs 9-10)

Tests the decision tree: when to infer, when to ask, when to clarify mode.

| ID | Name | What it tests |
|----|------|---------------|
| 9 | inferable-ticket | Rich description but no formal AC — skill should draft AC directly without questions |
| 10 | ambiguous-mode | "tickets related to FD-2847" — should ask for scope clarification |

---

### Category: False Positive Resistance (ID 11)

Tests that the skill catches quality issues even when fields are technically populated.

| ID | Name | What it tests |
|----|------|---------------|
| 11 | restated-ac | AC says "works as expected" — should FAIL despite text being present |

---

### Category: Type-Specific Checks (IDs 12-13)

Tests that type-specific checks and applicability matrices are applied correctly.

| ID | Name | What it tests |
|----|------|---------------|
| 12 | spike-audit | Spike ticket — reduced check set (9 applicable), no AC/test plan/error handling flags |
| 13 | bug-repro-details | Bug missing reproduction details — check #22 fires, asks targeted questions |

---

### Category: Report Formatting & Features (IDs 14-16)

Tests compact report output, readiness score, ready-for-implementation surfacing, batch resolution, and status exclusion.

| ID | Name | What it tests |
|----|------|---------------|
| 14 | sprint-compact-report | Readiness score, Ready for Implementation section, compact format (3 + N more) |
| 15 | batch-resolution-trigger | Same check fails on 12/15 tickets — offers batch fix + template recommendation |
| 16 | status-exclusion | Label-scoped audit excludes Done/Closed tickets from report and calculations |

---

## Audit Checks vs Eval Coverage

| # | Check | Severity | Project eval | Sprint eval | Ticket eval | Dedicated eval |
|---|-------|----------|:---:|:---:|:---:|:---:|
| 1 | Acceptance Criteria | Critical | Yes | Yes | Yes | #11 (restated-ac) |
| 2 | Description | Critical | Yes | Yes | Yes | #5 (bare-minimum) |
| 3 | Technical Context | Critical | Yes | Yes | Yes | — |
| 4 | Story Points | High | Yes | Yes | Yes | #14 (compact-report) |
| 5 | Test Plan | High | Yes | Yes | Yes | — |
| 6 | Vague Title | High | Yes | Yes | Yes | #5 (bare-minimum) |
| 7 | No Assignee | High | — | Yes | — | — |
| 8 | Scope Boundaries | High | Yes | Yes | Yes | #12 (spike-audit) |
| 9 | API/Interface Contract | High | If applicable | If applicable | If applicable | — |
| 10 | Design/UI Reference | High | If applicable | If applicable | If applicable | #7 (pure-backend) |
| 11 | Components/Labels | Medium | Yes | Yes | Yes | #15 (batch-resolution) |
| 12 | Dependencies | Medium | Yes | Yes | Yes | — |
| 13 | Priority | Medium | Yes | Yes | Yes | — |
| 14 | Stale Ticket | Medium | Yes | Yes | — | — |
| 15 | Error Handling | Medium | Yes | Yes | Yes | — |
| 16 | Affected Files/Areas | Medium | Yes | Yes | Yes | — |
| 17 | Edge Cases | Medium | Yes | Yes | Yes | — |
| 18 | Environment/Config | Medium | Yes | Yes | Yes | — |
| 19 | Sub-tasks (large) | Low | Yes | Yes | Yes | — |
| 20 | Epic Link | Low | Yes | Yes | Yes | — |
| 21 | Duplicates | Low | Yes | Yes | — | — |
| 22 | Reproduction Details | High | — | — | Yes | #13 (bug-repro) |

## Assertions Summary

| ID | Eval | Focus |
|----|------|-------|
| 1 | project-backlog-audit | Report structure, grouping, JQL, interactivity |
| 2 | sprint-readiness-check | Per-ticket format, readiness score, sprint-specific checks |
| 3 | single-ticket-remediation | Resolution workflow, Jira markup, approval flow, questions |
| 4 | clean-ticket | No false positives, concise confirmation |
| 5 | bare-minimum-ticket | Clarifying questions prioritized over inference |
| 6 | large-backlog | Summary-first, user-driven selection |
| 7 | pure-backend-ticket | Conditional checks marked N/A correctly |
| 8 | sub-task-audit | Applicability matrix respected |
| 9 | inferable-ticket | Direct AC drafting from rich description |
| 10 | ambiguous-mode | Mode disambiguation question asked |
| 11 | restated-ac | Quality judgment on populated-but-useless fields |
| 12 | spike-audit | Reduced check set for Spike type, correct N/A marking |
| 13 | bug-repro-details | Reproduction detail check, targeted questions |
| 14 | sprint-compact-report | Readiness score, ready section, compact 3+N format |
| 15 | batch-resolution-trigger | Batch fix offer, template recommendation |
| 16 | status-exclusion | Done ticket exclusion, correct audit count |

## Running Evals

Run from the repository root:

```sh
waza spec verify skills/jira-audit \
  skills/jira-audit/evals/eval.yaml \
  --fail --no-update-check
waza run skills/jira-audit/evals/eval.yaml \
  --tags ci --no-update-check

python3 scripts/skill_evals/run_live_matrix.py \
  --waza "$(command -v waza)" \
  --skill jira-audit \
  --model claude-sonnet-4.6 \
  --tag validation --tag heldout \
  --output-dir /tmp/jira-audit-waza
```

## Baseline Comparison (Reference)

The following result predates WAZA and is retained as historical evidence:
**100% with-skill vs 79% without-skill (+21% delta)** in iteration 2. Current
live runs calculate the same A/B directly with WAZA's `--baseline` mode.

Largest gaps (where the skill adds most value):
- Project mode reporting: +57% (compact format, severity headers, ready section)
- Ticket remediation: +50% (Jira markup, approval flow, audit table)
- Spike type handling: +50% (reduced check set correctly applied)
- Sub-task applicability: +40% (skips AC, points, epic, test plan)
- Batch resolution: +40% (offers batch fix + template recommendation)

Non-discriminating evals (0% delta — Claude handles well without skill): ambiguous-mode, bare-minimum-ticket, pure-backend-ticket, restated-ac, inferable-ticket, sprint-readiness-check, bug-repro-details.

## Gaps / Future Work

- **Live Jira integration tests** — requires a test Jira instance with seeded tickets
- **Mock Jira responses** — could add mock-curl fixtures for deterministic testing
- **Multi-turn resolution** — eval that continues past the initial report into the full Q&A and update flow
- **Cross-check interactions** — tickets where multiple checks fail and questions should be batched
- **Partial-pass ticket** — ticket that passes Critical/High but fails multiple Medium checks (tests severity-appropriate tone)
