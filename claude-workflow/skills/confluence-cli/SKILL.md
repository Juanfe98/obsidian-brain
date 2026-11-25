---
name: confluence-cli
version: 0.59.0
description: >
  Agent-friendly Confluence CLI. Use when user mentions: confluence, wiki, page, space, CQL, documentation, knowledge base, content.
metadata:
  generated: true
  requires:
    bins: ["confluence"]
---

# Agent-friendly Confluence CLI

## Quick Reference

```bash
# Pages
confluence --agent page get 12345678
confluence --agent page get 12345678 --body-format markdown   # whole page as Markdown (Cloud)
confluence --agent page outline 12345678   # headings with index, level and Anchor names (Cloud)
confluence --agent page get 12345678 --heading 13   # the section of heading 13 in the outline (Cloud)
confluence --agent page get 12345678 --section '#2.3.-Message-Type'   # one section as Markdown (Cloud)
confluence --agent page get-by-title --space DEV --title "Design Document"
confluence --agent page create --space DEV --title "New Page" --body "<p>Content here</p>"
confluence --agent page create --space DEV --title "Child Page" --body "<p>Details</p>" --parent-id 12345
confluence --agent page update 12345 --body "<p>Updated content</p>" --version-message "Fixed typo"
confluence --agent page update 12345 --title "Renamed Page"
confluence --agent page delete 12345
confluence --agent page children 12345
confluence --agent page tree 12345 --depth 2
confluence --agent page versions 12345
confluence --agent page compare-versions 12345 --v1 1 --v2 3
confluence --agent page create-from-template --space DEV --template-id 99999 --title "From Template"
confluence --agent page move 12345 --parent 67890
confluence --agent page move 12345 --parent 67891   # parent can be a folder ID
confluence --agent page move 12345 --after 67892    # beside a sibling (Cloud only)

# Search (CQL)
confluence --agent search query --cql "space = DEV AND type = page" --limit 10
confluence --agent search query --cql "title ~ \"design document\"" --limit 10
confluence --agent search query --cql "label = reviewed AND space = DEV" --limit 10
confluence --agent search query --cql "creator = currentUser() AND lastModified > now(\"-7d\")"
confluence --agent search query --cql "ancestor = 12345 AND type = page" --limit 20
confluence --agent search query --cql "text ~ \"error handling\"" --limit 5

# Spaces
confluence --agent space list
confluence --agent space get DEV

# Comments
confluence --agent comment list 12345
confluence --agent comment list 12345 --modified-after 2026-06-01T00:00:00Z
confluence --agent comment changes 12345 --since 2026-06-01T00:00:00Z
confluence --agent comment get 12345 67890
confluence --agent comment get 12345 67890 --body-format atlas_doc_format   # ADF instead of storage HTML (Cloud v2)
confluence --agent comment add 12345 --body "<p>Looks good!</p>"
confluence --agent comment add 12345 --body "<p>Reply</p>" --parent-id 67890
confluence --agent comment add 12345 --inline --selection "rollout plan" --body "<p>Which date?</p>"   # inline, anchored to page text (Cloud v2)
confluence --agent comment add 12345 --inline --selection "TBD" --match-index 2 --body "<p>Owner?</p>"   # third occurrence; required when the text repeats

# Labels
confluence --agent label list 12345
confluence --agent label add 12345 --labels "reviewed,approved"
confluence --agent label remove 12345 --label draft

# Attachments
confluence --agent attachment list 12345
confluence --agent attachment get 67890
confluence --agent attachment get-batch --ids 67890,67891,67892
confluence --agent attachment upload 12345 --file-path ./diagram.png
confluence --agent attachment download 67890 --output ./downloaded.pdf

# Blogposts & v2 content types (Cloud only)
confluence --agent blogpost list --space DEV
confluence --agent blogpost create --space DEV --title "Release Notes" --body "<p>Shipped</p>"
confluence --agent whiteboard create --space DEV --title "Brainstorm"
confluence --agent database create --space DEV --title "Tracker"
confluence --agent folder create --space DEV --title "Archive"
confluence --agent folder children 789
confluence --agent folder move 789 --after 790      # beside a sibling folder
confluence --agent custom-content list --type forge:my-type --space DEV
confluence --agent custom-content create --type forge:my-type --space DEV --title "Item" --body "<p>x</p>"

# Content properties (Cloud only)
confluence --agent property list 12345 --type pages
confluence --agent property get 12345 67890 --type pages
confluence --agent property set 12345 --type pages --key my-prop --value '{"count":3}'
confluence --agent property delete 12345 67890 --type pages

# Templates & Permissions
confluence --agent template list --space-key DEV
confluence --agent permission get 12345

# Users
confluence --agent user me
confluence --agent user get 5b10ac8d82e05b22cc7d4ef5
confluence --agent user search --query "John Smith"

```

## Authentication

