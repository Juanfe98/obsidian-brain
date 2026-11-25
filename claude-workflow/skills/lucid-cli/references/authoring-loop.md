# The authoring loop — geometric reasoning for Lucid diagrams

Standard Import gives you full manual control over every coordinate and no local validation or
geometry read-back. That combination is exactly what language models are worst at: synthesizing a
page full of non-overlapping absolute coordinates in one shot. This doctrine removes that burden.
It is derived from the layout-reasoning literature (LayoutGPT, DiagrammerGPT, PlanarBench,
LaySPA, IsoBench) and from a real 25-hour hand-authoring experiment whose entire pain was
hand-computed geometry. Follow it and most diagrams come out right on the first or second render.

## First choice for graphs: let `lucid layout` place the nodes

For anything graph-shaped — a flow, a pipeline, a dependency tree, an architecture with
connectors — **do not hand-compute coordinates at all**. Emit only the *topology* and let the
deterministic layered engine assign geometry. Past roughly ten edges, one-shot hand-placement
collapses (PlanarBench: edge count dominates difficulty); `lucid layout` sidesteps that entirely.

```bash
# spec: {nodes:[{id,label?,type?/className?,w?,h?}], edges:[{from,to,label?}], groups?:[{id,label?,children:[ids]}]}
lucid --agent layout --spec graph.json | jq .data > board.json
lucid --agent geometry lint --content board.json     # confirm zero overlaps / line-throughs
lucid --agent document create --title "Flow" --product lucidchart --content board.json
```

- The engine is **deterministic**: the same spec + `--seed` (default 1, pinned) produces
  byte-identical output. Snap grid is `--grid` (default 20); flow with `--direction TB|LR`;
  tune gaps with `--node-spacing` / `--layer-spacing`.
- Sizes come from your explicit `w`/`h`, else are derived from the label. Every node is a shape,
  every edge a **shape-anchored smart line** (Lucid auto-routes — no endpoint math), and every
  `group` becomes a **magnetized container** wrapping its children. Output is valid Standard Import.
- `--from-mermaid flow.mmd` accepts a Mermaid flowchart subset (`graph/flowchart TD|LR`;
  `A[..]`/`B(..)`/`C{..}`/`D[(..)]`; `A-->B`, `A-->|label|B`; `subgraph … end`) and runs the
  same pipeline — handy when the topology is easier to write as Mermaid.
