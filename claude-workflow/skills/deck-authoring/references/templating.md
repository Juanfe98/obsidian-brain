# DEE template sources

The [brand-assets page](https://dee.technology/brand-assets) directs authors to use its templates
for Disney Entertainment and ESPN Product & Technology presentations. Select the destination
application and light/dark mode. For Google, copy the native template for the user's domain.
The 2025 assets were inspected on September 8, 2026.

All 24 linked assets were downloaded and inspected: two PowerPoint, two Keynote, three Word,
three Pages, four Google Slides exports, four Google Docs exports, and six logo/icon libraries.
[The asset inventory](../templates/asset-inventory.json) records their source URLs and snapshot
hashes. Google export hashes describe downloaded snapshots, not stable revisions. Official
binaries stay outside Git.

## Presentation library

| Source | Sample slides | Layouts in inspected PPTX | Design |
|---|---:|---:|---|
| PowerPoint light | 66 | 51 | Blue and pale Spark artwork; white content surfaces |
| PowerPoint dark | 62 | 46 | Dark Aurora artwork and mode-specific colors |
| Google light, either domain | 67 | 51 | Native Montserrat/Avenir typography; an additional icon sample |
| Google dark, either domain | 62 | 44 | Native Google dark layouts with separate object IDs |

All six inspected PPTX packages use **1920×1080 points**, or **24384000×13716000 EMU**. A native
copy preserves that size. A blank Google presentation defaults to another size and the Slides
API cannot set it. The apps.disney.com and disneystreaming.com sources have distinct IDs.
[The runtime registry](../templates/dee.json) pins those IDs and the PowerPoint source hashes.

| Family | Available designs | Preserve |
|---|---|---|
| Covers/dividers/endings | Centered and left lockups; blue/Spark and dark variants | Artwork, logo, alignment and typography |
| Text | Agenda, sidebar, quotes, statements, one–four columns, containers/lines, large copy | Paragraph levels, bullet spacing, column boundaries and footer |
| Metrics | Big fact and three facts | Sample font-size overrides; layout defaults alone differ |
| Tables/diagrams | Native tables, org charts with/without portraits, process columns | Editable cells, groups, connectors and shapes |
| Timelines | Three, four, five and six stops | One dotted axis, native markers and final star |
| Media | Left/right image with copy, three-up, full bleed, containers/icons | Crop, z-order and frame geometry |
| Device mockups | Desktop, laptop, phone and tablet arrangements | Replace the image behind the device frame |

Instruction pages and sample content usually do not belong in a finished deck. Tables,
diagrams and mockups often sit on general layouts as slide-level objects; retaining layout
parts alone does not recreate them. Use [native plans](native-plans.md) for these source slides.

## Native typography

The PowerPoint centered cover specifies **Arial 116 pt bold** with a 48 pt subtitle. Other
objects use Avenir Book, Medium or Heavy. Google uses Montserrat variants, Avenir LT Pro and
some Arial; native Google PDF exports confirm those faces are rendered. Neither PowerPoint
source embeds fonts. Inspect selected shapes and rendered pages instead of imposing global
heading/body fonts.

The compact `--template` emitter clones sample placeholders, preserving their overrides and
layout inheritance. The three-fact sample, for example, overrides two layout defaults to
180 pt. The timeline adapter selects the matching native timeline and fills it. Background
overrides are rejected because an overlay can cover inherited logos and footers.

## Other assets

Word/Pages and native Google Docs provide long-document and short-document templates. Word
and Pages also provide email-signature templates. Long documents include a branded cover;
short documents use a compact branded header. These are document templates, not slide canvases.
`preread` creates Markdown content; it does not apply those native document templates.

The ZIP libraries provide main Product + Technology lockups, alliance logos, organization/pillar
symbols, and light/dark/white icon variants. Use the supplied artwork in its intended context;
do not stretch, recolor or redraw logos.

## Implementation

`python-pptx` loads the authorized PowerPoint package, copies native slides/placeholders, and
proves unchanged master/layout/theme/artwork parts. Google uses Drive copy and typed,
revision-guarded Slides edits. Both routes render their resulting native documents.

PptxGenJS remains behind `--reconstruct` for deliberately composed designs and custom themes.
That output is editable and template-derived; it does not preserve the official package.
PPTX-to-Google conversion remains an optional import route with a separate visual review.
