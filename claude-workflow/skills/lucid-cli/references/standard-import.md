# Lucid Standard Import — authoring contract

The reference for hand-authoring the JSON that `lucid document create --content <file>`
uploads. Everything here is verified against Lucid's Standard Import documentation
(developer.lucid.co, fetched 2026-07-03) and against live create/export probes. When this
document and older notes disagree, this document wins.

`lucid document create --content` uploads the raw Standard Import document JSON (what Lucid
calls `document.json`). A true `.lucid` file is a ZIP that additionally carries `/data`
(CSV) and `/images` folders — that ZIP goes through `lucid document import --file`, not
`--content`. The inline `--content` path cannot carry local `/data` or `/images` assets;
use image URLs or the ZIP import for those.

## Top-level document

```json
{
  "version": 1,
  "pages": [ { "id": "page1", "title": "Main", "shapes": [], "lines": [] } ],
  "documentSettings": { "units": "px" }
}
```

- `version` (Number, **required**) — always `1`.
- `pages` (Array, **required**, min 1) — each page holds `shapes`, `lines`, `groups`, `layers` (all optional arrays).
- `documentSettings` (optional) — `units` is `cm | in | pt | px` (default `in`). See the units trap below.
- `collections`, `extensionBootstrapData` (optional) — data-backed shapes and extension bootstrap; rarely needed.

`--product` must be `lucidchart` or `lucidspark` for Standard Import. `lucidscale` is a valid
Lucid product but is **not** a Standard Import target — do not pass it to `document create --content`.

## Coordinate model — the single most important section

- Coordinates are **absolute**. Every shape carries a `boundingBox { x, y, w, h }`; there are no relative child coordinates.
- Origin is **top-left**. `x` increases to the **right**, `y` increases **downward**.
- `x, y, w, h` are `Decimal` and all **required** on every shape. `rotation` is optional, degrees, clockwise, 0–360 (not every shape honors it).
- **Units are pixels, always.** `boundingBox` values carry no unit qualifier and are interpreted as pixels regardless of `documentSettings.units`.

### The units trap (read this before choosing numbers)

`documentSettings.units` only changes the ruler label Lucid **displays**; it does **not**
rescale your coordinates. A shape at `x: 100` lands at 100 px whether `units` is `in`, `cm`,
or `px`. Do **not** author coordinates as if `units: "in"` means inches — a "10 inch" box is
`w: 960`-ish (≈96 px/inch), not `w: 10`. Treat every number as pixels. A `w: 10` box is 10 px
wide and will render as an illegible sliver. Typical shapes are 120–200 px wide, 60–90 px tall.

### Page size

Page size only matters when `infiniteCanvas` is false (the Lucidchart default). Set an explicit custom size so your canvas is deterministic:

```json
"settings": { "size": { "type": "custom", "w": 1200, "h": 800 } }
```

- Custom `w`/`h` are **in pixels, restricted to 1–20000 inclusive**.
- Standard sizes: `type` of `letter | legal | executive | a3 | a4 | a5 | tabloid | folio | statement`, optional `format` of `portrait | landscape`.
- Keep all shape bounding boxes inside the page rectangle plus a margin, or they render off-canvas.

## IDs

Every item (page, shape, line, layer, group) needs a unique `id`. An ID is a string of
**1–36 characters**, each alphanumeric or one of `-` `_` `.` `~`. Reuse a collision-free scheme
(`start`, `p_ingest`, `db1`) — IDs are how lines anchor to shapes, so they must be stable and unique.

## Shapes

Common properties (see the per-library shape catalogs for `type` names and `className` values):

| Property | Requirement | Notes |
| --- | --- | --- |
| `id` | **required** | Unique, 1–36 chars |
| `type` | **required** | Library shape type, e.g. `rectangle`, `process`, `decision`, `namedShape` |
| `boundingBox` | **required** | `{ x, y, w, h }` + optional `rotation` |
| `style` | optional | Fill, stroke, rounding, text color |
| `text` | optional | Plain string or HTML rich text (see Text) |
| `opacity` | optional | 0–100, default 100 |
| `zIndex` | optional | Integer draw order; higher is on top; ties broken by later-in-JSON |

`zIndex` matters for backgrounds: put zone/container backgrounds at a lower `zIndex` (or earlier
in the JSON) than the shapes drawn on top of them.

## The 11 importable libraries and the coverage ceiling

Standard Import renders **native vector shapes only from these 11 libraries**. Pick shapes from
them whenever possible.

