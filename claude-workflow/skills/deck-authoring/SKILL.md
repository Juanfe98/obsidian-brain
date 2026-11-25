---
name: deck-authoring
description: >
  Build editable DEE presentations from approved PowerPoint or native Google Slides templates.
  Inspect and populate source slides, preserving typography, artwork, tables, diagrams,
  images and mockups. Render the delivered native file, check current artifacts, and inspect
  every slide before claiming pixel fidelity. Use for decks, slides, presentations, readouts,
  pitches, pre-reads, all-hands and QBRs. Also supports explicitly reconstructed HTML/PPTX.
scope: segment
segment: product-and-technology
roles:
  - product
  - design
version: "1.7.2"
author: AIX Platform (@AIX/platform-core)
keywords:
  - deck
  - slides
  - presentation
  - pptx
  - powerpoint
  - google slides
  - keynote
  - readout
  - pitch deck
  - pre-read
  - QBR
  - all-hands
  - brand template
  - pixel faithful
metadata:
  requires:
    bins: ["node"]
    optional_bins: ["aix-proto", "gdrive", "udoc"]
---

# DEE presentation authoring

Start with the approved template for the destination application. The PowerPoint and
Google sources have different typography and layouts. Read [the source guide](references/templating.md)
before choosing a route; use [native plans](references/native-plans.md) for the full slide library.

| Need | Workflow |
|---|---|
| Native Google Slides | `inspect-google`, write a plan, `build-google` |
| PowerPoint tables, diagrams, mockups or alternate covers | `inspect-template`, write a plan, `build-native` |
| PowerPoint from the compact layout catalog | Write the [deck IR](references/ir.md), `build --template` |
| An intentionally reconstructed design | `build --reconstruct`; label it template-derived |

Native builds produce an editable PPTX, a PDF rendered from the native document, and an HTML
viewer of those PDF pages. Google builds also return the editable Slides URL. The official
source stays untouched. Keep authorized template files and generated decks outside Git.

## Setup

Use Node 22.13+ or a newer supported even-numbered Node release. Install script
dependencies through the bundled Artifactory npm configuration:

```sh
cd "<skill-dir>/scripts"
npm ci --install-links --no-audit --no-fund
node deck.mjs doctor
```

PowerPoint authoring also requires Python 3.9+ with `python-pptx==1.0.2`:

```sh
PIP_INDEX_URL=https://artifactory.global.twdcgrid.net/artifactory/api/pypi/aix-pypi/simple \
  python3 -m pip install --user python-pptx==1.0.2
```

On Windows use `py -3` and set `PIP_INDEX_URL` through PowerShell. `DECK_PYTHON` can select a
specific interpreter. Rendering uses Keynote on macOS, PowerPoint COM on Windows, or `soffice`
on Linux. `DECK_RENDERER=keynote|powerpoint|libreoffice` selects an installed renderer.
Keynote and LibreOffice previews require a final check in PowerPoint. No renderer is downloaded
automatically. Install the fonts actually used by the chosen source; approved Arial is valid.

Google authoring requires authenticated `udoc` and `gdrive`. `build-google` checks that the
installed `udoc agent schema` includes `slide batch-update` before copying anything. If absent,
update CLI Universe through AIX; do not substitute a blank presentation. The Google server
renders its native fonts; local Avenir checks from `doctor` concern PowerPoint/reconstruction.

## Claude Cowork

Cowork mounts this skill read-only and runs commands in a Linux VM without the host's CLIs.
Use `inspect-template` and `build-native` there. The Google commands need host `udoc`/`gdrive`
and run only in Claude Code. For DEE decks use this skill, not the generic pptx skill. Prepare a
writable copy once per task, then run every command from it:

```sh
bash "$HOME/mnt/.local-plugins/marketplaces/aix-skills/skills/deck-authoring/scripts/cowork-setup.sh"
cd "$HOME/deck-authoring/scripts"
node deck.mjs doctor
```

