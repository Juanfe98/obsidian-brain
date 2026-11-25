# jira-ticket

A Claude Code skill for interacting with Jira via natural language. Translates prose into [jira-cli](https://github.com/ankitpokhrel/jira-cli) commands, handling custom field mappings, project conventions, user specified default values, and Jira markup translation.

## Prerequisites

- [Homebrew](https://brew.sh)
- [jira CLI](https://github.com/ankitpokhrel/jira-cli) — for all Jira operations
- [jq](https://jqlang.github.io/jq/) — for custom field discovery

The installer will attempt to use `brew` to install `jira` and `jq` for you if they're missing.

## Setup

1. Clone this repo and run the installer:

   ```sh
   git clone git@github.twdcgrid.net:AIX/skills.git
   cd skills/skills/jira-ticket
   ./scripts/install.sh
   ```

2. Configure authentication for the jira CLI:

   ```sh
   jira init
   ```

3. Link the skill into Claude Code using [skillsrc](https://github.twdcgrid.net/AIX/skillsrc) (recommended), or manually:

   ```sh
   ln -sfn /path/to/skills/jira-ticket ~/.claude/skills/jira-ticket
   ```

## Usage

Invoke with `/jira-ticket` followed by natural language.

### Create issues

```
/jira-ticket create a story for adding retry logic to the upload service, 3 points
/jira-ticket create a bug — login page throws 500 when email has a plus sign
/jira-ticket create a task to update the staging environment to Java 21
```

### Find and query

```
/jira-ticket list my open stories
/jira-ticket find all high-priority bugs assigned to me
/jira-ticket what's in the current sprint?
/jira-ticket -q "project = SLQA AND status = 'In Progress'"
```

### Manage issues

```
/jira-ticket move SLQA-100 to In Progress
/jira-ticket assign SLQA-100 to me
/jira-ticket link SLQA-100 blocks SLQA-101
/jira-ticket comment on SLQA-100: discussed with the team, deferring to next sprint
```

### View issues

```
/jira-ticket view SLQA-100
/jira-ticket view SLQA-100 and show me the comments
```

View returns a concise summary by default — no comments. Ask for comments explicitly when you need them.

## Configuration

The skill reads config from `~/.config/jira-ticket/jira-ticket.yaml`, created by the installer.

Configure with natural language — the skill manages the YAML for you:

```
/jira-ticket set the default project to SLQA
/jira-ticket set default type to Task
/jira-ticket set default priority to Medium
/jira-ticket set default labels to backend
/jira-ticket add custom field story-points as customfield_10047
/jira-ticket show my jira settings
```

The installer bootstraps these defaults out of the box:

| Default | Value | Why |
|---------|-------|-----|
| `type` | Story | Most common issue type — override per-request with "create a bug..." |
| `server` | `https://deept.atlassian.net` | Used for building browse URLs — set this to your Jira instance |

The config has three sections:

| Section | What it holds |
|---------|---------------|
| `defaults` | Freeform defaults for commands (project, type, priority, labels, etc.). Shown in the create preview as prose; anything you specify in your prompt overrides them. |
| `custom_fields` | Maps friendly names to Jira custom field keys |
| `after_create` | Steps run on a newly created issue once the create succeeds. See below. |

All default keys are normalized to lowercase. Setting a key that already exists overwrites it.
`after_create` values are status names passed to Jira, so their case is preserved.

### Post-create actions (`after_create`)

`defaults` and `custom_fields` are create-time *field values*. A standing preference
like "always move my new tickets to In Progress" is an action on the issue afterwards,
so it lives in `after_create`:

```yaml
after_create:
  transition_to: In Progress
```

```
/jira-ticket always move new tickets to In Progress
/jira-ticket stop moving new tickets automatically
```

The configured status appears in the create preview before anything runs, so you can
veto or change it for that one ticket. After the create the skill transitions the new
issue and reports its link.

Status names are per-project: `In Progress` is not universal (some workflows use
`In Development` or `Started`). If the configured status is not an available
transition, the skill tells you the issue *was* created, lists the transitions the
project actually offers, and does not claim the move happened — so you can pick a
valid name and correct the config.

`transition_to` is the only key supported today.

See `jira-ticket.example.yaml` for the full file format.

## Running Evals

The skill uses the repository-wide WAZA convention. The deterministic CI task
requires no Jira instance or model credential; live behavioral tasks must
degrade honestly if Jira is unavailable.

### Prerequisites

- Install the catalog-pinned runner: `aix add waza`
- For live-model runs, provide a Copilot-capable `GITHUB_TOKEN`

### Quick start

Run from the repository root:

```sh
waza spec verify skills/jira-ticket \
  skills/jira-ticket/evals/eval.yaml \
  --fail --no-update-check
waza run skills/jira-ticket/evals/eval.yaml \
  --tags ci --no-update-check
```

Run validation and held-out tasks with baseline A/B:

```sh
python3 scripts/skill_evals/run_live_matrix.py \
  --waza "$(command -v waza)" \
  --skill jira-ticket \
  --model claude-sonnet-4.6 \
  --tag validation --tag heldout \
  --output-dir /tmp/jira-ticket-waza
```

### Eval categories

| Category | Count | What it tests |
|----------|-------|---------------|
| Base | 5 | Happy-path single actions (create, move, jql, assign) |
| Adversarial | 12 | Edge cases: ambiguous routing, markup, missing fields, repeatable flags, config overrides |
| Multi-step | 11 | Sequenced operations and output dependencies |
| Error handling | 6 | Honest handling of failed or partial Jira operations |

See `evals/COVERAGE.md` and `docs/skill-evaluations.md` for the assertion
matrix, partitions, and shared output contract.

## Adding Custom Fields

If you see a field in the Jira UI that isn't mapped:

1. Find an issue with the field populated
2. Dump its raw JSON: `jira --agent issue get ISSUE-KEY | jq '.data.fields | to_entries[] | select(.value != null)'`
3. Find the `customfield_NNNNN` key matching the value you want
4. Add it via the skill: `/jira-ticket add custom field <name> as customfield_NNNNN`
