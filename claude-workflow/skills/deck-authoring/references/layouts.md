# Layout catalog

17 layouts. Their geometry is derived from the official DEE presentation system.
`sourceLayout` selects the official layout in `--template` mode; `sourcePlaceholder` selects
its native text object, including sample-slide overrides. `--reconstruct` uses catalog geometry
in px (== pt on the 1920x1080 canvas). For the full native library, use
[inspect-template or inspect-google](native-plans.md).

Deliberate departures from the template are listed in `layouts/catalog.json` under
`derivedSlots`, each with its reason — read that before "fixing" a coordinate.

## Choosing (narrative recommendations; slot limits remain enforced)

| Layout | Use it for | Refuses |
|---|---|---|
| `title` | Opening slide. Usually the opening slide. | missing required text |
| `section-divider` | Marks a new act. 2-5 per deck. | body copy or images |
| `agenda` | Roadmap of the deck. Each item should map to a later section-divider. | <3 or >6 items |
| `bullets` | The workhorse. One idea per bullet. | more than 5 bullets, or an essay per bullet |
| `two-column` | Compare or contrast two sets. Never prose on both sides. | prose on both sides — short form only |
| `statement` | The one slide people remember. A single full sentence. | more than one sentence, or 140+ chars |
| `big-fact` | One number that carries the argument. | a second number competing for attention |
| `tri-fact` | Exactly three metrics. Use big-fact when one number dominates. | two or four metrics (use big-fact / quad) |
| `quote` | A verbatim customer or exec quote. Never paraphrase in this layout. | a paraphrase — this layout is for verbatim words |
| `three-up` | Three parallel ideas of equal weight. | anything but three peers |
| `quad` | Four items, or a 2x2 matrix. | more than four blocks |
| `chart-takeaway` | One chart, one message. The takeaway is the headline, not the chart type. | a chart with no takeaway headline, or two messages |
| `timeline` | Three to six milestones using the matching source timeline. | fewer than 3 or more than 6 milestones |
| `image-text` | One image carrying meaning, with supporting copy. | a decorative image with no meaning |
| `full-bleed-image` | A single full-bleed image with an optional short scrimmed caption. | body copy on top — put the argument on the next slide |
| `large-copy` | A paragraph that must be read verbatim. Pre-read mode only. | live mode (pre-read only) |
| `closing-cta` | The ask. Final slide, exactly one per deck. | more than one per deck; anything but the ask |

## Slot contracts

`opt` marks an optional slot. `max` is a character limit for text, an item count for lists.

### `title`  ->  "Title - Fantasy Blue One-Line Center"

Background: `accent`.

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 469, 1820, 164 | 116 | 60ch |
| `subtitle` *(opt)* | text | 50, 624, 1820, 331 | 48 | 90ch |

### `section-divider`  ->  "Section Title Fantasy Blue"

Background: `accent`.

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `label` | text | 50, 365, 1820, 350 | 116 | 40ch |

### `agenda`  ->  "Agenda"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 74.6, 1200, 75 | 54 | 60ch |
| `dek` *(opt)* | text | 50, 150, 1200, 75 | 36 | 80ch |
| `items` | text-list | 50, 275, 1200, 690.1 | 48 | 48ch, 3-6 items |
| `image` *(opt)* | image | 1289.7, -0.4, 630.3, 1080.8 | — | — |

### `bullets`  ->  "Title & Bullets"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 75, 1200, 75 | 54 | 60ch |
| `dek` *(opt)* | text | 50, 150, 1200, 75 | 36 | 80ch |
| `items` | text-list | 50, 274.5, 1152, 714.7 | 40 | 120ch, 2-5 items |
| `image` *(opt)* | image | 1289.7, -0.4, 630.3, 1080.8 | — | — |

### `two-column`  ->  "Title & Bullets - 2 Column"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 75, 1790, 74.6 | 54 | 60ch |
| `dek` *(opt)* | text | 50, 150, 1790, 75 | 36 | 80ch |
| `left` | text-list | 50, 275, 885.3, 690 | 40 | 110ch, 1-5 items |
| `right` | text-list | 985.1, 275, 885, 690 | 40 | 110ch, 1-5 items |