- Method: Auto-detected by server URL. Atlassian Cloud is the default (confluence -> https://disney-enterprise.atlassian.net). Cloud has two first-class methods: (1) email + API token, sent as HTTP Basic (the default of `confluence auth login`); (2) OAuth 2.0 (3LO), an opt-in browser flow (`confluence auth login --oauth`) that routes REST through the api.atlassian.com/ex cloudId gateway as Bearer. A stored OAuth session outranks the Basic credential. On Cloud, identify users by accountId (not username), and the CLI auto-adds the /wiki base prefix. Data Center (confluence.disney.com) is demoted but still reachable from a terminal via CONFLUENCE_SERVER / --server / [confluence].base_url; it uses a personal access token, sent as Bearer. Claude Desktop chat and Cowork are pinned to whichever site the generated config names and cannot switch per call, so a search there covers one deployment only. A headless service account (containers, CI) sets ATLASSIAN_OAUTH_GRANT=client_credentials with ATLASSIAN_OAUTH_CLIENT_ID + ATLASSIAN_OAUTH_CLIENT_SECRET: the CLI mints a Bearer token per process via the client_credentials grant, resolves the cloudId from the site's tenant_info, routes through the same gateway, and never falls back to Basic.
- Setup: Cloud (default): `pat-manager login confluence` runs the fully-automatic browser sign-in -- opens https://id.atlassian.com/manage/api-tokens, creates the API token, and stores the shared Atlassian Cloud credential (one API token + account email authenticates both Jira and Confluence; slots atlassian-cloud / atlassian-cloud-email) with no paste. Manual fallback: run `confluence auth login` to validate and store an email + API token (or set ATLASSIAN_EMAIL and ATLASSIAN_API_TOKEN; the per-product CONFLUENCE_EMAIL / CONFLUENCE_API_TOKEN remain fallbacks). OAuth 2.0 (3LO): run `confluence auth setup` for guided BYO-client steps (DEEP+T portal 245 + Atlassian developer console), set ATLASSIAN_OAUTH_CLIENT_ID and ATLASSIAN_OAUTH_CLIENT_SECRET (or ~/.cliuniverse/atlassian-client.json), then `confluence auth login --oauth`. Data Center (fallback): `pat-manager login confluence --dc` browser SSO, or `pat-manager set confluence <token>` for a manual PAT (or set CONFLUENCE_TOKEN).
- A stored OAuth session outranks the email + API token and survives `confluence auth logout`; that logout and a Basic `confluence auth login` list such sessions in `oauthSessions` with a `warning` naming the per-product `auth logout --oauth` that clears each. `confluence auth status` keeps the Basic/env `email` and adds that warning when `activePath` is `oauth`. With ATLASSIAN_OAUTH_GRANT=client_credentials the service account outranks the stored session, and the warning names that override instead.

## CQL (Confluence Query Language) Syntax

Applies to: --cql flag on search query command

```
# All pages in a space
space = DEV AND type = page

# Fuzzy title match
title ~ "design document"

# By label
label = "reviewed" AND space = DEV

# My recent edits
creator = currentUser() AND lastModified > now("-7d")

# All pages under a parent
ancestor = 12345 AND type = page

# Full-text content search
text ~ "error handling" AND space = ENG

# Multiple labels (OR)
label in ("draft", "needs-review") AND space = DEV

# Blog posts this month
type = blogpost AND created > now("-30d")

# Pages modified by user
contributor = "jsmith" AND lastModified > now("-14d")

# Exclude archived spaces
space = DEV AND type = page AND title !~ "[ARCHIVED]"

```

## Workflows

### Documentation Review

```bash
confluence --agent search query --cql "space = DEV AND label = needs-review" --limit 10
confluence --agent page get {page_id}
confluence --agent page update {page_id} --body "<p>Reviewed content</p>" --version-message "Review updates"
confluence --agent label remove {page_id} --label needs-review
confluence --agent label add {page_id} --labels reviewed
```

### Create Documentation Hierarchy

```bash
confluence --agent space get {space_key}
confluence --agent page create --space {space_key} --title "Project Docs" --body "<p>Root page for project documentation</p>"
confluence --agent page create --space {space_key} --title "Architecture" --body "<p>Architecture details</p>" --parent-id {root_id}
confluence --agent page create --space {space_key} --title "API Reference" --body "<p>API docs</p>" --parent-id {root_id}
confluence --agent page create --space {space_key} --title "Runbooks" --body "<p>Operational runbooks</p>" --parent-id {root_id}
```

### Find and Read Documentation

```bash
confluence --agent search query --cql "text ~ \"{topic}\" AND space = {space}" --limit 5
confluence --agent page get {page_id}
confluence --agent page children {page_id} --type page
```

### Page Version Audit

```bash
confluence --agent page versions {page_id}
confluence --agent page compare-versions {page_id} --v1 {older} --v2 {newer}
```

### Explore Space Structure

```bash
confluence --agent space list
confluence --agent search query --cql "space = {space_key} AND ancestor = {root_id} AND type = page" --limit 25
confluence --agent page tree {root_id} --depth 2
```

### Move Page With Redirect (cross-space)

```bash
confluence --agent page get {page_id}   # capture title, body.storage value, space, version.number
confluence --agent attachment list {page_id}   # capture each attachment id + filename
confluence --agent attachment download {att_id} --output ./{att_filename}   # repeat per attachment
confluence --agent page create --space {target_space_key} --title "{title}" --body "{body}" --parent-id {target_parent_id}   # omit --parent-id for a space-root page; capture new {new_page_id} and webui URL -> {new_page_url}
confluence --agent attachment upload {new_page_id} --file-path ./{att_filename} --comment "Transferred from original page"   # repeat per attachment
confluence --agent page update {page_id} --title "[MOVED] {title}" --body '<ac:structured-macro ac:name="html" ac:schema-version="1"><ac:plain-text-body><![CDATA[<meta http-equiv="refresh" content="0; URL={new_page_url}" />]]></ac:plain-text-body></ac:structured-macro><ac:structured-macro ac:name="info" ac:schema-version="1"><ac:rich-text-body><p><strong>This page was moved to:</strong></p><p><a href="{new_page_url}">{new_page_url}</a></p><p>You will be automatically redirected in a few seconds. If not, please click the link above.</p></ac:rich-text-body></ac:structured-macro>' --version-message "Moved to {new_page_url}"   # 5a) create_redirect=true: leave a meta-refresh + info-macro redirect at the old location
confluence --agent page delete {page_id}   # 5b) create_redirect=false: delete the old page INSTEAD of the update above
confluence --agent page children {page_id} --type page   # 6) redirect_child_pages=true only: recurse this whole workflow per child, passing {new_page_id} as the child's {target_parent_id}
```

## Tips

- Always use --agent for structured JSON output
- Use --limit to control response size (default 25) -- reduces tokens and avoids timeouts
- Use --concise to get all fields except body content when you only need metadata
- Use --fields to select only needed fields for maximum token efficiency
- Use --summary (alias --brief) for summary mode: counts and statuses only, when you just need to know how many results exist
- Default output already drops Atlassian reference keys (`self`, `_links`, `avatarUrls`, `iconUrl`, `statusCategory`, `_expandable`) -- pass --full only when you actually need the raw payload
- Page bodies use Confluence storage format (HTML-like markup) -- wrap content in <p> tags at minimum
- The CLI auto-increments version numbers on update -- no need to fetch version first
- Use CQL ancestor queries to find all pages nested under a parent recursively
- Use page get-by-title when you know the space and title but not the content ID
- To read one part of a large page on Cloud, pass the link (or its #fragment, a heading's text, or an Anchor name) to `page get <id> --section`; it returns only that section as Markdown. `page outline <id>` lists the headings with an `index` each; pass it to `page get <id> --heading <index>` to read exactly that one. When a value fits several headings, as a repeated `Response` heading does, or a heading and a different Anchor, `--section` refuses it and lists their `--heading` numbers; a link to a repeated heading is the exception and opens the first one. An outline `index` belongs to the page version that `page outline` read: after `--heading`, compare the returned `section.text` with the outline heading's `text`, and the returned `version.number` with the outline's `version`. Only top-level headings and headings in layout columns are sections: a heading inside any other block (a quote, expand, panel, table, list or macro) renders as bold text in the section that holds it
- Use page tree for navigating hierarchical documentation (set --depth 1-2 to limit response size)
- Use --version-message on updates to leave an audit trail
- Every --space flag takes the same identifier -- the human space key (e.g. DEV) -- on pages, blogposts, whiteboards, databases, folders, and custom content; a numeric space ID is also accepted, and the legacy --space-id spelling remains an alias of --space
- Content properties are eventually consistent on Atlassian's side: the CLI evicts its own cached reads on every write, but `property list` / `property get` can still echo pre-write state for a few seconds after a `property set` / `property delete` -- re-read before concluding the write failed
- Run `confluence agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`confluence --agent page delete --help`); a bare `confluence --agent --help` returns the whole schema
- Labels are stored LOWERCASE by Confluence -- `label add --labels "Needs-Review"` stores `needs-review`, so use the lowercase name in CQL (`label = "needs-review"`) and in `label remove`; the add response echoes the stored names
- To anchor a review note to the sentence it is about, use `comment add --inline --selection "<text>"` (Cloud v2). The CLI matches the selection against the page's text with markup removed, so copy it from the rendered page rather than from storage HTML, keep it inside one paragraph, heading, list item or table cell, and pass --match-index when it repeats
- `page delete` / `blogpost delete` only move content to the space Trash, where it keeps its title and still blocks a same-title create -- pass `--purge` to remove it permanently (trashes, then purges)

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| search without --limit | Large result sets waste tokens and may timeout; always specify --limit |
| update without checking current content first | The body flag replaces the entire page body -- read first if you need to preserve existing content |
| create without --space | Space key is required for page creation; fails with unhelpful 400 error |
| page tree with default depth on large spaces | Default depth 3 can return thousands of pages; use --depth 1 or 2 first |
| using raw text without HTML tags in --body | Confluence storage format requires HTML markup; bare text renders incorrectly |
| download with absolute output path | Security restriction: only relative paths within the current directory are allowed |
| searching with text ~ for exact titles | Use title = for exact match or title ~ for fuzzy; text ~ searches body content which is slower |
| updating the source page before capturing the new page URL | In a move-with-redirect, capture new_page_url from page create first; updating the source with an empty redirect link breaks the redirect. Run every write step with --dry-run first |
| search --query "...", search cql "...", or page search --cql "..." | None of these subcommands/flags exist -- the CQL search command is `search query --cql "..."` |
| confluence --agent schema or confluence --agent api ... | Neither exists -- the full command/flag reference is the separate subcommand `confluence agent schema` (no leading --agent) |
| assuming page delete removed the content | A plain delete only TRASHES the page: it still exists in the space Trash and still blocks creating a page with the same title. Pass --purge for a permanent, irreversible delete |
| mixed-case labels in CQL or in label remove | Confluence lowercases labels on write, so `label = "Needs-Review"` matches nothing and `label remove --label "Needs-Review"` does not match the stored `needs-review` |
| hunting for a command that lists custom-content types | There is none: `type` is required on every Confluence v2 custom-content collection, so no endpoint can enumerate the keys. Take a key from the app/Forge module that defines the content, or read the `type` field of `custom-content get <id>` |
| treating a `property list` / `property get` result taken immediately after a property write as authoritative | Content-property reads are eventually consistent upstream; a stale-looking result seconds after a durable set/delete is read-after-write lag, not a failed write -- re-read before retrying |
| treating a `page get <old-numeric-id>` NOT_FOUND on Cloud as "the page was deleted" | The DC -> Cloud migration did not preserve Data Center page IDs, so a stored DC id 404s on Cloud even though the page still exists. `page get` on Cloud names this in the error and points at the fix; recover it with `search query --cql "title ~ '<exact title>'"`, then `page get` the returned `content.id` |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `confluence page get`

Get a page by content ID

- `<id>`: Content ID **(required)**
- `--body-format`: Body representation to return: `storage` (default, Confluence storage HTML), `atlas_doc_format` (ADF), `view` (server-rendered HTML), or `markdown` (Cloud only: the CLI reads ADF and converts it). `storage`, `atlas_doc_format` and `view` are honored on both Cloud (v2 `body-format`) and Data Center (v1 `body.<format>` expand)
- `--section`: Return only one section, as Markdown (Cloud only): the blocks from the named heading to the next heading at the same or a higher level. Takes a page URL with a `#fragment`, the fragment, a heading's text, or an Anchor macro's name. A value that fits several headings (or a heading and a different Anchor, or only without its `.N` ending) is refused with their `--heading` numbers; a link to a repeated heading opens the first
- `--heading`: Return the section of the heading with this `index` in `page outline`, as Markdown (Cloud only)

### `confluence page get-by-title`

Get a page by title and space

- `--space`: Space key **(required)**
- `--title`: Page title **(required)**
- `--body-format`: Body representation to return: `storage` (default, Confluence storage HTML), `atlas_doc_format` (ADF), `view` (server-rendered HTML), or `markdown` (Cloud only: the CLI reads ADF and converts it). `storage`, `atlas_doc_format` and `view` are honored on both Cloud (v2 `body-format`) and Data Center (v1 `body.<format>` expand)

### `confluence page outline`

List a page's headings with their index, level and Anchor macro names (Cloud only), to pick a `page get --heading` or `--section` value

- `<id>`: Content ID **(required)**

### `confluence page create`

Create a new page or blogpost

- `--space`: Space key **(required)**
- `--title`: Page title **(required)**
- `--body`: Page body (Confluence storage format HTML) **(required)**
- `--parent-id`: Parent page ID (optional)
- `--content-type`: Content type: page or blogpost

### `confluence page update`

Update an existing page

- `<id>`: Content ID **(required)**
- `--title`: New title (optional)
- `--body`: New body (Confluence storage format HTML)
- `--version-message`: Version message

### `confluence page move`

Move a page under a new parent or beside a sibling (exactly one of --parent, --before, --after)

- `<id>`: Content ID of the page to move **(required)**
- `--parent`: New parent page or folder ID; the page becomes its last child
- `--before`: Sibling page or folder ID to place the page before (Cloud only). Never target a top-level page or the space homepage: the page would move to the space top level, hidden from the page tree; use --parent instead
- `--after`: Sibling page or folder ID to place the page after (Cloud only). Never target a top-level page or the space homepage: the page would move to the space top level, hidden from the page tree; use --parent instead

### `confluence page delete`

Delete a page (soft-delete to the space Trash unless --purge)

- `<id>`: Content ID **(required)**
- `--purge`: Permanently purge the page after trashing it (irreversible; the plain delete only moves the page to the space Trash)

### `confluence page tree`

Get page tree (recursive child pages and folders)

- `<id>`: Root content ID **(required)**
- `--depth`: Maximum recursion depth (1 = direct children only, default 3, max 10)

### `confluence page versions`

List page versions

- `<id>`: Content ID **(required)**
- `--cursor`: Cursor for the next page of versions (Confluence Cloud v2 pagination; replay the `_links.next` cursor from metadata verbatim). Ignored on Data Center v1, which paginates by `--offset`

### `confluence page children`

List direct children (pages, folders and other content types on Cloud)

- `<id>`: Content ID **(required)**
- `--type`: Restrict to one content type. `page` returns child pages only; without it Confluence Cloud (v2) also returns folders, whiteboards, databases etc., each with a `type` field. Data Center always returns pages only
- `--cursor`: Cursor for the next page of children (Confluence Cloud v2 pagination; replay the `_links.next` cursor from metadata verbatim). Ignored on Data Center v1, which paginates by `--offset`

### `confluence page compare-versions`

Compare two page versions side-by-side

- `<id>`: Content ID **(required)**
- `--v1`: First version number **(required)**
- `--v2`: Second version number **(required)**

### `confluence page create-from-template`

Create a page from a template

- `--space`: Space key **(required)**
- `--template-id`: Template content ID **(required)**
- `--title`: Page title **(required)**
- `--parent-id`: Parent page ID (optional)

### `confluence space list`

List all spaces

- `--cursor`: Cursor for next page (v2 pagination)

### `confluence space get`

Get a space by key

- `<key>`: Space key **(required)**

### `confluence space create`

Create a new space

- `--key`: Space key (unique, uppercase recommended) **(required)**
- `--name`: Space name (display title) **(required)**
- `--description`: Space description (plain text, optional)

### `confluence search query`

Search content using CQL (Confluence Query Language)

- `--cql`: CQL query string **(required)**
- `--limit`: Max results to return (overrides global --limit)
- `--start`: Start offset (overrides global --offset). Data Center only; on Confluence Cloud the CQL search endpoint ignores it, so a non-zero offset is rejected; page with `--cursor` instead
- `--cursor`: Next-page cursor (Confluence Cloud); replay the cursor from metadata.next_action verbatim. Ignored on Data Center v1, which pages by `--offset`

### `confluence comment list`

List comments on a page

- `<id>`: Content ID of the page **(required)**
- `--modified-after`: Only comments modified at/after this RFC 3339 time. Switches to a CQL fetch that returns the full comment tree (top-level + replies) with threading/resolution metadata
- `--include-resolved`: Include resolved inline comments (CQL path only; hidden by default)
- `--exclude-replies`: Exclude replies from the result (CQL path only; replies included by default)
- `--cursor`: Cursor that continues the v2 FOOTER-comment stream only (page 1 already returns the full inline set). Replay the cursor from a prior call's metadata verbatim; it is RFC3986 percent-decoded so replay through url_encode is byte-identical. To page the inline tail, use `comment inline-list <id> --cursor <inline-cursor>`. Ignored on the `--modified-after` CQL path
- `--body-format`: Body representation for the Cloud v2 streams: `storage` (default, Confluence storage HTML), `atlas_doc_format` (ADF), or `view` (server-rendered HTML). Ignored on the Data Center v1 / CQL paths

### `confluence comment changes`

Detect new/updated comments since a timestamp (incremental polling)

- `<id>`: Content ID of the page **(required)**
- `--since`: RFC 3339 timestamp from a prior call's `as_of`; omit to bootstrap (all new)
- `--safety-window-seconds`: Subtract N seconds from now() for `as_of`, giving at-least-once delivery (dedupe by id). Clamped to [0, 86400]

### `confluence comment add`

Add a footer comment to a page, or an inline comment with `--inline`

- `<id>`: Content ID of the page **(required)**
- `--body`: Comment body. Interpreted per `--body-format`: Confluence storage HTML (default) or an ADF document (`--body-format atlas_doc_format`) **(required)**
- `--parent-id`: Parent comment ID (for replying to an existing comment)
- `--body-format`: Body representation to send: `storage` (default, Confluence storage HTML) or `atlas_doc_format` (ADF)
- `--inline`: Create an inline comment anchored to `--selection` instead of a footer comment (Confluence Cloud v2 only)
- `--selection`: Exact page text to anchor the inline comment to: case-sensitive, within one paragraph, heading, list item or table cell
- `--match-index`: Which occurrence of `--selection` to anchor to, counting from 0. Required when the text appears more than once on the page

### `confluence comment get`

Get a specific comment by ID

- `<page_id>`: Page content ID **(required)**
- `<comment_id>`: Comment content ID **(required)**
- `--body-format`: Body representation to return: `storage` (default, Confluence storage HTML), `atlas_doc_format` (ADF), or `view` (server-rendered HTML). Honored on both Cloud (v2 `body-format`) and Data Center (v1 `body.<format>` expand)

### `confluence comment edit`

Edit a footer comment's body (Confluence Cloud v2 only)

- `<comment_id>`: Footer comment content ID **(required)**
- `--body`: New comment body. Interpreted per `--body-format`: Confluence storage HTML (default) or an ADF document (`--body-format atlas_doc_format`) **(required)**
- `--body-format`: Body representation to send: `storage` (default, Confluence storage HTML) or `atlas_doc_format` (ADF)

### `confluence comment delete`

Delete a footer comment (Confluence Cloud v2 only)

- `<comment_id>`: Footer comment content ID **(required)**

### `confluence comment inline-list`

List inline (in-context) comments on a page (Confluence Cloud v2 only)

- `<id>`: Content ID of the page **(required)**
- `--resolution-status`: Filter by resolution status. Also applied client-side to defend against the live v2 `=open` leak bug
- `--cursor`: Cursor for the next page. Replay the `_links.next` cursor verbatim
- `--body-format`: Body representation to return: `storage` (default, Confluence storage HTML), `atlas_doc_format` (ADF), or `view` (server-rendered HTML)

### `confluence comment resolve`

Resolve an inline comment (Confluence Cloud v2 only)

- `<comment_id>`: Inline comment content ID **(required)**

### `confluence comment reopen`

Reopen a resolved inline comment (Confluence Cloud v2 only)

- `<comment_id>`: Inline comment content ID **(required)**

### `confluence comment replies`

List one level of replies to a footer or inline comment (Confluence Cloud v2 only; the comment type is auto-detected)

- `<comment_id>`: Footer or inline comment content ID **(required)**
- `--cursor`: Cursor for the next page. Replay the `_links.next` cursor verbatim
- `--body-format`: Body representation to return: `storage` (default, Confluence storage HTML), `atlas_doc_format` (ADF), or `view` (server-rendered HTML)

### `confluence comment reply`

Reply to an existing comment (works for both footer and inline comments)

- `<page_id>`: Content ID of the page containing the comment **(required)**
- `--comment-id`: Comment ID to reply to **(required)**
- `--body`: Reply body (Confluence storage format HTML) **(required)**

### `confluence blogpost list`

List blogposts (optionally scoped to a space). Cloud v2 only

- `--space`: Filter to a single space by key (e.g. DEV) or numeric space ID
- `--body-format`: Body representation to include (lean by default; omit for list speed)
- `--cursor`: Cursor for the next page. Replay the cursor from metadata verbatim

### `confluence blogpost get`

Get a blogpost by ID (defaults to storage body). Cloud v2 only

- `<id>`: Blogpost ID **(required)**
- `--body-format`: Body representation (default: storage)

### `confluence blogpost create`

Create a blogpost. Cloud v2 only

- `--space`: Space key (e.g. DEV) or numeric space ID the blogpost belongs to **(required)**
- `--title`: Blogpost title **(required)**
- `--body`: Blogpost body (Confluence storage format HTML) **(required)**
- `--status`: Initial status: current or draft

### `confluence blogpost update`

Update a blogpost (auto-increments version). Cloud v2 only

- `<id>`: Blogpost ID **(required)**
- `--title`: New title (unchanged if omitted)
- `--body`: New body (Confluence storage format HTML; unchanged if omitted)
- `--version-message`: Version change message

### `confluence blogpost delete`

Delete a blogpost (soft-delete to the space Trash unless --purge). Cloud v2 only

- `<id>`: Blogpost ID **(required)**
- `--purge`: Permanently purge the blogpost after trashing it (irreversible; the plain delete only moves it to the space Trash)

### `confluence whiteboard create`

Create the object under a space (optionally nested under a parent)

- `--space`: Space key (e.g. DEV) or numeric space ID **(required)**
- `--title`: Title **(required)**
- `--parent-id`: Parent content ID (optional)

### `confluence whiteboard get`

Get the object by ID

- `<id>`: Content ID **(required)**

### `confluence whiteboard delete`

Delete the object by ID

- `<id>`: Content ID **(required)**

### `confluence database create`

Create the object under a space (optionally nested under a parent)

- `--space`: Space key (e.g. DEV) or numeric space ID **(required)**
- `--title`: Title **(required)**
- `--parent-id`: Parent content ID (optional)

### `confluence database get`

Get the object by ID

- `<id>`: Content ID **(required)**

### `confluence database delete`

Delete the object by ID

- `<id>`: Content ID **(required)**

### `confluence folder create`

Create the object under a space (optionally nested under a parent)

- `--space`: Space key (e.g. DEV) or numeric space ID **(required)**
- `--title`: Title **(required)**
- `--parent-id`: Parent content ID (optional)

### `confluence folder get`

Get the object by ID

- `<id>`: Content ID **(required)**

### `confluence folder delete`

Delete the object by ID

- `<id>`: Content ID **(required)**

### `confluence folder children`

List the folder's direct children (pages, folders and other content types), each with a `type` field. Cloud v2 only

- `<id>`: Folder ID **(required)**
- `--cursor`: Cursor for the next page of children. Replay the cursor from metadata verbatim

### `confluence folder move`

Move a folder under a new parent or beside a sibling (exactly one of --parent, --before, --after). Cloud v2 only

- `<id>`: Content ID of the folder to move **(required)**
- `--parent`: New parent page or folder ID; the folder becomes its last child
- `--before`: Sibling page or folder ID to place the folder before. Never target a top-level page or the space homepage: the folder would move to the space top level, hidden from the page tree; use --parent instead
- `--after`: Sibling page or folder ID to place the folder after. Never target a top-level page or the space homepage: the folder would move to the space top level, hidden from the page tree; use --parent instead

### `confluence custom-content list`

List custom content of a given type. Cloud v2 only

- `--type`: Custom content type (REQUIRED by the v2 API), e.g. "forge:my-type". No endpoint lists the available keys: take one from the app/Forge module that defines the content, or from the `type` field of `custom-content get <id>` **(required)**
- `--space`: Filter by space key (e.g. DEV) or numeric space ID
- `--page-id`: Filter by page ID
- `--blogpost-id`: Filter by blogpost ID
- `--body-format`: Body representation to include (lean by default)
- `--cursor`: Cursor for the next page. Replay the cursor from metadata verbatim

### `confluence custom-content get`

Get custom content by ID (defaults to storage body). Cloud v2 only

- `<id>`: Custom content ID **(required)**
- `--body-format`: Body representation (default: storage)

### `confluence custom-content create`

Create custom content. Cloud v2 only. Requires one container target

- `--type`: Custom content type, e.g. "forge:my-type" (defined by the owning app/Forge module; no endpoint enumerates the available keys) **(required)**
- `--space`: Attach to a space by key or numeric ID (one of --space / --page-id / --blogpost-id)
- `--page-id`: Attach to a page
- `--blogpost-id`: Attach to a blogpost
- `--title`: Title **(required)**
- `--body`: Body (Confluence storage format) **(required)**

### `confluence custom-content update`

Update custom content (auto-increments version). Cloud v2 only

- `<id>`: Custom content ID **(required)**
- `--title`: New title (unchanged if omitted)
- `--body`: New body (unchanged if omitted)
- `--version-message`: Version change message

### `confluence custom-content delete`

Delete custom content by ID. Cloud v2 only

- `<id>`: Custom content ID **(required)**

### `confluence property list`

List content properties on a container. Cloud v2 only

- `<container_id>`: Container content ID (the page/blogpost/custom-content id) **(required)**
- `--type`: Container type **(required)**
- `--cursor`: Cursor for the next page. Replay the cursor from metadata verbatim

### `confluence property get`

Get a single content property by ID. Cloud v2 only

- `<container_id>`: Container content ID **(required)**
- `<property_id>`: Property ID **(required)**
- `--type`: Container type **(required)**

### `confluence property set`

Create (POST) or update (PUT with --property-id) a content property. Cloud v2 only. The value must be valid JSON and at most ~32 KB

- `<container_id>`: Container content ID **(required)**
- `--type`: Container type **(required)**
- `--key`: Property key **(required)**
- `--value`: Property value as JSON (object, array, string, number, or boolean) **(required)**
- `--property-id`: Existing property ID; when set, updates via PUT (version bumped)

### `confluence property delete`

Delete a content property by ID. Cloud v2 only

- `<container_id>`: Container content ID **(required)**
- `<property_id>`: Property ID **(required)**
- `--type`: Container type **(required)**

### `confluence attachment list`

List attachments on a page

- `<id>`: Content ID of the page **(required)**
- `--cursor`: Cursor for the next page of attachments (Confluence Cloud v2 pagination; replay the `_links.next` cursor from metadata verbatim). Ignored on Data Center v1, which paginates by `--offset`

### `confluence attachment get`

Get attachment metadata

- `<id>`: Attachment content ID **(required)**

### `confluence attachment get-batch`

Get metadata for several attachments in one batch. Confluence has no native multi-attachment endpoint, so this is a client-side serial loop (one request per id) — it saves CLI round-trips, not HTTP calls. Any id that fails is reported per-id and makes the whole batch a partial failure

- `--ids`: Attachment content IDs (comma-separated) **(required)**

### `confluence attachment upload`

Upload an attachment to a page

- `<id>`: Content ID of the page **(required)**
- `--file-path`: Path to the file to upload **(required)**
- `--comment`: Optional comment for the attachment

### `confluence attachment download`

Download an attachment

- `<id>`: Attachment content ID **(required)**
- `--output`: Output file path **(required)**

### `confluence attachment delete`

Delete an attachment

- `<id>`: Attachment content ID **(required)**

### `confluence label list`

List labels on a page

- `<id>`: Content ID **(required)**
- `--cursor`: Cursor for the next page of labels (Confluence Cloud v2 pagination; replay the `_links.next` cursor from metadata verbatim). Ignored on Data Center v1, which paginates by `--offset`

### `confluence label add`

Add labels to a page. Confluence lowercases label names server-side

- `<id>`: Content ID **(required)**
- `--labels`: Labels to add (comma-separated). Confluence LOWERCASES each name server-side, so "Needs-Review" is stored as "needs-review"; the response echoes the stored names

### `confluence label remove`

Remove a label from a page (pass the stored, lowercase name)

- `<id>`: Content ID **(required)**
- `--label`: Label to remove. Use the STORED (lowercase) name -- Confluence lowercased it on add, so "Reviewed" does not match "reviewed" **(required)**

### `confluence template list`

List page templates

- `--space-key`: Filter by space key (optional)
- `--cursor`: Cursor for the next page (Confluence Cloud). Replay the cursor from a prior call's metadata verbatim. Data Center pages with `--offset`

### `confluence permission get`

Get content restrictions/permissions

- `<id>`: Content ID **(required)**

### `confluence permission add`

Add a user restriction (View or Edit) to a page

- `<id>`: Content ID **(required)**
- `--user`: Username to restrict **(required)**
- `--restriction-type`: Restriction type: View or Edit **(required)**

### `confluence permission remove`

Remove a user's read restriction from a page

- `<id>`: Content ID **(required)**
- `--user`: Username to unrestrict **(required)**

### `confluence user get`

Get a user by username

- `<name>`: Username **(required)**

### `confluence user me`

Get the current authenticated user

### `confluence user search`

Search users by query

- `--query`: Search query (searches in fullname and username) **(required)**

### `confluence user get-by-key`

Get a user by user key (legacy Confluence Server userKey)

- `<key>`: User key **(required)**

### `confluence user get-by-keys`

Get multiple users by user key (batch resolution; missing keys reported per-item)

- `--keys`: User keys (comma-separated)

### `confluence group list`

List all groups

- `--cursor`: Cursor for the next page (Confluence Cloud). Replay the cursor from a prior call's metadata verbatim. Data Center pages with `--offset`

### `confluence group members`

List members of a group. On Confluence Cloud pass the group **id** (`groupId`, as returned by `group list`); on Data Center pass the group **name**

- `<group>`: Group id (Cloud) or group name (Data Center) **(required)**
- `--cursor`: Cursor for the next page (Confluence Cloud). Replay the cursor from a prior call's metadata verbatim. Data Center pages with `--offset`

### `confluence auth login`

Sign in to Atlassian Cloud. Default: validate an email + API token (HTTP Basic) and store both. With --oauth: browser OAuth 2.0 (3LO) sign-in

- `--oauth`: Use the OAuth 2.0 (3LO) browser flow instead of email + API token (#2040)
- `--browser`: Capture the API token via a headed browser instead of pasting it: opens id.atlassian.com/manage/api-tokens, you sign in and click Create, and the token is captured automatically. Still email + token (HTTP Basic); ignored with --oauth

### `confluence auth logout`

Clear stored Atlassian Cloud credentials. Default: the email + API token. With --oauth: the stored OAuth (3LO) session

- `--oauth`: Clear the OAuth (3LO) session instead of the email + API token

### `confluence auth status`

Show the active Atlassian sign-in: deployment + which auth path is live

### `confluence auth setup`

Guided setup of your own Atlassian OAuth (3LO) integration (#2040)

- `--non-interactive`: Print the steps without opening a browser

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--summary` | Summary mode (counts and statuses only). Alias: --brief | - |
| `--concise` | Concise mode: drops body/description/content but KEEPS the reference keys the default projection removes, so it can return more than the default | - |
| `--full` | Preserve full API payloads: null-valued fields, plus the reference keys (`self`, `_links`, `avatarUrls`, `iconUrl`, `statusCategory`, `_expandable`) the default projection drops | - |
| `--limit` | Max items to return | 25 |
| `--offset` | Pagination offset | 0 |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override Confluence server URL | - |
| `--read-only` | Disable all write operations | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--timeout` | Request timeout in milliseconds (> 0); `[confluence]`/`[global]` timeout_ms, else 30000 | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--debug` | Print debug info to stderr | - |
| `--no-sanitize` | Return raw page/comment content without prompt-injection sanitization | - |
