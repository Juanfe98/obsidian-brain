# Native presentation plans

Inspect the approved source before writing a plan. The unfiltered response lists slides;
`--slide` expands one slide's text, cells, object IDs and geometry. PowerPoint indices are
one-based. Google object IDs are platform-specific. A source's first text object is not always
its title. Never transfer IDs or typography assumptions between sources.

```sh
node deck.mjs inspect-template --template /local/official-light.pptx --slide 49
node deck.mjs inspect-google --domain apps.disney.com --mode light --slide 50 --out source.json
node deck.mjs inspect-google --domain apps.disney.com --mode dark --preview source-preview
```

`--preview` downloads a read-only PDF reference and renders the official source pages without
copying or editing the template. It compares source fingerprints around the export. Open the
relevant PNGs before selecting layouts: dark templates can intentionally include white media
panels, and an agenda/sidebar is not a general-purpose body layout. The full `--out` snapshot
is for scripts; use the concise inspection result and selected-slide details instead of loading
the entire snapshot into model context.

Detailed inspection includes `boundsPt` in slide coordinates (including parent groups),
`readingOrder`, paragraphs with inherited text styles, `mixedStyles`, and `metricPairs` for
native large-number layouts. Metric pairs identify a value and its caption by position; check
their meaning against the brief. Never zip successive object IDs into value/label pairs.
Tables expose `cellPositions`: logical row/column anchors and spans. Covered cells in a merged
region cannot be edited individually. Table bounds describe the minimum frame, not proof that
long text will fit after Google lays out wrapped rows.

## PowerPoint plan

Copy the hash and object IDs from inspection. This example uses the audited light table slide.

```json
{
  "title": "Quarterly measures",
  "template": { "sha256": "<inspected SHA-256>" },
  "slides": [{
    "sourceSlide": 49,
    "edits": [
      { "kind": "text", "objectId": "1389", "text": "Quarterly measures" },
      { "kind": "table-cell", "objectId": "1392", "row": 0, "column": 0, "text": "Metric" }
    ],
    "notes": "Presenter notes for this output slide."
  }]
}
```

```sh
node deck.mjs build-native plan.json --template /local/official-light.pptx --out build/native
```

| Kind | Fields beyond `kind` and `objectId` | Result |
|---|---|---|
| `text` | `text`, optional `find` | Edit an existing native text frame |
| `table-cell` | zero-based `row`, `column`, `text`, optional `find` | Preserve table geometry, borders, fills and styles |
| `image` | `image: {src, alt}` | Local PNG/JPEG/GIF within the plan directory; retain frame, rotation and z-order, and cover-fit the replacement |
| `chart` | `categories`, `series: [{name, values}]` | Update an existing category chart and workbook while retaining source series count/style |
| `delete` | none | Remove an unwanted source object from the output slide |

Repeat a source slide to create independent copies, including independent chart/workbook
parts. Chart categories are limited to 100; series match that count and use finite values
within ±1e12. Scatter/bubble data cannot be expressed by this category-chart contract. Use the
target application for those charts. Rasterize SVG before a native image replacement.

## Google plan

Copy `template` and object IDs from `inspect-google`:

```json
{
  "title": "Quarterly measures",
  "template": { "id": "<inspected template ID>", "sourceHash": "<inspected hash>" },
  "slides": [{
    "sourceSlideId": "<source slide ID>",
    "edits": [{ "kind": "text", "objectId": "<native title ID>", "text": "Quarterly measures" }]
  }]
}
```

```sh
node deck.mjs build-google plan.json --out build/google --dry-run
node deck.mjs build-google plan.json --out build/google
```

Google supports `text`, `table-cell` and `delete` as above. `image` uses an HTTPS `url` reachable
by Google and optional `fit: "cover" | "contain"`. Use an approved location for the image's
contents. `refresh-chart` refreshes an existing linked Sheets chart after its source data is
updated. This workflow does not create linked charts or convert chart images into editable data.

Google omits revision IDs from read-only official templates. `sourceHash` binds the inspected
structure, styles and text, excluding temporary image-download URLs. The build compares the
copy with that structure, then applies one atomic batch guarded by the **copy's** fresh revision
ID. The native copy preserves canvas, masters and layouts. PDF and PPTX exports must come from
the same remote revision.

