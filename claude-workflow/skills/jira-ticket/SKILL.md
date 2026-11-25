---
name: jira-ticket
version: 3.4.4
metadata:
  requires:
    bins: ["jq"]
author: Jonathan Morris
description: >
  All Jira operations: view, create, edit, list, assign, move, sprint, link.
  Wraps the jira CLI (cli-universe, Rust) with friendly aliases and sensible defaults.
  TRIGGER when: user mentions a Jira issue key (e.g., MCM-1234, SLQA-100), asks about tickets/issues/stories, or wants to interact with Jira.
keywords: [jira, ticket, issue, story, sprint, backlog]
---

# Skill: Jira CLI

Run Jira CLI commands with friendly custom field aliases.

## Config

### Rust CLI Configuration

The Rust CLI (`jira`) resolves its server URL in this order:

1. `JIRA_SERVER` env var (the installer exports a non-default server and updates an existing export to the server you choose)
2. `~/.config/cliuniverse/config.toml` → `[jira] base_url`
3. Fallback: `https://deept.atlassian.net` (Atlassian Cloud — the post-cutover default). Data Center (`https://jira.disney.com`) is demoted but still reachable by setting `JIRA_SERVER` or `[jira] base_url`.

Authentication: on Atlassian Cloud (the new default, `deept.atlassian.net`) run `pat-manager login jira` for the fully-automatic browser sign-in (creates and stores the Cloud API token and account email — no paste), or `jira auth login` (manual email + API token, HTTP Basic) / `jira auth login --oauth` (OAuth 2.0 3LO) as fallbacks. Data Center users run `pat-manager login jira --dc` (`jira auth login` is Cloud-only). The installer never writes a token to a shell profile.

### Skill Configuration

Read config from `~/.config/jira-ticket/jira-ticket.yaml` at the start of every invocation. The config provides:

