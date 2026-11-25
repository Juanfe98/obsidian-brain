---
name: outlook-cli
version: 0.59.0
description: >
  Agent-friendly Microsoft Outlook CLI. Use when user mentions: email, outlook, mail, calendar, inbox, meeting invite, contacts, folder, draft.
metadata:
  generated: true
  requires:
    bins: ["outlook"]
---

# Agent-friendly Microsoft Outlook CLI

## Quick Reference

```bash
# Mail
outlook --agent mail list --limit 10
outlook --agent mail list --filter "isRead eq false"
outlook --agent mail list --folder-id <folder-id> --limit 20
outlook --agent mail get <message-id>
outlook --agent mail get <message-id-1>,<message-id-2>
outlook --agent mail send --to "user@example.com" --subject "Hello" --body "Message"
outlook --agent mail send --to "a@x.com,b@x.com" --cc "c@x.com" --subject "Hi" --body "<b>HTML</b>" --html
outlook --agent mail reply --message-id <id> --body "Thanks!"
outlook --agent mail reply --message-id <id> --body "Thanks all!" --all
outlook --agent mail forward --message-id <id> --to "user@example.com" --comment "FYI"
outlook --agent mail draft --to "user@example.com" --subject "Draft" --body "WIP"
outlook --agent mail draft --to "user@example.com" --subject "Report" --body "<h1>Q3</h1><p>Numbers attached.</p>" --html
outlook --agent mail reply-draft --message-id <id> --body "Thanks!"
outlook --agent mail move --message-id <id> --destination-id <folder-id>
outlook --agent mail move --message-id <id-1>,<id-2> --destination-id <folder-id>
outlook --agent mail mark-read --message-id <id> --read true
outlook --agent mail mark-read --message-id <id-1>,<id-2> --read false
outlook --agent mail flag --message-id <id> --status flagged
outlook --agent mail delete <message-id>

# Calendar
outlook --agent calendar list --days 7 --limit 10
outlook --agent calendar get <event-id>
outlook --agent calendar create --subject "Standup" --start 2026-03-20T10:00:00 --end 2026-03-20T10:30:00 --attendees user@example.com
outlook --agent calendar create --subject "Sync" --start <datetime> --end <datetime> --teams-meeting
outlook --agent calendar respond <event-id> accept
outlook --agent calendar respond <event-id-1>,<event-id-2> accept
outlook --agent calendar respond <event-id> decline --comment "Conflict with another meeting"
outlook --agent calendar respond <event-id> tentative --no-send-response
outlook --agent calendar delete <event-id>

# Folders
outlook --agent folder list
outlook --agent folder list --recursive
outlook --agent folder search --name "Archive"
outlook --agent folder get <folder-id>
outlook --agent folder messages --folder-id <id> --limit 20
outlook --agent folder create --name "Important"
outlook --agent folder create --name "Sub" --parent-id <folder-id>

# Rules
outlook --agent rule list
outlook --agent rule list --resolve-folders
outlook --agent rule get <rule-id>
outlook --agent rule create --display-name "Move Columbia" --move-to-folder <folder-id> --from-contains "columbia"
outlook --agent rule enable <rule-id>
outlook --agent rule disable <rule-id>
outlook --agent rule delete <rule-id>

# Contacts
outlook --agent contact list --limit 20
outlook --agent contact get <contact-id>
outlook --agent contact search --query "John"

# Search
outlook --agent search messages --query "quarterly report"

```

## Authentication

