---
name: airtable-cli
version: 0.59.0
description: >
  Agent-friendly Airtable CLI. Use when user mentions: airtable, base, table, records, airtable formula.
roles: ["product", "ops"]
metadata:
  generated: true
  requires:
    bins: ["airtable"]
---

# Agent-friendly Airtable CLI

## Quick Reference

```bash
# Bases
airtable --agent base list
airtable --agent base search "Product Roadmap"   # resolve a base by name -> ranked candidates + recommended id
airtable --agent base schema appXXX               # raw /meta payload for a base
airtable --agent base describe appXXX              # curated overview: per-table {id, name, field count}
airtable --agent base describe appXXX --table "Tasks"   # + per-field types, select choice ids, ~3 sampled example values
airtable --agent base tables appXXX
airtable --agent base create-table --base appXXX --name "Projects" --fields-json '[{"name":"Name","type":"singleLineText"}]'

# Records
airtable --agent record list --base appXXX --table "Tasks" --limit 10
airtable --agent record list --base appXXX --table "Tasks" --filter "{Status} = 'Active'"
airtable --agent record list --base appXXX --table "Tasks" --eq "Status=Active" --after "Created=2026-01-01T00:00:00Z"   # typed, injection-safe filters (AND-composed; conflicts with --filter)
airtable --agent record list --base appXXX --table "Tasks" --contains "Name=launch" --record-id recYYY --record-id recZZZ   # substring + specific-record match (--record-id repeats -> OR)
airtable --agent record list --base appXXX --table "Tasks" --view "Active View" --limit 10
airtable --agent record search --base appXXX --table "Tasks" --query "launch plan"
airtable --agent record get --base appXXX --table Tasks --record recYYY
airtable --agent record first --base appXXX --table Tasks --filter "{Status} = 'Active'" --sort -Created
airtable --agent record create --base appXXX --table Tasks --fields-json '{"Name":"New task","Status":"Todo"}'
airtable --agent record create --base appXXX --table Tasks --fields-json '{"Status":"Done"}' --typecast
airtable --agent record update --base appXXX --table Tasks --record recYYY --fields-json '{"Status":"Done"}'
airtable --agent record update --base appXXX --table Tasks --record recYYY --fields-json '{"Status":"Done"}' --verify   # re-read after the write; returns the stored row, not the echo
airtable --agent record list --base appXXX --table "Tasks" --resolve-links   # linked cells render as {id, display_name}, one batched lookup per linked table
airtable --agent record upsert --base appXXX --table Tasks --merge-on Key --records-json '[{"fields":{"Key":"a","Name":"Alice"}}]'
airtable --agent record upsert --base appXXX --table Tasks --merge-on Key --records-json '<up to 500 records>'   # >10 auto-chunks into serial batches of 10, paced <5 req/s, one 30s retry per 429
airtable --agent record delete --base appXXX --table Tasks --record recYYY
airtable --agent record attach --base appXXX --record recYYY --field Attachments --file ./report.pdf   # upload local bytes (max 5 MB)
airtable --agent record attach --base appXXX --table Tasks --record recYYY --field Attachments --url https://example.com/a.png   # attach by URL; REPLACES existing attachments (no upload)

# Fields, Views & Tables
airtable --agent field list --base appXXX --table Tasks
airtable --agent field delete --base appXXX --table tblYYY --field fldZZZ
airtable --agent view list --base appXXX --table Tasks
airtable --agent view create --base appXXX --table Tasks --name "Active" --view-type grid
airtable --agent base update-table --base appXXX --table Tasks --name "Open Tasks"
airtable --agent base create --workspace wspXXX --name "Roadmap" --tables-json '[{"name":"Tasks","fields":[{"name":"Name","type":"singleLineText"}]}]'

# Workspaces
airtable --agent workspace bases wspXXX
airtable --agent workspace bases https://airtable.com/wspXXX/tblYYY   # a pasted URL works too
airtable --agent base create --workspace https://airtable.com/wspXXX/... --name "Roadmap" --tables-json '[{"name":"Tasks","fields":[{"name":"Name","type":"singleLineText"}]}]'

# Record Comments
airtable --agent comment list --base appXXX --table Tasks --record recYYY
airtable --agent comment create --base appXXX --table Tasks --record recYYY --text "Looks good to me"
airtable --agent comment create --base appXXX --table Tasks --record recYYY --text "cc @[usrL2PNC5o3H4lBEi]"  # @mention markup sent verbatim
airtable --agent comment changes --base appXXX --table Tasks --record recYYY  # bootstrap: omit --since
airtable --agent comment changes --base appXXX --table Tasks --record recYYY --since 2026-06-01T00:00:00Z  # persist as_of -> next --since

```

