---
name: design-contrast-audit
description: >
  Design-TIME accessibility contrast review for designers. Read color tokens and
  a frame's text/background pairings from Figma (get_variable_defs, get_metadata,
  get_screenshot) and check WCAG contrast ratios BEFORE anything is built, then
  publish findings to a Confluence page and report them inline in chat. Use when a
  designer mentions color contrast, contrast ratio, AA/AAA, accessible color, or
  token contrast. (Scanning a built/staging UI with axe-core/Tenon is a separate
  QA/engineering task — see ui-accessibility-scan.)
roles:
  - design
version: "1.0.2"
author: AIX
keywords:
  - accessibility
  - a11y
  - wcag
  - color-contrast
  - contrast-ratio
  - design-tokens
---

# Design-Time Contrast Audit

Catch contrast problems at design time — from the tokens and frames in Figma,
before a single line of UI is built. This is the designer-owned half of
accessibility: deterministic, machine-checkable, and reachable on the no-shell
Cowork surface through the Figma MCP (no CLI needed). It does **not** drive a
browser or scan a deployed page (that's a QA/dev job).

## When to Use

- Verify a color palette / token set meets WCAG AA (4.5:1 text, 3:1 large/UI).
- Check a specific frame's text-on-background and UI-element contrast.
- Validate a new brand theme or dark-mode variant before handoff.

## Scope (read this)

- **In scope (designer, design-time):** color tokens + frame text/background
  pairings read from Figma, WCAG ratio math (deterministic, computed here — no
  browser, no external service), findings published to Confluence and inline in chat.
- **Out of scope (QA/eng, build-time):** running axe-core/Tenon against a
  staging URL or headless browser. A Cowork designer has no shell, no deploy,
  and no browser — that belongs in a QA/eng bundle skill (`ui-accessibility-scan`).

## Tools Used

- **Figma MCP** (read-only here):
  - `get_variable_defs` — resolve color tokens / variables for the selection into hex values.
  - `get_metadata` — the frame's layer structure (which nodes are text vs background fills).
  - `get_screenshot` — a **text description** of the rendered frame (not an image) to confirm which text sits on which background.
- **`confluence`** base CLI — publish the findings table for the record.

> There is no Figma comment / canvas-annotation tool in this environment, so
> findings go to Confluence (durable record) plus inline in chat — not back onto
> the Figma canvas.

## WCAG Contrast Thresholds

| Content | AA | AAA |
|---|---|---|
| Normal text (<18.66px regular / <24px) | 4.5:1 | 7:1 |
| Large text (≥24px, or ≥18.66px bold) | 3:1 | 4.5:1 |
| UI components & graphics | 3:1 | — |

## Contrast Math (deterministic)

Ratio = `(L1 + 0.05) / (L2 + 0.05)`, where L1 ≥ L2 are the relative luminances.
For each sRGB channel `c` (normalized to 0–1):
`c_lin = c/12.92 if c ≤ 0.03928 else ((c + 0.055)/1.055) ^ 2.4`, then
`L = 0.2126·R_lin + 0.7152·G_lin + 0.0722·B_lin`. Pure arithmetic on the hex
values from `get_variable_defs` — no browser, no external API.

## Common Workflow

1. Select the frame (or token collection) in Figma. Read the color values with
   `get_variable_defs` and the layer structure with `get_metadata`; use
   `get_screenshot` for a described view to confirm which text sits on which background.
2. For each text/background and UI-element/background pairing, compute the WCAG
   contrast ratio (formula above) and flag anything below the required threshold
   for its text size.
3. Report each failure **inline in chat** (pairing, measured ratio, required
   ratio, and the token to fix), and **publish a summary table to Confluence**.

## Key Calls

```bash
# Read the color tokens + frame from Figma (MCP tools — no CLI):
#   get_variable_defs  → resolved color hex values for the selection
#   get_metadata       → layer hierarchy (text nodes vs background fills)
#   get_screenshot     → text description of the rendered frame (not an image)

# Publish the findings table (base CLI):
confluence --agent page create --space DES --title "Contrast audit — <screen>" --body "<table>"
```

## Related

- `design-tokens` skill — source of the color tokens checked here
- `ui-accessibility-scan` (QA/eng) — built-UI axe-core/Tenon scanning
- [WCAG 2.2 contrast](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum)