- Method: Microsoft browser token capture (Graph API + Outlook REST fallback, via a CDP-driven Chromium)
- Setup: outlook auth login
- CI and one-off runs can skip the browser by setting OUTLOOK_TOKEN to a Microsoft Graph access token, or by storing one under the `outlook` service in pat-manager.
- By default `outlook auth login` opens an isolated sign-in window. Set AITOOLS_MS_SYSTEM_BROWSER=1 to open your OS default browser instead when a registered/compliant-device requirement is suspected. This changes the browser context, not the corporate network location or egress. The one-time code is copied to your clipboard and printed since that browser cannot be auto-filled.
- Conditional Access error 53003 on `outlook auth login` or a background refresh means Microsoft refused token issuance, but the code alone does not identify the failed criterion. Possible causes include network location or egress, device registration or compliance, and other tenant policy grants. If checking the network branch, use the route only as routing evidence: a `utunX`/tunnel adapter does not prove Entra accepts the public egress, and a local interface does not prove refusal. On macOS run `dscacheutil -flushcache` before `route -n get login.microsoftonline.com`, since a stale resolver cache can mislead the comparison. For the network branch: on a Mac on Prisma, follow steps 6 (turn on the GlobalProtect network extension, which needs Admin on Demand) and 8 (turn off IPv6) of the Prisma Access Troubleshooting page (https://disney-enterprise.atlassian.net/wiki/spaces/mediaeng/pages/1937293157/Prisma+Access+Troubleshooting), reconnect and sign in again. Otherwise sign in over an approved full-tunnel path: ask IT whether your account can get full tunnel on global-connect-me. A ds-connect-me FULL gateway or Backstage Pass works only if you still have access. None of this is proof that Prisma or egress caused this 53003. Changing browsers does not change egress; use the system-browser option only for suspected device context. If it still fails, contact IT to identify the matched policy and include the AADSTS code plus any correlation or request IDs. Teams and Outlook share one Microsoft session, so a successful refresh for one can restore the other.

## Workflows

### Email triage

```bash
outlook --agent mail list --filter "isRead eq false" --limit 10
outlook --agent mail get <message-id-1>,<message-id-2>
outlook --agent mail mark-read --message-id <id-1>,<id-2> --read true
outlook --agent mail flag --message-id <id> --status flagged
```

### Search and reply

```bash
outlook --agent search messages --query "<topic>"
outlook --agent mail get <message-id>
outlook --agent mail reply --message-id <id> --body "<response>"
```

### Calendar management

```bash
outlook --agent calendar list --days 3 --limit 10
outlook --agent calendar get <event-id>
outlook --agent calendar respond <event-id-1>,<event-id-2> accept
outlook --agent calendar create --subject "Follow-up" --start <datetime> --end <datetime> --attendees user@example.com --teams-meeting
```

### Organize with rules

```bash
outlook --agent folder list
outlook --agent folder create --name "Automated"
outlook --agent rule create --display-name "Move newsletters" --move-to-folder <folder-id> --from-contains "newsletter"
outlook --agent rule list --resolve-folders
```

### Forward and file

```bash
outlook --agent mail get <message-id>
outlook --agent mail forward --message-id <id> --to "colleague@example.com" --comment "FYI"
outlook --agent folder list
outlook --agent mail move --message-id <id> --destination-id <folder-id>
```

## Tips

- Always use --agent for structured JSON output
- Use --limit to control response size
- Use --filter for server-side OData filtering (e.g., "isRead eq false", "importance eq 'high'")
- Use `outlook folder list` to discover folder IDs before moving messages
- Use `outlook search messages` for full-text search across all mail
- Use `outlook folder list --recursive` to see all folders with full paths
- Use `outlook rule list --resolve-folders` to see human-readable folder names in rules
- Send/reply/forward auto-falls back to Outlook REST API if Graph token lacks Mail.Send scope
- Use `outlook auth refresh` if token expires mid-session
- Run `outlook agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`outlook --agent mail list --help`); a bare `outlook --agent --help` returns the whole schema
- Pass --html on mail send/reply/draft/reply-draft whenever the body contains markup. The flag is the only thing that sets Graph's body.contentType, and it is never inferred from the body: an HTML body sent without it is stored verbatim as plain text and Outlook shows the tags. The command does say so - it returns the message plus a `warnings[]` entry naming the mismatch - but it still sends what you asked for, so a plain-text mail that quotes HTML source keeps working.
- Read `requestedContentType` on a `mail draft` / `mail reply-draft` receipt to confirm which contentType the draft was written with. Do not read `body.contentType` for that - like every read path, the echoed body is converted to text for display and that field labels the conversion, so it says `text` for an HTML draft. Pass --keep-html to get the stored body back verbatim instead.
- The triage commands `mail get`, `mail move`, `mail mark-read`, and `calendar respond` accept 1-20 comma-separated ids. One id preserves the prior flat response; 2+ ids use one Microsoft Graph `$batch` request. Split larger sets into calls of at most 20.
- On multi-id `mail get`, the response is `{itemCount, failedCount, items[], failed[]}`. On the three multi-id writes it is `{succeededCount, failedCount, succeeded[], failed[]}`. Every failed[] entry is `{id, error, error_code, retryable}`; retry only entries with `retryable: true`. An all-failed batch exits non-zero with the same payload under `details`.
- Multi-id write success entries are command-specific: `mail move` returns `{id, newId}` (use `newId` for follow-up calls because moving re-ids a message), `mail mark-read` returns `{id, read}`, and `calendar respond` returns `{id, status, sendResponse}`.

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| fetch all messages without --limit or --filter | Large result sets waste tokens and may timeout |
| move message without checking folder ID | Wrong destination-id moves to wrong folder — list folders first |
| reply-all without checking recipients | May send to unintended recipients — read the message first |
| create rule without verifying folder exists | Rule creation fails silently if folder-id is invalid |
| combine --offset with --search on `mail list` or `contact search` | Graph rejects $skip beside $search, so the command errors - use `outlook search messages` to page full-text results |
| send or draft an HTML body without --html | contentType is Text, so Outlook renders the tags as literal text - the response carries a warnings[] entry, not a silent downgrade |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `outlook mail list`

List messages in inbox (or a specific folder)

- `--folder-id`: Folder ID (defaults to inbox)
- `--filter`: Filter expression (OData $filter)
- `--order-by`: Sort order (OData $orderby, e.g. "receivedDateTime desc")
- `--select`: Server-side field selection (OData $select, comma-separated)
- `--search`: Keyword search (OData $search)
- `--unread`: Show only unread messages
- `--newest`: Sort newest first (shortcut for --order-by "receivedDateTime desc")
- `--oldest`: Sort oldest first (shortcut for --order-by "receivedDateTime")
- `--flagged`: Show only flagged messages
- `--has-attachments`: Show only messages with attachments
- `--from`: Filter by sender email address

### `outlook mail get`

Get one or more messages by ID

- `<id>`: Message ID, or comma-separated IDs (max 20) **(required)**

### `outlook mail send`

Send a new email

- `--to`: Recipient email address(es), comma-separated **(required)**
- `--subject`: Email subject **(required)**
- `--body`: Email body (plain text) **(required)**
- `--cc`: CC recipient(s), comma-separated
- `--bcc`: BCC recipient(s), comma-separated
- `--html`: Send as HTML instead of plain text
- `--save`: Save to Sent Items (default: true)

### `outlook mail reply`

Reply to a message

- `--message-id`: Message ID to reply to **(required)**
- `--body`: Reply body (plain text) **(required)**
- `--html`: Reply as HTML
- `--all`: Reply-all instead of just sender

### `outlook mail forward`

Forward a message

- `--message-id`: Message ID to forward **(required)**
- `--to`: Recipient email address(es), comma-separated **(required)**
- `--comment`: Optional comment to include

### `outlook mail draft`

Create a draft message

- `--to`: Recipient email address(es), comma-separated **(required)**
- `--subject`: Email subject **(required)**
- `--body`: Email body (plain text) **(required)**
- `--cc`: CC recipient(s), comma-separated
- `--html`: Send as HTML instead of plain text

### `outlook mail reply-draft`

Create a reply draft (threaded, without sending)

- `--message-id`: Message ID to reply to **(required)**
- `--body`: Reply body **(required)**
- `--html`: Reply as HTML
- `--all`: Reply-all instead of just sender

### `outlook mail move`

Move one or more messages to a folder: one id prints the moved message, 2+ comma-separated ids print per-id succeeded[]/failed[] with counts

- `--message-id`: Message ID, or comma-separated IDs (max 20) **(required)**
- `--destination-id`: Destination folder ID **(required)**

### `outlook mail mark-read`

Mark one or more messages as read or unread

- `--message-id`: Message ID, or comma-separated IDs (max 20) **(required)**
- `--read`: Mark as read (default) or pass --read false to mark unread

### `outlook mail flag`

Set the flag status on a message

- `--message-id`: Message ID **(required)**
- `--status`: Flag status: notFlagged, flagged, or complete **(required)**

### `outlook mail delete`

Delete a message (moves to Deleted Items)

- `<id>`: Message ID **(required)**

### `outlook folder list`

List mail folders

- `--parent-id`: Parent folder ID (list children instead of top-level)
- `--recursive`: Recursively list all folders (flat output with paths)

### `outlook folder get`

Get a specific folder

- `<id>`: Folder ID **(required)**

### `outlook folder search`

Search folders by name (recursive)

- `--name`: Search query (case-insensitive substring match) **(required)**

### `outlook folder messages`

List messages in a folder

- `--folder-id`: Folder ID **(required)**
- `--filter`: Filter expression (OData $filter)
- `--order-by`: Sort order (OData $orderby, e.g. "receivedDateTime desc")
- `--select`: Server-side field selection (OData $select, comma-separated)
- `--search`: Keyword search (OData $search)
- `--unread`: Show only unread messages
- `--newest`: Sort newest first (shortcut for --order-by "receivedDateTime desc")
- `--oldest`: Sort oldest first (shortcut for --order-by "receivedDateTime")
- `--flagged`: Show only flagged messages
- `--has-attachments`: Show only messages with attachments
- `--from`: Filter by sender email address

### `outlook folder create`

Create a new folder

- `--name`: Folder display name **(required)**
- `--parent-id`: Parent folder ID (defaults to message root)

### `outlook calendar list`

List calendar events: the next 7 days by default (forward), or an explicit/past window via --since/--until (e.g. this week's meetings)

- `--days`: Days ahead to look (forward window). Mutually exclusive with --since/--until
- `--since`: Window start. ISO date (2026-07-06), datetime (2026-07-06T09:00:00), or relative ("today", "yesterday", "N days ago", "N weeks ago"). May be in the past. Naive values use --timezone when set, otherwise UTC
- `--until`: Window end (same formats as --since). Defaults to now. Requires --since
- `--timezone`: IANA timezone for naive window bounds and response times (e.g. "America/New_York"); falls back to OUTLOOK_CLI_TIMEZONE env
- `--filter`: OData $filter expression (e.g. "showAs eq 'busy'")

### `outlook calendar get`

Get a specific event by ID

- `<id>`: Event ID **(required)**

### `outlook calendar respond`

Respond to one or more calendar invites

- `<id>`: Event ID, or comma-separated IDs (max 20) **(required)**
- `<response>`: Response: accept, decline, or tentative **(required)**
- `--comment`: Optional comment to include with the response
- `--no-send-response`: Do not send response to organizer

### `outlook calendar create`

Create a new event

- `--subject`: Event subject **(required)**
- `--start`: Start datetime (ISO 8601, e.g. 2026-03-20T10:00:00) **(required)**
- `--end`: End datetime (ISO 8601, e.g. 2026-03-20T11:00:00) **(required)**
- `--body`: Event body / description
- `--location`: Location display name
- `--attendees`: Attendee email(s), comma-separated
- `--timezone`: IANA timezone (e.g. "America/New_York"); falls back to OUTLOOK_CLI_TIMEZONE env, then system tz
- `--teams-meeting`: Teams meeting (adds online meeting)
- `--show-as`: Show-as status: free, tentative, busy, oof, workingElsewhere
- `--is-all-day`: Mark as an all-day event
- `--recurrence`: Recurrence pattern: daily, weekly, monthly, yearly
- `--recurrence-interval`: Positive recurrence interval (every N days/weeks/months/years; default 1)
- `--recurrence-days-of-week`: Weekly recurrence days; defaults to the event start weekday
- `--recurrence-end`: Recurrence end date (YYYY-MM-DD); cannot be combined with --recurrence-count
- `--recurrence-count`: Positive occurrence count; cannot be combined with --recurrence-end

### `outlook calendar update`

Update an existing event (PATCH)

- `<id>`: Event ID **(required)**
- `--subject`: New subject
- `--start`: New start datetime (ISO 8601)
- `--end`: New end datetime (ISO 8601)
- `--timezone`: IANA timezone for start/end; falls back to OUTLOOK_CLI_TIMEZONE env, then system timezone
- `--body`: New body content
- `--location`: New location display name
- `--show-as`: Show-as status: free, tentative, busy, oof, workingElsewhere
- `--is-all-day`: Mark as an all-day event (true/false)
- `--importance`: Importance: low, normal, high
- `--sensitivity`: Sensitivity: normal, personal, private, confidential
- `--categories`: Categories (comma-separated)
- `--is-online-meeting`: Enable/disable Teams online meeting
- `--recurrence`: Recurrence pattern: daily, weekly, monthly, yearly
- `--recurrence-interval`: Positive recurrence interval (every N days/weeks/months/years; default 1)
- `--recurrence-days-of-week`: Weekly recurrence days; defaults to the event start weekday
- `--recurrence-end`: Recurrence end date (YYYY-MM-DD); cannot be combined with --recurrence-count
- `--recurrence-count`: Positive occurrence count; cannot be combined with --recurrence-end

### `outlook calendar delete`

Delete an event

- `<id>`: Event ID **(required)**

### `outlook calendar find-meeting-times`

Find available meeting times for attendees

- `--attendees`: Attendee email(s), comma-separated (required) **(required)**
- `--duration`: Meeting duration in ISO 8601 format (e.g. "PT1H", "PT30M"); default PT1H
- `--start`: Start of time window (ISO 8601); defaults to now
- `--end`: End of time window (ISO 8601); defaults to start + 7 days
- `--timezone`: IANA timezone (e.g. "America/New_York"); falls back to OUTLOOK_CLI_TIMEZONE env
- `--max-candidates`: Maximum number of suggestions to return
- `--is-organizer-optional`: Whether the organizer's attendance is optional (excluded from free/busy check)

### `outlook calendar get-schedule`

Get free/busy schedule for one or more users

- `--schedules`: Email address(es) to check, comma-separated **(required)**
- `--start`: Start datetime (ISO 8601) **(required)**
- `--end`: End datetime (ISO 8601) **(required)**
- `--timezone`: IANA timezone (e.g. "America/New_York"); falls back to OUTLOOK_CLI_TIMEZONE env
- `--availability-view-interval`: Availability view interval in minutes (default: 60)

### `outlook contact list`

List contacts

### `outlook contact get`

Get a specific contact

- `<id>`: Contact ID **(required)**

### `outlook contact search`

Search contacts

- `--query`: Search query (name or email) **(required)**

### `outlook rule list`

List all inbox rules

- `--resolve-folders`: Resolve folder IDs to display names in output

### `outlook rule get`

Get a specific rule by ID

- `<id>`: Rule ID **(required)**

### `outlook rule create`

Create a new inbox rule

- `--name`: Rule display name **(required)**
- `--sequence`: Sequence number (priority order)
- `--enabled`: Enable the rule (default: true)
- `--move-to`: Move matching messages to this folder ID
- `--stop-processing`: Stop processing more rules after this one matches
- `--from-contains`: Condition: sender contains (comma-separated)
- `--subject-contains`: Condition: subject contains (comma-separated)
- `--body-contains`: Condition: body contains (comma-separated)
- `--from-addresses`: Condition: sender email addresses (comma-separated)
- `--mark-read`: Action: mark as read
- `--importance`: Action: mark importance (low, normal, high)
- `--forward-to`: Action: forward to these addresses (comma-separated)
- `--delete`: Action: delete the message
- `--permanent-delete`: Action: permanently delete (bypass Deleted Items)
- `--json`: Full rule JSON body (overrides all other flags)

### `outlook rule update`

Update an existing inbox rule

- `<id>`: Rule ID **(required)**
- `--name`: Rule display name
- `--sequence`: Sequence number (priority order)
- `--move-to`: Move matching messages to this folder ID
- `--stop-processing`: Stop processing more rules after this one matches
- `--from-contains`: Condition: sender contains (comma-separated, replaces existing)
- `--subject-contains`: Condition: subject contains (comma-separated, replaces existing)
- `--body-contains`: Condition: body contains (comma-separated, replaces existing)
- `--from-addresses`: Condition: sender email addresses (comma-separated, replaces existing)
- `--mark-read`: Action: mark as read
- `--importance`: Action: mark importance (low, normal, high)
- `--forward-to`: Action: forward to these addresses (comma-separated, replaces existing)
- `--delete`: Action: delete the message
- `--permanent-delete`: Action: permanently delete (bypass Deleted Items)
- `--json`: Full rule JSON body (overrides all other flags)

### `outlook rule delete`

Delete an inbox rule

- `<id>`: Rule ID **(required)**

### `outlook rule enable`

Enable an inbox rule

- `<id>`: Rule ID **(required)**

### `outlook rule disable`

Disable an inbox rule

- `<id>`: Rule ID **(required)**

### `outlook search messages`

Search emails (full-text)

- `--query`: Search query **(required)**
- `--order-by`: Sort order (e.g. "receivedDateTime desc")

### `outlook auth login`

Log in to Microsoft (interactive browser sign-in). By default opens an isolated sign-in window. Set AITOOLS_MS_SYSTEM_BROWSER=1 to open your OS default browser instead when Conditional Access requires a registered device the isolated profile can't present. This does not change network egress; location-based policy still requires login.microsoftonline.com through an approved company network path. The code is still copied to your clipboard and printed for manual entry

- `--login-events`: Stream machine-readable NDJSON login events on stdout (consumed by the AIX Manager desktop app). Also enabled by the AIX_MANAGER env

### `outlook auth refresh`

Refresh session tokens (pure HTTP)

- `--force`: Force refresh even if current token is still valid

### `outlook auth logout`

Clear the shared Microsoft/Copilot session and browser profile

### `outlook auth status`

Show current authentication status

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--summary` | Summary mode (counts and statuses only). Alias: --brief | - |
| `--concise` | Concise mode: all fields except body/description/content | - |
| `--full` | Preserve full API payloads, including null-valued fields | - |
| `--limit` | Max items to return, at most 50 (larger values are clamped with a warning) | 25 |
| `--offset` | Pagination offset | 0 |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override Microsoft Graph API URL | - |
| `--read-only` | Disable all write operations | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--timeout` | Request timeout in milliseconds (> 0); `[outlook]`/`[global]` timeout_ms, else 30000 | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--keep-html` | Preserve raw HTML in body/content fields (default: convert to text) | - |
| `--max-body` | Truncate body/content fields to N characters (adds "body_truncated": true) | - |
| `--debug` | Print debug info to stderr | - |
