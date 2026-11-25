---
name: dd-cli
version: 0.59.0
description: >
  Datadog gap commands (k8s, mesh, pipeline, profiler, watchdog, database, session, analysis). Use when user mentions: datadog, kubernetes, k8s, pods, mesh, profiler, watchdog, pipeline, session replay.
roles: ["engineer", "data-analytics", "qa", "ops"]
metadata:
  generated: true
  requires:
    bins: ["datadog"]
---

# Datadog gap commands (k8s, mesh, pipeline, profiler, watchdog, database, session, analysis)

## Quick Reference

```bash
# Kubernetes
datadog --agent k8s clusters
datadog --agent k8s pods --cluster my-cluster
datadog --agent k8s deployments --cluster my-cluster
datadog --agent k8s workload-health --cluster prod
datadog --agent k8s events --cluster prod
datadog --agent k8s metrics --query "kubernetes.cpu.usage{*}"

# Service Mesh
datadog --agent mesh services
datadog --agent mesh service-health my-svc
datadog --agent mesh topology
datadog --agent mesh traffic-flow frontend backend
datadog --agent mesh error-rates

# Analysis (Smart Diagnostics)
datadog --agent analysis diagnose-service --service myapp
datadog --agent analysis error-spike --service myapp --from 2024-01-01T00:00:00Z --to 2024-01-02T00:00:00Z
datadog --agent analysis latency-anomaly --service myapp
datadog --agent analysis correlated-services --service myapp
datadog --agent analysis health-summary --service myapp
datadog --agent analysis recommendations --service myapp

# Profiler
datadog --agent profiler search --query "service:web"
datadog --agent profiler flamegraph --service web-api
datadog --agent profiler code-hotspots --service web-api

# Watchdog
datadog --agent watchdog alerts
datadog --agent watchdog alerts --service web-api
datadog --agent watchdog summary

# Database
datadog --agent database hosts
datadog --agent database health db-host-1
datadog --agent database slow-queries --host pg-master

# Pipelines (Log Processing)
datadog --agent pipeline list
datadog --agent pipeline get pipe-id

# Session Replay (RUM)
datadog --agent session list-replays
datadog --agent session search-sessions --query "@user.email:alice*"

```

## Authentication

- Method: OAuth2 through pup; the datadog gap CLI automatically brokers requests through the selected pup session. DD_API_KEY + DD_APP_KEY remain for Vault/environment automation.
- Setup: Sign in from AIX Manager or run `pup auth login`. Use `--org <profile>` for another organization and `--site <region>` only when the Datadog region differs.

## Datadog Query Language Syntax

Applies to: k8s metrics --query flag and analysis commands

```
# CPU usage
avg:kubernetes.cpu.usage{*}

# By cluster
avg:kubernetes.memory.usage{cluster:prod}

# Service filter
avg:trace.http.request.duration{service:web-api}

```

## Workflows

### Service Diagnosis

```bash
datadog --agent analysis diagnose-service --service {service}
datadog --agent analysis error-spike --service {service} --from {start} --to {end}
datadog --agent analysis correlated-services --service {service}
datadog --agent k8s pods --cluster {cluster} --namespace {ns}
```

### Kubernetes Investigation

```bash
datadog --agent k8s clusters
datadog --agent k8s pods --cluster {cluster}
datadog --agent k8s workload-health --cluster {cluster}
datadog --agent k8s events --cluster {cluster}
```

## Tips

- Always use --agent for structured JSON output
- Use pup for monitors, logs, metrics, dashboards — this CLI covers gap commands only
- Use --limit to control response size
- Start with `analysis diagnose-service` for broad overview before drilling down
- Read-only by default — use --allow-writes for create/update/delete operations
- Help for a delegated verb comes from the vendor: `datadog --agent <verb> --help`, in either flag order, passes `--agent` to pup where it was typed. Rule: rust/cli-universe/docs/vendor-help-delegation.md

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| write operations without --allow-writes | Read-only by default to protect production monitoring |
| k8s metrics without --query | Must specify a Datadog query to fetch metrics |
| monitors/logs/traces commands | Use pup for those — this CLI only covers gap commands |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `datadog k8s clusters`

