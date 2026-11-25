---
name: weaponx-cli
version: 0.59.0
description: >
  Agent-friendly WeaponX CLI for experiments, feature flags, and audiences. Use when user mentions: weaponx, experiment, feature flag, feature toggle, audience.
scope: segment
segment: "product-and-technology"
roles: ["engineer", "product"]
metadata:
  generated: true
  requires:
    bins: ["weaponx"]
---

# Agent-friendly WeaponX CLI for experiments, feature flags, and audiences

## Quick Reference

```bash
# Experiments
weaponx --agent experiment list
weaponx --agent experiment list --team my-team --state Running
weaponx --agent experiment get <uuid>
weaponx --agent experiment force-assign <uuid> --variant my-variant --participant-id <uuid> --dry-run
weaponx --agent --allow-writes experiment force-assign <uuid> --variant my-variant --participant-id <uuid>

# Flags
weaponx --agent flag list
weaponx --agent flag list --team my-team
weaponx --agent flag get <uuid>
weaponx --agent flag audit-log <uuid>
weaponx --agent flag features --team my-team
weaponx --agent flag feature wpnx-my-feature

# Audiences
weaponx --agent audience list
weaponx --agent audience list --partner my-partner
weaponx --agent audience get <id>

# Teams
weaponx --agent user teams
weaponx --agent user team my-team

# Experiment Results (runs the pinned WeaponX MCP; needs Node.js)
weaponx --agent experiment results <uuid>
weaponx --agent experiment results <uuid> --role alliance,primary --limit 100
weaponx --agent experiment compare <uuid>,<uuid> --metric hours,stream_days
weaponx --agent metric list --search stream_days
weaponx --agent experiment by-metric <metric-uuid> --max-pvalue 0.05
weaponx --agent metric domains

```

## Authentication

- Method: JWT browser SSO
- Setup: weaponx auth login (captures scarifSSO from browser localStorage via Playwright; cached at ~/.cliuniverse/weaponx-token.json)
- A valid token in the WeaponX MCP's ~/.weaponx-mcp/token also signs the CLI in. `weaponx auth logout` leaves that file untouched, so the MCP stays signed in. A nonempty WEAPONX_JWT_TOKEN always wins for requests and logout does not clear it.
- Successful `weaponx --agent auth logout` exits 0 when the CLI's own state is cleared. If `data.mcpTokenRemains` is true, the CLI is still signed in via the MCP token; sign out of the WeaponX MCP or remove its token file to end that sign-in.
- `data.stillSignedInVia` names the source the CLI still uses for authentication. If it names WEAPONX_JWT_TOKEN, unset that variable; if `data.mcpTokenRemains` is also true, end the MCP sign-in too.
- With an older binary whose logout response lacks `mcpTokenRemains`, run `weaponx --agent auth status` and check `data.authenticated` before asserting sign-out; logout can keep sharing the MCP token.

## Workflows

### Check Experiment Status

```bash
weaponx --agent experiment list --team <team>
weaponx --agent experiment get <uuid>
```

### Read Experiment Results

```bash
weaponx --agent experiment list --team <team>
weaponx --agent experiment results <uuid> --role alliance,primary
weaponx --agent experiment results <uuid> --role guardrail
```

### Find Experiments That Moved a Metric

```bash
weaponx --agent metric list --search <title>
weaponx --agent experiment by-metric <metric-uuid> --max-pvalue 0.05
weaponx --agent experiment compare <uuid>,<uuid> --metric <title>
```

### Audit Feature Flag

```bash
weaponx --agent flag list --team <team>
weaponx --agent flag get <uuid>
weaponx --agent flag audit-log <uuid>
```

### Explore Feature Groups

```bash
weaponx --agent flag features --team <team>
weaponx --agent flag feature <feature-id>
weaponx --agent flag list --feature <feature-name>
```

### Force a QA Variant Assignment

```bash
weaponx --agent experiment get <uuid>
weaponx --agent experiment force-assign <uuid> --variant <variant-name> --participant-id <uuid> --dry-run
weaponx --agent --allow-writes experiment force-assign <uuid> --variant <variant-name> --participant-id <uuid>
```

## Tips