- **defaults** — freeform key/value pairs applied to commands (project, type, priority, labels, etc.). All keys are normalized to lowercase. Shown in the create preview; overridden by anything the user specifies in their prompt.
- **custom_fields** — maps friendly names to Jira custom field keys
- **after_create** — steps to run on the newly created issue, after a successful create. Only `transition_to: "<status>"` is supported today; see [Post-create actions](#post-create-actions). `defaults`/`custom_fields` are create-TIME field values, so a preference like "always move my new tickets to In Progress" belongs here, not in `defaults`.

If the config file is missing, the `jira` CLI is not installed, or a jira command fails with an auth error,
tell the user to run the installer and then resume the conversation:

```
bash <skill-dir>/scripts/install.sh
```

The installer verifies the CLI, checks whether it is signed in and prints the sign-in command if not, and bootstraps the config.

## Trigger

`/jira-ticket <natural language>`

The user writes prose. Extract the intent (action, fields, values) and build the CLI command.

Examples:
- `/jira-ticket create a story for fixing the listener bug, 2 points`
- `/jira-ticket assign SLQA-100 to me`
- `/jira-ticket move SLQA-100 to In Progress`
- `/jira-ticket list my open stories`
- `/jira-ticket what's in the current sprint?`
- `/jira-ticket add SLQA-100 to the current sprint`
- `/jira-ticket link SLQA-100 blocks SLQA-101`
- `/jira-ticket find all bugs in SLQA with priority High`
- `/jira-ticket -q "project = SLQA AND status = 'In Progress'" --limit 10`

## Custom Field Aliases

When the user specifies friendly names, map them to `--fields-json` entries using the `custom_fields` section of the config.

Example config entry:
```yaml
custom_fields:
  story-points: customfield_10047
```

Usage: `points=3` → `--fields-json '{"customfield_10047": 3}'`

## Actions

The skill supports: **create**, **view**, **list**, **edit**, **move**, **assign**, **comment**, **sprint**, **link**, **jql**, **settings**. It also drives multi-read **synthesis workflows** — **standup**, **epic-decomposition**, **triage**, **sprint-planning**, **release-notes** (see [Synthesis Workflows](#synthesis-workflows)). Infer the action from the user's prose.

## CLI Flag Reference (internal — not user-facing)

### Global

- All commands use `jira --agent` for structured JSON output
- "me" → resolve via `jira --agent user me` (extract accountId/name from JSON)
- Use `--fields key,summary,status` for token-efficient list responses
- Use `--limit N` to control response size (default 25)

### create → `jira --agent issue create`

| Flag | Field | Notes |
|------|-------|-------|
| `--project` | project | From `defaults.project` |
| `--issue-type` | type | From `defaults.type` |
| `--summary` | summary | Required |
| `--description` | body | Optional |
| `--priority` | priority | Highest, High, Medium, Low, Lowest |
| `--assignee` | assignee | Username or accountId |
| `--labels` | labels | Comma-separated |
| `--fields-json` | extra fields | JSON object for components, parent, fixVersions, custom fields |

**`--fields-json` examples:**
```bash
# Components
--fields-json '{"components": [{"name": "Backend"}]}'

# Parent/epic link
--fields-json '{"parent": {"key": "PROJ-100"}}'

# Fix versions
--fields-json '{"fixVersions": [{"name": "2.0"}]}'

# Story points (custom field from config alias)
--fields-json '{"customfield_10047": 3}'

# Multiple fields combined
--fields-json '{"components": [{"name": "Backend"}], "parent": {"key": "PROJ-100"}, "customfield_10047": 3}'
```

**Resolving an epic by name**: When the user names an epic in prose ("on the payments epic", "under the Q3 migration epic") instead of giving a key:

1. If the text already matches an issue key (`[A-Z]+-\d+`), use it directly as the parent.
2. Otherwise search for it: `jira --agent issue search --jql 'project = <PROJECT> AND issuetype = Epic AND summary ~ "<terms>"' --fields key,summary --limit 10`.
3. One clear match -> resolve to its key. Several plausible matches -> ask the user which one. No match -> create the issue without a parent and tell the user the epic was not found.
4. Show the resolved epic (key and summary) in the draft preview before creating, so the user can correct a wrong match.
5. Set it via `--fields-json '{"parent": {"key": "<RESOLVED-KEY>"}}'`.

**Defaults**: Apply `defaults` entries from config. User prose overrides defaults. Only include flags for fields the user specified or that appear in `defaults`.

**Draft first**: Summarize the create in natural prose. Default-sourced values are **bold**, user-specified are plain. If user overrides a default, show user's value in plain text only.

Examples:
- `I'll create a **Story** in **SLQA**: "Fix the listener bug", priority High, 2 **story points**, assigned to you.`
- With a body: `I'll create a **Story** in **SLQA**: "Fix the listener bug", priority High, assigned to you, with the following body:` followed by the body in a code block.

Wait for approval before executing.

#### Story-point estimation

When the user doesn't give an explicit point value but the issue type wants one, estimate on the Fibonacci effort scale and surface the estimate in the draft preview as a **bold** (default-sourced) value, so the user can correct it before the create runs:

| Points | Effort |
|--------|--------|
| 1 | Easy and straightforward |
| 2 | Easy, with some investigation |
| 3 | Medium effort |
| 5 | High effort |
| 8 | Very high effort |
| 13 | Unknown — needs significant investigation |

Rules:
- Only use Fibonacci values: 1, 2, 3, 5, 8, 13.
- Never assign more than 13 — if the work feels larger, say so and suggest splitting it into multiple issues rather than inflating the estimate.
- Inference guide: well-scoped fix → 1; needs investigation but a clear path → 2; standard feature → 3; multi-component change → 5; major feature spanning systems → 8; a true unknown or spike → 13.
- If you can't infer confidently, ask rather than guess (or fall back to a `defaults.story-points` value if one is configured).
- Map the chosen value through the `story-points` custom-field alias, e.g. `--fields-json '{"customfield_10047": 3}'`.

### view → `jira --agent issue get ISSUE-KEY`

Use `jira --agent issue get ISSUE-KEY` for standard view. Use `jira --agent issue get-full ISSUE-KEY` only when the user needs changelog or expanded fields.

Present view results as concise prose — not a table. Lead with key, summary, and the important fields. Omit fields that are empty/null. Only use structured format for description content worth showing verbatim.

### list → `jira --agent issue search`

| Flag | Filter | Notes |
|------|--------|-------|
| `--jql` | JQL query | Full JQL support including ORDER BY |
| `--limit` | max results | Default 25 |
| `--fields` | field selection | Comma-separated field names |
| `--expand` | expansions | e.g., `names` for field ID→name mapping |

Build JQL from the user's prose. Common patterns:
- "my open stories" → `assignee = currentUser() AND issuetype = Story AND status not in (Done, Closed, Resolved)`
- "open bugs in SLQA" → `project = SLQA AND issuetype = Bug AND status not in (Done, Closed, Resolved)`

### edit → `jira --agent issue update ISSUE-KEY`

| Flag | Field | Notes |
|------|-------|-------|
| `--summary` | summary | |
| `--description` | description | |
| `--priority` | priority | |
| `--assignee` | assignee | |
| `--fields-json` | extra fields | JSON object for labels, components, custom fields |

**`--fields-json` examples for update:**
```bash
# Labels (replaces all)
--fields-json '{"labels": ["backend", "urgent"]}'

# Components (replaces all)
--fields-json '{"components": [{"name": "Backend"}]}'

# Custom field
--fields-json '{"customfield_10047": 5}'
```

### move → `jira --agent issue transition ISSUE-KEY --to "STATE"`

Conceptual states: To Do, In Progress, Done, In Review — actual names vary by project workflow. If the CLI rejects a state, it lists the valid options.

### assign → `jira --agent issue assign ISSUE-KEY --to ASSIGNEE`

### comment → `jira --agent comment add ISSUE-KEY --body "text"`

### sprint

- Active sprint issues: `jira --agent sprint issues SPRINT_ID`
- List sprints: `jira --agent sprint list --board BOARD_ID --state active`
- Add to sprint: `jira --agent sprint add-issues SPRINT_ID --issues KEY-1,KEY-2`

To find the active sprint, first get the board (`jira --agent board list --name PROJECT`), then list sprints with `--state active`.

**Add a new issue to the active sprint on create**: When the user wants a newly created ticket to land in the current sprint (e.g. "...and put it in the current sprint", or a `defaults.sprint: active` convention in config), do it as a post-create step:

1. Create the issue and capture its key from the JSON response.
2. Resolve the active sprint: `jira --agent board list --name <PROJECT>` to get the board ID, then `jira --agent sprint list --board <BOARD_ID> --state active` to get the sprint ID.
3. Add it: `jira --agent sprint add-issues <SPRINT_ID> --issues <NEW-KEY>`.
4. Mention the target sprint in the draft preview so the user knows the issue will be added, and report the sprint in the result.

If no active sprint exists, create the issue anyway and tell the user it was not added to a sprint.

### Post-create actions

The config's `after_create` section declares what should happen to a newly created
issue every time, so a standing preference is honoured by the skill itself rather
than depending on prose memory:

```yaml
after_create:
  transition_to: In Progress
```

`transition_to` is the only supported key today. The section is a map so further
steps (assign to self, add to sprint, comment) can be added later without changing
the shape of what users have already written; ignore any key you do not recognise
and say so once, rather than guessing at an action.

When `after_create.transition_to` is set:

1. Show it in the **draft preview** as a default-sourced (**bold**) value, e.g.
   `…and move it to **In Progress**`, so the user can veto or change it before
   anything runs. No second confirmation after the create.
2. Create the issue and capture its key from the JSON response.
3. Transition it: `jira --agent issue transition <NEW-KEY> --to '<STATUS>'`.
   The status is config-supplied text, so shell-quote it like any other value (see
   Process): a legitimate status containing an apostrophe (`Won't Fix`) breaks a raw
   single-quoted argument, so escape the apostrophe (`'Won'\''t Fix'`) or pass the
   value without a shell at all. Never interpolate it unescaped.
4. Report the outcome and the issue's browse URL (per the Process section), so the
   user gets the link whether or not the transition succeeded.

**When the status is not an available transition** (project workflows use different
names — `In Development`, `Started`, …), the CLI rejects it and lists the valid
options. Do NOT retry with a guess and do NOT report the move as done. Say the issue
was created, that the configured status is not available in this project's workflow,
and list the transitions the CLI returned so the user can pick one and fix their
config. The issue still exists — never imply the create failed.

Applies to every create, interactive or not. A user who wants a one-off create
without the step says so in their prompt ("don't move it"), which overrides the
config like any other default.

### link → `jira --agent issue link ISSUE-1 ISSUE-2 --link-type "TYPE"`

| User says | Link type |
|-----------|-----------|
| "blocks", "is blocking" | blocks |
| "is blocked by" | is blocked by |
| "clones", "cloned from" | clones |
| "is cloned by" | is cloned by |
| "duplicates", "is a duplicate of" | duplicates |
| "is duplicated by" | is duplicated by |
| "relates to", "related to" | relates |

Example: `/jira-ticket link SLQA-100 blocks SLQA-101` → `jira --agent issue link SLQA-100 SLQA-101 --link-type "blocks"`

### jql

Two modes:

**Passthrough** — user provides raw JQL with `-q`:
```
/jira-ticket -q "project = SLQA AND status = 'In Progress'"
```

**Generated** — user describes what they want in prose:
```
/jira-ticket find all high-priority bugs assigned to me
```

In both cases:
1. Show the JQL query that will be executed
2. Wait for user confirmation before running
3. Execute: `jira --agent issue search --jql "<JQL>" --limit 25`

### settings

The user can view or change their config via natural language. Parse the intent and update `~/.config/jira-ticket/jira-ticket.yaml` accordingly. Use the Read tool to load the current config, modify it in memory, and use the Write tool to save it back.

All keys under `defaults` are normalized to **lowercase** on write. `after_create`
values are STATUS NAMES passed through to Jira, so preserve their case verbatim.

Examples:
- `/jira-ticket set the default project to SLQA`
- `/jira-ticket always move new tickets to In Progress` → writes `after_create.transition_to`
- `/jira-ticket stop moving new tickets automatically` → removes only `after_create.transition_to`, and the `after_create` map itself only if that leaves it empty (it may hold other steps)
- `/jira-ticket show my jira settings`

For **show**: read the config file and present it in a readable format.

## Synthesis Workflows

Beyond single actions, this skill drives **synthesis workflows** — multi-read
queries whose value is in aggregating and reasoning over several Jira reads, not
in a single API call. These preserve the five retired Jira MCP prompts
(`daily_standup`, `epic_decomposition`, `issue_triage`, `release_notes`,
`sprint_planning`) as CLI-driven flows over `jira --agent`.

Every read below uses `jira --agent` for structured JSON and a bounded `--limit`
so responses stay token-efficient. Never fabricate a result: if one read in a
multi-read workflow fails, report the failure and continue with the reads that
succeeded rather than inventing data.

Two workflows are described in full here (standup, epic decomposition). The other
three delegate to a single canonical workflow each — follow the link, do not
restate competing instructions:

| Workflow | Home |
|----------|------|
| Daily standup | This skill — [Daily Standup](#daily-standup) |
| Epic decomposition | This skill — [Epic Decomposition](#epic-decomposition) |
| Issue triage | The generated `jira-cli` skill (Issue Triage) and the `jira-audit` skill |
| Sprint planning | The `@pm/sprint-plan` skill and the generated `jira-cli` skill (Sprint Planning) |
| Release notes | Collect inputs here, then hand off to the `@pm/release-notes` skill |

### Daily Standup

Summarize a person's day: what is in progress, what completed in the last day,
and what is blocked or at risk. Defaults to the current user; accept an optional
assignee override from the prose (e.g. "standup for alice").

Run these reads (substitute `currentUser()` with `"<assignee>"` when an override
is given), then synthesize a short standup summary grouped by the three buckets:

```bash
# In progress
jira --agent issue search \
  --jql 'assignee = currentUser() AND status = "In Progress"' \
  --fields key,summary,status,assignee --limit 20

# Completed in the last day
jira --agent issue search \
  --jql 'assignee = currentUser() AND status changed to (Done, Closed, Resolved) after -1d' \
  --fields key,summary,status,assignee --limit 20

# Blocked or at risk
jira --agent issue search \
  --jql 'assignee = currentUser() AND (status = Blocked OR labels in (at-risk, blocked))' \
  --fields key,summary,status,assignee --limit 20
```

Present the result as three short lists (In progress / Completed / Blocked or at
risk), each line `KEY — summary`. If a bucket is empty, say so. If one query
fails, surface that failure and still report the buckets that succeeded.

### Epic Decomposition

Break an epic into a well-formed set of child stories. Requires an epic key
(`[A-Z]+-\d+`); if the user names an epic in prose instead, resolve it first via
the epic-by-name search in the create section.

Gather the epic and its current children:

```bash
# Epic details
jira --agent issue get <EPIC-KEY>

# Current children
jira --agent issue search \
  --jql 'parent = <EPIC-KEY>' \
  --fields key,summary,status --limit 50
```

Then guide the decomposition over the gathered data:

1. **Gap analysis** — compare the epic's goal against existing children; identify
   missing work. Do not duplicate children that already exist.
2. **Acceptance criteria** — draft clear, testable criteria for each proposed
   new child.
3. **Estimates** — size each proposed child on the Fibonacci scale using the
   [Story-point estimation](#story-point-estimation) table above.
4. **Dependencies** — call out ordering constraints between children (which
   block which).
5. **Implementation order** — sequence the children from the dependencies.
6. **Spikes** — where effort is a true unknown (13 points), propose a spike to
   de-risk before committing an estimate.

Present the proposed breakdown for review. Only create children (via the create
action) after the user approves — never bulk-create silently.

### Issue Triage

Do not restate triage rules here. Use the **Issue Triage** workflow in the
generated `jira-cli` skill for the CLI mechanics, and the `jira-audit` skill for
ticket-quality scoring and acceptance-criteria checks.

### Sprint Planning

Do not restate sprint-planning rules here. Use the `@pm/sprint-plan` skill for
the planning workflow, and the **Sprint Planning** workflow in the generated
`jira-cli` skill for the CLI mechanics (board/sprint resolution, adding issues).

### Release Notes

Collect the Jira inputs here, then hand off to the `@pm/release-notes` skill,
which owns the writing. Gather the issues for a release by fix version:

```bash
jira --agent issue search \
  --jql "fixVersion = '<VERSION>'" \
  --fields key,summary,issuetype --limit 100
```

Pass the collected issues to `@pm/release-notes`; do not draft the notes prose
in this skill.

## Process

1. Read `~/.config/jira-ticket/jira-ticket.yaml` first. If missing, tell the user to run the installer.
2. For create: show draft preview for approval. For jql: show query for confirmation.
3. Execute via Bash, parse JSON response and present results clearly. **Shell-quote all user-provided values** — wrap flag arguments in single quotes to prevent shell metacharacter injection.
4. After any create, edit, or move: provide the ticket URL as a clickable link using `defaults.server` (e.g., `https://jira.example.com/browse/{KEY}`).

If a required field (project, summary) is missing from both the user's prompt and config defaults, ask — don't guess.

## Description & comment formatting

The `jira` CLI converts rich-text bodies (`--description`, comment/worklog `--body`) for you by deployment — you never hand-write ADF or use the web editor:

- **Cloud (default):** author in **Markdown** — the CLI renders it to ADF (Atlassian's stored rich-text format).
- **Data Center** (`jira.disney.com`, via `JIRA_SERVER`): author in **wiki markup** — sent verbatim: `h3.` headings, `*bold*`, `{{code}}`, `* item`, `# item`, `[text|url]`, `{code}...{code}`.

**Default to Markdown** — Cloud is the default deployment. Use wiki markup only when the target is Data Center (`--server`/config points at `jira.disney.com`, or `jira auth status` reports `deployment: dc`).

Author in **Markdown** for Cloud. Supported (what the converter handles): headings `#`–`######`, **bold**/*italic*/inline code, bullet (`-`/`*`) and numbered (`1.`) lists, links `[text](url)`, fenced code blocks, block quotes `>`, horizontal rules `---`.

Actively apply formatting when the user provides structured content (criteria, steps, findings): render it as Markdown lists or headings, not flat prose.

- **Not converted** — pipe tables render as literal text; Markdown image syntax is dropped (only its alt text survives as plain text). Use lists instead of tables.
- **Gotcha:** a single newline is a soft break → becomes a space in ADF. Use a blank line to separate paragraphs and list blocks.
- **Gotcha:** don't apply bold/italic to an inline-code span (bold + code on the same text) — Jira Cloud rejects a code mark combined with strong/em (`INVALID_INPUT`).

## Error Handling

- If the CLI returns an error, show the error message and suggest fixes
- If a required field is missing, ask the user rather than guessing
- For `create`, always confirm the issue was created by checking the JSON response for the issue key
