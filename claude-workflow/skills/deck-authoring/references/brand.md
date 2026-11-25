# Brand: DEE-derived palette, type, and canvas

The shipped theme and layout measurements were derived from these official sources:

- Palette and gradients: <https://dee.technology/color-usage> (read from the live DOM)
- Canvas, layout geometry, type ramp, fonts: `DEPT_Template_Presentation_{Light,Dark}_2025.pptx`
  from <https://dee.technology/brand-assets>

Both are MyID-gated. The binaries are never shipped or committed. The audited 2025 SHA-256
values are:

- Light: `bbb8e9f83ed19bbdbe0b8d3eb6d2e66876a8491d08c4999118c2d093d68fa0d9`
- Dark: `e353099fdad9bb98b5c9a58f9b4ac56b1c8079d514dff5a8fe294458f14e7014`

Without `--template`, captured values in `themes/dee.theme.json` and
`layouts/catalog.json` drive a template-derived PPTX. With `--template`, the local authorized
binary is hash- and structure-checked, its sample slides are removed, and its real
master/layout/theme parts plus referenced brand media are retained while editable IR content is
added. The audited light source has 51 layouts and the dark source has 46; both contain the 17
IR layouts used by this skill through 16 unique source-layout bindings. The build report records
the source hash, master/layout counts, required-layout count, and preserved-part count.

## The canvas is the load-bearing fact

The official template is `<p:sldSz cx="24384000" cy="13716000"/>` = **1920x1080 points** =
26.6667 x 15 in — exactly **2x** the standard 960x540pt 16:9 slide.

Rendering HTML at 1920x1080 CSS px therefore makes **1pt = 1px exactly**. The same captured
coordinates feed HTML and PPTX generation; T1/T2 verification detects drift between the
outputs. `scripts/lib/geometry.mjs` asserts the canvas identity and `deck.test.mjs` guards it.

Consequence for legibility: a size on this canvas reads like *half* that on a normal deck, so
36px here == 18pt there.

## Palette

Core: Fantasy Blue `#1990B7` · Royal Blue `#1E1C5D` · Black `#000000` · White `#FFFFFF`

Neutrals: Light Spark `#F0F1F3` · Spark `#C8D3DD` · Dark Spark `#8694A6` · Screen Gray
`#576377` · Dark Gray `#373F4F` · Dark Midnight `#02081D`

Blues: Bright Blue `#C2E9FF` · Star Blue `#0E7FFF` · Deep Blue `#002CD1` · Bright Aurora
`#02D6E8` · Aurora `#136878` · Dark Blue `#093A52`

Greens: Light Aurora `#C0E2BF` · ESPN Bet `#20F4CA` · Hulu Green `#1CE783` · ESPN Green
`#41AD49` · Green `#1F7954` · Dark Green `#004940`

Warm/purple: Starry Yellow `#FFC000` · Star Orange `#FF8000` · ESPN Red `#E52534` · Dark Red
`#730000` · Light Plum `#DDAFF6` · Plum Purple `#9429B2` · Deep Purple `#5E19C1` · Dark Purple
`#4D0069`

Documented roles: **primary text** Fantasy Blue, Royal Blue, Dark Gray, Screen Gray, Dark
Spark, Spark, Bright Blue, White · **backgrounds** Fantasy Blue, Royal Blue, Dark Midnight,
Light Spark, White · **accents, used sparingly** Light Aurora, Starry Yellow.

Gradients: `#1990B7 -> #02081D` (dramatic) · `#1990B7 -> #1E1C5D` (welcoming) ·
`#FFC000 -> #FF8000` "Touch of Magic" (milestones) · `#C2E9FF -> #1990B7` "Touch of Fantasy"
(progress). CSS gradients do not survive to OOXML — pre-rasterize or use a native `gradFill`.

### The palette is a dark-mode palette

Most of the bright brand colors fail WCAG on white. Measured, unrounded:

| Color | On white | Verdict as light-mode text |
|---|---|---|
| Starry Yellow `#FFC000` | 1.642:1 | fails 4.5 **and** 3.0 |
| Star Orange `#FF8000` | 2.518:1 | fails both |
| Hulu Green `#1CE783` | 1.64:1 | fails both |
| ESPN Bet `#20F4CA` | 1.41:1 | fails both |
| Fantasy Blue `#1990B7` | 3.67:1 | fails 4.5 as text; OK as a graphic |

So `dee.theme.json` carries **per-mode series and roles**: light mode uses the dark end of the
palette (Aurora, Deep Blue, Green, Plum Purple, Dark Red, Dark Blue, Dark Purple), dark mode
uses the bright end. `validateTheme` enforces every floor and the build fails otherwise.

One derived color exists, documented in `theme.derived`: `#B35900`, a darkened Star Orange
(4.832:1 on white), because **no official DEE amber is legible as light-mode text**. When the
brand color itself must appear, use Star Orange as a *fill* with Dark Midnight ink (7.904:1).

## Type

The native sources apply fonts through master, layout, placeholder, paragraph and run styles.
A global theme font is insufficient. The PowerPoint centered cover uses **Arial 116 pt bold**
with a 48 pt subtitle; other shapes use Avenir Book/Medium/Heavy. The Google source uses
Montserrat variants and Avenir LT Pro, with Arial in specific objects. These are approved source
choices, not automatic substitution failures.

Neither official PowerPoint package embeds its fonts. Confirm the actual selected fonts on the
recipient's machine. `doctor` measures the Avenir families used by reconstructed output; the
native workflow preserves source inheritance and records fonts in the rendered PDF. Inspect
both the output and the source in the same target application for line wrapping and weight.

Reconstructed output enforces a 36px prose floor and 20px secondary furniture floor. Native
source tables and annotations have their own typography; do not apply those reconstructed
floors to approved native objects. Do not claim font embedding or cross-application equivalence.

## Adding a brand (data only)

Write `./deck/themes/<id>.theme.json` in the project, or
`~/.aix/deck/themes/<id>.theme.json` per user; both win over the shipped default. Then:

```sh
node <skill-dir>/scripts/deck.mjs validate --theme <id>
node <skill-dir>/scripts/deck.mjs build deck/x.deck.json --theme <id> --reconstruct
```

Required shape: `id`, `canvas` (must be 1920x1080), `palette`, `modes.{light,dark}` with every
role (`canvas surface ink inkSecondary inkMuted rule accent accentInk positive negative warning
codeBg codeInk`) plus per-mode `series[]` and `seriesOnAccent[]` arrays of >= 4 colors, the three
font stacks, `pptxFont*` names, `type`, `grid`, `radius`, `motion`. The normal series must clear
3:1 on `canvas`; the accent series must clear 3:1 on `accent`. Any non-palette color must be
listed in `derived` with the reason.

A theme **cannot** launder: the 1920x1080 canvas, the 36px prose floor, the 44px margin, or the
unrounded WCAG floors.