## Authentication

- Method: PAT via pat-manager
- Setup: aix auth login airtable (non-interactive: pat-manager set airtable <your-personal-access-token>)
- Required PAT scopes: data.records:read + schema.bases:read to read rows/tables; add data.records:write for create/update/delete.
- Interface-only access is NOT enough: if a base was shared with you via an interface (not as a base collaborator), the Airtable API cannot read it and calls 403 — ask the base owner to add you as a base collaborator.
- Each PAT is scoped to specific bases/workspaces — make sure the base you query is in the token's access list.
- `workspace bases` needs the additional workspacesAndBases:read scope — a PAT scoped only for the base/record commands will 403 on it.

## Airtable Formula Syntax

Applies to: --filter flag on record list and record first commands

```
# Exact match
{Status} = 'Active'

# AND condition
AND({Status} = 'Active', {Priority} = 'High')

# Text search
FIND('keyword', {Name}) > 0

# Case-insensitive match (SEARCH/FIND are case-SENSITIVE by default, unlike Excel) - wrap both sides in LOWER()
LOWER({Name}) = LOWER('acme')

# Case-insensitive substring match
SEARCH(LOWER('acme'), LOWER({Name})) > 0

# Date comparison
IS_AFTER({Due Date}, TODAY())

# OR condition
OR({Status} = 'Active', {Status} = 'In Progress')

# Not empty
NOT({Assignee} = '')

```

## Workflows

### Golden Discovery Path

```bash
# 1. search: find the base if you only know it by name (skip if you already have the app... id)
airtable --agent base search "Product Roadmap"   # ranked candidates + recommended id; or airtable --agent base list to browse everything
# 2. list: discover the tables inside the base
airtable --agent base tables <base_id>
# 3. schema: learn field names, types, and select choice values BEFORE writing a filter
airtable --agent base describe <base_id> --table <table>   # or base schema <base_id> for the raw /meta payload
# 4. query: filter with fields the schema step just confirmed exist
airtable --agent record list --base <base_id> --table <table> --filter "{Status} = 'Done'"   # or record search --query "<text>" for full-text
```

### Find a Base by Name

```bash
airtable --agent base search "Product Roadmap"   # ranked candidates; read recommended (null when ambiguous)
airtable --agent base tables <recommended_id>       # drill in to find the table
airtable --agent record list --base <recommended_id> --table <table> --limit 5
# Or skip the search entirely: --base accepts the name directly ->
airtable --agent record list --base "Product Roadmap" --table Tasks --limit 5
```

### Open a Pasted airtable.com URL

```bash
# Paste the full link from the browser address bar; the app…/tbl…/rec… ids are extracted for you.
airtable --agent record get --base "https://airtable.com/appXXX/tblYYY/viwZZZ/recWWW"   # --table/--record filled from the URL
airtable --agent record list --base "https://airtable.com/appXXX/tblYYY"                 # --table filled from the tbl… segment
```

### Explore Base

```bash
airtable --agent base list
airtable --agent base schema <base_id>
airtable --agent field list --base <base_id> --table <table>
airtable --agent record list --base <base_id> --table <table> --limit 5
```

### Find and Update Record

```bash
airtable --agent record first --base <base_id> --table <table> --filter "{Name} = 'Target Record'" --sort -Created
airtable --agent record update --base <base_id> --table <table> --record <record_id> --fields-json '{"Status":"Done"}'
```

### Idempotent Sync (Upsert)