Source slides may repeat or appear in any order. Google requires each slide-move
request to list IDs in their current presentation order, so the composer moves
copies individually to produce the plan's order within the same atomic batch.

Bounds: 1–200 output slides, 500 edits per slide, 2,000 objects per Google slide, 1,000 requests
and 4 MiB per Google batch. Text replacements accept at most 10,000 UTF-16 units. Unknown
fields, foreign IDs, invalid cells, stale hashes and incompatible edit kinds fail explicitly.

## Mixed typography and sample content

Whole-object replacement requires uniform source text styles. To retain distinct heading,
body and emphasized runs, use `find`, one unique match per replacement. Multiple
`find` edits on one object apply in plan order. Do not edit a deleted object or a child of a deleted group.
For repeated placeholder paragraphs, target a unique contiguous body block with the same style,
or choose a simpler source object. Do not combine a differently styled heading and body in one
replacement just to make the match unique.

```json
[
  { "kind": "text", "objectId": "<milestone ID>", "find": "Description of Milestone", "text": "Release the pilot" },
  { "kind": "text", "objectId": "<milestone ID>", "find": "Milestone", "text": "Pilot" }
]
```

Replace or delete all sample content. For device mockups, replace the image under the frame.
PowerPoint source notes are omitted unless `notes` supplies replacements. Google copies retain
native speaker notes; inspect and edit them in the native editor before sharing.

## Content and visual acceptance

Before building, map the brief to the selected source objects: slide purpose, title, body,
metric value and label, diagram node, table cell, or image. Use the source preview and native
positions to confirm the map. Keep each metric's meaning and precision; units can move into
its caption when the large number needs more room. A summary should state conclusions in a
body layout, rather than squeeze a paragraph into a subtitle or leave an unused media panel.

Record repeated facts once in a separate authoring note: metric, exact value,
unit, period, and affected slides. Check them again after repairs. This applies to illustrative
data too: changing a KPI from `99.95%` to `99.9%` while its scorecard retains `99.95%` creates a
contradiction. Choose a wider approved layout when the exact value will not fit.

For milestone timelines, edit date labels in place and retain the approved markers/connectors.
Evenly spaced milestones need not imply a proportional time scale. Check chronological order,
the stated time horizon, and matching dates wherever the same milestone appears. A known
contradiction remains an unfinished repair even when the native artifacts pass verification.

Review the final native PNGs at a readable size. Check these independently from `verify`:

- Each value matches its adjacent caption; number/unit tokens do not split awkwardly.
- Headings and body text retain their distinct source styles, including inside diagrams.
- Tables retain a readable footprint above the logo/footer. Wrapped cells can expand rows even
  when the API still reports the original minimum row heights. Use concise labels, define
  abbreviations, or choose another layout; removing the caption alone may leave the collision.
- All sample text and placeholder imagery are replaced or removed. Empty white panels may be
  intentional in the source, but the chosen layout still needs to suit the authored content.
- Every required point is present, text is legible, and no repair changes a figure's meaning.
- Repeated metrics, thresholds, dates and totals agree across the summary, charts and tables;
  differences in period or population are stated explicitly.

After any repair, re-export, re-run verification and regenerate the review images. A contact
sheet from the first build cannot verify the final deck. Do not shrink fonts, alter approved
artwork, silently round supplied figures, or delete required data to make a layout fit.

## Recovery

The receipt at `<out>.google/google-receipt.json` records the new draft ID and phase. Inspect
an ambiguous result before retrying: an atomic Slides batch either applied completely or did
not apply. Replaying the same revision-guarded batch cannot apply it twice. A Drive copy may
exist even if its response was lost, so never repeat a timed-out copy blindly.

CLI failures retain the structured API diagnosis, including the rejected request,
while the receipt retains the draft ID. Inspect that draft and its current revision
before attempting recovery; an error alone does not authorize a fresh copy.

After population, `export-google <id> --out <dir>` retries exports without remote mutation.
A prior receipt prevents `build-google` from duplicating drafts at that output path. Choose a
fresh output path for a deliberately new deck. Export-only checks cannot compare with a plan
that was not supplied; `build-google` additionally checks the planned text.

Inspect every native page and the editable output in the target application before delivery.
See [verification](verify.md) and [delivery](publish.md).