- **Node** boxes are overlap-free at any spacing. Group **containers** are AABBs with no
  inter-container separation pass, so keep group members topologically contiguous and leave
  `--layer-spacing` at/above the default when packing groups tightly — shrinking it below a
  container's title+padding (~60px) can make two containers overlap (still valid SI; `geometry
  lint` flags it). `--node-spacing`/`--layer-spacing` must be finite (non-finite → Usage error).
- One algorithm ships today: the in-house `layered` engine (no `--algo` flag). The opt-in ELK /
  libavoid tiers named in #2373 are deferred — they need a Node sidecar / an LGPL FFI + C
  toolchain that break the workspace's pure-Rust cross-compile bar, so smart-line auto-route stays
  the only router.

Hand-place coordinates (the rest of this doc) only for a handful of shapes, for pixel-exact
tuning after a layout pass, or for non-graph diagrams (posters, freeform boards). When you do,
the discipline below still applies. (Unification note: node label sizing shares the font-metrics
model used by `geometry lint`; a future `geo measure`/`geo fit` command will be the single source.)

## Plan before you place

Write a short layout plan **in prose or a scratch table before emitting any coordinate.** Planning
first is the single highest-leverage habit — models that reason about layout before committing
numbers place shapes dramatically better, and the effect grows with edge count.

The plan must state:

1. **Canvas** — page `w`/`h` in pixels, and a margin (e.g. 40 px) all shapes stay inside.
2. **Grid** — the module you snap to (use **20 px**).
3. **Per-node cell** — for each shape: a grid-aligned `x, y, w, h`. Lay it out as rows/columns of cells so shapes line up.
4. **Routing** — for each connector: source shape, destination shape, and whether a smart line suffices or an endpoint must be pinned.

Only after the plan is written do you translate it into the JSON. A worked plan for a six-node
flow: canvas 740×720, grid 20; column centered at x=280–440; rows at y=40, 160, 280, 460, 600;
one side node at x=520,y=300; all six edges are smart lines except deny→end, which pins both
endpoints so it routes below the process node. That plan is `references/examples/flowchart.json`.

## Snap everything to a 20 px grid

Every `x, y, w, h` is a multiple of 20. Discretizing coordinates does two things: it makes shapes
align and space evenly for free (equal gaps fall out automatically), and it keeps the numbers
small and round so you are not juggling long decimals. Widths and heights snap too — 120/160/180
wide, 60/80 tall are good defaults. There is no reason to emit `x: 237.4`; emit `x: 240`.

You do not have to snap by hand: `lucid geo snap --content d.json --grid 20` rounds every `x/y/w/h`
(and every absolute line joint / control point) to the grid for you, deterministically and
idempotently — see the `geo` toolbox below.

## Never do coordinate arithmetic in context

Do not compute centering, distribution, or connector geometry with in-context math. Models drop
digits and the errors compound silently across a page. Instead, choose round grid cells in the
plan, and let Lucid's smart lines handle connector geometry.

### Let the solver place relational layouts — `geo solve`

When placement is **relational** ("these three align left", "keep a ≥40 px gap", "keep this inside
that container", "rank the db below the api"), do not hand-compute the coordinates — write the
intent as a constraint file and let the solver resolve exact coordinates for you:

```
lucid --agent geo solve --content board.json --constraints layout.rules --grid 20 --output solved.json
```

The DSL is line-based (`#` comments); one directive per line:

```text
align left|right|top|bottom|center-x|center-y [a, b, c]
gap(a, b) >= 40        # also <=, ==; hgap(...)/vgap(...) force the axis
contain a in zone1 padding 20
same-size [a, b] width|height|both
fixed a                # pin a's current position
order-x [a, b, c]      # monotone left→right (order-y for top→bottom)
rank db > api          # vertical tier shorthand: "db below api" (order-y, reversed)
```

