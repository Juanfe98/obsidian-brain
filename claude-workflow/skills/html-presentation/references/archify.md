# Archify diagrams in a deck

Archify (the `archify` skill) produces checked, standalone, interactive HTML diagrams: architecture,
workflow, sequence, data-flow, lifecycle, ERD, class, tree, timeline and waterfall. They look far
better than Mermaid for real systems, and the viewer can zoom, focus a node and trace routes, which is
great during Q&A. The deck embeds them so it stays a single file.

## When to use Archify vs Mermaid

- **Mermaid**: small flows (up to ~8 to 10 nodes), quick sequences, anything that should match the deck
  theme exactly and print cleanly. Default choice.
- **Archify**: the real system architecture, a multi-actor sequence, a schema, or any diagram the team
  will want to explore or ask questions about. Use at most 1 to 3 per deck; they're the centerpiece slides.

## Steps

1. **Make the diagram presentation-friendly before you generate it.** A slide is read from across a room:
   - Show only what the slide's title claims. Cut the rest, or split it into two diagrams.
   - Aim for at most ~12 nodes for architecture or flow, and ~6 participants for sequence.
   - Prefer a wide (landscape) layout: the slide area is about 1680×780 at 16:9.
   - Short labels: names, not sentences.
2. **Generate it with the `archify` skill**, following that skill's own instructions, with the output
   in the deck folder: `<deck-folder>/diagrams/<name>.html`. Let its `finalize` gates pass.
3. **Embed it** in a `diagram` slide:

   ```html
   <section class="slide" data-layout="diagram">
     <header class="slide-head"><p class="kicker">Architecture</p><h2>Claim-style title</h2></header>
     <div class="slide-body">
       <div class="archify" data-archify-file="diagrams/catalog-topology.html" data-title="Catalog topology"></div>
     </div>
     <aside class="notes"><p>What to point at, in order.</p></aside>
   </section>
   ```

   **Fit it to the slide.** The Archify viewer scales a diagram to the frame's *width*, so a tall
   diagram overflows a wide frame and gets cut off. Match the frame to the diagram's shape and use
   `class="slide bleed"` (thin padding, no footer) to give it room:

   - **Wide diagrams** (architecture, data flow): `bleed` with the normal `.slide-head` above a
     full-width frame.
   - **Tall diagrams** (sequence, long workflows): `bleed`, no `.slide-head`, and a two-column split:
     the title and 3 to 4 short bullets on the left, the diagram on the right in a column about
     1040px wide, `style="height:100%"` on the `.archify` box:

   ```html
   <section class="slide bleed" data-layout="diagram">
     <div class="slide-body">
       <div class="split" style="grid-template-columns: 1fr 1040px; gap: 56px; align-items: stretch;">
         <div class="stack" style="justify-content: center;">
           <p class="kicker">One deploy run</p><h2>Claim-style title</h2>
           <ul class="points compact"><li>Step <span class="sub">one line</span></li></ul>
         </div>
         <div class="archify" style="height: 100%;" data-archify-file="diagrams/deploy-run.html"></div>
       </div>
     </div>
   </section>
   ```

   Always check the screenshot: the whole diagram, including its last message or node, must be
   visible without scrolling the frame.
4. **Build.** `build_deck.py` base64-embeds the file. Rebuild after regenerating the diagram, since the
   embed is refreshed on every build.
5. **Check.** `check_deck.py` flags an archify box that wasn't embedded. Look at the screenshot: if the
   diagram is too small to read, simplify it or give it the full slide.

## How it behaves while presenting

- The diagram loads when its slide is shown.
- A transparent shield keeps the arrow keys and clicker driving the slides. **Click the diagram** to
  interact with it (zoom, focus, trace). **Esc** returns control to the slides.
- A small **Full screen ↗** button (bottom-left of the frame) opens the diagram on its own in a new
  tab, for deep dives during Q&A. Archify's own controls (theme, export, zoom) stay uncovered.
- When printing or saving as PDF, the diagram prints as it currently looks in the frame.

## Known limits (to refine together)

- Archify has its own light/dark theme, saved in the browser. It doesn't follow the deck theme
  automatically yet. If it clashes, toggle Archify's theme inside the frame once before presenting.
- For a static, theme-exact image instead, export SVG or PNG from Archify's export menu into `images/`
  and use `<img class="figure-img" data-inline="images/name.svg">`. You lose interactivity, but it's
  pixel-stable in print.
