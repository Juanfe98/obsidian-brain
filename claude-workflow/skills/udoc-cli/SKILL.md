---
name: udoc-cli
version: 0.59.0
description: >
  Agent-friendly Universal Document CLI. Use when user mentions: document, doc, sheet, spreadsheet, slides, presentation, universal doc, udoc.
representative_queries: ["edit a google sheet or google doc","read a range from a spreadsheet","update the slides in a presentation"]
metadata:
  generated: true
  requires:
    bins: ["udoc"]
---

# Agent-friendly Universal Document CLI

## Quick Reference

```bash
# Documents
udoc --agent doc resolve "Q3 planning"  # title/URL/id/doc:// URI -> doc:// URI; ranked candidates + recommended (exit 2 when ambiguous)
udoc --agent doc read abc123
udoc --agent doc read doc://google/abc123  # doc:// URI (from a search hit or resolve) reads verbatim
udoc --agent doc read https://docs.google.com/document/d/abc123/edit  # pasted web URL works anywhere an id is required
udoc --agent doc read abc123 --format markdown --tab <tab-id>
udoc --agent doc read abc123 --suggestions inline  # pending suggestions marked {++inserted++} / {--deleted--}; accepted|original preview the doc with all of them accepted or rejected
udoc --agent doc outline abc123  # compact heading/table/range map (Google), feeds doc edit; table cells not expanded
udoc --agent doc metadata abc123
udoc --agent doc create --title "Meeting Notes"
udoc --agent doc update abc123 --body "New content"
udoc --agent doc update abc123 --body "More" --append
udoc --agent doc update abc123 --body $'# Plan\n|a|b|\n|-|-|\n|1|2|' --reimport  # whole-content replace via Drive markdown import, id/URL stable
udoc --agent doc export abc123 --format application/pdf
udoc --agent doc download abc123 --output ./file.json
udoc --agent doc copy abc123 --title "Copy of Doc"
udoc --agent doc delete abc123

# Granular editing (Google Docs, comment-safe)
udoc --agent doc create --title Plan --body $'# Goals\n- one\n- two' --format markdown
udoc --agent doc edit replace abc123 --find "draft" --with "final"
udoc --agent doc edit replace abc123 --find TODO --with DONE --all
udoc --agent doc edit style abc123 --find "Important" --bold --italic
udoc --agent doc edit style abc123 --find "docs" --link https://example.com
udoc --agent doc edit style abc123 --find "Project Plan" --style "Heading 1" --color "#1a73e8"
udoc --agent doc edit insert abc123 --markdown "## Summary" --at-end
udoc --agent doc edit insert abc123 --text " (revised)" --after "Title"
udoc --agent doc batch-update abc123 --requests '[{"updateTextStyle":{}}]'
udoc --agent doc batch-update abc123 --requests-stdin < requests.json  # same JSON piped in; --file requests.json reads it from disk

# Durable anchors + atomic multi-edit (Google Docs, #2251)
udoc --agent doc anchor create abc123 --name intro --find "Introduction"  # durable named range, survives index shifts
udoc --agent doc anchor list abc123                                          # names, ids, current bounds
udoc --agent doc edit replace abc123 --anchor-range intro --with "New intro"  # re-reads current bounds at edit time
udoc --agent doc edit apply abc123 --ops-json '[{"op":"replace","find":"draft","with":"final"},{"op":"style","anchor_range":"intro","bold":true}]'  # one atomic batchUpdate, all-or-nothing
udoc --agent doc anchor delete abc123 --name intro

# Search
udoc --agent search documents --name-contains "Q3 plan" --type doc  # typed filters translate per provider (Drive q / Graph KQL)
udoc --agent search documents --full-text revenue --owner me --modified-after 2026-01-01T00:00:00Z --order modified
udoc --agent search documents --type sheet --in-folder <folder-id>  # --owner <email>/--in-folder are Google-only
udoc --agent search documents --query "quarterly report" --limit 10  # raw --query escape hatch still works
udoc --agent search recent --limit 10
# every search/recent AND folder list hit carries a doc:// URI that `doc read` accepts verbatim (no snippet: Drive files.list returns none)

# Fetch every page in one call (--page-all)
udoc --agent search recent --page-all  # walks nextPageToken / @odata.nextLink to the end; metadata.has_more=false means the set is complete
udoc --agent search documents --type sheet --page-all  # applies to search documents/recent, folder list, comment list, revision list
udoc --agent folder list --id root --page-all --page-limit 4  # cap the pages; the response carries a resume next_action with the unconsumed --page-token
udoc --agent comment list abc123 --page-all  # --modified-after/--include-resolved filter the WHOLE walk, and ride along in the resume command
# --page-all keeps one JSON envelope regardless of size; add --format ndjson to stream rows one JSON object per line on stdout (envelope on stderr)
udoc --agent search recent --page-all --format json  # pin --format to keep one JSON envelope instead
udoc --agent search recent --page-all --format ndjson  # or force the row stream at any size

# Sheets
udoc --agent sheet describe <sheet-id>
udoc --agent sheet describe <sheet-id> --sheet "Budget"
udoc --agent sheet locate --id <sheet-id> --query "employee salaries"
udoc --agent sheet read-range --id <sheet-id> --range "Sheet1!A1:D10"
udoc --agent sheet read-range --id <sheet-id> --range "Sheet1!A1:D10" --value-mode both
udoc --agent sheet read-range --id <sheet-id> --range "Data!A1:Z500" --format csv
udoc --agent sheet read-range --id <sheet-id> --range "Data!A1:Z500" --no-compress
udoc --agent sheet read-range --id <sheet-id> --range "Data!A1:Z500" --value-render unformatted --number-formats
udoc --agent sheet read-range --id <sheet-id> --range "Data!A1:Z500" --value-render unformatted --date-time-render formatted-string
udoc --agent sheet write-range --id <sheet-id> --range "Sheet1!A1" --data '[["a","b"],["c","d"]]'
udoc --agent sheet write-range --id <sheet-id> --range "Sheet1!A1" --data '[["001"]]' --value-input raw
udoc --agent sheet append --id <sheet-id> --range "Sheet1" --data '[["new","row"]]'
udoc --agent sheet append --id <sheet-id> --range "Sheet1" --data '[["new","row"]]' --insert-data insert-rows
udoc --agent sheet clear --id <sheet-id> --range "Sheet1!A1:D10"
udoc --agent sheet list-sheets <sheet-id>
udoc --agent sheet manage --id <sheet-id> --operation add --sheet "New Sheet"
udoc --agent sheet batch-update --id <sheet-id> --requests '[{"autoResizeDimensions":{"dimensions":{"sheetId":0,"dimension":"COLUMNS"}}}]'  # raw Sheets batchUpdate passthrough
udoc --agent sheet batch-update --id <sheet-id> --requests-stdin < requests.json  # same JSON piped in; or --file requests.json

# Slides
udoc --agent slide list <presentation-id>
udoc --agent slide get <presentation-id>
udoc --agent slide outline <presentation-id>  # revisionId, layout, placeholder and element ids, kinds, geometry and UTF-16 text lengths in one small read
udoc --agent slide batch-update <presentation-id> --requests '{"requests":[{"deleteObject":{"objectId":"slide_2"}}],"writeControl":{"requiredRevisionId":"<revision-id>"}}' --dry-run  # any Slides request kind, guarded by the revision from slide outline
udoc --agent slide batch-update <presentation-id> --file requests.json --revision <revision-id> --dry-run
udoc --agent slide batch-update <presentation-id> --revision <revision-id> --requests-stdin < requests.json
udoc --agent slide add --id <presentation-id> --layout TITLE
udoc --agent slide add --id <presentation-id> --markdown $'# Roadmap\n\n- **Q3** ship\n  - beta' --revision <revision-id> --dry-run  # native title/body slides from an outline

# Folders
udoc --agent folder list --id root  # each child carries a doc:// URI that `doc read` accepts verbatim
udoc --agent folder create --name "New Folder" --parent <folder-id>

# Sharing & Comments
udoc --agent share get abc123
udoc --agent share set --id abc123 --email user@example.com --role writer
udoc --agent comment list abc123
udoc --agent comment list abc123 --modified-after 2026-06-01T00:00:00Z --include-resolved
udoc --agent comment changes abc123 --since 2026-06-01T00:00:00Z
udoc --agent comment add --id abc123 --content "Looks good"
udoc --agent comment add --id abc123 --content "Reword this" --quote "quoted text"  # records the quote; does not anchor or highlight it in the Docs editor
udoc --agent comment reply cmt123 --id abc123 --content "Fixed in rev 12"
udoc --agent comment resolve cmt123 --id abc123 --content "Done in rev 12"

# Revisions & Batch
udoc --agent revision list abc123
udoc --agent batch read --ids id1,id2,id3
udoc --agent batch get-metadata --ids id1,id2,id3

# Storage
udoc --agent storage quota

```

