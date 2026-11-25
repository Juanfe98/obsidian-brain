# Delivering a presentation

Native builds write `index.html`, `assets/native/slide-NNN.png`, `dl/deck.pdf`, `dl/deck.pptx`
and a private `.verify/` directory. The HTML shows the actual native PDF pages; the PPTX
contains editable source objects. Google builds also return the native Slides URL. The HTML
excludes speaker notes; review notes in the native deck before sharing.

Run `verify <directory>` on the current files, inspect every rendered slide, and open the
editable output in the recipient's application. PowerPoint and Google have different native
fonts/layouts. A Google export must be checked in PowerPoint when both are deliverables.
Keynote/LibreOffice previews do not certify PowerPoint's rendering.

## Files and native Google

Distribute verified files through the user's authorized Drive/Microsoft workflow. Official
PowerPoint sources do not embed fonts; recipients need the faces used by selected objects.
Approved Arial is not a substitution error.

For Google, prefer `build-google` and its native URL. Optional import remains available:

```sh
gdrive file upload --help
gdrive file upload --path build/deck/dl/deck.pptx --convert-to slides --name "Deck title" --agent
```

Use conversion only if installed help lists `--convert-to` (gdrive 0.39.1+). Import can change
fonts, groups and editability. Review it independently. `build-google` copies the native
Google source and requires `udoc slide batch-update`, detected before creating a draft.

## MyID page

Publication is a separate authorized action. Compact builds can emit an aix-proto manifest:

```sh
node deck.mjs build deck.json --template /local/official-light.pptx --out build/deck \
  --author "<name@disney.com>" --author-id "<MyID>" --publish-ready --strict
aix-proto publish <slug> --dir build/deck --agent
```

Official files often exceed aix-proto's 5 MiB per-file cap. A deck can be valid for local
delivery while `publish.ready` is false. Deliver the files through Drive/Microsoft, or obtain
authorization for a separate `--reconstruct` design. Do not delete files to bypass the gate.
A differently rendered webpage cannot prove native fidelity. `build-native` and `build-google`
produce delivery/review artifacts, not an aix-proto manifest.

## Pre-read

```sh
node deck.mjs preread deck.json --out preread.md
```

This converts compact IR to Markdown: sections become headings, chart values become tables,
and notes become prose. `udoc doc create --format markdown` can import it into Google Docs.
Local images become alt-text callouts. Insert images separately and apply the approved
long/short document template as a separate document-authoring step.
