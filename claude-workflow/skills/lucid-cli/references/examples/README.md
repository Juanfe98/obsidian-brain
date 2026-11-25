# Golden Standard Import exemplars

Three verified example documents to use as few-shot templates when authoring Lucid diagrams. Each
was created live (`lucid document create --content <file>`), exported to PNG, and visually
inspected for clean layout, readable text, and sane connector routing. All three are grid-snapped
(20 px), anchor connectors by `shapeId`, and set explicit font sizes — the practices in
`../authoring-loop.md`.

These are Standard Import document JSON, so they are consumed by `--content`:

```bash
lucid --agent document create --title "My diagram" --product lucidchart --content flowchart.json
```

| File | Demonstrates |
| --- | --- |
| `flowchart.json` | Flowchart shapes (`terminator`, `process`, `decision`), smart-line connectors with `yes`/`no` labels, and one connector with both endpoints pinned (via relative-position anchors) to force a route where a smart line would clip a shape. |
| `swimlane.json` | A three-lane horizontal `swimLanes` container (User / API / Data) with `process` and `database` children and cross-lane connectors. |
| `aws-architecture.json` | AWS 2024 `namedShape` service icons and nested `namedContainer` boundaries (VPC → public/private subnets); named shapes self-label from their `className`. |

Copy the closest exemplar, change the shapes and coordinates to your plan, and re-run the
create → export → inspect loop. Do not treat the coordinates as sacred — treat the structure
(grid alignment, shapeId-anchored smart lines, explicit font sizes) as the pattern to keep.
