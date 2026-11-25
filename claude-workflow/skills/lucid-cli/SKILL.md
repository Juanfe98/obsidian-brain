---
name: lucid-cli
version: 0.59.0
description: >
  Agent-friendly Lucid CLI (Lucidchart, Lucidspark, Lucidscale). Use when user mentions: lucid, lucidchart, lucidspark, lucidscale, diagram, flowchart, whiteboard, ERD.
roles: ["engineer", "product", "design"]
metadata:
  generated: true
  requires:
    bins: ["lucid"]
---

# Agent-friendly Lucid CLI (Lucidchart, Lucidspark, Lucidscale)

## Quick Reference

```bash
# Documents
lucid --agent document search --keywords "architecture" --product lucidchart --limit 10
lucid --agent document get <document-id>
lucid --agent document contents <document-id>
lucid --agent document export <document-id> --image-format png --output diagram.png

# Folders
lucid --agent folder get <folder-id>
lucid --agent folder contents <folder-id> --limit 20
lucid --agent folder search --keywords "design" --request-as user

# Shape catalog (offline, no auth)
lucid --agent catalog libraries
lucid --agent catalog search s3 --limit 5
lucid --agent catalog search "load balancer" --library aws-2024
lucid --agent catalog get ArchAmazonSimpleStorageServiceAWS2024

# Layout: topology -> coordinates (offline, no auth)
lucid --agent layout --spec graph.json | jq .data > board.json   # {nodes,edges,groups?} -> Standard Import
lucid --agent layout --from-mermaid flow.mmd --direction LR | jq .data > board.json
lucid --agent geometry lint --content board.json   # verify zero overlaps, then create

```

## Authentication

- Method: API key (Bearer), managed by pat-manager
- Setup: pat-manager login lucid  # or: export LUCID_API_KEY=<your-api-key>

## Workflows

### Author a diagram (create -> export -> inspect loop)

```bash
# 1. Plan canvas, 20px grid, per-node cells, and routing FIRST (references/authoring-loop.md)
# 2. Write Standard Import JSON: absolute px coords, unique IDs, explicit font-size, shapeId-anchored connectors (references/standard-import.md; copy references/examples/*.json)
lucid --agent document create --title "My diagram" --product lucidchart --content diagram.json
lucid --agent document export <document-id> --image-format png --output diagram.png
# 3. Inspect the PNG for overlaps / off-canvas / clipped text / connectors through shapes; fix the JSON and recreate (bounded to ~2 layout passes)
```

## Tips

