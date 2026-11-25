---
name: design-system-governance
description: >
  Design-system inventory and consistency reconciliation. Enumerate the
  published Figma library components and styles via the Figma MCP
  (get_libraries, search_design_system, get_variable_defs) and cross-check them
  against an Airtable component inventory (status, owner, deprecation flag) —
  flagging coverage gaps and deprecated-but-still-published components — then
  publish a governance report to Confluence. Use when the user mentions
  design-system health, component inventory, library governance, deprecated
  components, or reconciling a Figma library against a tracked component list.
  NOTE: adoption/usage counts and detached-instance metrics are NOT available —
  those require Figma Library Analytics, which no connected tool exposes.
roles:
  - design
version: "1.0.2"
author: AIX
keywords:
  - design-system
  - component-inventory
  - governance
  - consistency-reconciliation
  - deprecated-components
---

# Design System Governance

Keep the design system's inventory honest and consistent. This skill reconciles
the **published Figma library** (read via the Figma MCP) against an **Airtable**
component inventory of record and reports to **Confluence**. It is read-only on
Figma, so it is safe to schedule. It drives MCP tools + base CLIs, so it works
on the no-shell Cowork surface as well as in a terminal.

## When to Use

- Periodic design-system inventory / health reports.
- Reconciling the published Figma library against the tracked Airtable inventory
  (coverage gaps in both directions).
- Finding components marked deprecated in the inventory that are still published
  in the library.
- Confirming the components / styles / variables the design system documents
  actually exist as published.

## Not Available Yet (be honest)

Adoption, usage counts, insert/detach rates, and **detached-instance** reporting
require **Figma Library Analytics** (the Figma Enterprise REST API). **No
connected tool exposes it** — the Figma MCP has no analytics tool, and there is
no design-ops CLI for it. So this skill does **not** report adoption numbers or
detach counts, and it must not fabricate them. That capability is **deferred
design-ops automation**: it becomes possible only if a future
Library-Analytics-backed CLI is added. Report inventory and consistency only.

## Tools Used

- **Figma MCP** (read-only — there is no Figma CLI, so name the tool):
  - `get_libraries` — enumerate published libraries and their components/styles.
  - `search_design_system` — find published components/styles/variables by name
    or type.
  - `get_variable_defs` — read the variables/design tokens for a selection.
  - `get_metadata` — inspect the layer structure of a frame when confirming a
    component's shape.
  - `whoami` — confirm the connected Figma account and scope.
- **`airtable`** (base CLI) — the component inventory of record.
- **`confluence`** (base CLI) — publish the governance report.

## Reconciliation Checks

- **Coverage gap** — a component published in the library but missing from the
  Airtable inventory (or tracked in Airtable but not published).
- **Deprecated-but-published** — marked deprecated in the inventory yet still
  present in the library. Highest-priority cleanup.
- **Metadata drift** — owner or status in Airtable disagrees with what the
  library shows.

## Key Commands / Calls

Figma MCP (call the tools directly):

- `get_libraries` → list published libraries + their components/styles.
- `search_design_system` → enumerate components/styles/variables by name/type.
- `get_variable_defs` → read the variables/tokens for a selection.

Base CLIs:

```bash
# Inventory of record
airtable --agent records list --base <baseId> --table "Components"

# Publish the reconciliation report
confluence --agent page create --space DES \
  --title "Design System Inventory — <period>" --body "<report>"
```

## Common Workflow

1. Enumerate the published design system: `get_libraries` for the libraries in
   scope, then `search_design_system` (and `get_variable_defs` for tokens) to
   list the components/styles/variables that actually exist.
2. Pull the Airtable inventory (status, owner, deprecation flag).
3. Join on component name/key and run the reconciliation checks above.
4. Publish the report to Confluence; optionally open Jira cleanup tickets for
   deprecated-but-published components.

## Related

- `design-tokens` skill — variable/token governance on the same library.
- `user-research-synthesis` skill — sibling base-composition design skill.
- Deferred: adoption/usage/detach metrics would come from a future
  Library-Analytics-backed design-ops CLI ([Figma Library Analytics API](https://www.figma.com/developers/api#library-analytics)).