```bash
airtable --agent record upsert --base <base_id> --table <table> --merge-on <key_field> --records-json '[{"fields":{"<key_field>":"abc","Status":"Done"}}]'
# Large sync: pass the full array (e.g. 500 records) in ONE call — upsert auto-chunks into serial batches of 10, paced under 5 req/s, and returns Airtable's raw records/createdRecords/updatedRecords aggregated across chunks. No manual splitting or sleeping.
airtable --agent record upsert --base <base_id> --table <table> --merge-on <key_field> --records-json '<up to 500 records>'
# Preview first: --dry-run shows the chunk plan (n chunks + per-chunk sizes) and the first chunk's request, not 50 live calls.
airtable --agent --dry-run record upsert --base <base_id> --table <table> --merge-on <key_field> --records-json '<records>'
```

### Create a Base in a Workspace

```bash
# Find the workspace id in the browser: open the workspace, copy the wsp… id from the address bar (https://airtable.com/wsp…/…)
airtable --agent workspace bases <wsp-or-url>   # confirm the id + see existing bases
airtable --agent base create --workspace <wsp-or-url> --name "New Base" --tables-json '[{"name":"Tasks","fields":[{"name":"Name","type":"singleLineText"}]}]'
```

### Create Structured Data

```bash
airtable --agent base schema <base_id>
airtable --agent field list --base <base_id> --table <table>
airtable --agent record create --base <base_id> --table <table> --fields-json '{"Name":"New item","Status":"Todo"}'
```

### Poll Record Comments

```bash
airtable --agent comment changes --base <base_id> --table <table> --record <record_id>   # bootstrap poll: omit --since, everything returns as new
# persist the returned as_of; on each later poll pass it as --since:
airtable --agent comment changes --base <base_id> --table <table> --record <record_id> --since <prior_as_of>   # returns {new, updated, as_of}; dedupe by comment id
```

## Tips