## Authentication

- Method: Google OAuth or Microsoft OAuth browser login (auto, based on --provider)
- Setup: udoc agent health  # triggers OAuth flow on first use; use --provider google|microsoft|local

## Drive Search Syntax

Applies to: --query flag on search commands

```
# Name contains
name contains 'report'

# By document type
mimeType = 'application/vnd.google-apps.document'

# Modified after date
modifiedTime > '2024-01-01'

# Full-text search
fullText contains 'quarterly'

```

## Workflows

### Document Review

```bash
udoc --agent search recent --limit 10
udoc --agent doc read <id>
udoc --agent comment list <id>
udoc --agent comment add --id <id> --content "Reviewed and approved"
```

### Spreadsheet Data Extraction

```bash
udoc --agent search documents --query "name contains 'tracker'" --limit 5
udoc --agent sheet describe <sheet-id>
udoc --agent sheet locate --id <sheet-id> --query "the table you want"
udoc --agent sheet read-range --id <sheet-id> --range "Sheet1!A1:Z50"
```

### Bulk Document Metadata

```bash
udoc --agent search documents --query "project plan" --limit 10
udoc --agent batch get-metadata --ids id1,id2,id3
```

### Create and Share Document

```bash
udoc --agent doc create --title "Sprint Retro Notes"
udoc --agent share set --id <new-doc-id> --email team@example.com --role writer
udoc --agent comment add --id <new-doc-id> --content "Please add your notes here"
```

### Durable anchored editing (#2251)

```bash
udoc --agent doc outline <id>                                             # find spans to anchor
udoc --agent doc anchor create <id> --name summary --find "Summary"       # durable named range
udoc --agent doc outline <id>                                             # revision_id after the anchor write; every write moves it
udoc --agent doc edit apply <id> --revision <revision-id> --ops-json '[{"op":"replace","anchor_range":"summary","with":"Executive Summary"},{"op":"style","anchor_range":"summary","bold":true}]'  # atomic multi-edit, refused if the doc moved past that revision
udoc --agent doc anchor list <id>                                         # confirm anchors tracked the new bounds
```

### Refresh a metrics deck from a Sheet

```bash
udoc --agent sheet read-range --id <sheet-id> --range "Metrics!A1:D20"  # the new numbers
udoc --agent slide list <deck-id>  # page order; render takes the 1-based page
udoc --agent slide outline <deck-id>  # revisionId plus the page and object ids to scope edits
udoc --agent slide batch-update <deck-id> --file refresh.json --dry-run  # replaceAllText scoped by pageObjectIds, refreshSheetsChart, writeControl.requiredRevisionId
udoc --agent slide batch-update <deck-id> --file refresh.json  # same file without the preview
udoc --agent slide render <deck-id> --page 2  # look at each changed slide
```

### Edit a slide and look at it

```bash
udoc --agent slide outline <deck-id>  # revisionId, and which page holds the text
udoc --agent slide edit <deck-id> --find "Q2" --with "Q3" --match-case --revision <revision-id>  # replaces every case-sensitive match in the deck; without --match-case, q2 matches too. A stale revision is refused
udoc --agent slide render <deck-id> --page 3  # check the result by eye
```

### Markdown spec to a new Doc

```bash
# --body is one argv element: Linux caps it at 128 KiB, Windows a whole command line at 32,767 characters. A re-run makes a second Doc, so after an unclear failure look for it with search documents --name-contains first
body=$(cat spec.md) && test -n "$body" && udoc --agent doc create --title "Launch Spec" --format markdown --body "$body"  # Google only. A missing, unreadable or empty spec.md stops before udoc, so no empty Doc is made. The Docs API has no request that inserts a table of contents: add one in the Docs UI
udoc --agent doc read <new-doc-id> --format markdown  # read back to check headings and tables survived the import
```

### Sheet dashboard

```bash
udoc --agent sheet describe <sheet-id>  # sheetId and dimensions for the ranges
udoc --agent --dry-run sheet batch-update --id <sheet-id> --file dashboard.json  # addChart, addConditionalFormatRule and setBasicFilter in one batch
udoc --agent sheet batch-update --id <sheet-id> --file dashboard.json  # all or nothing, but unguarded: Sheets has no writeControl, and addChart and addConditionalFormatRule add again on a re-run
# After a timeout or error, check the sheet for the charts and rules before re-running; udoc cannot read charts or conditional formats yet (#8989), so look in the Sheets UI
udoc --agent sheet read-range --id <sheet-id> --range "Summary!A1:D20"  # the data the charts plot; this read cannot show the charts themselves
```

