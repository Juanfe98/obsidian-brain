---
name: html-presentation
description: Research a topic and build a modern presentation deck as a single HTML file, like PowerPoint but in the browser, for presenting to a team. Every claim is backed by a sourced fact sheet built from repos, docs and connected tools. Supports keyboard/clicker navigation, speaker notes with a presenter view, a slide overview, PDF export, curated themes (including PriceSmart brand), and code, diagrams (Mermaid and Archify), charts, metrics, timelines and comparisons. Use this whenever the user wants slides, a deck, a presentation, a talk, a demo walkthrough, a sprint review, a status or roadmap update, a tech talk, a kickoff or a training session, for technical or non-technical audiences. Also use it when they say "I have to present X to my team", ask to turn a doc, PR, README, Confluence page or research into slides, or want to edit or restyle an existing HTML deck, even if they never say "HTML".
---

# HTML presentation

You produce **one self-contained `.html` file** that someone opens in a browser and presents full screen.
The deck runs on a bundled engine (`assets/engine.html`). You only write the slides; the engine provides
the 16:9 stage, themes, navigation, presenter view, overview and print.

The point of a deck is to help someone **talk to a room**. Optimize for what the audience understands and
remembers, not for how much information fits. A good deck makes the presenter look prepared and the
message easy to follow.

## Workflow

### 1. Get the brief

Gather these, inferring from the conversation and the user's materials first. Ask only for what's
missing and actually changes the deck, in a single short round:

- **Audience**: engineers, a mixed team, leadership, or non-technical stakeholders.
- **Goal**: what should the audience know, decide or do afterwards? This is the most important question.
- **Duration**: rough slide budget is about 1 slide per minute, plus the title and closing slides.
- **Source material**: docs, repos, PRs, tickets, notes, or just a topic. The research step starts from it.
- **Theme and language**: default to the theme that fits the audience (see Themes), and English unless the user writes or asks otherwise.

### 2. Research and write the fact sheet

Before outlining, collect what the deck will say and where each piece comes from, in
`research.md` in the deck folder. **Read `references/research.md` for the procedure and the file format.**
In short:

- Start from what the user gave you, then check the obvious places for the topic: the repo itself
  (code, `.github/workflows`, configs, README), team docs (e.g. pricesmart-docs), `personal-docs/`
  ticket and research folders, and Jira/Confluence or the web when those tools are available.
- Record each fact with its source (file path and line, link, command output, or "user said").
- For anything technical, the code and config win over docs. When sources disagree, record the
  contradiction instead of picking a side silently.
- Stop when every slide the deck needs is backed by a fact. Match the depth to the deck: a 10-minute
  update needs a handful of verified facts, an architecture deep dive needs the real system.

If a `research.md` already exists for this deck (or the user hands you one), reuse it and only fill
the gaps. If the user says to skip research and just use what they gave, do that, and still record
the facts you use. Every claim, number and name in the deck comes from this file. Anything that
isn't in it either gets researched, gets marked `.todo`, or gets cut.

### 3. Propose the storyline before building

Show the outline as a numbered list: for each slide, the **title written as a claim**, the layout, and
one line on what it shows. Put the fact sheet's contradictions and open questions right after it, so the
user can settle them in the same reply. Wait for the user's OK or edits. A changed outline costs seconds; a rebuilt
deck costs minutes. Skip this step only if the user explicitly asks you to just build it.

A storyline that works for most team presentations:

1. **Title**: what this is and why it matters, in one line.
2. **Context or problem**: where we are and why we're talking about it.
3. **The core**: 1 to 3 sections, each opened by a `section` slide when the talk is over ~10 minutes.
4. **What it means**: impact, trade-offs, risks.
5. **The ask**: decisions needed, owners, next steps. End on it, then Q&A.

For a non-technical audience, lead with outcomes and impact, and keep mechanisms to one simple diagram.
For engineers, show the real thing: actual code, commands, diagrams of the actual system. Keep each one
focused on the point the slide is making.

### 4. Write the slides file

Create `<slug>.slides.html` in the deck folder (see "Where files go"). It starts with a header comment,
then `<section class="slide">` elements. **Read `assets/gallery.slides.html` before writing.** It has
one working example of every layout, with comments on when to use each. Copy its markup patterns, not
its content: it's sample text.

