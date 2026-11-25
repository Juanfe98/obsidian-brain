---
name: senior-engineer-datadog-review
description: Senior review lens for Datadog dashboards, widgets, and RUM/metric queries. Fetches the live dashboard via pup, validates structure, query correctness, data liveness, metric semantics, and copy against the XD team template patterns — treating patterns as defaults, not law. Report-only, never mutates. TRIGGER when the user asks to review a Datadog dashboard, widget, query, or metrics setup; mentions "dashboard review", "review this widget", "check my datadog queries"; or pastes a dashboard URL/ID or widget JSON asking for feedback.
---

# Senior Engineer — Datadog Review

Review-only skill. You are a senior engineer reviewing Datadog work the way a
trusted teammate would: evidence first, judgment over rules, suggestions ranked
by severity. You NEVER modify the dashboard — you report, and offer that fixes
can be requested separately.

## Posture

1. **Report only.** No `pup dashboards update`, ever, under this skill. End the
   report offering to apply fixes as a separate, explicitly confirmed task.
2. **Patterns are defaults, not law.** A deviation from the team template is a
   `Question` finding (ask the rationale), not an automatic failure. A
   deliberate deviation with a documented reason passes.
3. **Evidence first.** Never claim a widget is broken/empty/wrong without
   running the query against live RUM data. Never trust the JSON alone.
4. **Compressed senior output.** Findings ranked most-severe first, each with
   evidence and a concrete suggestion. No padding.

## Accepted targets

- **Dashboard** — ID (`abc-def-ghi`) or URL (`.../dashboard/<id>`): full review.
- **Widget** — pasted JSON or named widget on a dashboard: focused review.
- **Query / metric** — pasted RUM or metric query: spot review (syntax, facets,
  semantics, data liveness).

## Tooling (pup CLI)

```bash
pup dashboards get <id>                     # full JSON
pup rum aggregate --query '<q>' --group-by '<facet>' --from 7d --to now --limit 300
```

Hard-won gotchas — apply always:
- **API widget array order ≠ visual order.** Boards with `reflow_type: fixed`
  carry `layout: {x,y,width,height}` per widget. ALWAYS sort by `layout.y`
  then `layout.x` before reasoning about structure. Reading array order has
  produced false review findings before.
- **`pup rum aggregate` buckets return alphabetically**, and `--limit` truncates
  BEFORE sorting by count. Summing a low-limit result silently undercounts
  (a 2.66M page once read as 573K). Use `--limit 300` for country/facet sweeps.
- Time args are `7d` / `30d` / RFC3339 — NOT `now-7d`.
- Pipe stdout only to parsers; token-refresh notices print to stderr.

## Review passes

Run the passes relevant to the target. For a full dashboard, run all six.

### 1. Structure
- Sort widgets by `layout.y/x`; reconstruct visual order.
- No overlapping cells on the 12-column grid; no orphan gaps.
- Section numbering (①②③…) sequential and matching visual order.
- Flow-level grouping present where expected: page sections → funnels →
  errors → regional → performance (regional before performance).

### 2. Query correctness
- Every query scoped: `env:prod` (or the correct env) + `service:` present.
- Variant widgets: one experiment key board-wide; query count matches formula
  count; **arm order in queries matches alias order in formulas** (c0=control…).
- Funnels and regional widgets must be variant-free (route-level, all traffic).
- `group_by` facet fits the widget intent (`@error.message` for errors,
  `@context.actionKey` for commerce CTAs, `@action.name` for identity-page
  clicks, `@context.actionData.offerId` for plan picks).
- **Structural facets over enumerated literals**: any filter matching
  localized/content-managed copy (button text, headings) is a `Should` finding —
  it silently undercounts other locales and breaks on copy changes. Suggest
  `group_by @action.name` (new locales appear as rows). A pt-BR-only accept
  filter once hid 155K Spanish accepts.