- Always use --agent for structured JSON output
- --base accepts an app… id, a case-insensitive base NAME, or a pasted airtable.com URL — you rarely need to look up the raw id first. A name is resolved by a ranked search; an unambiguous match is used automatically, an ambiguous one errors with the candidate ids+names so you can retry with the exact id.
- Use `base search "<name>"` to preview how a name resolves: it returns relevance-ranked candidates (exact > prefix > word-boundary > substring), a `recommended` id (null when ambiguous), and `needs_disambiguation`. Mirrors the official MCP's search_bases.
- A malformed value that STARTS with lowercase `app` (e.g. `app store`) is treated as a hallucinated id and rejected — it is NOT retried as a name. If your base is literally named that, pass its app… id or airtable.com URL.
- Paste a full airtable.com link on --base: the app…/tbl…/viw…/rec… ids are extracted, so --table (and --record on record get/update/delete, --view on list/first/view get) are filled from the URL when omitted. An explicit --table/--record/--view always overrides the URL.
- --limit sets records per page (default 25, capped at 100) - it is NOT a total-result control; a larger value is clamped, not paged
- Airtable is cursor-only - page past the first page by following metadata.next_action or passing metadata.cursor as --cursor (there is no numeric offset)
- Reuse the same --limit on each page; metadata.next_action already carries it so the page size does not revert to 25
- Use --filter for server-side filtering with Airtable formulas
- Prefer the typed filter flags on record list/first over hand-writing --filter: --eq FIELD=VALUE ({Field}="VALUE"), --contains FIELD=TEXT (case-insensitive SEARCH), --record-id recXXX (repeatable -> one OR of RECORD_ID()), and --before/--after FIELD=RFC3339 (IS_BEFORE/IS_AFTER over DATETIME_PARSE). All are repeatable and AND-composed, injection-safe (values escaped, field names brace-checked, dates validated), and conflict with a raw --filter. Fall back to --filter only for formulas the typed flags can't express.
- Prefer record search over hand-writing a formula for full-text lookups: it generates injection-safe, case-insensitive LOWER()-wrapped SEARCH() clauses and (with no --table) fans out across the base's tables, tagging each hit with its table. Fall back to record list --filter for structured precision and full cursor pagination
- record search --dry-run still needs a valid token, unlike other commands whose dry-run is fully offline: it previews the per-table record-fetch requests (the generated formula and params) but must first do a live schema read to learn which fields exist and their types before it can build any formula
- record search honors the global --limit as a TOTAL hit cap (default 25, max 100): in fan-out mode (no --table) it is split across the base's tables (small per-table pages, min 3), every table is still queried at least once, and when the cap truncates results has_more=true with a next_action drill-down into the first table with more matches
- Use --view to leverage pre-configured filters and sorts
- Get base schema first to understand table structure before querying
- Describe before filtering or writing select fields. `base describe --table <t>` returns each singleSelect/multipleSelects field's choice IDs and display names (plus colors), its type, and up to 3 sampled example values in one read; a filterByFormula filter matches the option's display NAME (`{Status} = 'Done'`), while a typecast-free create/update addresses the option by its ID — describe surfaces both. It also flags computed fields (formula/rollup/lookup) so you leave them out of a create. `base schema` stays the raw /meta payload; `describe` is the curated, example-annotated view — omit --table for a schema-only overview (no example sampling).
- Use record first with --sort for single-record lookups instead of list with --limit 1; without --sort the "first" of several matches is non-deterministic on ties
- Prefer record upsert (--merge-on <field>) over a find-then-update round trip; it is the idempotent sync primitive and saves a request against the 5 req/sec limit
- record upsert auto-chunks payloads over 10 records into serial batches of 10, paced under 5 req/s, retrying a rate-limited batch once after Airtable's fixed 30s penalty — pass the whole array (up to ~500 records) in one call instead of hand-rolling a batch loop. The result uses Airtable's RAW upsert shape — records/createdRecords/updatedRecords aggregated across chunks, the SAME keys a <=10 single-request upsert returns — plus additive chunk metadata (complete, chunks); on a partial failure it reports the failing batch and a `replay` command for the unprocessed `remainder`. Caveat: cross-chunk dedup relies on Airtable's per-chunk merge, so two records that share a merge-on key but land in different chunks are merged independently (a duplicate key spanning chunks can create twice) — de-duplicate the input by merge key for exactly-once semantics. Only upsert auto-chunks: the batch-create/batch-update/batch-delete verbs stay strict single requests capped at 10.
- If a write to a select/linked-record/number column 422s with INVALID_VALUE_FOR_COLUMN, retry the same record create/update/upsert/batch with --typecast to coerce the human-readable string into the typed value (opt-in; it can create new select options)
- If record list/first 422s because a --record-fields, --sort or --filter name is unknown (UNKNOWN_FIELD_NAME, or INVALID_FILTER_BY_FORMULA naming unknown fields), the CLI makes one schema read and puts the table's real field names in the first suggestion (up to 50) and in details.available_fields. Field names are case-sensitive; retry with a name from that list. If the token lacks schema.bases:read, the error stays Airtable's own 422 and `field list` will 403 too.
- Pass --verify on record create/update to get the STORED row back instead of the write echo. The echo is the server's view at write time, so a formula, rollup or lookup column can still read stale; --verify costs one extra GET and returns what a fresh read would show. Skip it when you only need the ids the write returned.
- Pass --resolve-links on record list/get/first to render linked cells as [{id, display_name}] instead of bare rec… ids, so you do not need a follow-up read per linked id. Cost is one schema read plus ONE batched lookup per linked table (per 100 distinct ids), not one per record. It is best-effort, so the read never fails. An id the lookup does not return keeps its place as {id} with no display_name (an explicit null under --full) and writes nothing to stderr. A FAILED lookup degrades that table's ids the same way, plus one stderr warning carrying the error's own code and retryable flag. A FAILED schema read is the one case that changes shape: with no plan there is nothing to rewrite, so every cell stays exactly as the API sent it, as bare rec… ids, with the same warning. Omit --resolve-links when you need only the ids.
- record update and field update both use HTTP PATCH (replacement of the supplied keys, not a full overwrite); omitted fields are left untouched. field update requires at least one of --name/--description
- record attach has two modes: --file uploads local bytes (max 5 MB, MIME sniffed from the extension unless --content-type is given) to content.airtable.com; --url attaches a public URL by reference (no upload). WARNING: --url REPLACES the field's existing attachments (Airtable PATCH sets the cell, it does NOT append) - any attachments already there are lost. A file over 5 MB is rejected locally with the --url suggestion; mind the replace behavior when following it
- To create a base you need a workspace id (wsp…). There is no way to LIST your workspaces via the API — `workspace list` is an intentional dead-end. Find the id in the browser address bar while viewing the workspace (https://airtable.com/wsp…/…); both `workspace bases` and `base create --workspace` accept that URL directly or a bare wsp… id.
- `workspace bases <wsp>` returns a `baseIds` array (ids only, no names) as `data`. Follow up with `base schema <baseId>` to resolve a name/schema.
- Track record discussion incrementally with comment changes: persist the returned as_of and pass it as the next --since (omit --since on the first poll to bootstrap). It returns {new, updated, as_of} on the same contract as udoc/confluence comment changes, so one polling loop works across all three. Dedupe by comment id — the as_of safety window re-delivers boundary comments at-least-once
- comment create sends --text verbatim: @mention markup (@[usrXXXXXXXXXXXXXX]) is passed through unescaped and Airtable resolves it into a real, notified mention. Record comments need the data.recordComments:read (list/changes) and data.recordComments:write (create) PAT scopes
- Read outputs are sanitized by default: record list/get/first/search, view get, and comment list/changes strip ANSI/control/bidi (Trojan Source) sequences from every field value, column name, comment body, author name, and search match preview, so untrusted cell content can't inject terminal escapes or hidden instructions into the agent. Control-free ids, names, and timestamps pass through byte-for-byte. Pass --no-sanitize for raw bytes (e.g. a value that legitimately contains escape codes you need verbatim).
- Run `airtable agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`airtable --agent record list --help`); a bare `airtable --agent --help` returns the whole schema

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| record list without --limit | Airtable has rate limits (5 req/sec) — large unbounded lists risk throttling |
| create records without checking schema first | Field names are case-sensitive and type-specific — mismatches cause silent failures |
| update without getting record first | Fields use replacement semantics — omitted fields are not preserved in PATCH |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `airtable record list`

List records in a table

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--view`: View name
- `--filter`: Filter by formula (raw Airtable syntax; escape hatch for the typed --eq/--contains/--record-id/--before/--after flags)
- `--eq`: Typed equality predicate FIELD=VALUE -> {Field}="VALUE" (repeatable, AND-composed; injection-safe; conflicts with --filter)
- `--contains`: Case-insensitive substring predicate FIELD=TEXT (repeatable, AND-composed; conflicts with --filter)
- `--record-id`: Match a specific record id (repeatable -> OR of RECORD_ID(); conflicts with --filter)
- `--before`: Date predicate FIELD=RFC3339 -> IS_BEFORE({Field}, ...) (repeatable, AND-composed; conflicts with --filter)
- `--after`: Date predicate FIELD=RFC3339 -> IS_AFTER({Field}, ...) (repeatable, AND-composed; conflicts with --filter)
- `--sort`: Sort field (prefix with - for descending, e.g. -Created)
- `--record-fields`: Fields to return (comma-separated)
- `--cursor`: Pagination offset token
- `--resolve-links`: Expand linked-record ids to {id, display_name} from each linked table's primary field (costs one schema read plus one batched lookup per linked table)

### `airtable record get`

Get a single record

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--record`: Record ID (optional if a record URL is passed to --base)
- `--resolve-links`: Expand linked-record ids to {id, display_name} from each linked table's primary field (costs one schema read plus one batched lookup per linked table)

### `airtable record first`

Get the first record matching criteria

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--filter`: Filter by formula (raw Airtable syntax; escape hatch for the typed --eq/--contains/--record-id/--before/--after flags)
- `--eq`: Typed equality predicate FIELD=VALUE -> {Field}="VALUE" (repeatable, AND-composed; injection-safe; conflicts with --filter)
- `--contains`: Case-insensitive substring predicate FIELD=TEXT (repeatable, AND-composed; conflicts with --filter)
- `--record-id`: Match a specific record id (repeatable -> OR of RECORD_ID(); conflicts with --filter)
- `--before`: Date predicate FIELD=RFC3339 -> IS_BEFORE({Field}, ...) (repeatable, AND-composed; conflicts with --filter)
- `--after`: Date predicate FIELD=RFC3339 -> IS_AFTER({Field}, ...) (repeatable, AND-composed; conflicts with --filter)
- `--view`: View name
- `--sort`: Sort field (prefix with - for descending, e.g. -Created)
- `--resolve-links`: Expand linked-record ids to {id, display_name} from each linked table's primary field (costs one schema read plus one batched lookup per linked table)

### `airtable record search`

Full-text search records with safe, auto-generated case-insensitive formulas

- `--base`: Base ID **(required)**
- `--table`: Table name or ID; omit to fan out across every table in the base
- `--query`: Search text (case-insensitive); wrap in double quotes for an exact phrase **(required)**
- `--search-fields`: Restrict the search to these field names (comma-separated); validated against the schema
- `--all-searchable`: Widen the default text-field set to also search number/select columns

### `airtable record create`

Create a new record

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--fields-json`: Fields as JSON object **(required)**
- `--typecast`: Coerce string inputs into typed columns (select options, linked records, numbers)
- `--return-fields-by-field-id`: Key the response's fields object by field id instead of field name
- `--verify`: Return the stored row instead of the write echo by re-reading after the write. Costs one extra GET

### `airtable record update`

Update a record

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--record`: Record ID (optional if a record URL is passed to --base)
- `--fields-json`: Fields as JSON object **(required)**
- `--typecast`: Coerce string inputs into typed columns (select options, linked records, numbers)
- `--return-fields-by-field-id`: Key the response's fields object by field id instead of field name
- `--verify`: Return the stored row instead of the write echo by re-reading after the write. Costs one extra GET

### `airtable record upsert`

Upsert records: update matches on the merge fields, else create (idempotent sync)

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--records-json`: Records as JSON array (e.g. [{"fields":{"Key":"a","Name":"Alice"}}]) **(required)**
- `--merge-on`: Field name(s) to match on when deciding update vs create (repeatable) **(required)**
- `--typecast`: Coerce string inputs into typed columns (select options, linked records, numbers)
- `--return-fields-by-field-id`: Key the response's fields object by field id instead of field name

### `airtable record delete`

Delete a record

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--record`: Record ID (optional if a record URL is passed to --base)

### `airtable record attach`

Attach a file (uploaded bytes) or a public URL to an attachment field

- `--base`: Base ID (app id, base name, or airtable.com URL) **(required)**
- `--table`: Table name or ID (required for --url mode; optional if a table URL is on --base)
- `--record`: Record ID (optional if a record URL is passed to --base)
- `--field`: Attachment field name or id (fieldIdOrName) **(required)**
- `--file`: Local file to upload (max 5 MB). Mutually exclusive with --url
- `--url`: Public URL to attach instead of uploading bytes. WARNING: REPLACES the field's existing attachments - Airtable's PATCH sets the cell, it does NOT append, so any attachments already in the field are lost. Mutually exclusive with --file
- `--content-type`: MIME type for --file (default: sniff from extension, else application/octet-stream)

### `airtable record batch-create`

Create multiple records in a single request (max 10)

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--records-json`: Records as JSON array (e.g. [{"fields":{"Name":"Alice"}},{"fields":{"Name":"Bob"}}]) **(required)**
- `--typecast`: Coerce string inputs into typed columns (select options, linked records, numbers)
- `--return-fields-by-field-id`: Key the response's fields object by field id instead of field name

### `airtable record batch-update`

Update multiple records in a single request (max 10)

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--records-json`: Records as JSON array (e.g. [{"id":"rec...","fields":{"Name":"Alice"}}]) **(required)**
- `--typecast`: Coerce string inputs into typed columns (select options, linked records, numbers)
- `--return-fields-by-field-id`: Key the response's fields object by field id instead of field name

### `airtable record batch-delete`

Delete multiple records in a single request

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--id`: Record IDs to delete (can specify multiple times) **(required)**

### `airtable base list`

List all accessible bases

- `--cursor`: Pagination offset token

### `airtable base search`

Search accessible bases by name; returns ranked candidates + recommended

- `<name>`: Base name (or part of it) to search for **(required)**

### `airtable base schema`

Get schema for a base (all tables, fields, views)

- `<base>`: Base ID, name, or airtable.com URL **(required)**

### `airtable base tables`

List tables in a base

- `<base>`: Base ID, name, or airtable.com URL **(required)**

### `airtable base describe`

Schema-first view of a base: per-table {id, name, field count}; add --table for one table's per-field types, singleSelect/multipleSelects choice ids, and up to 3 sampled example values (the cheap pre-write/pre-filter read)

- `<base>`: Base ID, name, or airtable.com URL **(required)**
- `--table`: Table to profile (name or ID). Omit for the schema overview only — no example sampling (token+rate economy)

### `airtable base create`

Create a new base in a workspace

- `--workspace`: Workspace ID (wsp...) to create the base in **(required)**
- `--name`: Base name **(required)**
- `--tables-json`: Initial tables as JSON array (e.g. [{"name":"Tasks","fields":[{"name":"Name","type":"singleLineText"}]}]) **(required)**

### `airtable base create-table`

Create a new table in a base

- `--base`: Base ID, name, or airtable.com URL **(required)**
- `--name`: Table name **(required)**
- `--fields-json`: Fields as JSON array (e.g. [{"name":"Name","type":"singleLineText"}]) **(required)**

### `airtable base update-table`

Update a table's name and/or description

- `--base`: Base ID, name, or airtable.com URL **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--name`: New table name
- `--description`: New table description

### `airtable field list`

List fields in a table

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)