List Kubernetes clusters

### `datadog k8s pods`

List pods

### `datadog k8s deployments`

List deployments

### `datadog k8s nodes`

List nodes

### `datadog k8s namespaces`

List namespaces

### `datadog k8s events`

Get Kubernetes events for a cluster

- `--cluster`: Cluster name **(required)**

### `datadog k8s daemonsets`

List daemonsets in a cluster

- `--cluster`: Cluster name **(required)**

### `datadog k8s services`

List services in a cluster

- `--cluster`: Cluster name **(required)**

### `datadog k8s workload-health`

Get workload health for a cluster namespace

- `--cluster`: Cluster name **(required)**
- `--namespace`: Namespace

### `datadog k8s metrics`

Query Kubernetes metrics

- `--query`: Metrics query string **(required)**

### `datadog mesh services`

List mesh services

### `datadog mesh virtual-services`

List virtual services (Istio/Envoy)

### `datadog mesh service-health`

[experimental] Get mesh service health

- `<name>`: Service name **(required)**

### `datadog mesh topology`

[experimental] Get mesh topology

### `datadog mesh traffic-flow`

Get mesh traffic flow between services

- `<source>`: Source service **(required)**
- `<dest>`: Destination service **(required)**

### `datadog mesh error-rates`

Get mesh error rates

- `<service>`: Service name (optional, all if omitted)

### `datadog mesh latency`

Get mesh latency metrics

- `<service>`: Service name (optional, all if omitted)

### `datadog mesh istio-metrics`

Get Istio/Envoy metrics

- `<service>`: Service name (optional, all if omitted)

### `datadog mesh mtls-status`

[experimental] Get mTLS status for mesh services

### `datadog mesh analyze-traffic`

Analyze mesh traffic patterns

- `<service>`: Service name **(required)**

### `datadog pipeline list`

List all log processing pipelines

### `datadog pipeline get`

Get a single pipeline by ID

- `<id>`: Pipeline ID **(required)**

### `datadog pipeline create`

Create a new log processing pipeline

- `--name`: Pipeline name **(required)**
- `--filter`: Filter query for the pipeline **(required)**
- `--is-enabled`: Enable the pipeline

### `datadog pipeline update`

Update an existing pipeline

- `<id>`: Pipeline ID **(required)**
- `--name`: Pipeline name
- `--filter`: Filter query for the pipeline
- `--is-enabled`: Enable or disable the pipeline

### `datadog pipeline delete`

Delete a pipeline

- `<id>`: Pipeline ID **(required)**

### `datadog profiler search`

[experimental] Search profiles

- `--query`: Profile query string **(required)**
- `--from`: Start time (ISO 8601 or epoch)
- `--to`: End time (ISO 8601 or epoch)

### `datadog profiler summary`

[experimental] Get profile summary

- `<id>`: Profile ID **(required)**

### `datadog profiler get-metrics`

[experimental] Get profiling metrics for a service

- `--service`: Service name **(required)**

### `datadog profiler flamegraph`

[experimental] Get flamegraph data for a service

- `--service`: Service name **(required)**
- `--profile-id`: Profile ID

### `datadog profiler code-hotspots`

[experimental] Get code hotspots for a service

- `--service`: Service name **(required)**

### `datadog profiler endpoint-profiling`

[experimental] Get endpoint profiling for a service

- `--service`: Service name **(required)**
- `--endpoint`: Endpoint name

### `datadog watchdog alerts`

List Watchdog alerts (Events API, source:watchdog)

- `--service`: Filter to a single service
- `--from`: Start of the time range (e.g. `now-1d` or an ISO 8601 timestamp)
- `--to`: End of the time range (e.g. `now` or an ISO 8601 timestamp)

### `datadog watchdog details`

Get Watchdog alert (event) details by id