- Authoring a diagram? Read references/standard-import.md (coordinate model, IDs, the 11 shape libraries, connectors, text, style ceiling) BEFORE writing --content JSON
- Past ~10 edges, do NOT hand-place coordinates: emit topology (nodes+edges+groups) and let `lucid layout` compute the geometry deterministically, then lint and create. See references/authoring-loop.md
- Follow references/authoring-loop.md: plan first, snap coords to a 20px grid, anchor connectors by shapeId (omit position for smart routing), set explicit font-size, then create -> export PNG -> inspect -> recreate
- No way to write a file (Claude Desktop chat)? Pass the Standard Import object inline: `document create --content-json '{"version":1,"pages":[...]}'`. At most 64 KiB; a larger document needs `--content <file>`. The value is visible in process listings and shell history; use `--content` for anything sensitive
- Look up cloud service classNames in references/classnames.md (AWS/Azure/GCP) — never invent a className (unknown values are a server 400 with no local validator)
- Start from a verified template in references/examples/ (flowchart.json, swimlane.json, aws-architecture.json)
- Always use --agent for structured JSON output
- Use --limit to control response size (max 200, default 25)
- Set --product lucidchart|lucidspark|lucidscale to scope searches (Standard Import supports lucidchart|lucidspark only)
- Run `pat-manager login lucid` to set up the API key (Bearer)
- Run `lucid agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`lucid --agent document search --help`); a bare `lucid --agent --help` returns the whole schema

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `lucid account me`

Get the calling account's profile

### `lucid document get`

Get a document's metadata

- `<id>`:  **(required)**

### `lucid document contents`

Get a document's full structural contents (pages, shapes, lines, layers)

- `<id>`:  **(required)**

### `lucid document search`

Search documents (user-scoped)

- `--keywords`: Full-text query
- `--product`: Restrict to one product family (overrides the global `--product`)
- `--exclude-trashed`: Filter out trashed documents (default: include them)
- `--modified-after`: ISO-8601 lower bound on `lastModified`
- `--modified-before`: ISO-8601 upper bound on `lastModified`
- `--all`: Exhaust pages

### `lucid document create`

Create a new document from Lucid Standard Import JSON

- `--title`: New document title **(required)**
- `--product`: Target product **(required)**
- `--content`: Path to JSON content file (`-` reads from stdin). Conflicts with --content-json
- `--content-json`: Standard Import JSON passed inline, for a caller that shares no filesystem with this CLI (a Claude Desktop chat tool call). At most 64 KiB, a JSON object; use --content for a larger document. The value is visible in process listings and shell history; use --content for anything sensitive
- `--parent`: Parent folder ID (omit to create at the user's root)
- `--team`: Owning team ID
- `--source-map`: Write a local source-map sidecar to this path after a successful create: maps each spec id -> boundingBox/type, plus the content hash and document metadata. Requires --content or --content-json. Closes the geometry read-back gap the API cannot (G5)

### `lucid document copy`

Copy an existing document via the `template` field

- `--title`: New document title **(required)**
- `--product`: Target product **(required)**
- `--template`: Source document ID to copy from **(required)**
- `--parent`: Parent folder ID for the copy

### `lucid document import`

Import a file (Visio / draw.io / Gliffy / Lucid Standard)

- `--file`: Path to the source file **(required)**
- `--title`: New document title **(required)**
- `--product`: Target product **(required)**
- `--parent`: Parent folder ID. Without this the doc lands at the user's root
- `--type`: Override MIME type (auto-detected by extension)

### `lucid document pull`

Pull a document's current contents into a local `contents-v1` JSON (always fetched fresh, bypassing the cache). The read API is geometry-BLIND (no boundingBox/style/z-order); pull warns about this and, with --source-map, grafts type + boundingBox back from the create-time map AND reports drift vs the create-time hash

- `<id>`:  **(required)**
- `--output`: Write the normalized contents-v1 JSON to this path (default: print only)
- `--source-map`: Graft geometry (type + boundingBox) from this create-time source map onto the pulled shapes, and compare the pulled readable content against its stored hash to detect UI edits since create

### `lucid document update`

Update a document's title or other metadata

- `<id>`:  **(required)**
- `--title`: New title

### `lucid document trash`

Trash a document

- `<id>`:  **(required)**

### `lucid document export`

Export a document image: single page, every page, a validated crop, or an R×C tile grid

- `<id>`:  **(required)**
- `--image-format`: Raster output format (named `--image-format` to avoid colliding with the global `--format` flag that controls JSON/YAML output). Conflicts with `--tiles`, which is always PNG (the naming contract and the dimension probe both assume PNG), so a `jpeg` request there is rejected rather than silently ignored
- `--page`: 1-based page index (default 1). With `--tiles`, selects which page to tile
- `--page-id`: Page ID (alternative to `--page`)
- `--all-pages`: Export every page. Writes `<stem>-p<N>.<ext>` per page; partial failures are reported (PARTIAL_FAILURE, non-zero exit)
- `--crop`: Validated crop region `x,y,w,h` in page pixels (x,y ≥ 0; w,h ≥ 1), rejected locally before any HTTP call
- `--crop-raw`: Raw crop spec sent verbatim (e.g. `content`); forward-compat escape hatch for server syntaxes `--crop` does not model
- `--dpi`: Export DPI, sent via the Accept header (server default 160). Oversized exports may be auto-downscaled server-side
- `--scale`: Client-side resolution multiplier over the default DPI (`--scale 2` ≡ `--dpi 320`). No image processing — maps to the server DPI knob
- `--tiles`: Tile the page into an `RxC` grid of server-side crops. Writes `<stem>-r<r>c<c>.png` (legibility helper; always PNG)
- `--output`: Output path (default: `lucid-<id>.<ext>`). Multi-file modes (`--all-pages`, `--tiles`) derive `<stem>` from this (extension stripped)

### `lucid document validate`

Validate Standard Import JSON offline (no HTTP) before creating

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--strict`: Also enforce determinism-discipline rules (explicit font-size, no curved lines, no absurd coordinates)

### `lucid document revise`

Revise a document via the recreate round-trip (creates a NEW document; the OLD one is left UNTOUCHED)

- `<id>`:  **(required)**
- `--content`: Path to the new Standard Import JSON content (`-` reads from stdin) **(required)**
- `--title`: Override the inherited base title (before the suffix is appended)
- `--product`: Override the inherited product
- `--parent`: Override the inherited parent folder ID
- `--title-suffix`: Suffix appended to the (inherited or overridden) title, e.g. " (v2)"
- `--source-map`: Path to a source-map JSON file to update with the new documentId and contentHash lineage (created if absent)