- Always use --agent for structured JSON output
- Use --team to filter experiments and flags by team
- Flag and experiment IDs are UUIDs — get them from list commands first
- Use flag features to see feature groups, then flag feature <id> for details
- Read targetPlatform before saying a flag or experiment is on in production: Live is production, Test is QA/non-prod, PreProd is pre-production. Each flag and experiment belongs to one platform, and a feature's per-platform copies are independent and often share a name, so tell them apart by targetPlatform (keep it in any --fields list), never by name
- Use --fields to select only needed fields for token efficiency
- Run `weaponx agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`weaponx --agent experiment list --help`); a bare `weaponx --agent --help` returns the whole schema
- Pick the results command by question: `experiment results <uuid>` for one experiment's results by tier (ALLIANCE, PRIMARY, CORE, SECONDARY, GUARDRAIL); `experiment compare` for the same 1-5 metrics across up to 50 experiments; `experiment by-metric <metric-uuid>` for every experiment that moved one metric; `metric list --search` to find a metric's title or metricId first
- experiment results/compare/by-metric and metric list/domains run the pinned WeaponX MCP (@weaponx/mcp 1.6.0) through npx from Artifactory, so they need Node.js 20+; if it is missing, ask the user to install Node.js from AIX Manager or run `aix add node` in their own terminal, because an agent's `aix add node` is refused; the first run downloads the package
- Only `experiment results` needs a WeaponX login, and it refuses a token with 10 minutes or less left; compare, by-metric and metric list read the 626 results reader without one
- `experiment results` returns overall rows by default: pass `--dimension all` (with `--dimension-depth`) or one group key for breakdowns, and check `summary.availableDimensions`

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| treating empty experiment results as no effect | Results appear about 51 hours after start and refresh daily. The CLI turns the upstream failures the MCP masks as empty data into errors, so empty usually means not computed yet |
| --offset on experiment results or by-metric | They return one window; raise --limit instead |
| guess UUIDs | Always list first to get valid IDs — UUIDs are not guessable |
| list without --team filter | Unfiltered lists may return very large result sets |
| force-assign with --allow-writes before --dry-run | This changes real bucketing for a real participant — always preview first |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `weaponx experiment results`

Analyzed results of one experiment, grouped by metric and tier (runs the pinned WeaponX MCP; needs Node.js)

- `<id>`: Experiment ID (UUID) **(required)**
- `--metric`: Only these metric titles (repeatable or comma-separated), e.g. hours
- `--domain`: Only metrics of this domain
- `--role`: Only these metric tiers (repeatable or comma-separated)
- `--mode`: Latest results (default), or a cumulative or daily time series
- `--dimension`: Breakdown: overall (default), all, or one dimension group key
- `--dimension-value`: Keep only this value of --dimension (case-insensitive)
- `--dimension-depth`: Deepest cross-tab kept when --dimension is not overall (0-10, default 1)
- `--all-exposure-types`: Keep every exposure type instead of one per slice

### `weaponx experiment compare`

Cumulative results for the same metrics across experiments (runs the pinned WeaponX MCP; needs Node.js)

- `<ids>`: Experiment IDs (UUIDs, 1-50; space- or comma-separated) **(required)**
- `--metric`: Metric titles to compare (1-5; repeatable or comma-separated), e.g. hours **(required)**
- `--dimension`: Also return slices of these dimension group keys (repeatable or comma-separated)
- `--all-dimensions`: Return every dimension slice, not only overall rows

### `weaponx experiment by-metric`

Experiments with results for one metric, largest favorable lift first (runs the pinned WeaponX MCP; needs Node.js)

- `<metric_id>`: Metric ID (UUID): the metricId from `weaponx metric list` **(required)**
- `--dimension`: Keep slices whose dimension key has this value, as key=value (repeatable or comma-separated)
- `--dimension-key`: Keep slices of exactly these dimension keys, any value (repeatable or comma-separated)
- `--experiment`: Only these experiments (UUIDs; repeatable or comma-separated)
- `--max-pvalue`: Keep rows with a p-value at or below this, e.g. 0.05
- `--min-relative-lift`: Keep rows whose favorable relative lift is at least this (>= 0)
- `--include-unfavorable`: Also keep rows where the treatment moved the metric the wrong way

### `weaponx experiment list`

List experiments (optionally filtered by team)

- `--team`: Filter by team name
- `--state`: Filter by state, case-insensitive: Archived, Draft, Expired, Ready, Running, Scheduled or Terminated

### `weaponx experiment get`

Get experiment details by ID

- `<id>`: Experiment ID (UUID) **(required)**

### `weaponx experiment force-assign`

Force a participant into a specific experiment variant, overriding normal randomized bucketing (QA/testing). WRITE: refused unless --allow-writes or --dry-run is set

- `<experiment_id>`: Experiment ID (UUID) **(required)**
- `--variant`: Variant name to force (e.g., treatment-nbo-offer-randomization) **(required)**
- `--participant-id`: Participant ID to force-assign (UUID) **(required)**
- `--identifier-type`: Identifier type for participant-id (server default applies if omitted). Free-form string, not an enum: the full valid IdentifierType set isn't known, and the real WeaponX UI omits this field entirely rather than picking one
- `--dry-run`: Preview the request without executing

### `weaponx flag list`

List feature flags (optionally filtered by team or feature)

- `--team`: Filter by team name
- `--feature`: Filter by feature name (substring match)

### `weaponx flag get`

Get feature flag details by ID

- `<id>`: Feature flag ID (UUID) **(required)**

### `weaponx flag audit-log`

Get audit log for a feature flag

- `<id>`: Feature flag ID (UUID) **(required)**

### `weaponx flag features`

List features (feature groups that contain flags)

- `--team`: Filter by team name

### `weaponx flag feature`

Get a feature by ID

- `<id>`: Feature ID (e.g., "wpnx-my-feature") **(required)**

### `weaponx audience list`

List targeting lists (audiences)

- `--partner`: Filter by partner name

### `weaponx audience get`

Get targeting list details by ID

- `<id>`: Targeting list ID **(required)**

### `weaponx user teams`

List teams

### `weaponx user team`

Get team details by name or ID

- `<name>`: Team name or ID **(required)**

### `weaponx metric list`

List the metric catalog: metricId, title, description, source (runs the pinned WeaponX MCP; needs Node.js)

- `--domain`: Only metrics of this domain
- `--search`: Case-insensitive substring of the metric title or description

### `weaponx metric domains`

List the metric domains --domain accepts (runs the pinned WeaponX MCP; needs Node.js)

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--summary` | Summary mode (counts and statuses only). Alias: --brief | - |
| `--concise` | Concise mode: all fields except body/description/content | - |
| `--full` | Preserve full API payloads, including null-valued fields | - |
| `--limit` | Max items to return | 25 |
| `--offset` | Pagination offset | 0 |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override WeaponX base URL | - |
| `--timeout` | Request timeout in milliseconds (> 0); `[weaponx]`/`[global]` timeout_ms, else 30000 | - |
| `--debug` | Print debug info to stderr | - |
| `--allow-writes` | Allow high-impact writes (e.g., experiment force-assign) | - |
