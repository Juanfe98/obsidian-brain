---
name: design-tokens
description: >
  Inspect and compare design tokens with the Figma and TokenForge remote MCPs:
  read selected Figma Variables, resolve source-grounded Streaming Design System
  (SDS) tokens at a published release, validate references, and map values to W3C
  Design Tokens / Style Dictionary or a target platform. Use when the user
  mentions design tokens, TokenForge, SDS tokens, Figma variables, token drift,
  W3C design tokens, Style Dictionary, themes, brands, or locale modes.
scope: segment
segment: product-and-technology
roles:
  - design
version: "1.1.2"
author: AIX
keywords:
  - design-tokens
  - tokenforge
  - sds-tokens
  - streaming-design-system
  - figma-variables
  - style-dictionary
  - w3c-design-tokens
  - token-drift
  - theming
---

# Design Token Inspection & Drift Review

Designers bind tokens in Figma as **Variables**. TokenForge reads the published
Streaming Design System repositories at an explicit release and returns
source-grounded token and component data. This skill compares those two views,
maps values to W3C Design Tokens / Style Dictionary or the target platform, and
reports drift with release provenance. It is **read-and-advise**; neither MCP
writes Variables or design-system source.

## When to Use

- Inspect which Variables (tokens) a selected frame or component actually binds.
- Check whether a frame uses the expected design-system token vs a hard-coded /
  off-system value.
- Find and retrieve canonical SDS tokens from a published release without
  inventing names, values, themes, or component behavior.
- Validate a proposed token reference/value and compare two SDS releases.
- Understand how a Figma Variable maps to a W3C design token before wiring Style
  Dictionary or a theme/mode.
- Resolve brand/theme and script-locale overlays before consumer implementation.

## Prerequisites

- **Figma remote MCP** — reaches Claude Code via the `design` bundle's MCP wiring
  and Cowork via the Figma account connector. Confirm the connection with
  `whoami`.
- **TokenForge remote MCP** — reaches shell surfaces (Claude Code, Cursor, VS
  Code) through the `design` bundle and requires the corporate network / VPN. It
  is not reachable from Cowork: a custom connector is fetched by Claude's cloud
  rather than your machine, so it never reaches the Disney-internal address.
- **An explicit release scope.** Use `list_design_systems`, then
  `resolve_design_system_release`. Never guess the design-system id, release tag,
  component experience, theme, or locale.

## Key Tools

- Figma `get_variable_defs` — read Variables bound to the current
  Figma selection, or a pasted `figma.com` node URL: names + resolved values.
- TokenForge `search_tokens` / `get_tokens` — find and retrieve canonical,
  repo-backed tokens at the resolved release.
- TokenForge `resolve_tokens` / `get_semantic_theme_tokens` — compile the
  theme/locale semantic values a consumer actually ships.
- TokenForge `validate_token_reference` — verify a token exists and optionally
  compare a proposed value.
- TokenForge `diff_design_system_releases` — compare published releases.
- TokenForge `normalize_tokens_for_platform` — produce grounded mapping hints
  for web, iOS, Android, Roku, or generic consumers.

## Format Mapping (important)

Figma Variables are **not** W3C Design Tokens out of the box. Map between them
before comparing values:

| Figma Variable | W3C Design Token |
|---|---|
| `COLOR` (r,g,b,a 0–1) | `$type: color`, `$value: "#rrggbb[aa]"` |
| `FLOAT` | `$type: dimension`/`number`, `$value` + unit |
| `STRING` | `$type: string` |
| `BOOLEAN` | (no standard type — keep as a private extension) |
| Variable **collection** | a top-level token group |
| Variable **mode** | a theme/dimension (e.g. light/dark, brand) |

## Common Workflow — check a frame for token drift

1. Select the frame/component in Figma (or paste its `figma.com` node URL) and
   run `get_variable_defs` to list the Variables it binds and their values.
2. Call `list_design_systems`, choose the intended system/release from user or
   repository context, and pin it with `resolve_design_system_release`.
3. Use `search_tokens`, then `get_tokens` or `validate_token_reference`, to
   retrieve the canonical SDS value. When capability hints report themes or
   locales, resolve the applicable context before comparing.
4. Map both sides through the table above so you compare like for like.
5. Report the Figma value, canonical SDS value, token path, release tag/commit,
   and recommended human fix. Writing that fix back into Figma is a manual step,
   outside this skill's scope.

## Not Covered Here (be honest)

`get_variable_defs` reads only the **current Figma selection**. TokenForge can
retrieve repo-backed token layers, validate references, normalize values, and
diff published SDS releases, but it does not crawl every Figma file, perform a
fully automatic Figma-vs-repo audit, write Variables/modes back to Figma, mutate
the SDS repository, or run a CI sync. Those write/automation steps remain manual
or require separate governed tooling.

## Related

- `design-system-governance` skill — design-system inventory reconciliation on the same library
- TokenForge `get_mcp_capabilities` — authoritative live capability and policy catalog
- [W3C Design Tokens Format](https://www.designtokens.org/)
- [Figma variables guide](https://help.figma.com/hc/en-us/articles/15339657135383)