| Library | How to reference | Example |
| --- | --- | --- |
| Standard | `type` | `rectangle`, `text`, `hotspot`, `image`, `stickyNote` |
| Shape | `type` | `circle`, `cloud`, `cross`, `diamond`, … |
| Flowchart | `type` | `process`, `decision`, `terminator`, `data`, `document`, `database`, `delay`, … |
| Container | `type` | `rectangleContainer`, `roundedRectangleContainer`, `circleContainer`, `swimLanes`, … |
| Lucidspark | `type` | Lucidspark board shapes |
| BPMN 2.0 | `type` | BPMN events, gateways, tasks |
| Table | `type` | Table shapes |
| AWS 2024 | `type: "namedShape"` / `"namedContainer"` + `className` | `ArchAmazonEC2AWS2024` |
| Azure 2021 | `type: "namedShape"` / `"namedContainer"` + `className` | `VirtualMachineAzure2021` |
| Azure 2024 | `type: "namedShape"` / `"namedContainer"` + `className` | `VirtualMachineAzure2024` |
| GCP 2021 | `type: "namedShape"` / `"namedContainer"` + `className` | `GCP2021ComputeEngineIcon` |

Cloud className lookup tables (AWS/Azure/GCP) live in `references/classnames.md`.

**The ceiling:** shapes outside these 11 libraries (Cisco/network gear, full UML/ERD notation,
UI mockups, floor plans, most third-party icon sets) have **no Standard Import type**. Your only
option is to embed them as an image (`fill.type: "image"` with a URL, or the `/images` folder via
`document import`). Images imported as `.svg` are **converted to PNG**, so you lose vector
fidelity and editability. Decide deliberately: a native library shape stays crisp and editable;
an image fallback is a flat raster. Do not invent a `className` or `type` — an unknown value is a
server `400`, and there is no local validator.

Named shapes and containers **render their built-in catalog label** (e.g. `ArchAmazonEC2AWS2024`
shows "Amazon EC2"). In probes, an HTML-span `text` did not override that label. Choose the
className that carries the label you want rather than relabeling.

## Lines (connectors)

A line needs `id`, `lineType`, `endpoint1`, `endpoint2` (all required); `stroke`, `text`,
`joints`, `elbowControlPoints`, `zIndex` are optional.

`lineType`:

| Value | Shape | Control points |
| --- | --- | --- |
| `straight` | straight segments | optional `joints` (array of absolute `{x,y}`) |
| `elbow` | right-angle segments | optional `elbowControlPoints` (absolute `{x,y}`, must form 90° angles) |
| `curved` | smooth curve | **no control points exist** — you cannot shape a curved line |

### Anchor connectors by shapeId, and let Lucid route them

Endpoint types:

