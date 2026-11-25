# The deck IR

One file is the source of truth: `<slug>.deck.json`. Delivered artifacts are derived and
regenerated on every build — never hand-edit them.

## Envelope

```json
{
  "title": "Platform Reliability — Q3 Readout",
  "mode": "live",
  "theme": "dee",
  "slides": [ { "layout": "title", "title": "...", "subtitle": "..." } ]
}
```

| Field | Rule |
|---|---|
| `title` | required; the document title and the PPTX title |
| `mode` | `live` or `preread`; they are different artifacts, never a hybrid |
| `theme` | a theme id resolved from project -> user -> shipped (`references/brand.md`) |
| `slides` | 1–200 slides; each object is `{ layout, ...slots }` plus optional `notes`, `background` |

`mode: "live"` advises **40 words** per slide and reserves `large-copy` for prereads. `mode: "preread"`
allows dense prose because the reader sets the pace.

Optional per-slide keys: `notes` (speaker notes; emitted as real PPTX notes, promoted into the
pre-read, excluded from the word count, and never included in HTML) and `background`
(`accent` | `surface`, overriding the layout default in `--reconstruct` only).
Official builds reject background overrides because overlays obscure inherited logos/footer.

## Slot kinds

| Kind | Shape | Notes |
|---|---|---|
| `text` | string | `maxLength` enforced; overage is reported in characters |
| `text-list` | string[] | `minItems`/`maxItems`/per-item `maxLength` |
| `card` | `{heading, body?}` | `headingMax`/`bodyMax` |
| `milestone-list` | `{label, body?}[]` | 3–6 items; official output selects the matching native timeline |
| `image` | `"path"` or `{src, alt}` | relative local path; HTML gets a hashed relative asset, PPTX gets embedded bytes; `cover` cropping |
| `chart` | see below | one message per chart |

A slot name that does not exist on the chosen layout is a **hard error**, never silently
dropped — a typo must not lose content.

## Charts

```json
{
  "type": "line",
  "categories": ["Apr", "May", "Jun"],
  "series": [{ "name": "Availability", "values": [99.82, 99.86, 99.88] }]
}
```

`type` is `bar | line | area | pie | doughnut`. Every series' `values` length must equal
`categories` length. Max 8 series (the palette holds 8).

There is **no `scatter`**: a scatter plot needs an X value per point, and this IR gives every
series one shared `categories` axis. pptxgenjs also consumes `data[0]` as the shared X axis
rather than a series, so the shape emits an empty chart for one series and silently drops
`series[0]` for two. For a relationship between two measures, plot it outside the deck and use an
`image` slot.

`pie` and `doughnut` plot the **first series only** — that is what PowerPoint does, and the HTML
matches it rather than inventing a multi-ring chart the PPTX cannot express. Non-positive values
are skipped; a chart with no positive value says so instead of drawing an empty disc.

Axis behavior is decided for you and is not configurable: **bar/pie axes include zero**
(length encodes magnitude), **line/area axes zoom to the data range** and print
`axis starts at <n>` for positive-only data or `axis ends at <n>` for negative-only data
(forcing zero flattened a real 99.82 -> 99.94 trend into a dead horizontal rule). Series are
labelled directly at the line end rather than in a legend.

## Narrative guidance (`build` reports `narrativeAdvice`)

- `slides[0]` is `title`; exactly one exists.
- The last slide is `closing-cta`; exactly one exists.
- A deck of >= 8 slides carries 2-5 `section-divider` slides.
- No two adjacent slides share a layout (except `bullets`, the workhorse).
- If an `agenda` exists, its item count equals the number of `section-divider` slides — an
  agenda promises sections and the deck must deliver them.

These are suggestions for a complete narrative. They never block a single slide, an appendix,
or a repeated layout. `validate` enforces the data and slot contracts. Native plans have their
own source-object contracts; see [native plans](native-plans.md).

## Editing an existing deck

Change the IR and rebuild. To find the slot behind a defect, read
`build/<slug>/.verify/report.json`: every finding carries `slide` (1-based) and either the
`data-slot` name or the field path, so `slides[4].takeaway is 118 chars, 8 over the 110 limit`
maps straight to the edit.