### `airtable field create`

Create a new field in a table

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--name`: Field name **(required)**
- `--field-type`: Field type (singleLineText, number, checkbox, etc.) **(required)**
- `--options`: Field options as JSON

### `airtable field update`

Update a field

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--field`: Field ID **(required)**
- `--name`: New field name
- `--description`: New field description

### `airtable field delete`

Delete a field

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--field`: Field ID **(required)**

### `airtable workspace list`

List accessible workspaces (unsupported: Airtable's public API has no workspace-enumeration endpoint — see the error for how to find a wsp id)

### `airtable workspace bases`

List the bases in a workspace (accepts a wsp… id or a pasted airtable.com URL)

- `<workspace>`: Workspace id (wsp…) or a pasted airtable.com workspace URL **(required)**

### `airtable view list`

List views in a table

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)

### `airtable view get`

Get records through a specific view

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--view`: View name (optional if a view URL is passed to --base)
- `--cursor`: Pagination offset token

### `airtable view create`

Create a new view in a table

- `--base`: Base ID **(required)**
- `--table`: Table name or ID (optional if a table URL is passed to --base)
- `--name`: View name **(required)**
- `--view-type`: View type (grid, form, calendar, gallery, kanban, timeline, gantt, block)

### `airtable comment list`

List comments on a record (newest first)

