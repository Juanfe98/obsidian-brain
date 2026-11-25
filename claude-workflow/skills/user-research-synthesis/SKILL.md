---
name: user-research-synthesis
description: >
  Turn raw user-research inputs into a synthesized read-out using base tools:
  interview notes in Universal Doc / Confluence, a participant tracker and
  findings log in Airtable, and affinity maps in Lucid. Produces themes,
  severity-tagged findings, and a stakeholder summary doc or deck. Use when the
  user mentions user research, research synthesis, usability findings, affinity
  mapping, interview synthesis, or an insights report.
roles:
  - design
version: "1.0.2"
author: AIX
keywords:
  - user-research
  - research-synthesis
  - usability
  - affinity-map
  - insights
---

# User Research Synthesis

Synthesize qualitative research into a structured, decision-ready read-out.
This skill is **pure base composition** — no new CLI — so it works for any
design team on the `design` (or `base`) bundle.

## When to Use

- After a round of interviews or usability sessions, to extract themes.
- To turn a findings log into a severity-tagged, stakeholder-facing summary.
- To roll an affinity-mapping session into documented insights.

## Prerequisites

- **CLIs**: `airtable`, `udoc`, `confluence`, `lucid` (all in `base`).
- **Auth**: standard cascade per tool (`pat-manager login <service>`).

## Inputs → Outputs

| Source | CLI | What it holds |
|---|---|---|
| Interview notes / transcripts | `udoc`, `confluence` | raw qualitative data |
| Participant tracker + findings log | `airtable` | structured records, tags, severity |
| Affinity map / journey board | `lucid` | clustered themes |
| **Output** read-out (doc/deck) | `udoc`, `confluence` | themes + findings + recommendations |

## Key Commands

```bash
# Pull raw notes
udoc --agent doc read <doc-id> --format markdown
confluence --agent search query --cql "label = 'research' AND space = DES"

# Pull the structured findings log
airtable --agent records list --base <baseId> --table "Findings"

# Read the affinity board
lucid --agent document contents <document-id>

# Write the synthesized read-out
confluence --agent page create --space DES --title "Research read-out — <study>" --body "<synthesis>"
```

## Common Workflow

1. Gather notes (udoc/Confluence) + the findings log (Airtable) + the affinity
   board (Lucid).
2. Cluster into **themes**; for each theme list supporting findings with a
   **severity** tag (blocker / major / minor) and frequency.
3. Draft recommendations tied to themes.
4. Publish a stakeholder summary (Confluence page or a udoc deck).

## Note — best-of-breed vs this bridge

Dedicated research repositories (**Dovetail**, **Maze**) are the 2026
best-of-breed and expose REST APIs. This base-composition skill is the
**interim bridge**. If design-ops standardizes on one, a first-party
`dovetail-cli`/`maze-cli` is the upgrade path (see the design bundle's open
questions).

## Related

- `airtable-cli`, `udoc-cli`, `confluence-cli`, `lucid-cli` reference skills