### `lucid document revise-trash`

Revise a document AND trash the original (DESTRUCTIVE)

- `<id>`:  **(required)**
- `--content`: Path to the new Standard Import JSON content (`-` reads from stdin) **(required)**
- `--title`: Override the inherited base title (before the suffix is appended)
- `--product`: Override the inherited product
- `--parent`: Override the inherited parent folder ID
- `--title-suffix`: Suffix appended to the (inherited or overridden) title, e.g. " (v2)"
- `--source-map`: Path to a source-map JSON file to update with the new documentId and contentHash lineage (created if absent)

### `lucid geometry lint`

Lint the geometry of a Standard Import document (offline; no HTTP)

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--page`: Restrict the lint to a single 1-based page index

### `lucid diff`

Offline semantic diff of two Standard Import documents (added/removed/moved/resized/restyled/text-changed/rerouted)

- `<a>`: Path to the first (baseline) Standard Import JSON file **(required)**
- `<b>`: Path to the second (proposed) Standard Import JSON file **(required)**

### `lucid geo snap`

Snap all x/y/w/h (and, page-wide, absolute line coords) to a grid module

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--output`: Write the transformed JSON to this path (bare document, for `document create`)
- `--in-place`: Rewrite the --content file in place (requires a file path, not `-`)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it
- `--grid`: Grid module in pixels

### `lucid geo align`

Align a set of shapes to a shared edge or center

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--output`: Write the transformed JSON to this path (bare document, for `document create`)
- `--in-place`: Rewrite the --content file in place (requires a file path, not `-`)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it
- `--edge`: Alignment target **(required)**

### `lucid geo distribute`

Even out spacing across a set of shapes along an axis

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--output`: Write the transformed JSON to this path (bare document, for `document create`)
- `--in-place`: Rewrite the --content file in place (requires a file path, not `-`)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it
- `--axis`: Axis: h (horizontal) | v (vertical) **(required)**

### `lucid geo pack`

Compact shapes along an axis, removing gaps (fixed inter-shape gap)

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--output`: Write the transformed JSON to this path (bare document, for `document create`)
- `--in-place`: Rewrite the --content file in place (requires a file path, not `-`)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it
- `--axis`: Axis: h | v **(required)**
- `--gap`: Gap between packed shapes, in pixels

### `lucid geo nudge`

Translate shapes by a delta (relative move; not idempotent)

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--output`: Write the transformed JSON to this path (bare document, for `document create`)
- `--in-place`: Rewrite the --content file in place (requires a file path, not `-`)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it
- `--dx`: Horizontal delta in pixels (may be negative) **(required)**
- `--dy`: Vertical delta in pixels (may be negative) **(required)**

### `lucid geo bbox`

Compute the bounding box of a set of shapes (read-only query)

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it

### `lucid geo canvas-fit`

Translate a page's content so it fits inside the page's fixed size

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--output`: Write the transformed JSON to this path (bare document, for `document create`)
- `--in-place`: Rewrite the --content file in place (requires a file path, not `-`)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it

### `lucid geo measure`

Measure rendered text width/height with embedded font metrics (query)

- `--content`: Path to the Standard Import JSON file (measure every text shape)
- `--text`: Measure this literal string instead of a document
- `--font-size`: Font size in points for --text (default 10pt)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it

### `lucid geo fit`

Fit text boxes to their text, always emitting an explicit font-size

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--output`: Write the transformed JSON to this path (bare document, for `document create`)
- `--in-place`: Rewrite the --content file in place (requires a file path, not `-`)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it
- `--mode`: grow: enlarge the box for the text; shrink: shrink the font to the box
- `--pad`: Padding kept inside the box around the text, in pixels

### `lucid geo route`

Re-route connectors: shape-anchored smart lines (default) or obstacle-dodging elbows

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--output`: Write the transformed JSON to this path (bare document, for `document create`)
- `--in-place`: Rewrite the --content file in place (requires a file path, not `-`)
- `--ids`: Restrict to these shape ids (comma-separated); default = all shapes
- `--page`: Restrict to a single 1-based page index
- `--no-with-children`: Disable the default behavior of moving a container's contained shapes with it
- `--explicit`: Write explicit elbowControlPoints dodging obstacles (default: smart lines)
- `--padding`: Obstacle padding for --explicit routing, in pixels

### `lucid geo solve`

Resolve a constraint DSL against a Standard Import document (offline)

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--constraints`: Path to the constraint DSL file (`-` reads from stdin) **(required)**
- `--grid`: Grid to snap the solved coordinates to (px). 0 disables snapping
- `--output`: Write the transformed document JSON to this path instead of the envelope (the solve report is always in the envelope)