- `<id>`: Event ID (from `watchdog alerts`) **(required)**

### `datadog watchdog summary`

Get a Watchdog alert summary (counts derived from source:watchdog events)

### `datadog database hosts`

List database hosts (DBM)

### `datadog database health`

Get database host health (DBM)

- `<id>`: Host ID **(required)**

### `datadog database connections`

[experimental] Get database connections for a host

- `--host`: Host identifier **(required)**

### `datadog database locks`

[experimental] Get database locks for a host

- `--host`: Host identifier **(required)**

### `datadog database wait-events`

[experimental] Get database wait events for a host

- `--host`: Host identifier **(required)**

### `datadog database slow-queries`

[experimental] Get slow queries for a host

- `--host`: Host identifier **(required)**

### `datadog database query-samples`

[experimental] Get query samples for a host

- `--host`: Host identifier **(required)**

### `datadog database query-plan`

[experimental] Get query execution plan

- `--host`: Host identifier **(required)**
- `--query-id`: Query ID **(required)**

### `datadog database query-metrics`

[experimental] Get database metrics for a host

- `--host`: Host identifier **(required)**

### `datadog session list-replays`

List session replays

- `--query`: Optional query filter

### `datadog session get-replay`

[experimental] Get session replay data by session ID

- `<id>`: Session ID **(required)**

### `datadog session search-sessions`

Search sessions

- `--query`: Search query **(required)**

### `datadog session session-events`

Get events for a specific session

- `<id>`: Session ID **(required)**

### `datadog session correlate-errors`

Correlate errors for a specific session

- `--session-id`: Session ID **(required)**

### `datadog analysis error-spike`

Analyze an error spike for a service

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)
- `--from`: Start time (ISO 8601) **(required)**
- `--to`: End time (ISO 8601) **(required)**
- `--summary`: Return summary (id, timestamp, status, service, message≤200) instead of raw events

### `datadog analysis latency-anomaly`

Detect latency anomalies for a service

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)
- `--threshold`: Threshold percentile (e.g., 0.95)
- `--summary`: Return summary (status, percentiles, trend) instead of raw pointlist

### `datadog analysis change-point`

Detect change points in a metric

- `--query`: Metric query **(required)**
- `--from`: Start time (epoch seconds) **(required)**
- `--to`: End time (epoch seconds) **(required)**

### `datadog analysis correlated-services`

Find correlated services for a given service

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging). Omit to query all environments

### `datadog analysis slos`

List SLOs filtered by service and/or tags

- `--service`: Service name (filters SLOs by service tag)
- `--tags`: Comma-separated tags (e.g., "team:glo,env:prod")

### `datadog analysis metrics-active`

Check if metrics are actively reporting (batched, 1h window)

- `<metrics>`: Metric names to check **(required)**

### `datadog analysis metrics-search`

Search metric names by prefix

- `--prefix`: Metric name prefix (e.g., "resilience4j") **(required)**

### `datadog analysis deployment-correlation`

Correlate deployment events with metrics

- `--service`: Service name **(required)**
- `--from`: Start time (ISO 8601) **(required)**
- `--to`: End time (ISO 8601) **(required)**

### `datadog analysis slo-breach-prediction`

Predict SLO breach based on current burn rate

- `--slo-id`: SLO ID **(required)**

### `datadog analysis incident-impact`

Predict incident impact

- `--incident-id`: Incident ID **(required)**

### `datadog analysis similar-incidents`

Find similar past incidents

- `--incident-id`: Incident ID to compare **(required)**

### `datadog analysis rca`

Get Root Cause Analysis report

- `--service`: Service name **(required)**
- `--from`: Timeframe start (ISO 8601) **(required)**
- `--to`: Timeframe end (ISO 8601) **(required)**

### `datadog analysis trace-root-cause`

Trace an error to its root cause

- `--trace-id`: Trace ID **(required)**

### `datadog analysis diagnose-service`

Diagnose a service issue

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)

### `datadog analysis signal-correlation`