- `--base`: Base ID **(required)**
- `--table`: Table name or ID **(required)**
- `--record`: Record ID **(required)**
- `--cursor`: Pagination offset token (from a prior response's metadata.cursor)

### `airtable comment create`

Add a comment to a record

- `--base`: Base ID **(required)**
- `--table`: Table name or ID **(required)**
- `--record`: Record ID **(required)**
- `--text`: Comment body. Sent verbatim: @mention markup (@[usrXXXXXXXXXXXXXX]) passes through unescaped so Airtable resolves it into a notified mention **(required)**

### `airtable comment changes`

Detect new/updated comments since a timestamp (incremental polling)

- `--base`: Base ID **(required)**
- `--table`: Table name or ID **(required)**
- `--record`: Record ID **(required)**
- `--since`: RFC 3339 timestamp from a prior call's `as_of`; omit to bootstrap (all new)
- `--safety-window-seconds`: Subtract N seconds from now() for `as_of`, giving at-least-once delivery (dedupe by id). Clamped to [0, 86400]

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv | - |
| `--fields` | Project output keys only, comma-separated (NOT the write payload; use record create/update --fields-json for that) | - |
| `--summary` | Summary mode (counts and statuses only). Alias: --brief | - |
| `--concise` | Concise mode: all fields except body/description/content | - |
| `--full` | Preserve full API payloads, including null-valued fields | - |
| `--limit` | Max records per page (record list/view get cap at 100). Airtable is cursor-only: page with --cursor from metadata.cursor, not a numeric offset | 25 |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override server URL | - |
| `--read-only` | Disable all write operations | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--timeout` | Request timeout in milliseconds (> 0); `[airtable]`/`[global]` timeout_ms, else 30000 | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--debug` | Print debug info to stderr | - |
| `--no-sanitize` | Return raw record/comment content without prompt-injection sanitization | - |