```html
<!-- deck
title: Shipping the Visit API
theme: midnight           # midnight | paper | pricesmart | keynote
logo: pricesmart          # pricesmart | none | path/to/logo.png (plus logo-dark: path for dark surfaces)
lang: en
duration: 20              # minutes; drives the pace bar in presenter view
-->
<section class="slide" data-layout="bullets">
  <header class="slide-head"><p class="kicker">Why it matters</p><h2>Claim-style title</h2></header>
  <div class="slide-body">…</div>
  <aside class="notes"><p>What to say on this slide.</p></aside>
</section>
```

### 5. Build, check, look, fix

```bash
python3 <skill>/scripts/build_deck.py <deck-folder>/<slug>.slides.html     # writes <slug>.html
python3 <skill>/scripts/check_deck.py <deck-folder>/<slug>.html            # report + screenshots
```

`check_deck.py` renders every slide in headless Chrome with every reveal step shown, and reports text
that overflows or collides with the footer, code cut off on the right, broken images, Mermaid errors,
`.todo` markers, overly dense slides and missing speaker notes. It saves a PNG per slide in
`.check/` next to the deck.

**Fix every reported issue, then open the screenshots and look at them.** The report catches geometry,
not ugliness: a lonely bullet in a huge empty slide, a diagram too small to read, two slides in a row
with the same layout, a weak visual hierarchy. Fix by cutting words, splitting a slide in two, or
picking a better layout, not by shrinking the font. Use `--slides 3,7-9` to recheck only what you
changed. Repeat until the report is clean and the screenshots look like something you'd present.

### 6. Deliver

Open the deck for the user (`open <slug>.html` on macOS) and tell them:
- the file path, and that the `.slides.html` is the editable source (rebuild after editing it);
- how to present: `F` full screen, `S` presenter view (allow pop-ups), `O` overview, `?` all shortcuts;
- anything marked `.todo` that they still need to confirm, and that `research.md` lists every source (handy for Q&A);
- `--pdf` on `check_deck.py` writes a PDF to share afterwards.

## Writing slides that work

- **One idea per slide, and the title states it.** "CI runs on every PR, but deploys are gated" beats
  "CI/CD status". Someone who reads only the titles should get the whole story.
- **Few words on the slide, the detail in the notes.** Aim for under ~40 words of body text; the check flags
  slides over 90. If the presenter needs to say it, put it in `<aside class="notes">`, written as what
  they'd actually say: short paragraphs, key numbers, a transition to the next slide.
- **3 to 5 items per list or grid.** Six or more means two slides or a table.
- **Show, don't list.** Before writing bullets, check whether a diagram, metric tile, timeline, comparison or
  code snippet makes the point better. Vary layouts so consecutive slides don't look the same.
- **Reveal in steps when order matters.** Add `class="step"` to items that should appear one per click
  (bullets, cards, metrics, a highlighted callout). Don't put steps on every slide; it slows the talk down.
- **Never invent facts, numbers, names or dates.** Take them from `research.md`. If something is needed
  but unknown, write your best placeholder wrapped in `<span class="todo">…</span>`. It renders with a
  dashed outline and the check lists it, so it can't slip into the real presentation.
- Plain, direct language. No filler slides ("Thank you!" alone, "Questions?" alone): put the ask on the
  closing slide and take questions there.

## Themes

| Theme | Feel | Use for |
|---|---|---|
| `midnight` | Dark navy, teal/indigo glow, Inter | Engineering talks, architecture, demos. The default for technical decks. |
| `paper` | Warm light, serif headings (Fraunces) | Mixed or non-technical audiences, planning, retros, written-feeling decks. |
| `pricesmart` | PriceSmart navy `#23376d` + red `#dc3d22`, Fira Sans, navy hero slides | Company-facing or cross-team decks, anything shown outside engineering. |
| `keynote` | Black, bold Space Grotesk, orange/yellow | Kickoffs, vision, launches. Big statements, few words. |

`logo: pricesmart` puts the PriceSmart logo on the title slide and in every footer. The engine picks the
right variant for light or dark surfaces. During a run-through, `T` cycles themes live so the user can
compare (preview only; the header sets the real one). To add a theme: add a `[data-theme="name"]` block
to `assets/engine.html` (copy an existing one, it lists every variable) and add the name to `THEMES` in
both the engine script and `scripts/build_deck.py`.

## Layouts

All are in `assets/gallery.slides.html`. Set `data-layout` on the section:

| Layout | Use for |
|---|---|
| `title` | Cover. `.hero-logo` stays empty; the engine fills it. |
| `agenda` | Talks over ~15 minutes. Reuse it between sections with `li.is-current`. |
| `section` | Divider between parts, with a big number. |
| `statement` | The one sentence they must remember. Use once or twice per deck. |
| `bullets` | 3 to 5 points with optional `.sub` lines; `.points.check`/`.cross` for pros/cons. |
| `split` | Text plus a visual (code, diagram, image, metric). `.wide-left` / `.wide-right`. |
| `cards` | 2 to 4 parallel ideas (`.grid-2/3/4`, `.card.accent-top`, an emoji `.icon`). |
| `diagram` | Mermaid or Archify, full body area. |
| `metrics` | 2 to 4 big numbers with deltas; set `style="--cols:N"`. Audiences like these: look for real numbers to show (e.g. run history from the GitHub API, usage, timings), and state the sample and date. |
| `chart` | Horizontal bars; `--v` is the bar length in percent. Compute it from the real data (largest = 100). |
| `timeline` | Roadmaps and history: `li.done`, `li.now`, plain `li` for upcoming. |
| `compare` | Before/after, option A vs B; `.side.after` gets the accent. |
| `code` / `terminal` | Real code or commands (see below). |
| `table` | Up to ~6 rows; `tr.hl` highlights; `.pill.ok/.warn/.bad/.info` for status. |
| `quote` | A breather between sections. Only a real quote, checked word for word at a primary source, recorded in `research.md`. |
| `closing` | The ask and next steps. |

`.hero` on any section gives it the hero (title-slide) surface. `.bleed` gives a slide thin padding
and no footer, for interactive diagrams that need the room. `data-foot="off"` hides the footer.

## Content blocks

**Code.** `<figure class="code" data-lines="3,5-6"><figcaption>path/file.ts</figcaption><pre><code class="language-ts">…</code></pre></figure>`.
Keep to ~12 lines and ~60 characters per line, cut down to the lines that make the point (use `// …`
for elided parts), and HTML-escape `<`, `>` and `&`. `data-lines` highlights lines. Use `.code.small`
for up to ~16 lines. Highlighting is done by highlight.js from a CDN.

**Terminal.** `<figure class="terminal">` with `<span class="prompt">$</span>` before commands and
`.out` / `.ok` / `.err` spans for output. Use real commands from the source material.

**Mermaid.** `<div class="mermaid">flowchart LR …</div>` inside `<div class="diagram">`. Themed
automatically. Keep it to ~8 to 10 nodes, prefer `flowchart LR/TD` and `sequenceDiagram`, avoid
`stateDiagram-v2` (model states as a flowchart), keep edge labels short and plain (no parentheses,
slashes or `+`). A diagram too dense to read from the back of a room is two diagrams.

**Archify.** For a polished, interactive architecture, sequence, data-flow or ERD diagram, generate it
with the `archify` skill and embed it. **Read `references/archify.md` first.**

**Images.** `<img class="figure-img" data-inline="images/screenshot.png" alt="…">`. The build inlines
the file so the deck stays one file. `skill:` paths point inside this skill's `assets/`.

## Where files go

One folder per deck, holding `research.md` (fact sheet), `<slug>.slides.html` (source), `<slug>.html`
(the deck), plus `diagrams/`, `images/` and `data/` (raw data and the scripts behind any metric or
chart) if used:

- Inside a repo that has a `personal-docs/` folder: `personal-docs/presentations/<slug>/`.
- Otherwise: `~/Documents/presentations/<YYYY-MM-DD>-<slug>/`.
- If the user names a location, use it.

Keep `.check/` screenshots out of anything that gets shared or committed.

## Editing an existing deck

Edit the `.slides.html` and rebuild; never hand-edit the built `.html` (the next build overwrites it).
If only a built deck exists, everything between `<main class="deck" …>` and `</main>` is the slides
markup: copy it into a new `.slides.html` with a header, then continue as normal.

## Presenter controls (the engine)

`→ Space PgDn` next step or slide · `← PgUp` back · `Home/End` · digits + `Enter` jump ·
`O` overview · `S` presenter view (current slide, next slide, notes, timer, pace bar vs `duration`) ·
`F` full screen · `B` black screen · `T` theme preview · `Shift+P` print · `?` help.
In the presenter view, `+` / `−` resize the notes text (remembered between sessions); long notes
scroll. Notes are what the presenter reads live, so when the user asks you to explain a concept
during prep, offer to add a concise version to the notes of the slide where it comes up.
The presenter window and the audience window stay in sync both ways. Most wireless clickers send
PgUp/PgDn or arrow keys, so they work.