`rank a > b > c` is the ergonomic tier form: `a > b` reads "a ranks **below** b" (matching "rank the
db below the api" → `rank db > api` puts the API on top and the DB under it). It is just a vertical
`order` under the hood, so `report` shows it with `kind: "order"` and the original `rank` text in
`spec`. For horizontal ordering use `order-x`.

The solver anchors every shape to its current position with weak strength, so it makes the
**smallest** move that satisfies your (required) constraints — positions absorb the change; sizes
never change except via `same-size`. It then snaps the result to `--grid` (default 20) and emits the
transformed Standard Import document plus a `report` listing each constraint's residual. Feed the
solved document straight into `geometry lint` to confirm zero overlaps before you `create`.

In the `report`, each constraint's `satisfied` flag is **grid-tolerant** — it is true when the
constraint holds within one grid cell (`residual <= --grid`), because snapping can shift a coordinate
by up to half a grid cell. The exact deviation is always in `residual`; when you need a pixel-exact
gap or alignment, check `residual` (and solve with `--grid 0` to disable snapping entirely).

If the constraints contradict each other (e.g. two different required gaps on one pair), `geo solve`
exits non-zero and **names the conflict set** instead of emitting a wrong layout — relax or remove
the named constraints and re-run. Output is deterministic: identical document + rules always produce
byte-identical output.

### Hazard: hand-computed connector endpoints

**Before (fragile):** compute perimeter points and pin them as absolute endpoints.

```json
"endpoint1": { "type": "positionEndpoint", "style": "none", "position": { "x": 220, "y": 130 } },
"endpoint2": { "type": "positionEndpoint", "style": "arrow", "position": { "x": 400, "y": 130 } }
```

This bakes in A's and B's current geometry. If either shape moves, the endpoints are stale, and a
straight line between two computed points will happily pierce any shape in between.

**After (robust):** anchor by `shapeId` and omit `position` so Lucid smart-routes.

```json
"endpoint1": { "type": "shapeEndpoint", "style": "none", "shapeId": "a" },
"endpoint2": { "type": "shapeEndpoint", "style": "arrow", "shapeId": "b" }
```

Now Lucid picks the attachment points and re-routes whenever the shapes move. A whole class of
"line goes through a box" and "arrow lands in the wrong place" errors disappears. Pin an explicit
`position` only where a smart route visibly clips something — on **one** endpoint if that fixes the
route, or on **both** ends when you need to force the whole path (as `deny→end` does in the
flowchart exemplar, pinning both ends so it drops below the process node). Prefer relative-position
anchors like `{x:0.5,y:1}` (bottom-center) over hand-computed absolute points: they name a spot on
the shape and survive the shape moving, unlike a baked-in `positionEndpoint`.

### Hazard: arbitrary decimals from a layout calc

**Before:** `{ "x": 237.4, "y": 118.9, "w": 123.1, "h": 61.7 }` — nothing lines up with anything.

**After:** `{ "x": 240, "y": 120, "w": 120, "h": 60 }` — snapped; it aligns with every other
grid-snapped shape automatically.

## Anchor connectors by shapeId

Restating because it is load-bearing: build the graph by referencing shape IDs, not points. Give
each endpoint a `shapeId`, put `style: "arrow"` on the destination and `style: "none"` on the
source, omit `position`, and prefer `lineType: "elbow"` (or `straight`). Reserve `curved` for
decoration — it has no control points, so you cannot fix a bad curved route. Past roughly ten
edges, stop trying to place connectors by hand at all; lean entirely on shapeId smart lines.

## Fix geometry with `geo`, not by hand

`lucid geo` is a family of **pure, idempotent, offline** transforms over a Standard Import file —
`fn(model) → model`. Each reads `--content` (a file or `-` for stdin) and writes the transformed
document to stdout (or to `--output <path>` / `--in-place`). Use them to compute geometry the model
is bad at, instead of hand-editing coordinates. They **preserve every field** (including
type-specific and unknown ones); note that output object keys are sorted and numbers normalized —
the meaning is unchanged, only the formatting.

| Command | What it does |
|---|---|
| `geo snap --grid 20` | Round all `x/y/w/h` (+ absolute line points) to the grid. |
| `geo align --edge left\|right\|top\|bottom\|hcenter\|vcenter` | Align a set of shapes to a shared edge/center. |
| `geo distribute --axis h\|v` | Equalize edge-to-edge spacing across a set; endpoints stay fixed. |
| `geo pack --axis h\|v --gap 20` | Compact a set, removing gaps, with a fixed gap. |
| `geo nudge --dx --dy` | Translate a set by a delta (container children move too, by default). |
| `geo bbox` | Report the bounding box of a set (query). |
| `geo canvas-fit` | Translate a page's content to fit inside its fixed size. |
| `geo measure [--text S --font-size N]` | Real font-metric width/height of text (query). |
| `geo fit --mode grow\|shrink` | Fit text boxes to text and **always** emit an explicit `font-size`. |
| `geo route [--explicit]` | Convert connectors to shape-anchored smart lines (default), or write obstacle-dodging `elbowControlPoints`. |

Restrict most commands to a subset with `--ids a,b,c` and/or `--page N` (default: every shape, every
page). Two scoping rules worth knowing: `canvas-fit` and `route` act on the whole page and take
`--page` only — passing `--ids` is a usage error, not a silent no-op. And container-drag (a selected
container also carries the shapes geometrically inside it) applies to `snap`, `nudge`, and `fit`
only; disable it with `--no-with-children`. The set-relative `align`/`distribute`/`pack` act on
exactly the ids you name — a selected container is treated as one shape and its children stay put,
so you never accidentally flatten a group's layout onto the container's edge. They **compose** —
pipe one into the next; the downstream stage unwraps the envelope:

```bash
lucid --agent geo snap --content d.json --grid 20 \
  | lucid --agent geo align --content - --edge top --ids a,b,c \
  | lucid --agent geo fit --content - --mode grow --output final.json
```

Two habits worth pinning: run `geo fit` on every text box so an explicit `font-size` is always
present (never rely on Lucid's auto-shrink), and prefer `geo route` (smart lines) over hand-computed
endpoints — it deletes the whole "line pierces a box" / "arrow lands wrong" error class.

## Preview locally before you create

You no longer have to create a document to see where shapes land. `lucid render` transpiles a
Standard Import payload to SVG **offline** — no HTTP, no document created, no auth — and, with
`--emit-geometry`, hands back the **resolved geometry** an agent should reason over: each shape's
final box, each connector's resolved endpoints + route polyline + kind, and each text's estimated
bounds with an overflow flag. This is the geometry read-back the live API withholds (`document
contents` has no `x/y/w/h`), available before you spend a create round-trip.

```sh
# Resolved geometry (the primary substrate) — reason over this, not pixels:
lucid --agent render --content diagram.json --emit-geometry geometry.json
# Vector preview the raster-only export API cannot produce:
lucid --agent render --content diagram.json --page 1 -o preview.svg
# Optional raster preview (needs the Chromium engine; NEVER the default and it
# gracefully downgrades to SVG + a note when the browser engine is absent):
lucid --agent render --content diagram.json --engine chromium -o preview.png
```

`render` emits one SVG per page (z-order = document order), approximates each shape by its family
(rect / rounded / ellipse / diamond / cylinder / parallelogram; containers get a header band; cloud
`namedShape`s become labeled rounded-rects badged with the `className`), and routes lines through
their `joints`/`elbowControlPoints`. **Smart lines** (shapeId-anchored, no explicit route) draw
dashed centroid-to-centroid, with a note that Lucid auto-routes them on import — so a dashed straight
line in the preview is expected, not a defect. Fidelity is **geometric, not artistic**: positions,
sizes, and routes are faithful; iconography is not reproduced. The emitted `notes` array also flags
curved-line straightening, control-point-free elbow routing, endpoint decorations other than `arrow`
(only `arrow` draws an arrowhead — an `openArrow`/crow's-foot/etc. is noted, never mis-drawn), and
endpoints anchored to a **rotated** shape (resolved on its un-rotated box, so that attach point is
approximate). Read the notes before trusting a marker or a rotated attach point.

Pair `render --emit-geometry` with `geometry lint` (which scores the same payload and flags
overlaps / off-canvas / line-through-shape / dangling refs / text overflow with numeric fix deltas):
lint tells you *what* is wrong and by how much; the emitted geometry and SVG show you *where*.

## The render → validate → lint → create → export loop

There is no geometry read-back on the live API (`document contents` returns each shape's
`class`/`id`/`text` but **no** `x/y/w/h`), so resolve as much as possible locally first, then use an
exported image as the final ground truth. Verify in bounded rounds:

1. **Write** the plan, then the JSON (grid-snapped, shapeId-anchored, explicit font sizes).
2. **Render locally:** `lucid --agent render --content diagram.json --emit-geometry geometry.json -o preview.svg` — inspect the resolved boxes/routes/overflow flags (and the SVG) with no document created.
3. **Validate + lint:** `lucid --agent document validate --content diagram.json` and `lucid --agent geometry lint --content diagram.json` — fix any errors/defects in the JSON before spending a create.
4. **Create:** `lucid --agent document create --title "..." --product lucidchart --content diagram.json`
5. **Export:** `lucid --agent document export <id> --image-format png --output diagram.png`
   The output path must be inside your home directory, or export refuses it.
   - `--all-pages` exports every page in one call (`<stem>-p<N>.png`); a partial failure reports which pages succeeded (PARTIAL_FAILURE, exit 1) instead of silently succeeding.
   - **To read small text** without hand-cropping, tile the page: `--tiles 3x4` writes a 3×4 grid of server-side crops (`<stem>-r<r>c<c>.png`) that cover the page. Tiles are always PNG (`--image-format jpeg` is rejected here); combine with `--scale 2` (or `--dpi 320`) for extra resolution. This replaces the manual multi-crop pass.
   - `--crop x,y,w,h` clips one region (page pixels; validated locally before the request). Use `--crop-raw content` to crop to content or pass a server crop syntax verbatim.
6. **Inspect:** open the PNG and check for overlaps, off-canvas shapes, connectors crossing shapes, clipped or auto-shrunk text, and sane routing.
7. **Fix** the specific defects you saw — prefer a `geo` transform over a hand-edit (`geo snap` for off-grid coords, `geo align`/`distribute` for ragged rows, `geo fit` for clipped text, `geo route` for bad connectors), then re-render and recreate (or `document revise <prior-id> --content diagram.json --title-suffix " (v2)"` to inherit the prior document's metadata and record lineage). Cap this at about **two layout passes**; if it is still wrong after two, the plan is wrong, not the numbers — replan.
8. When it is clean, keep the final JSON as the source of truth.

Reason over structure first, pixels second: use `render --emit-geometry` (and the JSON you wrote) as
the primary substrate, and use the PNG for the final visual confirmation.

### No in-place editing — every change is a fresh document (`document revise` automates the recreate)

Lucid REST v1 has **no write-back to document contents** (re-verified 2026-07: `PATCH
/v1/documents/{id}` — the `document update` command — accepts only `title`/`parent`/`classification`,
never shapes/pages; the April-2026 "Edit Document API + Process Agent" is an LLM/MCP feature, not a
public REST contents-write endpoint). So every geometry or content tweak still means **creating a new
document with a new ID and URL**. Keep your `.json` on disk as the durable artifact and treat each
created document as disposable.

`document revise <id> --content new.json` packages that recreate into one step: it fetches the old
document's metadata and **inherits its title/product/parent** (each overridable with
`--title`/`--product`/`--parent`), appends `--title-suffix " (v2)"`, creates the new document, and —
with `--source-map map.json` — records the `{documentId, contentHash}` lineage so you can trace which
local edit produced which document. The `--source-map` path is validated (and any existing map parsed)
**before** the create, so a bad path — e.g. one outside `$HOME` — fails fast without creating anything;
if the map write still fails after the create, it reports a partial failure carrying the new id/URL, so
the new document is never lost. It reports `{old:{id,url}, new:{id,url}}` and states plainly that
**the old document is UNTOUCHED** and identity/URL changed. Use it instead of a bare `document create`
when iterating on an existing diagram, so you do not hand-copy the title/product every pass.

`document revise-trash <id>` is the **destructive** sibling: same recreate, then it **trashes the old
document after the new one is created successfully**. If the trash fails, both documents remain and it
reports a clear partial failure carrying the new id/URL — so a failed cleanup never loses your work.
It is named with `trash` (not `revise-replace`) so it classifies Destructive on the MCP/Cowork surface
and is gated behind the separate destructive opt-in, never a plain write grant.

There is still no true in-place `patch`: that is deliberately gated on Lucid's Edit Document API
actually reaching the public REST surface (it has not, as of 2026-07). Edit the local file and revise;
do not expect to patch a live document.

## Own the coordinates: source map, `diff`, and `pull`

The API cannot tell you where a shape landed (`document contents` is geometry-blind: it returns
`class`/`id`/`text`, never `boundingBox`/style). The tool closes that gap by owning the coordinates
it emitted. Three commands make the local `.json` the authoritative project model:

- **`document create --content board.json --source-map board.map.json`** — after a successful
  create, writes a sidecar mapping every spec `id -> boundingBox/type`, plus the uploaded
  `contentHash` and a `readableContentHash`. This is the local record of where each shape *was
  placed*, which the API will never give back. Explicit path only — no hidden state directory —
  written atomically (temp + rename). It is the durable answer to "where did this land".
- **`lucid diff before.json after.json`** — offline semantic diff of two Standard Import payloads,
  keyed by `id`: `added` / `removed` / `moved` (Δx,Δy) / `resized` (Δw,Δh) / `restyled` /
  `text-changed` per shape, plus line `rerouted` and page add/remove, with a summary count block.
  Use it to review exactly what a layout pass changed before you recreate, so a "fix" does not
  silently move ten other shapes. Diff is information: it always exits 0 for valid input.
- **`document pull <id> [--output pulled.json] [--source-map board.map.json]`** — fetches the current
  contents into a `contents-v1` JSON (a distinct schema, **not** Standard Import — `validate`
  rejects it, and the read API returns no geometry to recreate from). The GET is always fresh
  (cache-bypassed) so a drift check never reads a stale body. With `--source-map` it does two
  things: (1) **grafts geometry back** — `type` + `boundingBox` (position, size, rotation) from the
  create-time map are merged onto each shape the map covers, since shape ids round-trip on read-back
  (shapes added in the Lucid UI after create stay geometry-less, and the `geometry.recovered` count
  reports how many were restored); and (2) flags **drift** by comparing the pulled readable content
  (ids + text) against the create-time hash: someone edited the document in the Lucid UI since you
  created it. Drift cannot detect geometry/style edits — the read API is blind to those — so treat a
  "no drift" verdict as "no *text/structure* change", not "no change at all". Without `--source-map`
  the output warns that geometry is entirely unrecoverable.

Workflow: `create --source-map` when you ship a diagram; keep the `.json` + `.map.json` together;
`diff` two revisions of the `.json` before recreating; `pull --source-map` to check whether a live
document has been hand-edited out from under your local source of truth.

## Determinism checklist

Before you commit a document, confirm all of these. They are what keep a diagram reproducible
against Lucid's evolving renderer:

- [ ] Every shape's `x, y, w, h` is a multiple of 20.
- [ ] Every text has an explicit `font-size` (never rely on auto-scaling).
- [ ] Every connector anchors by `shapeId`; `position` is pinned only where a smart route clips.
- [ ] `lineType` is `elbow` or `straight`, not `curved`, wherever routing matters.
- [ ] No container you rely on for exact placement has `assistedLayout: true`.
- [ ] All shapes sit inside the page rectangle plus margin.
- [ ] Every `id` is unique; every connector `shapeId` resolves to a real shape.
- [ ] Colors are hex; no attempt at gradients, shadows, or themes.
- [ ] `className`/`type` values are real (from `references/classnames.md` or the library catalogs), not invented.

## Dead and limited surfaces (as of lucid-cli v0.26.0)

Do not spend turns on these:

- **`webhook` commands are not implemented** — `webhook list/get/create/delete` return a not-implemented error and issue no HTTP. Ignore them.
- **`--offset` is inert** — Lucid paginates by cursor. Use `--page-token` (or `--all`) for pagination; `--offset` does nothing.
- **No `restore` or `transfer` document subcommands exist** despite any doc-comment hint. The document verbs are `get`, `contents`, `search`, `create`, `copy`, `import`, `update`, `trash`, `export`, `validate`, `revise`, `revise-trash`.
- **`document update` writes the title only** — it cannot change page content. To "edit" content, use `document revise` (recreate; old kept) or `document revise-trash` (recreate + trash old); both produce a new document ID/URL.
- **`document contents` has no geometry** — it returns `class`, `id`, `customData`, `linkedData`, and `textAreas.text` per shape, but no bounding box, size, or style. You cannot ask the API where a shape landed; export and look.
- **`document export` is PNG or JPEG only** — no SVG/PDF (the endpoint does not render them). It now does multi-page and legibility work, though: `--all-pages`, `--crop x,y,w,h` (validated), `--dpi`/`--scale` (resolution), and `--tiles RxC` (grid of crops). Single-page selection is still `--page N` / `--page-id`. For a **vector (SVG)** preview, use the offline `lucid render` instead — it produces SVG per page and, unlike export, needs no document to exist.
