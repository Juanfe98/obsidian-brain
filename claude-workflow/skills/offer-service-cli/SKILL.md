---
name: offer-service-cli
version: 0.59.0
description: >
  Agent-friendly offer service CLI — look up streaming campaigns and offers via GraphQL, discovery and lookup only. Use when user mentions: offer, campaign, sku, pricing, streaming offer, offer-service, disney offer, hulu offer, espn offer.
scope: segment
segment: "product-and-technology"
roles: ["product", "marketing"]
metadata:
  generated: true
  requires:
    bins: ["offer-service"]
---

# Agent-friendly offer service CLI — look up streaming campaigns and offers via GraphQL, discovery and lookup only

## Quick Reference

```bash
# Search Offers
offer-service search --agent
offer-service search --country US --brand disney --billing-period month --agent
offer-service search --brand hulu --campaign-type promotional-campaign --agent
offer-service search --brand espn --purchase-flow switch-flow --agent
offer-service search --brand star --country GB --agent
offer-service search --package-id disney_base --package-id flagship_ads_bundle --agent
offer-service search --phase-type full-price --billing-period year --agent
offer-service search --phase-type free-trial --brand disney --agent
offer-service search --campaign-type upsell-campaign --brand hulu --agent
offer-service search --inactive --allow-test-offers --agent

# Get Campaign
offer-service get --campaign-id <uuid> --agent
offer-service get --campaign-id <uuid> --offer-id <uuid> --agent
offer-service get --campaign-id <uuid> --country GB --agent

# Production
offer-service search --env prod --agent
offer-service search --env prod --brand disney --billing-period month --agent
offer-service get --campaign-id <uuid> --env prod --agent

# Discovery
offer-service agent health --agent
offer-service agent schema

```

## Authentication

- Method: None
- Setup: No authentication required — the offer service is network-internal

## --brand Syntax

Applies to: search command — selects which streaming brand's offers to query

```
# Disney+ (default)
--brand disney

# Hulu
--brand hulu

# ESPN+
--brand espn

# Star (international)
--brand star

# Launchpad (internal testing)
--brand launchpad

```

## --campaign-type Syntax

Applies to: search command — filters by campaign category (default: standard-campaign)

```
# Standard campaigns (evergreen pricing)
--campaign-type standard-campaign

# Promotional campaigns (limited-time discounts)
--campaign-type promotional-campaign

# Upsell campaigns (upgrade flows)
--campaign-type upsell-campaign

```

## --purchase-flow Syntax

Applies to: search command — filters by purchase context (default: signup-flow, repeatable)

```
# New subscriber signup
--purchase-flow signup-flow

# Plan switching
--purchase-flow switch-flow

# Cancel-save retention offers
--purchase-flow cancel-save-flow

# Concessions (customer service)
--purchase-flow concessions-flow

# Combine multiple flows
--purchase-flow signup-flow --purchase-flow switch-flow

```

## --billing-period Syntax

Applies to: search command — client-side filter on phase duration unit (applied after server response)

```
# Monthly plans
--billing-period month

# Annual plans
--billing-period year

# Weekly (rare, promotional)
--billing-period week

# Daily (trial periods)
--billing-period day

```

## --phase-type Syntax

Applies to: search command — client-side filter on pricing phase type

```
# Free trial phases
--phase-type free-trial

# Discounted introductory phases
--phase-type discounted

# Full price (standard recurring)
--phase-type full-price

# Prepaid (lump sum)
--phase-type prepaid

```

## --env Syntax

Applies to: all commands — target environment (default: qa)

```
# QA environment (default, safe for testing)
--env qa

# Production (real offers, use with care)
--env prod

```

## Workflows

### Find Offer for Account Creation

```bash
offer-service search --brand disney --billing-period month --agent
# Pick an offer from results — note offerId and campaignId
# Use offerId + campaignId when calling account creation API
```

### Find Promotional Offers for a Brand

```bash
offer-service search --brand hulu --campaign-type promotional-campaign --agent
# Results include free-trial and discounted phases
# Check phase durations to understand promotion length
```

### Compare QA vs Production Offers

```bash
offer-service search --brand disney --billing-period month --env qa --agent
offer-service search --brand disney --billing-period month --env prod --agent
# Compare offerId and campaignId — they differ between environments
```

### Find Cancel-Save Retention Offers

```bash
offer-service search --brand disney --purchase-flow cancel-save-flow --agent
# These are special discounted offers shown during cancellation
# Often have discounted or free-trial phase types
```

### Get Full Details for a Known Campaign

```bash
offer-service get --campaign-id <uuid> --agent
# Returns all offers within the campaign with products and SKUs
# Add --offer-id <uuid> to narrow to a single offer
```

### Discover Bundle Package Offers

```bash
offer-service search --package-id disney_base --agent
offer-service search --package-id flagship_ads_bundle --agent
# --package-id is repeatable: combine to find bundles containing specific products
offer-service search --package-id disney_base --package-id hulu_ads --agent
```

## Tips

- Always use --agent for structured JSON output
- Default environment is QA — pass --env prod for production data
- Defaults: country=US, brand=disney, campaign-type=standard-campaign, purchase-flow=signup-flow
- --billing-period and --phase-type are client-side filters (applied after server response, so they narrow results without extra API calls)
- --package-id is repeatable — pass multiple to find bundles containing specific products
- Output includes offerId, campaignId, products[].productId, products[].sku, products[].phases[] — all usable for downstream account creation
- Use search to discover campaigns, then get with --campaign-id for full details
- Offer IDs and campaign IDs are UUIDs — they differ between QA and prod environments
- Pass --inactive to include expired or disabled offers (hidden by default)
- Pass --allow-test-offers to include campaigns with 'test' in the name (hidden by default)
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`offer-service --agent search --help`); a bare `offer-service --agent --help` returns the whole schema

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| use get without a campaign ID | get requires --campaign-id; use search to discover campaigns first |
| assume offer IDs are stable across environments | QA and prod have completely different IDs — always search in the target env |
| omit --agent flag | Without --agent output is human-formatted and not parseable; always pass --agent for structured JSON |
| use --billing-period to mean subscription cadence | --billing-period filters phase duration unit, not billing frequency; a monthly phase can exist in a yearly-billed plan |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `offer-service search`

Search campaigns by predicates, return flattened offer objects

- `--country`: Country code
- `--brand`: Brand [disney, hulu, espn, star, launchpad]
- `--campaign-type`: Campaign type [standard-campaign, promotional-campaign, upsell-campaign]
- `--billing-period`: Filter by phase duration unit — client-side, filters phases not billing cadence [day, week, month, year]
- `--platform`: Platform filter
- `--purchase-flow`: Purchase flow [signup-flow, switch-flow, cancel-save-flow, concessions-flow] (repeatable)
- `--package-id`: Package ID filter (repeatable)
- `--inactive`: Include inactive offers
- `--allow-test-offers`: Include offers/campaigns with "test" in name
- `--phase-type`: Phase type — client-side [free-trial, discounted, full-price, prepaid]

### `offer-service get`

Fetch specific campaign + offer by ID

- `--campaign-id`: Campaign ID **(required)**
- `--offer-id`: Offer ID (optional — filters to a specific offer within the campaign)
- `--country`: Country code for SKU extraction

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--summary` | Summary mode (counts and statuses only) | - |
| `--concise` | Concise mode: all fields except body/description/content | - |
| `--full` | Preserve full API payloads | - |
| `--env` | Target environment | qa |
| `--timeout` | Request timeout in milliseconds | 30000 |
| `--debug` | Print debug info to stderr | - |