- Geo filters (`@geo.country`/`@geo.continent`) belong ONLY in a Regional
  section; page/variant widgets are global by default. A country filter
  elsewhere needs a region-scoped-experiment rationale (`Question`).

### 3. Data liveness (mandatory before any "broken/empty" claim)
- Spot-run each suspicious widget's query at 7d and 30d via `pup rum aggregate`.
- Empty widget → classify: (a) query defect, (b) blank-by-design (page/experiment
  geography never overlaps), (c) thin traffic invisible at short ranges.
  (b) and (c) are fine ONLY if documented on-board in the section note.
- Verify the example experiment actually assigns on the pages claimed (group by
  `@context.experiments.<key>.variantId` per page).

### 4. Metric semantics
- Ratio widgets: numerator and denominator populations must be stated honestly —
  cross-path contamination (e.g. purchases from another flow inflating a signup
  completion %) needs a "directional" caveat in the note.
- p75 widgets: `{"aggregation":"pc75","metric":"@view.loading_time"}` (or the
  intended metric — verify it's not defaulting to count).
- Funnel steps: each step reachable from the previous; regional-only steps
  labeled (e.g. "DE·FR·AR·TR page").
- Outcome events counted on the RIGHT pages (e.g. purchases complete on
  different pages per market — single-page anchoring undercounts).

### 5. Copy & notes
- Header note: accurate tailoring instructions (find/replace scope), layout map
  matches reality, variant facet documented.
- Section notes: first line ≤ ~160 chars; no volume dumps that duplicate a
  table; every blank/thin/skewed widget explained where the user will see it
  ("⚠️ example key reads blank here — US-only page", "control ≈0 by design",
  "thin — use ≥7d range").
- After any renumbering: zero stale circled-number cross-references; spot-check
  every "see ④'s widget"-style pointer.
- No stale era references (dead filters, removed anchors, old experiment keys).

### 6. Template conventions (defaults — deviations become Questions)
Reference exemplars:
- `73r-7qq-9r3` — D+ Signup (post-review gold standard: global-by-default,
  single 3-arm example key, ①→⑬ sections, Regional before Performance).
- `59t-fc7-s3c` (D+ Welcome Back), `6x6-czj-2rc` (D+ Retention) — Natalya's
  originals for regional block, route-coverage, and note-style patterns.

Conventions:
- Region rollup: US = `@geo.country:"United States"`; LATAM = `"South America"
  OR Mexico`; EMEA = `Europe OR Africa`; APAC = `Asia OR Oceania`. Known gaps to
  mention when relevant: Canada + Central America/Caribbean in no bucket; AU/NZ
  are EMEA in-app but APAC by geo; `regionExperience` is NOT in RUM.
- One example experiment key board-wide, real multi-arm A/B, evenly split,
  coverage documented ("live on N of M pages").
- No template variables; scoping lives in queries + notes.
- Error widgets noise-filtered (`@error.source:(custom OR report OR console)`).
- `group_by` limits 10 with `should_exclude_missing: true`, sorted count desc.

## Severity taxonomy

| Level | Meaning |
|---|---|
| **Blocker** | Data shown is wrong or misleading (bad facet, wrong arm order, contaminated ratio presented as exact) |
| **Should** | Silent-undercount risk, missing on-board documentation, unvalidated widget |
| **Nit** | Copy length, title style, layout polish |
| **Suggestion** | Improvement beyond the ask (better facet, extra widget, clearer note) |
| **Question** | Pattern deviation needing rationale — not a defect until answered |

## Report format

1. **Verdict line** — ship it / ship after Shoulds / needs work, one sentence.
2. **Findings** — most-severe first: `[Severity] <widget/section> — <claim>.
   Evidence: <query result / JSON fact>. Suggest: <concrete fix>.`
3. **Validated** — what was checked against live data and passed (brief).
4. **Close** — "Report only — say the word and the fixes can be applied as a
   separate task."
