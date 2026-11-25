# Eval Coverage — jira-ticket skill

## Overview

34 behavioral tasks across four categories, plus one deterministic
golden CI task. Live runs use WAZA's with-skill/without-skill baseline A/B and
must not claim Jira mutations without evidence.

## Test Infrastructure

| Component | Path | Purpose |
|-----------|------|---------|
| WAZA suite | `eval.yaml` | Canonical executor/model and aggregate metrics |
| Typed tasks | `tasks/*.yaml` | Prompts, partitions, and trigger/prompt graders |
| Config fixture | `fixtures/configs/jira-ticket.yaml` | Clean config with no default project |
| Post-create fixture | `fixtures/configs/jira-ticket-after-create.yaml` | Same, plus `after_create.transition_to` |
| Shared runners | `scripts/skill_evals/` | Deterministic gate, baseline live matrix, and optimization adapter |

## Category: Base — 5 evals

Happy-path single actions. If these break, something fundamental is wrong.

| ID | Name | Action | Key assertions |
|----|------|--------|----------------|
| 1 | create-no-project | create | Reads config, asks for missing project, doesn't execute |
| 2 | move-issue | move | Correct subcommand, issue key, state as single arg |
| 3 | jql-from-prose | jql | Correct JQL fields, shown before execution, --plain --no-truncate |
| 4 | assign-to-me | assign | Resolves `me` via `jira me` before assign, uses email |
| 5 | create-without-after-create | create | No `after_create` key: no transition call, no invented post-create step |

## Category: Adversarial — 12 evals

Single-action edge cases: ambiguous routing, special values, missing fields, markup, config boundaries.

| ID | Name | What it probes | Key assertions |
|----|------|----------------|----------------|
| 101 | ambiguous-move-vs-edit | "put X in review" → move, not edit | Routes to `issue move`, not `issue edit` |
| 102 | create-missing-summary | No summary provided | Asks for summary, doesn't execute |
| 103 | blocked-by-link | Link direction matters | `is blocked by` (not `Blocks`), correct issue order |
| 104 | create-with-markdown-body | Body formatting | Markdown body (Cloud renders to ADF), not wiki markup; has `-b` flag |
| 106 | passthrough-jql | Raw JQL with `-q` | Passed verbatim, not rewritten; shown before running |
| 107 | unassign-issue | Special `x` value | Routes to `issue assign` with `x` |
| 109 | edit-custom-field | "set X to 5 points" | Routes to `issue edit`, maps to `--custom story-points=5` |
| 111 | unknown-custom-field | Unmapped field "team" | Doesn't guess field key, acknowledges it's unmapped |
| 112 | comment-with-markdown | Structured comment body | Markdown body, structured with headings, not flat |
| 113 | create-with-labels | Repeatable `-l` flags | Two labels as separate `-l` flags, not comma-separated |
| 114 | create-with-labels-and-components | Labels `-l` + components `-C` | Different flags for labels vs components, both present |
| 115 | after-create-skipped-by-prompt | One-off "don't move it" vs a configured `after_create` | Create runs, no transition, the skipped move is named, config not rewritten |

## Category: Multi-step — 11 evals

Sequenced reasoning: output dependencies, resolution chains, ordering.

| ID | Name | Steps | Key assertions |
|----|------|-------|----------------|
| 201 | set-default-then-create | settings → create | Config written before create, no phantom flags |
| 202 | create-and-assign | create → assign (or -a inline) | Resolves `me`, create before assign |
| 203 | sprint-add-current | sprint list → sprint add | Resolves active sprint ID (100), correct ordering |
| 204 | create-and-add-to-sprint | create → sprint list → sprint add | 3-step chain, uses created key MOCK-123 |
| 205 | create-and-link | create → link | Uses created key, correct link type (Blocks) |
| 206 | view-then-comment | view → comment | View before comment, correct issue, has body |
| 207 | find-and-move-mine | list → move each | Queries with JQL filters, moves results |
| 208 | draft-formatting | settings → create | Defaults bold, user values plain, overridden defaults hidden |
| 209 | daily-standup | 3× bounded search → synthesize | In-progress + completed-1d + blocked/at-risk buckets, `currentUser()` |
| 210 | epic-decomposition-with-children | get epic → list children → propose | Gap analysis vs existing children, Fibonacci sizes, waits for approval |
| 211 | create-with-after-create-transition | create → transition | `after_create.transition_to` honoured: preview names the move, transition uses created key MOCK-123 |

## Category: Error Handling — 6 evals

Failure scenarios migrated from the legacy mock contract. Tests that the skill
surfaces errors, does not claim success, and suggests fixes.

| ID | Name | Error scenario | Key assertions |
|----|------|----------------|----------------|
| 301 | error-on-create | Permission denied on create | Surfaces error, no fake success/URL, suggests fix |
| 302 | error-on-move | Invalid transition | Surfaces error, shows available transitions, no fake success |
| 303 | error-on-assign | User not found | Surfaces error, no fake success, suggests verifying email |
| 304 | error-on-sprint-add | Sprint not active | Surfaces sprint error, no fake success |
| 305 | partial-read-failure-on-standup | One of 3 standup reads errors | Surfaces failed read, still reports succeeded buckets, no fabrication |
| 306 | after-create-transition-unavailable | Configured post-create status not in the workflow | Reports the create, lists the real transitions, never claims the move |

## Skill Capabilities vs Coverage

| Skill action | Base | Adversarial | Multi-step | Error |
|-------------|------|-------------|------------|-------|
| create | 1, 5 | 102, 104, 111, 113, 114, 115 | 201, 202, 204, 205, 208, 211 | 301, 306 |
| view | — | — | 206 | — |
| list / jql | 3 | 106 | 207 | — |
| edit | — | 109 | — | — |
| move | 2 | 101, 115 | 207, 211 | 302, 306 |
| assign | 4 | 107 | 202 | 303 |
| comment | — | 112 | 206 | — |
| sprint | — | — | 203, 204 | 304 |
| link | — | 103 | 205 | — |
| settings | — | — | 201, 208 | — |
| standup (synthesis) | — | — | 209 | 305 |
| epic-decomposition (synthesis) | — | — | 210 | — |

## Gaps / Future Work

- **Edit multiple fields** — only tests single custom field edit
- **Epic/parent** — no eval tests -P flag
- **Model nondeterminism** — phantom flags (e.g., -y High) appeared in some runs but not others. Current assertions catch it when it happens, but single runs per eval may miss intermittent issues. A `--runs-per-eval N` option could help surface nondeterministic behavior.

## Skill Changes Driven by Evals

| Iteration | Change | Eval that exposed it |
|-----------|--------|---------------------|
| adversarial-1 | Description formatting section (Cloud = Markdown → ADF) with example | 104 (body passed as flat string) |
| iteration-5 | Added "only include flags from user prose or defaults" | 201 (phantom -y High flag) |
| iteration-7 | Draft preview uses exact template; defaults bold, user plain, no `(default)` annotation | 201, 208 (inconsistent formatting across runs) |
