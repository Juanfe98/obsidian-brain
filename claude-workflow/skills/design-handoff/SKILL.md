---
name: design-handoff
description: >
  Orchestrate design-to-dev handoff across Figma, Jira, and Teams: gather a
  frame's structure and spec context from the Figma MCP (get_metadata,
  get_design_context), create or update the implementing Jira story with the
  spec and the Figma share URL pasted in, then post a handoff summary to Teams.
  Use when the user says "hand off this design", "ready for dev", "spec for
  engineering", or "link Figma to a ticket".
roles:
  - design
version: "1.0.2"
author: AIX
keywords:
  - design-handoff
  - ready-for-dev
  - figma-to-jira
  - design-spec
  - handoff
---

# Design-to-Dev Handoff

Turn a finished Figma design into an actionable engineering ticket with the
design context attached, then notify the team — reading frame context from the
**Figma MCP** and using the base CLIs (`jira`, `teams`) for the work-tracking
side.

> **Scope note.** This is a designer→engineering *bridge*. The designer-owned
> parts are gathering frame context and writing the handoff summary. Generating
> *code* from a design (design-to-code, Code Connect) is a developer task — out
> of scope here; a developer does that with Figma's Dev Mode MCP in their IDE.

## When to Use

- A design is approved and needs an implementing story.
- A developer needs the spec/links for a frame.
- You want a Figma frame tied to its Jira ticket for traceability.

## Prerequisites

- **Figma MCP** connected (run `whoami` to confirm access to the file).
- **CLIs**: `jira`, `teams` (in the `design` / `base` bundle); Jira and Teams
  resolve via the standard auth cascade.

## Common Workflow

1. **Gather design context.** Open the frame in Figma (or paste its share URL),
   then read its layer structure with **get_metadata** and pull the
   implementation-ready spec (layout, spacing, component usage) with
   **get_design_context**. Optionally use **get_variable_defs** for the exact
   token values and **get_screenshot** for a text description of the frame.
2. **Create/locate the story.** File (or update) the Jira story with the spec,
   and paste the Figma share URL into the description so the frame is one click
   away.
3. **Announce.** Post a concise handoff summary to the team's Teams channel.

## Key Commands

```bash
# Create the implementing story — paste the Figma share URL into the body
jira --agent issue create --project DES --type Story \
  --summary "Implement <screen> per Figma" \
  --description "<spec>

Figma: https://www.figma.com/design/<key>/...?node-id=<node-id>"

# Announce the handoff
teams --agent message send --chat-id <id> \
  --content "Handoff: DES-123 ready — spec + Figma link in the ticket."
```

## Not Yet Automatable (needs a future design-ops CLI)

- **Bidirectional link.** The Figma MCP has no Dev Resources tool, so the ticket
  can't be attached back onto the Figma node as a dev-resource. Traceability is
  one-way for now — paste the Figma share URL into the Jira ticket (step 2). A
  first-party design-ops CLI is the upgrade path.
- **Auto-open on "Ready for Dev".** The Figma MCP exposes no webhook/event tool,
  so a frame flipped to *Ready for Dev* can't trigger `jira issue create`
  automatically. Run this handoff manually until a design-ops CLI adds event
  support.

## Related

- `jira-ticket` skill — richer Jira operations
- `teams` skill — posting to channels and chats
- Figma MCP tools: `get_metadata`, `get_design_context`, `get_variable_defs`,
  `get_screenshot`