The VM provides Node, Python with `python-pptx`, and LibreOffice. Setup adds the npm packages,
the mirrored headless Chromium and a library it needs, all from Artifactory, so the VM must reach
the Disney network. The VM has no Avenir, so `doctor` exits 1 with only the two `font:Avenir`
checks failing; that is expected, so continue when every other check is `ok`. The PPTX keeps its
source fonts while LibreOffice previews substitute them: use previews to check content and
layout, and ask the user to confirm the deck in PowerPoint. Avoid the compact `build` routes in
Cowork; they measure text with the substitutes. If setup, any other `doctor` check, or another
`deck.mjs` command fails, report the error and stop. Never compose, edit or render the deck
outside `build-native`, and never skip `verify`.

Ask the user to attach the official template or select the folder that holds it. Attachments
appear under `$HOME/mnt/uploads` and selected folders under `$HOME/mnt/<folder>`. Build under
`$HOME`, then copy the output directory into the selected folder, or `$HOME/mnt/outputs` when
none is selected, and name the copied `dl/deck.pptx` and `dl/deck.pdf` for the user.

## Author and verify

```sh
node deck.mjs inspect-template --template /local/official-light.pptx --slide 49
node deck.mjs build-native plan.json --template /local/official-light.pptx --out build/native

node deck.mjs inspect-google --domain apps.disney.com --mode dark --out source.json --preview source-preview
node deck.mjs inspect-google --domain apps.disney.com --mode dark --slide 35
node deck.mjs build-google google-plan.json --out build/google --dry-run
node deck.mjs build-google google-plan.json --out build/google

node deck.mjs build deck.json --template /local/official-light.pptx --out build/deck --strict
node deck.mjs verify build/deck
node deck.mjs thumbs build/deck
```

1. Identify the audience, purpose, destination and light/dark mode. Use narrative guidance when
   useful; single-slide requests, appendices and repeated layouts are valid.
2. Inspect source previews before selecting layouts, then expand the chosen slides. Use
   `boundsPt`, `paragraphs` and `metricPairs` to map content to objects; native array/ID order
   is not reading order. Preserve masters, layouts, imagery and the source canvas. Use targeted
   `find` replacements for mixed emphasis; whole-object edits require uniform source styles.
3. Replace or delete sample content. For device mockups replace the image under the frame.
   For tables edit native cells; retain source chart styles and linked chart behavior.
4. Build and inspect **every actual native page**. Check clipping, typography, line breaks,
   metrics, logos, footer, contrast, images and editability against the source. Fix content or
   choose another source slide when it does not fit. Do not shrink text to force a fit.
5. Run `verify` again on the delivery directory. It hashes current files and reopens the PDF
   and PPTX. `ok:true` means the automated checks pass; `fidelity.status` still requires a visual
   review. A matching HTML reconstruction cannot certify the native file.

For multi-slide reviews, follow the [content and visual acceptance checks](references/native-plans.md#content-and-visual-acceptance).
Check value/label pairs, unbroken metric values, mixed typography and table/footer spacing in
the **final** native renders. Recheck repeated figures across slides after repairs, including
illustrative data. Successful artifact validation alone does not check those decisions.

A failed Google run leaves a receipt at `<out>.google/google-receipt.json`. Inspect the named
draft before retrying. After population, `export-google <id> --out <dir>` refreshes local
artifacts without duplicating or editing the remote deck. Never blindly retry a timed-out copy.

## References

| Reference | Purpose |
|---|---|
| [Native plans](references/native-plans.md) | Source IDs, native object edits, bounds and recovery |
| [Templates](references/templating.md) | Complete brand asset inventory and platform differences |
| [Compact IR](references/ir.md) and [layouts](references/layouts.md) | Layout slots and reconstructed geometry |
| [Brand](references/brand.md) | Colors and source-specific typography |
| [Verification](references/verify.md) | Actual artifact checks and visual acceptance |
| [Delivery](references/publish.md) | PowerPoint, Google, PDF, and MyID publication |

Never claim pixel-perfect output until the actual target application has been inspected.
Never replace a native deck with slide-sized screenshots to satisfy editability. Never recreate
approved logos in code or upload a deck for sharing without the user's authorization.