### `statement`  ->  "Statement"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `claim` | text | 95, 118.5, 1730, 843 | 80 | 140ch |

### `big-fact`  ->  "Big Fact"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `value` | text | 110, 75, 1700, 550 | 180 | 12ch |
| `caption` | text | 110, 649.6, 1700, 150 | 48 | 120ch |

### `tri-fact`  ->  "Tri-Fact"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 75, 1820, 75 | 54 | 60ch |
| `dek` *(opt)* | text | 50, 150, 1820, 75 | 36 | 80ch |
| `value1` | text | 61.5, 274.8, 550, 275.1 | 72 | 10ch |
| `caption1` | text | 61.5, 574.6, 550, 350.1 | 48 | 90ch |
| `value2` | text | 685, 274.8, 550, 275.1 | 72 | 10ch |
| `caption2` | text | 685, 574.6, 550, 350.1 | 48 | 90ch |
| `value3` | text | 1308.5, 274.8, 550, 275.1 | 72 | 10ch |
| `caption3` | text | 1310.7, 574.6, 550, 350.1 | 48 | 90ch |

### `quote`  ->  "Quote"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `quote` | text | 110, 275, 1700, 524.7 | 80 | 220ch |
| `attribution` | text | 210, 839.6, 1500, 75 | 36 | 80ch |

### `three-up`  ->  "Title & 1/3 Containers"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 75, 1820, 75 | 54 | 60ch |
| `dek` *(opt)* | text | 50, 150, 1820, 74.6 | 36 | 80ch |
| `card1` | card | 50, 274.7, 575.3, 675.2 | 48/36 | h28/b150ch |
| `card2` | card | 672.4, 274.7, 575.3, 675.2 | 48/36 | h28/b150ch |
| `card3` | card | 1294.7, 274.7, 575.3, 675.2 | 48/36 | h28/b150ch |

### `quad`  ->  "2x2 blocks"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 75, 1820, 75 | 54 | 60ch |
| `dek` *(opt)* | text | 50, 150, 1820, 74.6 | 36 | 80ch |
| `card1` | card | 50, 275, 885.3, 324.7 | 40/36 | h32/b120ch |
| `card2` | card | 985.2, 275, 885.3, 324.7 | 40/36 | h32/b120ch |
| `card3` | card | 50, 639.5, 885.3, 324.7 | 40/36 | h32/b120ch |
| `card4` | card | 985.2, 639.5, 885.3, 324.7 | 40/36 | h32/b120ch |

### `chart-takeaway`  ->  "Title & Bullets - 2 Column"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 75, 1790, 74.6 | 54 | 60ch |
| `takeaway` | text | 50, 150, 1790, 75 | 36 | 110ch |
| `chart` | chart | 50, 275, 1180, 690 | — | — |
| `insights` *(opt)* | text-list | 1280, 275, 590, 690 | 32 | 100ch, 0-4 items |

### `timeline`  ->  "Timeline x4"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 75, 1820, 75 | 54 | 60ch |
| `dek` *(opt)* | text | 50, 150, 1820, 75 | 36 | 80ch |
| `milestones` | milestone-list | per-milestone | 24/20 | 3-4 items, l28/b60ch |

### `image-text`  ->  "Title & Photo Right Alt"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 74.6, 885, 459.6 | 72 | 70ch |
| `body` | text | 50, 540, 885, 459.6 | 40 | 320ch |
| `image` | image | 985.5, 74.9, 885.3, 890.6 | — | — |

### `full-bleed-image`  ->  "Photo"

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `image` | image | 0, 0, 1920, 1080 | — | — |
| `caption` *(opt)* | text | 50, 884, 1820, 76 | 28 | 100ch |

### `large-copy`  ->  "Title and Large Copy"

Modes: preread only.

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `title` | text | 50, 75, 1200, 75 | 54 | 60ch |
| `body` | text | 50, 175, 1100, 775 | 36 | 900ch |

### `closing-cta`  ->  "Ending Slide One-line"

Background: `accent`.

| slot | kind | box (x,y,w,h) | size | max |
|---|---|---|---|---|
| `ask` | text | 50, 478.3, 1820, 164.3 | 116 | 60ch |
