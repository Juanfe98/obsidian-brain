---
name: jira-cli
version: 0.59.0
description: >
  Agent-friendly Jira CLI. Use when user mentions: jira, ticket, sprint, board, issue, epic, JQL, backlog.
metadata:
  generated: true
  requires:
    bins: ["jira"]
---

# Agent-friendly Jira CLI

## Quick Reference

```bash
# Issues
jira --agent issue search --jql "assignee = currentUser() AND status != Done" --limit 10
jira --agent issue search --jql "project = PROJ" --expand names
jira --agent issue get PROJ-123
jira --agent issue get PROJ-123 --expand names
jira --agent issue get-full PROJ-123
jira --agent issue create --project PROJ --issue-type Story --summary "Title" --description "Plain summary text"
jira --agent issue create --project PROJ --issue-type Story --summary "Rich description" --description "Implement the **thing**: see the [design doc](https://example.com) and the `--flag` it adds"
jira --agent issue create --project PROJ --issue-type Story --summary "Multi-line Markdown description" --description=$'## Goal\n\nImplement the thing.\n\n* first\n* second'
jira --agent issue create --project PROJ --issue-type Story --summary "Raw ADF description" --fields-json '{"description":{"type":"doc","version":1,"content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Goal"}]},{"type":"paragraph","content":[{"type":"text","text":"Implement the thing."}]}]}}'
jira --agent issue update PROJ-123 --summary "New title"
jira --agent issue transition PROJ-123 --to "In Progress"
jira --agent issue transition PROJ-123 --to "Resolved" --resolution "Done"
jira --agent issue assign PROJ-123 --to john.doe
jira --agent issue clone PROJ-123
jira --agent issue link PROJ-1 PROJ-2 --link-type "blocks"

# Comments
jira --agent comment list PROJ-123
jira --agent comment list PROJ-123 --body-format adf   # raw ADF (Cloud); markdown flattens it to plain text
jira --agent comment get-batch PROJ-1 PROJ-2 PROJ-3
jira --agent comment add PROJ-123 --body "Done"
jira --agent comment add PROJ-123 --body '{"type":"doc","version":1,"content":[...]}' --body-format adf
jira --agent comment edit PROJ-123 --id 12345 --body "Updated"

# Boards & Sprints
jira --agent board list --name Platform
jira --agent sprint list --board 123 --state active
jira --agent sprint issues 456
jira --agent sprint add-issues <sprint_id> --issues KEY-1,KEY-2

# Projects
jira --agent project list --limit 10
jira --agent project get PROJ
jira --agent project components PROJ
jira --agent project versions PROJ

# Epics
jira --agent epic list --board 123
jira --agent epic issues PROJ-100
jira --agent epic add-issues PROJ-100 --issues PROJ-1,PROJ-2
jira --agent epic link --issue SUBPLAT-123 --epic SUBPLAT-100
jira --agent epic link --issue SUBPLAT-123 --epic SUBPLAT-100 --method relates_link

# Attachments
jira --agent attachment list PROJ-123
jira --agent attachment get-batch PROJ-1 PROJ-2 PROJ-3
jira --agent attachment download 12345 --output downloads
jira --agent attachment download-all PROJ-123 --type png,jpg
jira --agent attachment upload PROJ-123 screenshot.png design.pdf

# Bulk Operations
jira --agent bulk create --issues-json '[{"project":"PROJ","issuetype":"Task","summary":"Task 1"}]'
jira --agent bulk transition --issues PROJ-1,PROJ-2 --to Done
jira --agent bulk add-labels --issues PROJ-1,PROJ-2,PROJ-3 --labels critical,urgent
jira --agent bulk fetch-comments --issues PROJ-1,PROJ-2
jira --agent bulk fetch-attachments --issues PROJ-1,PROJ-2

# Fields & Admin
jira --agent field list
jira --agent field list --all --search "QA"
jira --agent priorities list
jira --agent resolutions list
jira --agent admin statuses
jira --agent admin issue-types
jira --agent admin issue-link-types

# Users
jira --agent user me
jira --agent user search --query "john"

# Xray (test management)
jira --agent xray test-details TEST-123
jira --agent xray add-to-plan --plan-key PLAN-1 --test-keys TEST-1,TEST-2
jira --agent xray update-type TEST-1 --type Automated

```

## Authentication

