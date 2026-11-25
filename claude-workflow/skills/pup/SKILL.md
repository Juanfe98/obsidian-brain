---
name: pup
description: >
  Datadog API CLI (pup) for metrics, logs, monitors, traces, APM, incidents, dashboards,
  SLOs, security, RUM, and 30+ other Datadog API domains. Use when user asks about
  Datadog observability, monitoring, log search, metric queries, incident management,
  or service health. Also use for audit logs, synthetics, and on-call.
metadata:
  requires:
    bins: ["pup"]
---

# Datadog API CLI (pup)

CLI for querying and managing Datadog via OAuth2 or API key auth. Self-documenting — use `--help` on any command for full details.

## Discovery

```bash
pup --help                            # Full list of command groups
pup <command> --help                  # Subcommands for a domain
pup <command> <subcommand> --help     # Flags, parameters, and detailed docs
```

Always run `--help` before constructing a command you haven't used before.

## Authentication

Sign in to your own Datadog org from the AIX Manager (Connections tab) or with `pup auth login` for a browser OAuth2 sign-in.
Commands then run against your org automatically.

```bash
pup auth login                         # Browser-based OAuth2 login to your Datadog org (OAuth2+PKCE)
pup auth login --org dtci-technology   # Add a named organization session
pup --org dtci-technology logs search --query "service:unison-ui" --from 1h
pup auth status                        # Check current session and which org is active
```

`--org` selects credentials for an organization. `--site`/`DD_SITE` selects the
Datadog region, not the organization; organizations such as `disneystreaming`
and `dtci-technology` can both use `datadoghq.com`.

Automation may instead inject `DD_API_KEY` + `DD_APP_KEY` from Vault.

## Command Map

| Command | Scope |
|---------|-------|
| `logs` | Search, aggregate, and analyze logs |
| `metrics` | Query and manage metrics |
| `monitors` | CRUD monitors, mute, search |
| `traces` | Search and aggregate APM traces |
| `apm` | APM services and entities |
| `incidents` | CRUD incidents |
| `dashboards` | CRUD dashboards |
| `slos` | Manage Service Level Objectives |
| `events` | CRUD Datadog events |
| `downtime` | Manage monitor downtimes |
| `security` | Security monitoring and signals |
| `rum` | Real User Monitoring |
| `synthetics` | Synthetic monitoring tests |
| `on-call` | Teams and on-call operations |
| `audit-logs` | Query audit log entries |
| `service-catalog` | Service catalog management |
| `ddsql` | Query Datadog data using SQL |
| `bits` | Ask Datadog Bits AI questions |
| `infrastructure` | Infrastructure monitoring |
| `dbm` | Database Monitoring query samples |
| `workflows` | Manage Datadog workflows |
| `api` | Raw authenticated API requests |

Run `pup --help` for the full list of command groups.

## Query Syntax

**Logs:** `status:error`, `service:web-app`, `@attr:val`, `host:i-*`, `"exact phrase"`, `AND/OR/NOT`, `-status:info` (negation)

**Metrics:** `<aggregation>:<metric>{<filter>} by {<group>}` — e.g., `avg:system.cpu.user{env:prod} by {host}`. Aggregations: avg, sum, min, max, count

**APM/Traces:** `service:<name> resource_name:<path> @duration:>5000000000 status:error` — durations are in **nanoseconds**

**Monitors:** Use `--name` for substring search, `--tags` for tag filtering

**RUM:** `@type:error @session.type:user @view.url_path:/checkout service:<app-name>`

## Time Ranges

Always specify `--from` explicitly. Accepts relative (`5m`, `1h`, `7d`) or absolute (RFC3339, Unix ms).

```bash
--from=1h                              # Last hour
--from=30m --to=now                    # Last 30 minutes
--from=7d --to=1d                      # 7 days ago to 1 day ago
--from=2024-01-01T00:00:00Z           # Absolute
```

## Gotchas

**APM durations are in nanoseconds.** 1 second = 1000000000, 5ms = 5000000.

**Use aggregation for counts.** Don't fetch raw logs to count them — use `pup logs aggregate --compute=count` instead.

**Start narrow.** Use small `--limit` values and short time ranges first, then widen.

**Filter at the API level.** Don't pipe large JSON through jq transforms — use query filters.

**Check output flags with `--help`.** Run `pup <command> --help` to confirm the exact output-format flag and value set before relying on it.
