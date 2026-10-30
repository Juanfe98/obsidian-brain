# Research: building the fact sheet

The fact sheet (`research.md` in the deck folder) is the only thing the slides are allowed to say.
It exists so that every claim on screen can be traced back to a source: by you while building, and
by the presenter when someone asks "where does that number come from?"

This procedure doesn't depend on the deck. It's written so it can become its own skill later; the
file format below is the handoff.

## Procedure

1. **Frame the questions.** From the brief's goal, write the 3 to 8 questions the deck has to answer
   (e.g. "Which apps deploy automatically today?", "What blocks the rest?", "Who decides?"). Research
   answers these questions. It doesn't catalog everything that exists on the topic.

2. **Start from what the user gave you.** Read all of it before searching further.

3. **Check the obvious places.** Look only at what fits the topic:
   - **The system itself**: code, `.github/workflows/`, Dockerfiles, IaC, configs, package manifests,
     README, and `git log` for recent history and dates. **Read config on every long-lived branch,
     not only the one you were pointed at**: `main`/the default branch can differ from `develop`/`stage`
     (a deploy workflow on `main` may target production while the `stage` copy doesn't). List the
     branches first (`gh api repos/<org>/<repo>/branches`) and compare.
   - **Team docs**: e.g. `~/Documents/priceSmart/repositories/pricesmart-docs` (`src/pages/projects/**`),
     ADRs, `specs/` folders.
   - **Personal notes**: `personal-docs/tickets/<ID>/` and `personal-docs/research/` in the relevant repos.
   - **Connected tools**: Jira, Confluence, GitHub (`gh`), and the web, when they're available in the
     session. If one would clearly help but isn't connected, say so in the open questions instead of guessing.
   - **Live state**, only read-only and only if the user expects it: e.g. `gh run list`, `az ... show`.
     Never run anything that changes state during research.
   - **Numbers worth showing**: audiences like real metrics (counts, success rates, durations, trends).
     Look for them on purpose, e.g. GitHub Actions run and job history (`gh api .../actions/workflows/<file>/runs`
     and `.../runs/<id>/jobs` for step timings), and compute them with a small script. Save the raw
     data and the script in the deck's `data/` folder so the numbers can be rechecked, and state the
     sample size and date on the slide. A small sample is fine if it's labeled.

   Practical gotchas when sweeping with CLIs:
   - **Paginate.** GitHub's REST API returns only 10 to 30 items per page by default (environment
     variables: 10). A short list may be the first page, not the whole set: pass `?per_page=100`
     (or `--paginate`) and check `total_count` before concluding something is missing.
   - **Run multi-command loops in `bash`, not zsh.** zsh doesn't split `$var` into words, so loops like
     `set -- $pair` silently get one argument. Write the loop to a script and run it with `bash`.
   - **Keep secrets out.** Read setting names, not values; to check whether a value is a Key Vault
     reference, print only the kind of value, never the value.

   For a broad topic that spans several repos, delegate the sweep to a search subagent and keep
   only its conclusions and source paths.

4. **Verify.** For anything technical, the code and config are the truth and docs are claims about it.
   Quotes are verified word for word at a primary source (the author's own page or the book), not a
   quote site.
   Prefer the newest source when two describe the same thing at different times. When sources
   disagree, record both under Contradictions. Don't pick a side silently: the disagreement is often
   worth a slide.

5. **Stop when the questions are answered.** Every question has an answer with a source, or is listed
   as open. A 10-minute status update usually needs 8 to 15 facts. A deep dive needs more, but the
   slide count still caps what's worth collecting.

## File format

```markdown
# Research: <deck title>

Goal: <what the audience should know, decide or do>
Audience: <who> · Researched: <YYYY-MM-DD>

## Questions
1. <question> → answered (F1, F3) | open (Q2)

## Facts
| ID | Fact | Source | Confidence |
|----|------|--------|------------|
| F1 | catalog-api deploy job is skipped unless `vars.AZURE_CLIENT_ID` is set | `catalog-api/.github/workflows/ci.yml:41` | verified in code |
| F2 | Visit API deploys DEV on push to `node/develop` | pricesmart-docs `b2b-visit-api/cicd.astro` | from docs, not checked in code |
| F3 | 3 of 4 apps have CI | user said | user |

## Contradictions
- C1: `azure-deployment.astro:169` says no pipeline exists; `ci.yml` (added <date>) shows one. Code wins → F1.

## Open questions
- Q1: Who owns creating the deploy identity? (ask the user / platform team)

## Sources
- <path or link>: <one line on what it contributed>
```

Rules for the facts table:
- **One fact per row**, in the form a slide could state it. Keep numbers and their units exact.
- **Sources must be specific enough to reopen**: path plus line or section, a URL, a command and the
  date it ran, or "user said".
- **Confidence** is one of: `verified in code`, `from docs, not checked in code`, `user`, `external`
  (web or third party), `inferred` (your reasoning from other facts: cite them, e.g. "inferred from F1+F4").
- No secrets, tokens, internal hostnames that shouldn't be shown, or personal data. If a fact involves
  one, describe it without the value.

## Using it in the deck

- Each slide should map to fact IDs. Put them in its speaker notes as a final line,
  e.g. `<p class="muted">Sources: F1, F4</p>`, so the presenter can answer "where's that from?"
- `inferred` and `from docs, not checked in code` facts are fine to present, but word them honestly
  ("the docs say…", "this suggests…").
- An open question the deck depends on becomes a `.todo` on the slide and goes into the outline
  review, so the user can answer it before the build.