Calculate signal correlation between two metrics

- `--query-a`: First metric query **(required)**
- `--query-b`: Second metric query **(required)**
- `--from`: From (epoch seconds) **(required)**
- `--to`: To (epoch seconds) **(required)**

### `datadog analysis recurring-pattern`

Detect recurring patterns in logs

- `--query`: Log query **(required)**

### `datadog analysis cluster-errors`

Cluster error messages for a service

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)

### `datadog analysis anomaly-timeline`

Get anomaly timeline for a service

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)
- `--from`: From time (ISO 8601) **(required)**
- `--to`: To time (ISO 8601) **(required)**

### `datadog analysis recommendations`

Get proactive recommendations for a service

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)

### `datadog analysis deployment-impact`

Get deployment impact analysis

- `--service`: Service name **(required)**
- `--deploy-id`: Deploy event ID or tag **(required)**

### `datadog analysis watchdog-correlation`

Correlate Watchdog alerts with incidents

- `--alert-id`: Watchdog alert ID **(required)**

### `datadog analysis correlate-signals`

Correlate signals around a point in time

- `--time`: Center time (ISO 8601) **(required)**
- `--service`: Service name
- `--window`: Window in seconds

### `datadog analysis error-rate-anomaly`

Detect error rate anomaly

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)
- `--summary`: Return summary (status, score, rates) instead of raw timeseries

### `datadog analysis compare-traces`

Compare trace performance between two time periods

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)
- `--baseline-from`: Baseline start (ISO 8601) **(required)**
- `--baseline-to`: Baseline end **(required)**
- `--compare-from`: Compare start **(required)**
- `--compare-to`: Compare end **(required)**

### `datadog analysis metric-cardinality`

Estimate metric cardinality

- `--metric`: Metric name **(required)**

### `datadog analysis container-health`

Analyze container health

- `--filter`: Container ID or name filter **(required)**

### `datadog analysis memory-analysis`

Analyze memory allocation patterns

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)

### `datadog analysis compare-database`

Compare database performance between two periods

- `--host`: Database host **(required)**
- `--from`: From period **(required)**
- `--to`: To period **(required)**

### `datadog analysis log-aggregate`

Aggregate logs with custom grouping and compute

- `--service`: Service name **(required)**
- `--env`: Environment (e.g., prod, staging)
- `--query`: Additional query filter (appended to service/env filter)
- `--group-by`: Group-by facets (repeatable, e.g. --group-by @partner --group-by @response.statusCode)
- `--compute`: Compute type: "count" or "cardinality:@fieldName"
- `--from`: Start time (ISO 8601) **(required)**
- `--to`: End time (ISO 8601) **(required)**
- `--compare-window`: Compare against a baseline period ending at --from (e.g. "1h", "45m"). Fetches baseline, normalizes to current window rate, and returns delta%
- `--count-distinct`: Count distinct values of a field per group via native cardinality aggregation. Adds a second compute to the API call (result in computes.c1)

### `datadog analysis compare-profiles`

Compare profiling data between two periods

- `--service`: Service name **(required)**
- `--baseline`: Baseline **(required)**
- `--compare`: Compare to **(required)**

### `datadog analysis health-summary`

Composite service health check: error count + baseline comparison + affected users

- `--service`: Service name **(required)**
- `--env`: Environment
- `--window`: Duration window (e.g., 15m, 1h, 30m)

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
| `--org` | Named pup organization session (see `pup auth login --org`) | - |
| `--site` | Datadog region/site | - |
| `--allow-writes` | Enable write operations (read-only by default; or set DD_ALLOW_WRITES=true) | - |
| `--yes` | Skip confirmation prompts for destructive operations (or set DD_AUTO_APPROVE=true) | - |
| `--cursor` | Pagination cursor for v2 endpoints (from next_action metadata) | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--timeout` | Request timeout in milliseconds (> 0); `[datadog]`/`[global]` timeout_ms, else 30000 | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--debug` | Print debug info to stderr | - |
