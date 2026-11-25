---
name: design-tools-in-cowork
description: >
  Plain-English guide for designers using Claude Cowork (Claude desktop chat, no
  terminal) to reach Disney's design tools — Figma, Lucid, and design research —
  and why the Disney-internal design MCPs (TokenForge / Streaming Design Systems,
  Backlot) work in Claude Code but cannot be reached from Cowork at all. Explains
  what you can ask for today, which capabilities an org Owner must switch on
  first, how to tell whether a design tool is connected, and where to go in the
  AIX Manager app when something says "not connected." Use when a designer asks
  how to use Figma, TokenForge, SDS tokens, a design system, or Backlot from
  Cowork, why a design tool is not responding, or how to get design capabilities
  turned on.
roles:
  - design
version: "1.3.0"
author: AIX
keywords:
  - design
  - cowork
  - figma
  - design tokens
  - design system
  - tokenforge
  - streaming design system
  - backlot
  - lucid
  - research synthesis
  - connector
  - not connected
---

# Design tools in Claude Cowork

You talk to Claude in plain English — no terminal, no config files. This guide
tells you what design work Claude can already do for you, what has to be switched
on first, and how to fix "that tool isn't connected." You never type a command;
you just ask.

## The one-minute version

- **Just ask.** "Summarize yesterday's research sessions into themes." "Read the
  design context for the frame I have selected in Figma." Claude picks the right
  tool — you don't name it.
- **Some things work right now** with no setup (research synthesis, Lucid,
  Confluence, Airtable, Jira — the tools your `base` setup already connected).
- **Figma is a connector your org Owner adds once.** In Cowork it only works
  after your **Claude org Owner** turns it on for the company. Until then Claude
  will tell you it isn't connected — that is expected, not a bug.
- **TokenForge (SDS) and Backlot cannot be reached from Cowork at all.** They
  live on the Disney network, and Cowork connectors are fetched by Claude's cloud
  rather than by your laptop — so being on VPN does not help. Use **Claude
  Code**, **Cursor**, or **VS Code** for those.
- **"Not connected"? Open the AIX Manager app.** It shows every tool's status and
  walks you through signing in. Claude will also point you there.

## What works in Cowork today (no connector needed)

These come from your `base`/`design` setup and are ready as soon as you have
signed in to them in the **AIX Manager** app:

| Ask Claude to… | Uses |
|---|---|
| Synthesize interviews/usability notes into themes + a read-out | research synthesis (Universal Doc, Confluence, Airtable, Lucid) |
| Pull an affinity map or diagram and summarize it | Lucid |
| Read/write a research doc, spec, or deck | Universal Doc, Confluence |
| Look up a findings log or participant tracker | Airtable |
| Create or update a design ticket | Jira |
| Post an update to a channel | Teams |

Try: *"Turn the findings log in Airtable and my interview notes in Confluence
into a severity-tagged read-out."*

## Figma in Cowork — and why TokenForge and Backlot are not

These are all **remote design MCP servers**, but they are not in the same
position. In **Claude Code** (the developer surface) AIX connects them for you
automatically. In **Cowork** only Figma is possible, and only an Owner can add
it.

**Figma — have your org Owner add the connector.**

1. Ask your Claude **org Owner / admin** to add it as a custom connector for the
   organization (Settings → Connectors, on the Team/Enterprise plan):
   - **Figma** — `https://mcp.figma.com/mcp`
2. Once the Owner has added it, **you** enable it for yourself under
   **Settings → Connectors** and complete the sign-in prompt.
3. Now you can ask, e.g. *"Read the design context for the frame I have selected
   in Figma and describe the components."*

**What the Figma connector can do.** Once connected, open its entry under
**Settings → Connectors** to see the exact tools and set permissions per tool
(Always allow / Needs approval / Never). The read tools default to **Always
allow** and cover the day-to-day designer + design-to-code asks:

- **Get Design Context** — turn a selected frame into code that matches your
  design (React/Tailwind by default).
- **Get Metadata / Get Libraries** — variables (design tokens), components, and
  layout of a selection or file.
- **Get Code Connect Mapping / Suggestions / Context** — map Figma components to
  code components.
- **Get FigJam Content**, **Get Motion Context**, **Get Screenshot**, **Download
  Assets**, **Export Video**.
- **Generate Diagram** (turn a prompt into a FigJam flow/Gantt) defaults to
  **Needs approval** — you confirm each use.

**Two honest caveats.**
- **You only see tools your organization has given you access to.** Canvas
  *authoring* (create/edit a Figma file) needs a **Full Figma seat with edit
  access**; on a lesser seat those tools simply won't appear — reads still work.
- **Get Screenshot returns a text description** of the screenshot in Claude /
  Claude Code, not the actual image (per Figma).

**TokenForge and Backlot — not available in Cowork, and a connector will not fix
it.** Both answer at Disney-internal addresses (`sds-mcp.global.twdcgrid.net` and
`mcp.design.twdc.com`). A Cowork connector is fetched by Claude's cloud, not by
your laptop, so it never reaches the Disney network — adding either as a custom
connector fails whether or not you are on VPN.

What *would* work is a small proxy running on your own machine: that is how your
AIX tools (Jira, Confluence, Datadog…) already reach Cowork. The `design` bundle
does not set one up for them yet, so today the answer is to use **Claude Code**,
**Cursor**, or **VS Code**, where AIX wires both up for you and the request
leaves from your own machine.

**What TokenForge does, once you are on one of those surfaces.** It retrieves and
validates SDS tokens and components from a published release, read-only. The
`design-tokens` skill covers what it can and cannot do.

## How to tell if a tool is connected

- **Just ask for it.** If it is connected, Claude uses it. If not, Claude says it
  isn't connected and points you to the AIX Manager app (for the AIX-managed
  tools) or to enabling the connector (for Figma). For TokenForge and Backlot it
  will tell you to switch to Claude Code, Cursor, or VS Code.
- **Open the AIX Manager app** to see the full picture: Home shows which
  tools you are signed in to; sign in there to fix anything showing as expired or
  not connected.

## Fixing "not connected"

| It says… | Do this |
|---|---|
| A base tool (Lucid, Confluence, Jira, Airtable…) isn't connected | Open **AIX Manager → Home** and sign in to that tool |
| Figma isn't available in Cowork | Ask your Claude **org Owner** to add the connector (URL above), then enable it under **Settings → Connectors** |
| TokenForge, Backlot — or another Disney-internal design tool — isn't available in Cowork | Expected. Cowork cannot reach Disney-internal addresses, so use **Claude Code**, **Cursor**, or **VS Code** |
| An AIX-managed tool (Jira, Confluence, Airtable…) works at the office but not from home | Connect to **VPN** — those requests go out from your own machine |
| Claude can read AIX tools (Jira, Confluence, Airtable…) but won't change anything | Read-only is the safe default. Turn on write access per tool in **AIX Manager** (see aix-start-cowork) |
| Figma can read but won't change anything | Write access for the Figma connector is a per-tool setting under **Claude Settings → Connectors**, not AIX Manager |
| TokenForge will not change a token or component | Expected — TokenForge is a source-grounded read and validate service, not a design-system writer |

## Related

- `aix-start-cowork` — the full getting-started guide for Cowork with AIX tools.
- `design-tokens` — what TokenForge covers, on the surfaces that can reach it.
- `user-research-synthesis` — the research read-out workflow (works in Cowork today).