- Method: Auto-detected by server URL. Atlassian Cloud is the default (jira -> https://deept.atlassian.net; auto-detected for any *.atlassian.net host). Cloud has two first-class methods: (1) email + API token, sent as HTTP Basic (the default of `jira auth login`); (2) OAuth 2.0 (3LO), an opt-in browser flow (`jira auth login --oauth`) that routes REST through the api.atlassian.com/ex cloudId gateway as Bearer. A stored OAuth session outranks the Basic credential. Data Center (jira.disney.com) is demoted but still reachable from a terminal via JIRA_SERVER / --server / [jira].base_url; it uses a personal access token, sent as Bearer. Claude Desktop chat and Cowork are pinned to whichever site the generated config names and cannot switch per call, so a search there covers one deployment only. A headless service account (containers, CI) sets ATLASSIAN_OAUTH_GRANT=client_credentials with ATLASSIAN_OAUTH_CLIENT_ID + ATLASSIAN_OAUTH_CLIENT_SECRET: the CLI mints a Bearer token per process via the client_credentials grant, resolves the cloudId from the site's tenant_info, routes through the same gateway, and never falls back to Basic.
- Setup: Cloud (recommended): `pat-manager login jira` runs a fully-automatic browser flow that opens https://id.atlassian.com/manage/api-tokens, creates the API token, resolves your account email, and stores the shared Atlassian Cloud credential (one API token + account email authenticates both Jira and Confluence; slots atlassian-cloud / atlassian-cloud-email) - no manual token creation, no paste.
- Cloud manual fallback: `jira auth login` validates an email + API token (HTTP Basic) with a live read and stores the shared Atlassian Cloud credential (slots atlassian-cloud / atlassian-cloud-email, shared with confluence); create a token at https://id.atlassian.com/manage/api-tokens (the paste prompt is no-echo), or set ATLASSIAN_EMAIL + ATLASSIAN_API_TOKEN (the per-product JIRA_EMAIL + JIRA_API_TOKEN remain fallbacks).
- Cloud OAuth 2.0 (3LO), opt-in: `jira auth login --oauth` runs a browser consent flow that needs a BYO admin-approved confidential client (DEEP+T portal 245 + the Atlassian developer console); run `jira auth setup` for guided steps, then set ATLASSIAN_OAUTH_CLIENT_ID + ATLASSIAN_OAUTH_CLIENT_SECRET (or ~/.cliuniverse/atlassian-client.json). Tokens are encrypted at ~/.cliuniverse/atlassian-tokens.json.
- Data Center fallback (https://jira.disney.com; select with JIRA_SERVER / --server / [jira] base_url): personal access token sent as Bearer. Set it up with `pat-manager login jira --dc` (browser SSO to the retired DC host while it is still reachable), `pat-manager set jira <token>` for a manually-created PAT, or JIRA_TOKEN.
- A Data Center Bearer PAT does NOT work on Cloud; the CLI returns a clear error telling you to authenticate for Cloud.
- Check the active sign-in with `jira auth status`; clear a session with `jira auth logout` (Basic) or `jira auth logout --oauth`. A stored OAuth session outranks the email + API token and survives `jira auth logout`; that logout and `jira auth login` list such sessions in `oauthSessions` with a `warning` naming the `--oauth` logout that clears each. `auth status` keeps the Basic/env `email` and adds that warning when `activePath` is `oauth`. With ATLASSIAN_OAUTH_GRANT=client_credentials the service account outranks the stored session, and the warning names that override instead.
- Xray commands authenticate separately from Jira. On Data Center they use the Server/DC Raven REST plugin via the Jira token; on Atlassian Cloud they use the Xray Cloud GraphQL API (xray.cloud.getxray.app), which needs an Xray client-id + client-secret (NOT the Jira token): set XRAY_CLIENT_ID + XRAY_CLIENT_SECRET, or store them once with `pat-manager set-cloud xray --client-id <id> --from-stdin` (slots xray-cloud / xray-cloud-id). Create the key in Jira -> Apps -> Xray -> API Keys (requires a Jira admin). Missing creds fail fast with an actionable AUTH_FAILED; deployment is auto-detected from the Jira server URL.

## JQL Syntax

Applies to: --jql flag on issue search and filter commands

```
# Open bugs in project
project = FOO AND type = Bug AND status = Open

# My active work
assignee = currentUser() AND sprint in openSprints()

# Recently updated
updated >= -7d AND project = PROJ

# Priority ordering
labels in (bug, critical) ORDER BY priority DESC

# OR-combined text
text ~ "TrueMoney" OR text ~ "GoPay" OR text ~ "GCash"

# Multi-project
project in (SUBPLAT, PAYMENTS) AND status = Open

# OR across labels
labels in (truemoney, gopay, gcash, dcb, hotstar)

```

## Workflows

### Sprint Planning

```bash
jira --agent board list --name {team}
jira --agent sprint list --board {board_id} --state active
jira --agent issue search --jql "project = {project} AND sprint is EMPTY AND status = Open" --limit 20
jira --agent sprint add-issues {sprint_id} --issues KEY-1,KEY-2
```

### Issue Triage

```bash
jira --agent issue search --jql "project = {project} AND status = Open AND assignee is EMPTY" --limit 20 --fields key,summary,priority
jira --agent issue assign {key} --to {assignee}
jira --agent issue transition {key} --to "In Progress"
```

## Tips

- Always use --agent for structured JSON output
- Use --limit N to control response size (default 25)
- Default to --fields key,summary,status on issue search and issue get; full payloads are 18KB+ per ticket versus ~500 bytes with --fields
- For a single ticket use `jira --agent issue get PROJ-123` and summarize from it; use `issue get-full` only when changelog or other expanded fields are explicitly needed, because full payloads can be very large
- Use --brief (alias --summary-only) for summary mode: counts and statuses only. On board issues and sprint issues, --counts returns total and per-status counts across every issue (--summary there is a deprecated alias)
- Default output already drops Atlassian reference keys (`self`, `_links`, `avatarUrls`, `iconUrl`, `statusCategory`, `_expandable`) on every read, `issue get-full` included -- pass --full only when you actually need the raw payload
- Check transitions before transitioning: run `jira --agent issue transitions PROJ-123` to list the valid --to values
- On Cloud, users are identified by accountId, not username - user get/search, issue assign, issue create, and bulk accept an email or display name and resolve it to an accountId
- On Cloud, --description takes Markdown and is converted to ADF: headings, bold, italic, inline code, ordered and unordered lists, links, code blocks, blockquotes and rules all render. Jira wiki markup is NOT converted and renders literally. On Data Center the string is sent verbatim as wiki markup
- Tables and images degrade silently in --description: a Markdown table flattens to a plain paragraph, and an image keeps only its alt text (the URL is dropped). A --description value beginning with `-` (a Markdown bullet) is parsed as a flag: use the --description=VALUE form or `*` bullets. For byte-level control over the stored document, pass a complete ADF description object through --fields-json instead
- ADF documents use {"type":"doc","version":1,"content":[...]}; common block nodes include heading, paragraph, bulletList, orderedList, listItem, codeBlock, blockquote, and rule
- Comment writes accept rich bodies: on Cloud --body is Markdown rendered to ADF (wiki markup on Data Center); pass --body-format adf to send a raw ADF JSON document verbatim, or --body-format storage to force a plain wiki string. `worklog add|update --comment` is Markdown rendered to ADF on Cloud too (verbatim wiki markup on Data Center); only `issue transition --comment` is plain text only
- Comment reads default to storage (readable wiki strings); --body-format adf returns the raw ADF (Cloud v3) and --body-format markdown flattens that ADF to plain text — the round-trip pairs with `comment add --body-format adf`
- In issue property-get/-set/-delete and issue properties, the `key` field always means the PROPERTY key (matching Atlassian's own property body); the issue key is reported separately as `issue`
- Run `jira agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`jira --agent issue transition --help`); a bare `jira --agent --help` returns the whole schema
- The valid `--priority` values are instance-defined -- list them with `jira --agent admin priorities` instead of guessing

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| search without --limit | Large result sets waste tokens and may timeout |
| create without checking project exists | Fails with unhelpful 400 error |
| update without --comment | Silent updates confuse team members |
| JQL that names a literal Data Center username (e.g. assignee = "jdoe") on Cloud | Returns zero rows - Cloud matches people by accountId; use currentUser() or an accountId |
| user create or user deactivate on Cloud | Not available on Cloud - manage users at admin.atlassian.com; the CLI returns a clear error |
| --expand for changelog or expanded detail | --expand only accepts names (field ID to display-name mapping); use issue get-full for expanded details and changelog |
| Jira wiki markup in --description | On Cloud --description takes Markdown, converted to ADF; wiki tokens like h2. or {{code}} are stored as literal text -- rewrite the body in Markdown. Data Center is the deployment that takes wiki markup |
| --description together with a description inside --fields-json | The rich ADF field is authoritative; omit --description so the request has one unambiguous description source |
| rely on currentUser() in JQL on every instance | May not resolve on all instances - prefer an email (e.g. assignee = 'user@disney.com') when it returns empty |
| issue view | Accepted only as an undocumented alias of issue get - write issue get |
| jira --agent schema or jira --agent api ... | Do not exist - the reference is `jira agent schema` (no leading --agent) |
| reading `key` from an issue property-set/-delete result as the ISSUE key | `key` is the property key across the whole property-* family; the issue key is in `issue` |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `jira issue get`

Get one or more issues by key

- `<keys>`: Issue key(s) (e.g., PROJ-123 or PROJ-1 PROJ-2 PROJ-3) **(required)**
- `--expand`: Comma-separated expansions (e.g., "names", "schema", "renderedFields")

### `jira issue search`

Search issues using JQL

- `--jql`: JQL query string **(required)**
- `--expand`: Comma-separated expansions (e.g., "names", "schema", "renderedFields")
- `--cursor`: Continuation cursor from a previous page's metadata (Cloud only; replay the nextPageToken verbatim)
- `--max-results`: Server-side page size (maps to Cloud REST API `maxResults`). Overrides the global --limit for this search request
- `--start-at`: Server-side start offset (maps to REST API `startAt`; Data Center only — Cloud uses cursor pagination). Overrides the global --offset
- `--search-fields`: Server-side field selection (comma-separated field IDs sent to the REST API `fields` parameter). Only the listed fields are returned by the server, reducing payload size. Overrides the global --fields for this request

### `jira issue create`

Create a new issue (ticket)

- `--project`: Project key **(required)**
- `--issue-type`: Issue type (Story, Bug, Task, Epic, etc.) **(required)**
- `--summary`: Issue summary **(required)**
- `--description`: Markdown; converted to ADF on Cloud, sent as a wiki-markup string on Data Center
- `--assignee`: Assignee username
- `--priority`: Priority name
- `--labels`: Labels (comma-separated)
- `--fields-json`: Additional custom fields as JSON (e.g., '{"customfield_10001": "value"}')

### `jira issue update`

Update an existing issue

- `<key>`: Issue key **(required)**
- `--summary`: New summary
- `--description`: Markdown; converted to ADF on Cloud, sent as a wiki-markup string on Data Center
- `--assignee`: New assignee
- `--priority`: New priority
- `--fields-json`: Additional custom fields as JSON (e.g., '{"customfield_10001": "value"}')

### `jira issue delete`

Delete an issue

- `<key>`: Issue key **(required)**

### `jira issue transition`

Transition an issue to a new status

- `<key>`: Issue key **(required)**
- `--to`: Target status name (list valid values with `jira issue transitions <KEY>`) **(required)**
- `--resolution`: Resolution name (e.g., "Done", "Won't Do", "Duplicate"). Use `jira resolutions list` to list valid values
- `--comment`: Transition comment (plain text only)
- `--fields-json`: Fields to set on the transition screen as JSON (e.g., '{"customfield_10513": {"value": "Code Review"}}')

### `jira issue transitions`

List available transitions for an issue

- `<key>`: Issue key **(required)**

### `jira issue assign`

Assign an issue to a user

- `<key>`: Issue key **(required)**
- `--to`: Assignee username (use "none" to unassign) **(required)**

### `jira issue clone`

Clone an issue

- `<key>`: Source issue key **(required)**
- `--project`: Target project (optional, defaults to same project)

### `jira issue link`

Link two issues

- `<from>`: Source issue key **(required)**
- `<to>`: Target issue key **(required)**
- `--link-type`: Link type (e.g., "blocks", "is blocked by", "relates to") **(required)**

### `jira issue watch`

Watch an issue

- `<key>`: Issue key **(required)**

### `jira issue vote`

Vote for an issue

- `<key>`: Issue key **(required)**

### `jira issue get-full`

Get an issue with full expanded details (changelog, rendered fields, etc.)

- `<key>`: Issue key (e.g., PROJ-123) **(required)**
- `--expand`: Comma-separated list of sections to expand

### `jira issue get-changelog`

Get the changelog for an issue

- `<key>`: Issue key **(required)**

### `jira issue get-watchers`

Get watchers of an issue

- `<key>`: Issue key **(required)**

### `jira issue unwatch`

Remove yourself as a watcher from an issue

- `<key>`: Issue key **(required)**

### `jira issue unvote`

Remove your vote from an issue

- `<key>`: Issue key **(required)**

### `jira issue rank`

Rank issues before or after another issue in the backlog

- `--issues`: Issue keys to rank (comma-separated)
- `--rank-before`: Issue key to rank before
- `--rank-after`: Issue key to rank after

### `jira issue delete-link`

Delete an issue link by link ID

- `--link-id`: Issue link ID **(required)**

### `jira issue validate-jql`

Validate a JQL query string

- `--jql`: JQL query string **(required)**

### `jira issue get-create-meta`

Get available fields and issue types for creating issues in a project

- `--project`: Project key **(required)**

### `jira issue get-edit-meta`

Get edit metadata for an issue (editable fields and allowed values)

- `<key>`: Issue key **(required)**

### `jira issue count`

Count issues matching a JQL query without fetching them (approximate on Cloud, exact on Data Center)

- `--jql`: JQL query string (maximum 8192 UTF-8 bytes) **(required)**

### `jira issue add-watcher`

Add a user as a watcher to an issue

- `<key>`: Issue key **(required)**
- `--account-id`: Account ID of the user to add as watcher (e.g., 5b10ac8d14c90a0068b0000a) **(required)**

### `jira issue remove-watcher`

Remove a user as a watcher from an issue

- `<key>`: Issue key **(required)**
- `--account-id`: Account ID of the user to remove as watcher **(required)**

### `jira issue remote-link-list`

List remote (web) links on an issue

- `<key>`: Issue key **(required)**

### `jira issue remote-link-add`

Add a remote (web) link to an issue (upsert on --global-id)

- `<key>`: Issue key **(required)**
- `--url`: Link URL **(required)**
- `--title`: Link title **(required)**
- `--global-id`: Global ID: re-adding the same globalId updates the existing link instead of creating a new one

### `jira issue remote-link-delete`

Delete a remote link from an issue

- `<key>`: Issue key **(required)**
- `--link-id`: Remote link ID **(required)**

### `jira issue properties`

List entity property keys on an issue (keys only, cheap discovery)

- `<key>`: Issue key **(required)**

### `jira issue property-get`

Get a single entity property value from an issue

- `<key>`: Issue key **(required)**
- `--name`: Property key **(required)**

### `jira issue property-set`

Set an entity property on an issue (value parsed as JSON)

- `<key>`: Issue key **(required)**
- `--name`: Property key **(required)**
- `--value-json`: Property value as JSON (object, array, string, number, or bool) **(required)**

### `jira issue property-delete`

Delete an entity property from an issue

- `<key>`: Issue key **(required)**
- `--name`: Property key **(required)**

### `jira issue notify`

Send an email notification about an issue

- `<key>`: Issue key **(required)**
- `--subject`: Notification subject **(required)**
- `--body`: Notification body text
- `--to-assignee`: Notify the assignee
- `--to-reporter`: Notify the reporter
- `--to-watchers`: Notify all watchers
- `--to-voters`: Notify all voters

### `jira board list`

List all boards

- `--type`: Board type filter: scrum, kanban, simple
- `--project`: Filter by project key
- `--name`: Filter by board name

### `jira board get`

Get a specific board by ID

- `<id>`: Board ID **(required)**

### `jira board issues`

List issues on a board

- `<id>`: Board ID **(required)**
- `--jql`: JQL filter
- `--fields`: Fields to return (comma-separated, e.g., "key,summary,status"). Ignored with --counts (which fetches only status)
- `--counts`: Counts only (total + per-status counts) across ALL issues (auto-paginated) instead of full payloads; overrides --fields. `--summary` is a deprecated alias

### `jira board create`

Create a new board backed by a saved filter

- `--name`: Board name **(required)**
- `--board-type`: Board type: scrum or kanban **(required)**
- `--filter-id`: Filter ID **(required)**

### `jira board delete`

Delete a board

- `<id>`: Board ID **(required)**

### `jira sprint list`

List sprints for a board (--board) or for every board of a project (--project, resolved server-side); exactly one is required

- `--board`: Board ID (mutually exclusive with --project)
- `--project`: Project key: resolve the project's board(s) server-side (Agile projectKeyOrId filter — no full board scan) and aggregate their sprints (mutually exclusive with --board)
- `--state`: Sprint state filter: active, future, closed

### `jira sprint get`

Get a specific sprint

- `<id>`: Sprint ID **(required)**

### `jira sprint issues`

List issues in a sprint

- `<id>`: Sprint ID **(required)**
- `--jql`: JQL filter
- `--fields`: Fields to return (comma-separated, e.g., "key,summary,status"). Ignored with --counts (which fetches only status)
- `--counts`: Counts only (total + per-status counts) across ALL issues (auto-paginated) instead of full payloads; overrides --fields. `--summary` is a deprecated alias

### `jira sprint create`

Create a new sprint on a board

- `--board`: Board ID **(required)**
- `--name`: Sprint name **(required)**
- `--start`: Start date (ISO 8601)
- `--end`: End date (ISO 8601)
- `--goal`: Sprint goal

### `jira sprint update`

Update a sprint

- `<id>`: Sprint ID **(required)**
- `--name`: New name
- `--state`: New state: active, closed, future
- `--start`: New start date
- `--end`: New end date
- `--goal`: New goal

### `jira sprint start`

Start a sprint

- `<id>`: Sprint ID **(required)**

### `jira sprint complete`

Complete a sprint

- `<id>`: Sprint ID **(required)**

### `jira sprint add-issues`

Add issues to a sprint

- `<id>`: Sprint ID **(required)**
- `--issues`: Issue keys to add (comma-separated)

### `jira sprint move-to-backlog`

Move issues out of a sprint back to the backlog

- `--issues`: Issue keys (comma-separated)

### `jira sprint delete`

Delete a sprint

- `<id>`: Sprint ID **(required)**

### `jira project list`

List all accessible projects

### `jira project get`

Get a specific project

- `<key>`: Project key or ID **(required)**

### `jira project components`

List project components

- `<key>`: Project key **(required)**

### `jira project versions`

List project versions

- `<key>`: Project key **(required)**

### `jira project roles`

List project roles

- `<key>`: Project key **(required)**

### `jira project role`

Get a specific project role

- `<key>`: Project key **(required)**
- `--role-id`: Role ID **(required)**

### `jira project create`

Create a new project

- `--key`: Project key (e.g., PROJ) **(required)**
- `--name`: Project name **(required)**
- `--project-type`: Project type key (e.g., software, business)
- `--lead`: Lead username **(required)**
- `--description`: Description

### `jira project delete`

Delete a project

- `<key>`: Project key **(required)**

### `jira user me`

Get current authenticated user

### `jira user get`

Get a user by username or account ID

- `<name>`: Username or account ID **(required)**

### `jira user search`

Search for users

- `--query`: Search query **(required)**

### `jira user groups`

List groups for a user

- `<name>`: Username **(required)**

### `jira user create`

Create a new user

- `--username`: Username **(required)**
- `--email`: Email address **(required)**
- `--display-name`: Display name **(required)**

### `jira user deactivate`

Deactivate a user

- `--username`: Username to deactivate **(required)**

### `jira comment list`

List comments on an issue

- `<key>`: Issue key (e.g., PROJ-123) **(required)**
- `--body-format`: Body representation to return: `storage` (wiki-markup strings, the default v2 read), `adf` (raw Atlassian Document Format, Cloud v3), or `markdown` (the ADF flattened to plain text). `adf`/`markdown` read Cloud's v3 comment endpoint; on Data Center (no v3) they fall back to the v2 string and `markdown` is a no-op flatten

### `jira comment get`

Get a specific comment

- `<key>`: Issue key **(required)**
- `--id`: Comment ID **(required)**
- `--body-format`: Body representation to return: `storage` (wiki-markup string, the default v2 read), `adf` (raw Atlassian Document Format, Cloud v3), or `markdown` (the ADF flattened to plain text). See `comment list`

### `jira comment get-batch`

Get the comments for several issues in one batch (fewer round-trips than one `comment list` per issue under the tight rate limiter)

- `<keys>`: Issue keys (e.g., PROJ-1 PROJ-2 PROJ-3) **(required)**

### `jira comment add`

Add a comment to an issue

- `<key>`: Issue key **(required)**
- `--body`: Comment body. Default (or `--body-format markdown`): Markdown on Cloud (rendered to ADF), wiki markup on Data Center. With `--body-format storage` it is sent verbatim as a wiki-markup string; with `--body-format adf` it must be a raw ADF JSON document **(required)**
- `--body-format`: How to interpret `--body`: `markdown` (default; Markdown→ADF on Cloud, wiki string on Data Center), `storage` (verbatim wiki-markup string via v2), or `adf` (`--body` is a raw ADF JSON document sent via v3 — the round-trip counterpart of `comment get --body-format adf`; Cloud only, rejected on Data Center)

### `jira comment edit`

Edit a comment

- `<key>`: Issue key **(required)**
- `--id`: Comment ID **(required)**
- `--body`: New comment body. Interpreted per `--body-format` (see `comment add`) **(required)**
- `--body-format`: How to interpret `--body`: `markdown` (default; Markdown→ADF on Cloud, wiki string on Data Center), `storage` (verbatim wiki-markup string via v2), or `adf` (`--body` is a raw ADF JSON document sent via v3; Cloud only, rejected on Data Center)

### `jira comment delete`

Delete a comment

- `<key>`: Issue key **(required)**
- `--id`: Comment ID **(required)**

### `jira attachment list`

List attachments on an issue

- `<key>`: Issue key (e.g., PROJ-123) **(required)**

### `jira attachment get`

Get attachment metadata by ID

- `<id>`: Attachment ID **(required)**

### `jira attachment get-batch`

Get the attachments for several issues in one batch (fewer round-trips than one `attachment list` per issue under the tight rate limiter)

- `<keys>`: Issue keys (e.g., PROJ-1 PROJ-2 PROJ-3) **(required)**

### `jira attachment get-limits`

Get attachment upload limits (max size, allowed types)

### `jira attachment delete`

Delete an attachment

- `<id>`: Attachment ID **(required)**

### `jira attachment download`

Download an attachment to a local file

- `<id>`: Attachment ID **(required)**
- `--output`: Output directory (defaults to current directory)

### `jira attachment download-all`

Download all attachments from an issue to a directory

- `<key>`: Issue key (e.g., PROJ-123) **(required)**
- `--output`: Output directory (defaults to current directory)
- `--type`: Filter by file extension (comma-separated, e.g., "png,jpg,gif")

### `jira attachment upload`

Upload one or more files as attachments to an issue

- `<key>`: Issue key (e.g., PROJ-123) **(required)**
- `<files>`: File paths to upload **(required)**

### `jira attachment upload-content`

Upload attachment content held in memory (base64), for a headless or containerized caller with no shared filesystem with this CLI

- `<key>`: Issue key (e.g., PROJ-123) **(required)**
- `--content-base64`: Base64-encoded attachment content, for a caller that shares no filesystem with this CLI. Through a tool call aix-mcp pipes this value to the stdin route, which carries 4 MiB of base64; on a command line it is one argv element, holds 64 KiB decoded (less on Windows, whose 32767-character command line that payload exceeds once encoded, #4874), and is visible in `ps` and shell history
- `--content-base64-stdin`: Read the base64 attachment content from stdin instead of --content-base64. Nothing crosses argv on this route, so no per-argument ceiling applies. A tool call does not pass this switch itself: it fills --content-base64 and aix-mcp substitutes this route
- `--filename`: Filename to record for the uploaded content **(required)**

### `jira worklog list`

List worklogs on an issue

- `<key>`: Issue key (e.g., PROJ-123) **(required)**

### `jira worklog add`

Add a worklog entry to an issue

- `<key>`: Issue key **(required)**
- `--time-spent`: Time spent (e.g., "3h 30m", "1d") **(required)**
- `--comment`: Worklog comment. Markdown, rendered to ADF on Cloud; a verbatim wiki-markup string on Data Center
- `--started`: Start date/time (ISO 8601)

### `jira worklog update`

Update a worklog entry

- `<key>`: Issue key **(required)**
- `--id`: Worklog ID **(required)**
- `--time-spent`: New time spent (e.g., "3h 30m", "1d")
- `--comment`: New worklog comment. Markdown, rendered to ADF on Cloud; a verbatim wiki-markup string on Data Center

### `jira worklog delete`

Delete a worklog entry

- `<key>`: Issue key **(required)**
- `--id`: Worklog ID **(required)**

### `jira label list`

List labels on an issue

- `<key>`: Issue key (e.g., PROJ-123) **(required)**

### `jira label add`

Add a label to an issue

- `<key>`: Issue key **(required)**
- `--label`: Label name **(required)**

### `jira label remove`

Remove a label from an issue

- `<key>`: Issue key **(required)**
- `--label`: Label name **(required)**

### `jira label bulk-add`

Add labels to multiple issues at once

- `--issues`: Issue keys (comma-separated)
- `--labels`: Labels to add (comma-separated)

### `jira epic list`

List epics for a board (--board) or for every board of a project (--project, resolved server-side); exactly one is required

- `--board`: Board ID (mutually exclusive with --project)
- `--project`: Project key: resolve the project's board(s) server-side and aggregate their epics (mutually exclusive with --board)

### `jira epic get`

Get a specific epic

- `<id>`: Epic ID or key **(required)**

### `jira epic issues`

List issues in an epic

- `<id>`: Epic ID or key **(required)**

### `jira epic add-issues`

Add issues to an epic

- `<id>`: Epic ID or key **(required)**
- `--issues`: Issue keys to add (comma-separated)

### `jira epic link`

Link an issue to an epic, trying multiple strategies with fallback (custom field, agile API, epic-story link)

- `--issue`: Issue key (e.g., SUBPLAT-123) **(required)**
- `--epic`: Epic key (e.g., SUBPLAT-100) **(required)**
- `--method`: Force a specific method: custom_field, agile_api, epic_story_link, relates_link

### `jira filter list`

List saved filters

### `jira filter get`

Get a specific filter by ID

- `<id>`: Filter ID **(required)**

### `jira filter search`

Search filters by name

- `--name`: Filter name to search for

### `jira filter create`

Create a new saved filter

- `--name`: Filter name **(required)**
- `--jql`: JQL query **(required)**
- `--description`: Filter description

### `jira filter update`

Update an existing filter

- `<id>`: Filter ID **(required)**
- `--name`: New name
- `--jql`: New JQL
- `--description`: New description

### `jira filter delete`

Delete a filter

- `<id>`: Filter ID **(required)**

### `jira dashboard list`

List dashboards

### `jira dashboard get`

Get a specific dashboard by ID

- `<id>`: Dashboard ID **(required)**

### `jira dashboard search`

Search dashboards

- `--filter`: Search filter string

### `jira field list`

List fields (defaults to custom fields only, compact: id, name, custom). Use --full for complete schema.

- `--custom`: Show only custom fields (default when no filter specified)
- `--system`: Show only system fields
- `--all`: Show all fields (custom and system)
- `--search`: Case-insensitive search by field name

### `jira priorities list`

List all available priorities (discovery shortcut for `admin priorities`)

### `jira resolutions list`

List all available resolutions (discovery shortcut for `admin resolutions`). Use to find valid --resolution values for `issue transition`.

### `jira admin statuses`

List all workflow statuses

### `jira admin issue-types`

List all issue types

### `jira admin priorities`

List all priorities

### `jira admin workflows`

List all workflows

### `jira admin workflow-schemes`

List all workflow schemes

### `jira admin issue-link-types`

List all available issue link types (use to find valid --link-type values for `issue link`)

### `jira admin issue-type-schemes`

List all issue type schemes

### `jira admin notification-schemes`

List all notification schemes

### `jira admin permission-schemes`

List all permission schemes

### `jira admin resolutions`

List all resolutions (discovery shortcut: `jira resolutions list`; use to find valid --resolution values for `issue transition`)

### `jira admin transitions`

List available transitions for an issue

- `<key>`: Issue key (e.g., PROJ-123) **(required)**

### `jira component create`

Create a project component

- `--project`: Project key **(required)**
- `--name`: Component name **(required)**
- `--description`: Component description
- `--lead`: Component lead username

### `jira component update`

Update a component

- `<id>`: Component ID **(required)**
- `--name`: New name
- `--description`: New description
- `--lead`: New lead username

### `jira component delete`

Delete a component

- `<id>`: Component ID **(required)**

### `jira group list`

List groups (via picker)

- `--query`: Search query to filter groups

### `jira group members`

List members of a group

- `--name`: Group name **(required)**

### `jira group create`

Create a group

- `--name`: Group name **(required)**

### `jira group delete`

Delete a group

- `--name`: Group name **(required)**

### `jira group add-user`

Add a user to a group

- `--name`: Group name **(required)**
- `--username`: Username to add **(required)**

### `jira group remove-user`

Remove a user from a group

- `--name`: Group name **(required)**
- `--username`: Username to remove **(required)**

### `jira version create`

Create a project version

- `--project`: Project key **(required)**
- `--name`: Version name **(required)**
- `--description`: Version description
- `--release-date`: Release date (yyyy-MM-dd)

### `jira version update`

Update a version

- `<id>`: Version ID **(required)**
- `--name`: New name
- `--description`: New description
- `--release-date`: New release date (yyyy-MM-dd)

### `jira version release`

Release a version (mark as released)

- `<id>`: Version ID **(required)**

### `jira version delete`

Delete a version

- `<id>`: Version ID **(required)**

### `jira bulk create`

Bulk create multiple issues from JSON

- `--issues-json`: JSON array of issue definitions (each with project, issuetype, summary, etc.) **(required)**

### `jira bulk update`

Bulk update fields on multiple issues

- `--issues`: Issue keys (comma-separated)
- `--fields-json`: Fields to update as JSON. On Data Center this is a v2 `fields` object (e.g. '{"summary":"new title"}'). On Jira Cloud it is the native bulk-edit `editedFieldsInput` structure — typed field groups, each entry carrying a `fieldId`, e.g. '{"singleLineTextFields":[{"fieldId":"summary","text":"new title"}]}' **(required)**
- `--no-wait`: Cloud only: submit the async bulk job and return its taskId immediately, without polling for completion. Ignored on Data Center (which runs synchronously per issue)

### `jira bulk transition`

Bulk transition multiple issues

- `--issues`: Issue keys (comma-separated)
- `--to`: Target status name **(required)**
- `--resolution`: Resolution name (e.g., "Done", "Won't Do", "Duplicate"). Data Center only; the native Cloud bulk-transition endpoint takes no field values
- `--no-wait`: Cloud only: submit the async bulk job and return its taskId immediately, without polling for completion. Ignored on Data Center

### `jira bulk assign`

Bulk assign multiple issues to a user

- `--issues`: Issue keys (comma-separated)
- `--to`: Assignee username (use "none" to unassign) **(required)**

### `jira bulk add-labels`

Bulk add labels to multiple issues

- `--issues`: Issue keys (comma-separated)
- `--labels`: Labels to add (comma-separated)

### `jira bulk status`

Cloud only: query the status of an async bulk task by its id

- `<task_id>`: The bulk task id returned by a `--no-wait` submit **(required)**

### `jira bulk fetch-comments`

Bulk fetch comments for multiple issues (all pages per issue)

- `--issues`: Issue keys (comma-separated)

### `jira bulk fetch-attachments`

Bulk fetch attachment metadata for multiple issues

- `--issues`: Issue keys (comma-separated)

### `jira xray test-details`

Get test details

- `<key>`: Test issue key **(required)**

### `jira xray add-to-plan`

Add tests to a test plan

- `--plan-key`: Test plan issue key **(required)**
- `--test-keys`: Test issue keys (comma-separated)

### `jira xray add-to-set`

Add tests to a test set

- `--set-key`: Test set issue key **(required)**
- `--test-keys`: Test issue keys (comma-separated)

### `jira xray remove-from-plan`

Remove a test from a test plan

- `--plan-key`: Test plan issue key **(required)**
- `--test-key`: Test issue key to remove **(required)**

### `jira xray remove-from-set`

Remove a test from a test set

- `--set-key`: Test set issue key **(required)**
- `--test-key`: Test issue key to remove **(required)**

### `jira xray update-steps`

Update manual test steps

- `<key>`: Test issue key **(required)**
- `--steps-json`: Steps as JSON array **(required)**

### `jira xray update-type`

Update test type

- `<key>`: Test issue key **(required)**
- `--test-type`: New test type (Manual, Automated, etc.) **(required)**

### `jira xray update-fields`

Update test fields

- `<key>`: Test issue key **(required)**
- `--fields-json`: Fields as JSON object **(required)**

### `jira xray update-repo-path`

Update test repository path

- `<key>`: Test issue key **(required)**
- `--path`: Repository path **(required)**

### `jira xray exec-details`

Get test execution details

- `<key>`: Test execution issue key **(required)**

### `jira xray add-to-exec`

Add tests to a test execution

- `--exec-key`: Test execution issue key **(required)**
- `--test-keys`: Test issue keys (comma-separated)

### `jira xray remove-from-exec`

Remove a test from a test execution

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key to remove **(required)**

### `jira xray add-exec-to-plan`

Add test executions to a test plan (Xray Cloud only; Data Center returns NOT_IMPLEMENTED)

- `--plan-key`: Test plan issue key **(required)**
- `--exec-keys`: Test execution issue keys (comma-separated) **(required)**

### `jira xray remove-exec-from-plan`

Remove test executions from a test plan (Xray Cloud only; Data Center returns NOT_IMPLEMENTED)

- `--plan-key`: Test plan issue key **(required)**
- `--exec-keys`: Test execution issue keys (comma-separated) **(required)**

### `jira xray exec-runs`

Get test runs for an execution

- `<key>`: Test execution issue key **(required)**

### `jira xray update-run-status`

Update a test run's status in an execution

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**
- `--status`: New status (PASS, FAIL, TODO, EXECUTING, etc.) **(required)**

### `jira xray plan-tests`

Get tests in a test plan

- `<key>`: Test plan issue key **(required)**

### `jira xray set-tests`

Get tests in a test set

- `<key>`: Test set issue key **(required)**

### `jira xray run-details`

Get full test run details (status, steps, defects, evidence)

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**

### `jira xray run-comment`

Update a test run's comment

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**
- `--comment`: Comment text **(required)**

### `jira xray run-step-status`

Update a specific step's status in a test run

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**
- `--step-index`: Step index (1-based) **(required)**
- `--status`: New status (PASS, FAIL, TODO, etc.) **(required)**

### `jira xray run-defects`

Get defects linked to a test run

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**

### `jira xray run-add-defect`

Add defect(s) to a test run

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**
- `--defect-keys`: Defect issue keys (comma-separated)

### `jira xray run-remove-defect`

Remove a defect from a test run

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**
- `--defect-key`: Defect issue key to remove **(required)**

### `jira xray exec-add-env`

Add test environment(s) to a test execution

- `--exec-key`: Test execution issue key **(required)**
- `--environments`: Environment names (comma-separated)

### `jira xray exec-remove-env`

Remove a test environment from a test execution

- `--exec-key`: Test execution issue key **(required)**
- `--environment`: Environment name to remove **(required)**

### `jira xray run-add-evidence`

Add evidence (attachment) to a test run

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**
- `<files>`: File paths to attach **(required)**

### `jira xray run-remove-evidence`

Remove evidence from a test run by ID

- `--exec-key`: Test execution issue key **(required)**
- `--test-key`: Test issue key **(required)**
- `--evidence-id`: Evidence/attachment ID to remove **(required)**

### `jira jsm desk-list`

List service desks you can access

### `jira jsm request-list`

List customer requests (filter server-side to keep payloads lean)

- `--desk-id`: Restrict to a single service desk (numeric ID)
- `--status`: Request status filter
- `--ownership`: Whose requests to return (JSM defaults to OWNED_REQUESTS). ALL_REQUESTS needs service-desk agent access and lists an entire desk's requests — pair it with --desk-id
- `--search`: Free-text search term
- `--expand`: Comma-separated expansions (e.g. status,sla,requestType,serviceDesk,comment)

### `jira jsm request-get`

Get a single customer request by issue key or ID

- `<key>`: Request issue key or ID (e.g., HELP-42) **(required)**
- `--expand`: Comma-separated expansions (e.g. status,sla,requestType,participant,comment)

### `jira jsm request-create`

Create a customer request (use this for JSM semantics, not issue create)

- `--desk-id`: Service desk ID **(required)**
- `--type-id`: Request type ID **(required)**
- `--summary`: Request summary **(required)**
- `--description`: Request description
- `--fields-json`: Extra request field values as a JSON object, merged into requestFieldValues

### `jira jsm request-comment-list`

List comments on a request

- `<key>`: Request issue key or ID **(required)**
- `--visibility`: Which comments to return (JSM defaults to both public and internal)

### `jira jsm request-comment-add`

Add a comment to a request (write-guarded)

- `<key>`: Request issue key or ID **(required)**
- `--body`: Comment text **(required)**
- `--internal`: Post as an internal comment (agents only; not visible to the customer)

### `jira jsm request-type-list`

List request types (all, or one desk's with --desk-id)

- `--desk-id`: Restrict to a single service desk (numeric ID)

### `jira jsm queue-list`

List queues for a service desk (issue counts only with --include-count)

- `--desk-id`: Service desk ID **(required)**
- `--include-count`: Include the issue count per queue (off by default — counting is costly)

### `jira jsm queue-issues`

List issues in a service desk queue

- `--desk-id`: Service desk ID **(required)**
- `--queue-id`: Queue ID **(required)**

### `jira jsm sla-list`

List SLA records for a request

- `<key>`: Request issue key or ID **(required)**

### `jira jsm approval-list`

List approvals for a request

- `<key>`: Request issue key or ID **(required)**

### `jira jsm transition-list`

List available transitions for a request

- `<key>`: Request issue key or ID **(required)**

### `jira auth login`

Sign in to Atlassian Cloud. Default: validate an email + API token (HTTP Basic) and store both. With --oauth: browser OAuth 2.0 (3LO) sign-in

- `--oauth`: Use the OAuth 2.0 (3LO) browser flow instead of email + API token (#2040)
- `--browser`: Capture the API token via a headed browser instead of pasting it: opens id.atlassian.com/manage/api-tokens, you sign in and click Create, and the token is captured automatically. Still email + token (HTTP Basic); ignored with --oauth

### `jira auth logout`

Clear stored Atlassian Cloud credentials. Default: the email + API token. With --oauth: the stored OAuth (3LO) session

- `--oauth`: Clear the OAuth (3LO) session instead of the email + API token

### `jira auth status`

Show the active Atlassian sign-in: deployment + which auth path is live

### `jira auth setup`

Guided setup of your own Atlassian OAuth (3LO) integration (#2040)

- `--non-interactive`: Print the steps without opening a browser

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--brief` | Brief mode (counts and statuses only). Alias: --summary-only | - |
| `--concise` | Concise mode: drops body/description/content but KEEPS the reference keys the default projection removes, so it can return more than the default | - |
| `--full` | Preserve full API payloads: null-valued fields, plus the reference keys (`self`, `_links`, `avatarUrls`, `iconUrl`, `statusCategory`, `_expandable`) the default projection drops | - |
| `--limit` | Max items to return | 25 |
| `--offset` | Pagination offset | 0 |
| `--page-all` | Fetch all pages automatically (combines results into single response) | - |
| `--page-limit` | Maximum number of pages to fetch with auto-pagination | - |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override Jira server URL | - |
| `--read-only` | Disable all write operations | - |
| `--timeout` | Request timeout in milliseconds (> 0); `[jira]`/`[global]` timeout_ms, else 30000 | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--debug` | Print debug info to stderr | - |