## Tips

- Don't hand-write Drive query syntax: use typed `search documents` filters (--name-contains, --full-text, --type, --modified-after/before, --owner, --in-folder, --order) — they translate per provider. Keep --query only as an escape hatch.
- On Google, search documents/recent, folder list and doc resolve include shared-drive items and leave out trashed files. To reach the trash, give `search documents --query` a query written wholly in Drive syntax that names `trashed`, such as `trashed = true`, `starred = true and trashed = true` or `name contains 'plan' and trashed = true`. Drive syntax here means the terms of Drive's `files.list` search reference and the `labels/<labelId>.<fieldId>` fields of its Labels search guide, field names spelled exactly, joined by `and`/`or`, negated with `not` or grouped in parentheses. A query that is not wholly Drive syntax, such as `budget and trashed = true` or `budget and name contains 'plan' and trashed = true`, is searched as full text and still leaves out the trash.
- From a human reference (title/URL) to a read in <=2 calls: `doc resolve "<title|url>"` returns a doc:// URI (or ranked candidates when ambiguous), then `doc read <uri>`. Every search hit already carries a doc:// URI, so pipe it straight into `doc read`.
- A doc:// URI, a Google Docs/Drive web URL, and a bare id are interchangeable everywhere an id is required (read/update/edit/export/download, sheet/slide). A doc:// URI can also target a DIFFERENT provider than --provider (read/outline route cross-provider). The exceptions are comment, revision, share and batch, and folder on Google or Microsoft: they take only a bare id (the <id> in doc://google/<id>) and refuse URLs and doc:// URIs.
- Always use --agent for structured JSON output
- Use --limit to control response size (default 25)
- Use --fields to select only needed fields for token efficiency
- Use specific ranges for sheet reads — never read entire spreadsheets
- Use batch operations (batch read, batch get-metadata) for multiple documents
- A batch too large for one 4 MiB response answers PARTIAL_FAILURE, and read, get-metadata and delete all describe it with the same counts in `details`: `succeeded` and `failed` for the ids the report carries, plus either `refused` and `unread` (read and get-metadata, which drop ids the full envelope has no room for) or `unreported_succeeded` and `unreported_failed` (delete, which still applies every id and drops only the report of it). The counts always sum to the ids you passed and the message names the non-zero ones, so re-request the difference in a smaller batch.
- Use page tokens for navigating large result sets — or `--page-all` (optionally `--page-limit N`) to walk every page in ONE call on search documents/recent, folder list, comment list, and revision list. Treat the result as complete only when metadata.has_more is false; when it is true, re-run the response's next_action (it carries the unconsumed --page-token).
- A `--page-all` result is one `Response<T>` envelope on stdout no matter how large, so `has_more`/`next_action` always arrive on the contract stream - treat a walk as partial until `has_more` is false. Pass `--format ndjson` to stream rows instead (one JSON object PER LINE on stdout, envelope on stderr).
- Start with sheet describe to learn dimensions, sheet list, and per-column types cheaply (2 small reads) before pulling ranges; use sheet locate to find a table when you don't know its range
- read-range returns display strings ("$1,234.50", "10/29/26") by default. For analysis pass `--value-render unformatted` (with `--number-formats` to keep the format strings): numbers and booleans arrive as JSON numbers and booleans, and dates as serial numbers unless `--date-time-render formatted-string` is also passed. `--date-time-render` requires `--value-render unformatted`, and `--value-render unformatted` cannot be used with `--value-mode formulas`; both are usage errors. With `--value-mode both` the formulas are still fetched as FORMULA
- write-range and append default to `--value-input user-entered`, which turns "001", "=not a formula" or "3/4" into a number, formula or date. Pass `--value-input raw` to store literal codes as typed. `append` overwrites cells below the table by default; pass `--insert-data insert-rows` to shift a block below down (`--insert-data overwrite` states Google's default). `--value-render unformatted`, `--date-time-render`, `--value-input raw` and `--insert-data` are Google only (refused with --provider microsoft; a Microsoft append adds table rows, so `--insert-data` of either value is refused)
- `doc read` and `batch read` of a Google Sheet return the CSV export of the FIRST sheet only. When the payload has partial=true (more than one sheet, or the sheet count is unknown) do not treat it as the whole workbook: follow its hint, which names `sheet list-sheets <id>` and `sheet read-range`. When Drive is redirected (--server or a configured base URL) the hint names no sheet command, because those commands call Google directly and would bypass that route; report the read as the first sheet only instead. A one-sheet workbook carries sheet_count=1 and no partial
- read-range auto-compresses ranges over 200 rows; data.dimensions counts the RETURNED range (run `sheet describe` for the whole sheet's size) and metadata.has_more + a next-block next_action say whether more rows follow — treat a read as partial until has_more is false. The next_action repeats the read's own flags, so run it as given
- Run `udoc agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`udoc --agent doc read --help`); a bare `udoc --agent --help` returns the whole schema
- Reach for a raw `batch-update` passthrough (doc, sheet) only when no typed verb covers the edit: the typed ones translate per provider, shape the output, and validate ids. `slide batch-update` is a revision-guarded passthrough of every Google Slides request kind: pass the revision from `slide outline` with --revision or writeControl.requiredRevisionId (never both); udoc never fetches it. Preview any raw write with --dry-run first.
- Every `batch-update` (doc, sheet, slide) takes its JSON body from exactly one of `--requests '<json>'`, `--file <path>` or `--requests-stdin` (pipe it: `< requests.json`). A file or stdin body may be up to 4 MiB; prefer one of them over `--requests` for a large batch, which otherwise hits the OS argument-length limit. Through aix-mcp, pass the body as `requests` and the server pipes it over stdin for you.
- Before a Google Slides edit, run `slide outline <deck>` (add `--slide <pageObjectId>` for one slide) and take the revisionId, layout and placeholder ids, element objectIds and speaker-notes shape id from it; its textLengthUtf16 is the UTF-16 length that insertText offsets use. Use `slide get` only for styles or full text, or for an element the outline marks `not_described` (nested below 3 group levels, so only its objectId was read).
- Build Google Slides from an outline with `slide add --id <deck> --markdown <outline> --revision <revision-id>`: Write-graded batchUpdates (one for the slides, a second insertText batch for speaker notes), so it needs no destructive grant. Read the revision with `slide outline`, preview with --dry-run, then check each new slide with `slide render`. Each # or ## heading, or a --- line after a blank line, starts a slide on TITLE_AND_BODY (or --layout / --layout-id); a --- directly under text makes that text a title. Paragraphs, ### headings (bold) and nested lists (one bullet style per top-level list) fill the body; bold, italic, `code` and absolute http, https, mailto and tel links are styled. Tables, images and HTML are skipped with a warning. Plain body paragraphs take the placeholder's own list style, which depends on the theme. Numbered lists always count from 1; a list that starts at another number gets a warning. A layout name found on several masters means the one on the master at the insertion point, as for a plain `slide add --layout`. A slide's last paragraph that starts with an unstyled `Note:` becomes its speaker notes (plain text, inline styles dropped with a warning) and leaves the body, with a warning naming the slide. Only a top-level paragraph that is last on the slide and has text after `Note:` counts: a list item, quote, styled (`**Note:**`) or empty `Note:`, lowercase `note:`, or one followed by a skipped table, image or HTML block stays in the body. Notes take a second write after the slides exist: udoc reads each new slide's notes shape, then sends insertText guarded by the revision the first write returned. A failure after the slides were written is a PARTIAL_FAILURE listing the slide ids and each unwritten note, with a `slide edit --insert` recovery line when its notes shape id is known (each line is a write: read a fresh revision with `slide outline` before each); never run the command again with a new revision, which would create every slide again. A 5xx, a timeout or a stale-revision refusal on either write may have landed: check the slides with `slide list` and each slide's notesPreview with `slide outline` before recovering. --dry-run also previews the notes read and the notes batch, with placeholders for the ids the server assigns
- Prefer `doc edit` (replace/style/insert) over `doc update --body` to change part of a doc: edits are anchored and touch only the matched span, preserving collaborator content and comments
- `doc edit replace` without --all requires a UNIQUE anchor; on an ambiguous match the error lists candidate snippets so you can refine --find
- `doc read` (text or json, and any `--tab` read) shows smart chips as labels: a person as `@Name <email>`, a rich link as `title (uri)` (only one of them when they match or one is missing), a date or dropdown as its displayed text, a footnote reference as `[^N]`, an image as `[image: title]`, an equation as `[equation]`; `--tab` markdown and HTML show the person and rich link as links. Header text comes first under a `[header]` line, and a blank line ends it; footer and footnote text follow the body under `[footer]` and `[^N]:` lines (HTML wraps them in `<header>`, `<footer>` and `<aside>`). Whole-doc `--format markdown|html` without `--tab` is Drive's export and renders these its own way. Chip labels and these segment headings are rendering only: `doc edit --find` matches only the body's own text runs, so never use them, or any header, footer or footnote text, as --find text; anchor on the body text beside them. `doc read` output is a rendering: never write it back as a body (`doc update --body`, `--append`, `doc edit insert`, `replace --with`), or the labels become literal text
- `doc read` of a Google Doc marks pending suggestions: a suggested insertion reads `{++text++}` and a suggested deletion `{--text--}` in text, json and `--tab` markdown (`<ins>`/`<del>` in `--tab` HTML); a run that carries both reads as a deletion. `--suggestions inline|accepted|original` picks the view (inline marks them, accepted and original preview the doc with every suggestion accepted or rejected, so no marks); omit it for Google's default view. It needs a Google Doc with `--format text|json`, or `--tab` for markdown|html, and other providers refuse it. The marks are rendering only, like chip labels: `doc edit --find` matches the document's own text, so never put `{++`, `{--` or the marks' closing halves in --find or write them back as body text
- Every real write returns metadata.next_action, the read that shows its effect: `doc read --format markdown` after a Google Docs content write (`doc edit`, `create`, `update`, `batch-update`), `doc metadata` after a copy, move, rename, delete, upload or folder create, and `comment get`, `share get`, `doc anchor list`, `sheet read-range`, `sheet describe`, `sheet list-sheets` or `slide list` for those verbs. Run it to confirm the write matched intent rather than trusting the write's own summary. A `--dry-run` preview carries no next_action, because nothing was written
- Google Docs writes are pinned to the revision udoc reads just before sending, which misses a collaborator's edit made since YOUR read. To catch it, pass `--revision <revision_id>` to `doc edit replace|style|insert|apply` and `doc batch-update`, taken from a `doc outline` read after your own last write: every write moves the revision, `doc anchor create` included. A stale revision is a USAGE_ERROR that names the re-read. If an earlier attempt of the write got no response (a timeout, or a proxy resend), it may have landed and moved the revision, even when the refusal says this run sent nothing: check `doc read` for the change before re-pinning to a fresh `doc outline`, or the write goes in twice. A whole-body `doc update --body` replace is refused when the doc has open comments unless --force
- For new docs with nested lists/images, use `doc create --format markdown` (Drive native import). In-place markdown edits (`doc update --format markdown`, `doc edit insert --markdown`) render text styles and turn a GFM table into a real Docs table, with four caveats the response warns about or you should expect: cell text is inserted PLAIN (inline bold/code and link URLs inside cells are dropped), a table inside a list or quote falls back to pipe text, so does one over 1000 cells, and the Docs API writes an empty paragraph immediately before every table it inserts
- To republish a whole markdown document into an EXISTING Google Doc at create-level fidelity (tables, inline data-URI images), use `doc update <id> --body <markdown> --reimport`: it replaces the whole content via Drive's native import, keeping the doc id and URL stable (open tabs and shared links keep working). Existing comments survive but their anchors are orphaned, so it obeys the same open-comments refusal as a plain whole-body replace (--force to override). Requires --body, implies --format markdown, incompatible with --append, no writeControl collision check
- Through aix-mcp, edits inside a document need only the write grant, deletes included: `doc update`, `doc edit`, `doc anchor delete`, `sheet clear`, `sheet manage`, `slide edit` and the three `batch-update` verbs. The file's version history in the Docs, Sheets or Slides editor undoes them (`udoc revision restore` refuses native Google files). Deleting a file (`doc delete`, `batch delete`) or a comment (`comment delete`) and removing sharing (`share unset`) need the destructive grant, because no history undoes them; the three `batch-update` verbs refuse `deleteComment`, `deleteCommentReply` and `updateCommentPost` for that reason, and `doc batch-update` also refuses `deleteSuggestion` and `rejectSuggestion` (for now a reviewer removes suggestions in the Docs editor). `sheet batch-update` also refuses `deleteProtectedRange` and `updateProtectedRange`: change range protection in the Sheets editor (`addProtectedRange` is still sent).
- An empty `--with` (or `"with":""` in `doc edit apply`) deletes the matched text in a doc; recover it from the file's version history in the Docs editor (`udoc revision restore` refuses native Google files). The `doc edit replace` tool in aix-mcp takes `"with":""` and deletes the same way; if an older aix-mcp refuses it as a missing argument, use the `doc edit apply` tool with `[{"op":"replace","find":"…","with":""}]`. `slide edit` still refuses an empty `--with`; use `slide batch-update` with `replaceAllText` and `replaceText: ""`.

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| read entire spreadsheet without a range | Massive payloads waste tokens — always specify A1 notation range |
| doc create --title then doc update --body to fill a new doc | put new content in one call: doc create --title T --body ... [--format markdown on Google only; Microsoft does not support it]. doc update is for docs that already exist (and needs the destructive grant through aix-mcp), or use doc upload to create a file with content. |
| search without --limit | Large result sets waste tokens and may timeout |
| write-range without reading first | May overwrite existing data — read the range first to confirm layout |
| doc update --body to make a small change | Replaces the WHOLE body, discarding collaborator edits and orphaning comments — use doc edit replace/insert/style |
| sheet batch-update for something a typed sheet verb already does | The passthrough skips output shaping and the Microsoft translation, and returns the raw Sheets reply — use it only for unmodeled requests |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `udoc doc read`

Read a document by ID

- `<id>`: Document ID (or a doc://<provider>/<id>[?tab=<t>] URI) **(required)**
- `--tab`: Return only this tab's content (Google Doc Tabs). Omit to merge all tabs
- `--format`: Output format: text (default), markdown, html, json
- `--suggestions`: Google Docs only: which pending suggestions the read shows. Omit for Google's default view. Markdown and html need --tab

### `udoc doc outline`

Compact structural outline of a document (Google Docs only): the heading tree, tables, named ranges, section breaks, and header/footer segments, WITHOUT the full body prose. Tables are listed with their dimensions only; structure inside table cells (nested headings/tables) is not expanded. Accepts a bare id or a doc:// URI, like read

- `<id>`: Document ID (or a doc://<provider>/<id>[?tab=<t>] URI) **(required)**
- `--tab`: Restrict the outline to a single tab (Google Doc Tabs)

### `udoc doc resolve`

Resolve a title, URL, id, or doc:// URI to a doc:// URI that `doc read` accepts. A doc:// URI / Google Docs-Drive URL / id short-circuits offline; a title is name-searched and returns ranked candidates + a recommendation (exit 2 with the candidates when ambiguous)

- `<query>`: A document title, web URL, bare id, or doc://<provider>/<id> URI **(required)**

### `udoc doc tabs list`

List tabs in a Google Doc (flattened, in document order)

- `<id>`: Document ID **(required)**

### `udoc doc create`

Create a new document

- `--title`: Document title. Microsoft: the file name, one name without leading or trailing spaces or any of " * : < > ? / \ | that does not end in '.', with no extension or one from a fixed plain-text list (txt, md, csv, json, ...); any other extension (Office, binary, or an unlisted text one such as ts or jsonl) is refused **(required)**
- `--body`: Initial body content. Google Docs: written via the Docs API, rendered per --format. Microsoft: the plain-text file content
- `--format`: How to interpret --body: text (literal, default) or markdown (rendered as real headings/bold/lists in Google Docs)

### `udoc doc update`

Update an existing document

- `<id>`: Document ID **(required)**
- `--title`: New title (Drive metadata). Microsoft: alone it is a plain rename; with --body it must pass the doc create --title file-name rule
- `--body`: New body content. Google: written via the Docs API (replaces content, or appends with --append). Microsoft: replaces the content of a plain-text file only; an Office, binary or folder item is refused
- `--append`: Append --body instead of replacing (Google Docs only)
- `--format`: How to interpret --body: text (literal, default) or markdown (rendered as real headings/bold/lists in Google Docs)
- `--reimport`: Replace the WHOLE content via Drive's native markdown import (Google Docs only): the same full-fidelity converter as `doc create --format markdown` (tables, inline data-URI images), applied to an EXISTING doc. The doc id and URL stay stable; existing comments survive but their anchors are orphaned. Requires --body, implies --format markdown, incompatible with --append
- `--force`: Allow a whole-body replace even when the doc has open comments (which would be orphaned). Granular `doc edit` is preferred

### `udoc doc edit replace`

Replace anchored text. Without --all the anchor must be unique

- `<id>`: Document ID **(required)**
- `--find`: Verbatim text to find (mutually exclusive with --anchor-range)
- `--anchor-range`: Resolve the span from a durable named range's CURRENT bounds instead of --find (created by `doc anchor create`). Survives index shifts
- `--with`: Replacement text; an empty string deletes the matched text **(required)**
- `--all`: Replace every occurrence (skip the uniqueness check; --find only)
- `--match-case`: Case-sensitive match
- `--tab`: Restrict to a specific tab id
- `--revision`: Refuse the edit unless the document is still at this revision, the `revision_id` of a `doc outline` read after your last write

### `udoc doc edit style`

Apply text and paragraph styling to a unique anchored span (font, size, color, named style, alignment)

- `<id>`: Document ID **(required)**
- `--find`: Verbatim text whose span gets styled (mutually exclusive with --anchor-range; must be unique)
- `--anchor-range`: Style the span of a durable named range's CURRENT bounds instead of --find (created by `doc anchor create`)
- `--bold`: Bold the span
- `--italic`: Italicize the span
- `--underline`: Underline the span
- `--strikethrough`: Strike through the span
- `--link`: Turn the span into a hyperlink (http/https/mailto/tel only)
- `--style`: Named paragraph style: "Title", "Subtitle", "Heading 1".."Heading 6", "Normal text"
- `--font`: Font family for the span (e.g. "Roboto", "Arial")
- `--size`: Font size in points (e.g. 14)
- `--color`: Text color as #rrggbb (e.g. #1a73e8)
- `--align`: Paragraph alignment: left | center | right | justify
- `--tab`: Restrict to a specific tab id
- `--match-case`: Case-sensitive anchor match (default: case-insensitive, like replace)
- `--revision`: Refuse the edit unless the document is still at this revision, the `revision_id` of a `doc outline` read after your last write

### `udoc doc edit insert`

Insert text or markdown at an anchor or document edge

- `<id>`: Document ID **(required)**
- `--text`: Literal text to insert
- `--markdown`: Markdown to render and insert (mutually exclusive with --text)
- `--after`: Insert immediately after this unique anchor
- `--before`: Insert immediately before this unique anchor
- `--anchor-range`: Insert immediately after a durable named range's CURRENT end bound
- `--at-start`: Insert at the start of the body
- `--at-end`: Insert at the end of the body
- `--tab`: Restrict to a specific tab id
- `--match-case`: Case-sensitive anchor match (default: case-insensitive, like replace)
- `--revision`: Refuse the edit unless the document is still at this revision, the `revision_id` of a `doc outline` read after your last write

### `udoc doc edit apply`

Apply MULTIPLE edits atomically in ONE batchUpdate (#2251). All ops resolve against a single fetched revision, sort back-to-front (highest index first), and submit together — all-or-nothing, collision-safe

- `<id>`: Document ID **(required)**
- `--ops-json`: JSON array of ops. Each: {"op":"replace","find"|"anchor_range":..,"with":..}, {"op":"style","find"|"anchor_range":..,"bold":true,..}, or {"op":"insert","text"|"markdown":..,"after"|"before"|"anchor_range"|"at_start"|"at_end":..} **(required)**
- `--revision`: Refuse the edit unless the document is still at this revision, the `revision_id` of a `doc outline` read after your last write

### `udoc doc anchor create`

Create a named range over a uniquely-resolved span (a durable anchor)

- `<id>`: Document ID **(required)**
- `--name`: Anchor name (referenced later by `doc edit --anchor-range <name>`) **(required)**
- `--find`: Verbatim text whose span the anchor covers (must be unique) **(required)**
- `--match-case`: Case-sensitive anchor match (default: case-insensitive, like replace)
- `--tab`: Restrict to a specific tab id

### `udoc doc anchor list`

List named ranges (names, ids, current bounds)

- `<id>`: Document ID **(required)**

### `udoc doc anchor delete`

Delete a named range by name (removes the anchor, not the text)

- `<id>`: Document ID **(required)**
- `--name`: Name of the anchor to delete **(required)**
- `--all`: Delete EVERY range sharing the name. Required when the name is duplicated: Google's deleteNamedRange keyed by name has no delete-one option, so it removes all matches at once

### `udoc doc batch-update`

Raw Docs API batchUpdate passthrough (escape hatch for unmodeled requests)

- `<id>`: Document ID **(required)**
- `--requests`: JSON: either a requests array `[ {...} ]` or `{ "requests": [...] }`
- `--file`: Read the same JSON as --requests from this file (at most 4 MiB)
- `--requests-stdin`: Read the same JSON as --requests from stdin (at most 4 MiB)
- `--revision`: Pin the write to this revision, the `revision_id` of a `doc outline` read after your last write. An object body may carry it as `writeControl.requiredRevisionId` instead, not both

### `udoc doc export`

Export a document to a different format

- `<id>`: Document ID **(required)**
- `--format`: Export MIME type (e.g. application/pdf, text/plain, text/html) **(required)**
- `--output`: Write the exported bytes here. Omit to return them in the envelope: text inline as `content`, anything else as base64 `content_base64`

### `udoc doc download`

Download a document

- `<id>`: Document ID **(required)**
- `--output`: Write the bytes here. Omit to return them in the envelope as base64 `content_base64`, the only route for a caller that shares no filesystem with this CLI

### `udoc doc copy`

Copy a document

- `<id>`: Source document ID **(required)**
- `--title`: New title

### `udoc doc move`

Move a document to a different folder

- `<id>`: Document ID **(required)**
- `--folder`: Target folder ID **(required)**

### `udoc doc rename`

Rename a document

- `<id>`: Document ID **(required)**
- `--name`: New name **(required)**

### `udoc doc delete`

Delete a document

- `<id>`: Document ID **(required)**

### `udoc doc metadata`

Get document metadata

- `<id>`: Document ID **(required)**

### `udoc doc diff`

Unified line diff of a Google Doc between a Drive revision and its current text (Google Docs only). Drive may merge or omit older Docs revisions, so the history is coarser than the editor's version history. A doc with more than one tab is refused, because the Drive exports it compares carry only the first tab; the tab count is not checked while Drive is redirected (--server or [gdrive] base_url)

- `<id>`: Google Doc id, web URL or doc://google/<id> URI **(required)**
- `--revision`: Drive revision id from `udoc revision list`, not the Docs API revisionId. Conflicts with --since; one of the two is required
- `--since`: Compare against the latest revision at or before this RFC 3339 time. Conflicts with --revision; one of the two is required

### `udoc doc upload`

Upload a file, from a local path or an inline base64 payload. Exactly one content source is required

- `--folder-id`: Target folder ID
- `--file-path`: Path to file to upload. Conflicts with the --content-base64 routes
- `--content-base64`: Base64-encoded file content, for a caller that shares no filesystem with this CLI. Through a tool call aix-mcp pipes this value to the stdin route, which holds 2 MiB decoded; on a command line it is one argv element, holds 64 KiB decoded (less on Windows, whose 32767-character command line a 64 KiB payload exceeds once encoded, #4874), and is visible in `ps` and shell history. Requires --name
- `--content-base64-stdin`: Read the base64 file content from stdin instead of --content-base64. At most 2 MiB decoded: the full inline budget, because no payload is passed as an argument. A tool call does not pass this switch itself: it fills --content-base64 and aix-mcp substitutes this route. Requires --name
- `--name`: Name for the uploaded file (defaults to the filename; required with an inline base64 payload, which carries no name)

### `udoc sheet batch-update`

Raw Sheets API batchUpdate passthrough (escape hatch for unmodeled requests)

- `--id`: Spreadsheet ID **(required)**
- `--requests`: JSON: either a requests array `[ {...} ]` or `{ "requests": [...] }`
- `--file`: Read the same JSON as --requests from this file (at most 4 MiB)
- `--requests-stdin`: Read the same JSON as --requests from stdin (at most 4 MiB)

### `udoc sheet read-range`

Read a range from a spreadsheet

- `--id`: Spreadsheet ID **(required)**
- `--range`: Range in A1 notation (e.g., Sheet1!A1:D10) **(required)**
- `--value-mode`: Cell payload: values (default), formulas, or both ({value, formula} per formula cell). formulas/both add a valueRenderOption=FORMULA fetch
- `--number-formats`: Also return each cell's number-format string (opt-in: adds a field-masked includeGridData fetch, which is token-heavy)
- `--compress`: Force structural compression on (collapse runs of >3 identical/empty rows into a marker). Default: auto-on above 200 returned rows
- `--no-compress`: Force structural compression off (overrides the >200-row auto-default)
- `--format`: Serialize cells as markdown | csv | json. Default: markdown when the range is rectangular and --value-render is not unformatted, json otherwise
- `--value-render`: How values are rendered: formatted (default, display strings such as "$1,234.50") or unformatted (numbers and booleans as JSON values; dates as serial numbers unless --date-time-render formatted-string). Applies to the values fetch only, so --value-mode both keeps formulas as FORMULA. unformatted is not valid with --value-mode formulas (a usage error) and is Google provider only
- `--date-time-render`: How dates and times are rendered: serial-number or formatted-string. Requires --value-render unformatted (a usage error otherwise). Google provider only

### `udoc sheet describe`

Schema-first summary of a spreadsheet: dimensions, sheet list, and per-column {name, inferred type, examples} for one sheet. Google provider only

- `<id>`: Spreadsheet ID **(required)**
- `--sheet`: Sheet to profile (defaults to the first sheet)

### `udoc sheet locate`

Find candidate table regions by fuzzy-matching a query against header rows and sheet titles. Heuristic (bounded per-sheet sample); Google only

- `--id`: Spreadsheet ID **(required)**
- `--query`: Natural-language description of the table to find **(required)**

### `udoc sheet write-range`

Write data to a spreadsheet range

- `--id`: Spreadsheet ID **(required)**
- `--range`: Range in A1 notation **(required)**
- `--data`: Data as JSON array of arrays **(required)**
- `--value-input`: How input is interpreted: user-entered (default; "001", "=SUM(A1)" and "3/4" become numbers, formulas or dates) or raw (stored as typed). raw is Google provider only

### `udoc sheet append`

Append rows to a spreadsheet

- `--id`: Spreadsheet ID **(required)**
- `--range`: Range (table/sheet to append to) **(required)**
- `--data`: Rows as JSON array of arrays **(required)**
- `--value-input`: How input is interpreted: user-entered (default) or raw (stored as typed). raw is Google provider only
- `--insert-data`: Whether new rows overwrite the cells below the table (overwrite, the Google default when omitted) or shift them down (insert-rows). Google provider only: a Microsoft append adds table rows, so either value is refused there

### `udoc sheet clear`

Clear a spreadsheet range

- `--id`: Spreadsheet ID **(required)**
- `--range`: Range in A1 notation **(required)**

### `udoc sheet list-sheets`

List sheets in a spreadsheet

- `<id>`: Spreadsheet ID **(required)**

### `udoc sheet manage`

Manage sheets (add, delete, rename)

- `--id`: Spreadsheet ID **(required)**
- `--operation`: Operation: add, delete, rename **(required)**
- `--sheet`: Sheet name or ID **(required)**
- `--name`: New name (for rename operation)

### `udoc slide batch-update`

Apply any Google Slides batchUpdate requests, guarded by a caller-supplied revision

- `<id>`: Presentation ID (a copied template for deck authoring) **(required)**
- `--requests`: JSON: a requests array, or {requests, writeControl?}
- `--file`: Read the same JSON as --requests from this file (at most 4 MiB)
- `--requests-stdin`: Read the same JSON as --requests from stdin (at most 4 MiB)
- `--revision`: Presentation revisionId from `slide outline` (or `slide get`); omit when the body has writeControl

### `udoc slide list`

List slides in a presentation

- `<id>`: Presentation ID **(required)**

### `udoc slide get`

Get full presentation data

- `<id>`: Presentation ID **(required)**

### `udoc slide outline`

One small read of what an edit needs: revisionId, masters, layouts and placeholders, and each slide's element ids, kinds, geometry and UTF-16 text lengths

- `<id>`: Presentation ID **(required)**
- `--slide`: Only this slide, by pageObjectId (repeatable); index and slideCount stay deck-wide

### `udoc slide add`

Add a slide to a presentation, or build slides from a markdown outline

- `--id`: Presentation ID **(required)**
- `--layout`: Predefined slide layout (e.g., BLANK, TITLE, TITLE_AND_BODY); BLANK by default, TITLE_AND_BODY with --markdown
- `--layout-id`: Layout objectId (`layouts[].objectId` in `slide outline`), instead of --layout
- `--index`: Insert at index (0-based, appends if omitted)
- `--markdown`: Markdown outline (at most 64 KiB): each # or ## heading, or a --- line after a blank line, starts a slide
- `--revision`: revisionId from a fresh `slide outline` (or `slide get`), guarding the --markdown slide batch (a notes batch uses the revision that batch returns)

### `udoc slide edit`

Replace anchored text, or insert text into one shape or table cell, under a revision guard

- `<id>`: Presentation ID **(required)**
- `--find`: Verbatim text to replace everywhere it appears
- `--with`: Replacement for --find
- `--insert`: Text to insert into --object-id
- `--object-id`: Object ID receiving --insert (from slide outline): a shape on its own, or a table when --row and --column name a cell
- `--row`: 0-based row of the cell in a table --object-id; pass with --column, or neither for a shape
- `--column`: 0-based column of the cell in a table --object-id; pass with --row, or neither for a shape
- `--at`: UTF-16 offset within the target shape or cell for --insert
- `--match-case`: Case-sensitive --find match (default: case-insensitive)
- `--revision`: revisionId from a fresh `slide outline` (or `slide get`); a stale value is refused by Google **(required)**

### `udoc slide render`

Render one slide to a PNG thumbnail for visual verification: inline base64 in contentBase64 on the CLI, an MCP image block through aix-mcp

- `<id>`: Presentation ID **(required)**
- `--page`: Slide to render, 1-based **(required)**
- `--size`: Thumbnail size. Through MCP the payload comes back as one viewable image block when it fits the inline cap, refused with a hint if not

### `udoc search documents`

Search for documents. Compose typed filters (translated per provider to a Drive `q` expression or a Microsoft Graph KQL query) and/or the raw `--query` escape hatch. Every hit carries a `doc://` URI that `doc read` accepts verbatim

- `--query`: Raw provider query. On Google, only a query written wholly in Drive `q` syntax passes through; any other query is searched as full text. On Microsoft it is matched as a literal phrase — KQL operators (`OR`, `filetype:`, …) do NOT apply; use the typed filters for those. Composes (AND) with the typed filters below
- `--name-contains`: Match documents whose NAME contains this substring
- `--full-text`: Full-text (body) search for this phrase
- `--type`: Restrict to a document type (mapped to the provider's MIME/filetype)
- `--modified-after`: Only documents modified at/after this RFC 3339 timestamp
- `--modified-before`: Only documents modified at/before this RFC 3339 timestamp
- `--owner`: Owner filter: `me` or an email address (Google only)
- `--in-folder`: Restrict to documents inside this folder id (Google only)
- `--order`: Result ordering
- `--page-token`: Page token for pagination

### `udoc search recent`

List recently modified documents

- `--page-token`: Page token for pagination

### `udoc folder list`

List contents of a folder. Every child carries a `doc://` URI that `doc read` accepts verbatim

- `--id`: Folder ID (use "root" for root folder)
- `--page-token`: Page token for pagination

### `udoc folder create`

Create a new folder

- `--name`: Folder name **(required)**
- `--parent`: Parent folder ID

### `udoc share get`

Get permissions for a document

- `<id>`: Document ID (a bare id, never a URL or doc:// URI) **(required)**

### `udoc share set`

Share a document with a user

- `--id`: Document ID **(required)**
- `--email`: Email address to share with **(required)**
- `--role`: Role: reader, commenter, writer, owner

### `udoc share unset`

Remove sharing for a user

- `--id`: Document ID **(required)**
- `--permission-id`: Permission ID to remove **(required)**

### `udoc share link`

Create a sharing link

- `--id`: Document ID **(required)**
- `--role`: Link role: reader, commenter, writer

### `udoc comment list`

List comments on a document

- `<id>`: Document ID (bare id; URLs and doc:// URIs are refused) **(required)**
- `--page-token`: Page token for pagination
- `--modified-after`: Only comments modified at/after this RFC 3339 time (Drive startModifiedTime)
- `--include-resolved`: Include resolved comments (hidden by default)

### `udoc comment changes`

Detect new/updated comments since a timestamp (incremental polling)

- `<id>`: Document ID (bare id; URLs and doc:// URIs are refused) **(required)**
- `--since`: RFC 3339 timestamp from the previous poll's `as_of`. Omit to treat all as new
- `--safety-window-seconds`: Subtract N seconds from now() for `as_of`, giving at-least-once delivery (dedupe by id). Clamped to [0, 86400]

### `udoc comment get`

Get a single comment

- `--id`: Document ID **(required)**
- `<comment_id>`: Comment ID (bare id; URLs and doc:// URIs are refused) **(required)**

### `udoc comment add`

Add a comment to a document

- `--id`: Document ID **(required)**
- `--content`: Comment content **(required)**
- `--quote`: Text the comment refers to (recorded as quoted content; does NOT anchor or highlight the comment in the Docs editor)

### `udoc comment reply`

Reply to a comment thread

- `--id`: Document ID **(required)**
- `<comment_id>`: Comment ID (bare id; URLs and doc:// URIs are refused) **(required)**
- `--content`: Reply text **(required)**

### `udoc comment delete`

Delete a comment

- `--id`: Document ID **(required)**
- `<comment_id>`: Comment ID (bare id; URLs and doc:// URIs are refused) **(required)**

### `udoc comment resolve`

Resolve a comment

- `--id`: Document ID **(required)**
- `<comment_id>`: Comment ID (bare id; URLs and doc:// URIs are refused) **(required)**
- `--content`: Message to post instead of "Resolved"

### `udoc comment reopen`

Reopen a resolved comment

- `--id`: Document ID **(required)**
- `<comment_id>`: Comment ID (bare id; URLs and doc:// URIs are refused) **(required)**
- `--content`: Message to post instead of "Reopened"

### `udoc revision list`

List revisions of a document

- `<id>`: Document ID (bare id only; no URL or doc:// URI) **(required)**
- `--page-token`: Page token for pagination

### `udoc revision get`

Get revision metadata

- `--id`: Document ID **(required)**
- `<revision_id>`: Revision ID (bare id only; no URL or doc:// URI) **(required)**

### `udoc revision restore`

Restore a document to a specific revision

- `--id`: Document ID **(required)**
- `--revision`: Revision ID **(required)**

### `udoc batch read`

Read multiple documents at once

- `--ids`: Document IDs (comma-separated)

### `udoc batch get-metadata`

Get metadata for multiple documents

- `--ids`: Document IDs (comma-separated)

### `udoc batch delete`

Delete multiple documents

- `--ids`: Document IDs (comma-separated)

### `udoc storage quota`

Get storage quota information

### `udoc health check`

Check API connectivity

### `udoc provider capabilities`

Show supported providers and their capabilities

### `udoc auth login`

Log in to Google via browser OAuth (covers Docs, Sheets, Slides, Drive)

### `udoc auth logout`

Revoke Google access and clear stored tokens

### `udoc auth status`

Show current Google authentication status

### `udoc auth setup`

Set up your own Google OAuth client (escapes the shared-client user cap)

- `--client-secret-file`: Path to a downloaded client_secret JSON (skips auto-import from ~/Downloads)
- `--project`: Reuse an existing GCP project (deep-links straight to client creation in it instead of opening the New Project page)
- `--non-interactive`: Print the steps without opening a browser or waiting for a download

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--provider` | Document provider: google, microsoft, local | google |
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv, yaml, tsv, ndjson | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--summary` | Summary mode (counts and statuses only). Alias: --brief | - |
| `--concise` | Concise mode: all fields except body/description/content | - |
| `--full` | Preserve full API payloads, including null-valued fields | - |
| `--limit` | Max items to return | 25 |
| `--offset` | Pagination offset | 0 |
| `--page-all` | Fetch every page of a paginated list (search documents/recent, folder list, comment list, revision list) instead of one page. The output format is unchanged; pass --format ndjson to stream a large set line by line | - |
| `--page-limit` | Maximum pages to fetch when auto-paginating (implies --page-all) | - |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override the API base URL. Path-inclusive: the microsoft provider's base ends at a Graph drive (default https://graph.microsoft.com/v1.0/me/drive), so an override must carry the whole path. Prefer --drive/--site | - |
| `--drive` | Microsoft only: address the Graph drive with this driveId (/v1.0/drives/{driveId}) instead of the caller's own OneDrive; a `search recent` hit carries its driveId as parentReference.driveId. Pair with --no-cache when switching drives in one session (cache key is base-agnostic, #4238) | - |
| `--site` | Microsoft only: address the default document library of this SharePoint site (/v1.0/sites/{siteId}/drive) instead of the caller's own OneDrive. Pair with --no-cache when switching sites in one session (cache key is base-agnostic, #4238) | - |
| `--read-only` | Disable all write operations | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--timeout` | Request timeout in milliseconds (> 0). Sheets, Slides and Docs always take `[gdrive]` timeout_ms, the Drive client `[microsoft-graph]` under `--provider microsoft`; else `[global]` timeout_ms, else 30000 | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--debug` | Print debug info to stderr | - |
| `--no-sanitize` | Return raw document/comment content without prompt-injection sanitization | - |