### `lucid layout`

Deterministic topology→coordinates layout (offline): a graph spec or Mermaid becomes Standard Import

- `--spec`: Path to the topology spec JSON (`-` reads from stdin). Mutually exclusive with --from-mermaid
- `--from-mermaid`: Path to a Mermaid flowchart file (`-` reads from stdin). Mutually exclusive with --spec
- `--seed`: Deterministic layout seed (pinned; the same seed yields byte-identical output)
- `--grid`: Grid to snap all output coordinates to
- `--direction`: Flow direction (default: TB for --spec, the Mermaid header for --from-mermaid)
- `--node-spacing`: Minimum gap between sibling nodes within a layer (px)
- `--layer-spacing`: Gap between adjacent layers (px)

### `lucid render`

Offline local preview: transpile a Standard Import payload to SVG (or PNG via the optional Chromium engine) and emit resolved geometry — no HTTP, no document created

- `--content`: Path to the Standard Import JSON file (`-` reads from stdin) **(required)**
- `--page`: Restrict rendering to a single 1-based page index (default: all pages)
- `--output`: Output path. SVG: omit to inline the SVG in the envelope; multi-page writes `<stem>-p<N>.<ext>`. Required for `--engine chromium` (PNG)
- `--engine`: Rendering engine: `svg` (pure-Rust, default) or `chromium` (rasterize to PNG; gracefully downgrades to SVG when the engine is unavailable)
- `--emit-geometry`: Also write the resolved-geometry JSON (boxes, routes, text bounds) — the substrate an agent reasons over

### `lucid folder get`

Get folder metadata

- `<id>`:  **(required)**

### `lucid folder contents`

List folder contents (folders + documents)

- `<id>`:  **(required)**
- `--all`: Exhaust pages

### `lucid folder create`

Create a folder

- `--name`: Folder name **(required)**
- `--parent`: Parent folder ID (omit to create at the user's root)
- `--team`: Owning team ID (omit for personal folders)

### `lucid folder update`

Update folder name or parent

- `<id>`:  **(required)**
- `--name`: New folder name
- `--parent`: New parent folder ID

### `lucid folder search`

Search folders (requires `--request-as`)

- `--keywords`: Full-text query
- `--type`: Filter by type: `folder` (default) or `team`
- `--owned-by-users`: Restrict to folders owned by users (vs. teams)
- `--all`: Exhaust pages

### `lucid folder trash`

Trash a folder

- `<id>`:  **(required)**

### `lucid user me`

Get the calling user's profile

### `lucid user get`

Get a user by numeric ID

- `<id>`:  **(required)**

### `lucid user list`

List users in the account (admin)

- `--all`: Exhaust pages

### `lucid user search`

Search users by email (admin)

- `--email`:  **(required)**

### `lucid catalog libraries`

List the importable Standard Import libraries (native-shape coverage ceiling)

### `lucid catalog search`

Fuzzy-search shapes by name or className (case-insensitive, offline). Honors the global `--limit` (default 25)

- `<query>`: Query, matched against className and display name **(required)**
- `--library`: Restrict to one library slug (e.g. aws-2024, flowchart, shape)

### `lucid catalog get`

Resolve a single className exactly (case-insensitive)

- `<class_name>`: The exact className / shape type to resolve **(required)**

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv, yaml, tsv | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--summary` | Summary mode (counts and statuses only). Alias: --brief | - |
| `--concise` | Concise mode: all fields except body/description/content | - |
| `--full` | Preserve full API payloads, including null-valued fields | - |
| `--limit` | Max items to return | 25 |
| `--page-token` | Lucid pageToken (opaque cursor returned by previous response) | - |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token (Bearer API key). Resolves via cascade: this flag > `LUCID_API_KEY` env > pat-manager `lucid`. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override server URL (e.g., FedRAMP environment) | - |
| `--read-only` | Disable all write operations | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--timeout` | Request timeout in milliseconds | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--product` | Default product for commands that accept one | - |
| `--request-as` | Inject `Lucid-Request-As` header (required by folder search, account search, etc.) | - |
| `--debug` | Print debug info to stderr | - |