- `shapeEndpoint` — attaches to a shape by `shapeId`. `position` (a **RelativePosition object** `{x,y}`, each 0–1, where `{0,0}` is the shape's top-left and `{1,1}` its bottom-right) is **optional**.
- `lineEndpoint` — attaches to another line by `lineId`; `position` here is a **plain number** 0–1, not an object.
- `positionEndpoint` — a free canvas point, `position` is an absolute `{x,y}`.

**Smart lines:** if **neither** endpoint provides a `position`, Lucid treats the line as a
"smart line" and auto-routes it, re-picking attachment points based on where the shapes sit.
This is the default you want almost always: give each endpoint a `shapeId` and omit `position`,
and stop hand-computing perimeter fractions. Pin an explicit `position` only when a smart route
would clip a shape (see `references/authoring-loop.md` for the before/after).

Gotcha: a `shapeEndpoint` `position` is an **object** `{x,y}`; a `lineEndpoint` `position` is a
**number**. Passing a number to a `shapeEndpoint` (or vice versa) is a validation error.

### Arrowheads

Each endpoint has a `style`. Common values: `none`, `arrow`, `openArrow`, `hollowArrow`,
`closedCircle`, `openCircle`. ERD/UML cardinality styles also exist: `one`, `many`, `oneOrMore`,
`zeroOrMore`, `zeroOrOne`, `exactlyOne`, `aggregation`, `composition`, `generalization`, `nesting`,
`async1`, `async2`, `closedSquare`, `openSquare`, `bpmnConditional`, `bpmnDefault`. Put the arrow
on the destination endpoint and `none` on the source.

```json
{
  "id": "e1",
  "lineType": "elbow",
  "stroke": { "color": "#333333", "width": 2, "style": "solid" },
  "endpoint1": { "type": "shapeEndpoint", "style": "none", "shapeId": "a" },
  "endpoint2": { "type": "shapeEndpoint", "style": "arrow", "shapeId": "b" }
}
```

### Line text

`text` on a line is an array of `{ text, position, side }`, where `position` is 0–1 along the line
and `side` is `top | middle | bottom`. Use it for edge labels like "yes"/"no".

## Text and fonts

Shape/line `text` is a plain string or a string of HTML for rich formatting.

**Always set an explicit `font-size`.** If you omit font size, Lucid uses an auto-scaling font
that resizes to fit the box — small boxes shrink text to illegibility, and the rendered size is
not something you can predict locally. Wrap text in a span with an explicit size:

```json
"text": "<span style='font-size:12pt'>Receive request</span>"
```

Honored inline `style` attributes (others are ignored): `color`, `font-family`, `font-size`
(default 10pt), `font-style`, `font-weight`, `text-align` (default center), `text-decoration`,
`vertical-align`. Supported markup tags: `<br>`, `<b>`/`<strong>`, `<i>`/`<em>`, `<s>`/`<strike>`,
`<u>`, `<a>`, `<ol>`, `<ul>`, `<li>`.

Text does not resize the box. Size the `boundingBox` to fit the text at your chosen font size —
long text in a small box clips or auto-shrinks. Roughly budget ~8 px of width per character at
12pt and give multi-word labels two lines of height.

## Style ceiling

`style` supports only:

- `fill` — `{ "type": "color", "color": "#rrggbb" }` or `{ "type": "image", "url": "..."|"ref": "..." , "imageScale": "fit|fill|stretch|original|tile" }`.
- `stroke` — `{ "color": "#rrggbb", "width": <px>, "style": "solid|dashed|dotted" }`.
- `rounding` — integer, twice the corner-radius pixel value.
- `textColor` — hex color.

There are **no gradients, no drop shadows, no theme tokens, no per-corner radius**. Colors are hex
`#rrggbb`; 8-digit `#rrggbbaa` (with alpha) is also accepted by the API. Encode emphasis with fill
color, stroke weight, and `dashed`/`dotted` strokes, not with effects that do not exist.

## Containers and auto-layout

Container shapes (`rectangleContainer`, `roundedRectangleContainer`, `circleContainer`,
`pillContainer`, `diamondContainer`, `braceContainer`, `bracketContainer`, `swimLanes`, and the
cloud `namedContainer`s) visually enclose the shapes whose bounding boxes fall inside them.

- `magnetize` (default `true`) — child shapes move with the container when it is dragged. Leave it on so a container and its contents stay together.
- `assistedLayout` (optional, on several containers) — when `true`, Lucid **re-arranges the children into a grid the first time the document is opened**. That overrides your explicit child coordinates. Leave `assistedLayout` off (omit it) whenever you need your exact placement to hold.
- `swimLanes` — set `vertical`, a `titleBar { height, verticalText }`, and a `lanes[]` array. Each lane has `title`, `width`, `headerFill`, `laneFill`. Lane `width` values must sum to the swimlane's cross-axis size (its height when `vertical` is false, its width when `vertical` is true). Place child shapes by absolute coordinate inside the lane bands. Lucid's spec types lane `title` as a plain String, but a probe confirmed it also honors the same HTML text markup as shape/line `text`: wrap it in a `<span>` to set `color`/`font-weight`/`font-size` (e.g. white bold titles on colored `headerFill`s, as `references/examples/swimlane.json` does). A bare string works too.

## Render determinism caveat

Lucid's own docs warn that "an unchanged Standard Import file may produce varying results over
time" because the render engine evolves. Reduce your exposure: always set explicit `font-size`,
prefer `straight`/`elbow` over `curved`, avoid `assistedLayout` when you need exact placement, keep
coordinates on a round grid, and anchor connectors by `shapeId`. Treat a real `document export`
PNG as the authoritative check of how your document actually renders.

## Verified exemplars

`references/examples/` holds three grid-snapped, `shapeId`-anchored, explicit-font-size documents,
each verified by create → export → visual inspection:

- `flowchart.json` — decision flow with smart-line connectors and one connector with both endpoints pinned.
- `swimlane.json` — three-lane `swimLanes` container with cross-lane connectors.
- `aws-architecture.json` — AWS 2024 `namedShape`/`namedContainer` icons in nested VPC/subnet containers.

Use them as few-shot templates. The end-to-end authoring method is in `references/authoring-loop.md`.
