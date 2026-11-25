---
name: gdrive-cli
version: 0.59.0
description: >
  Agent-friendly Google Drive CLI. Use when user mentions: google drive, gdrive, files, docs, sheets, drive.
metadata:
  generated: true
  requires:
    bins: ["gdrive"]
---

# Agent-friendly Google Drive CLI

## Quick Reference

```bash
# Search
gdrive --agent search query --query "name contains 'report'" --limit 10
gdrive --agent search recent --limit 10
gdrive --agent search starred --limit 10
gdrive --agent search shared-with-me --limit 10

# Read
gdrive --agent read metadata abc123
gdrive --agent read content abc123

# File Operations
gdrive --agent file create --name "Notes" --mime-type application/vnd.google-apps.document
gdrive --agent file upload --path ./report.pdf --name "Q4 Report" --parent folder123
gdrive --agent file update abc123 --path ./notes.md
gdrive --agent file download abc123 --output ./report.pdf
gdrive --agent file export abc123 --mime-type application/pdf --output ./doc.pdf
gdrive --agent file copy abc123 --name "Copy of Doc"
gdrive --agent file move abc123 --to folder456
gdrive --agent file rename abc123 --name "New Name"
gdrive --agent file trash abc123
gdrive --agent file restore abc123
gdrive --agent file star abc123
gdrive --agent file unstar abc123

# Folders
gdrive --agent folder list --id root
gdrive --agent folder shared-drives --limit 10

# Sharing
gdrive --agent share share --id abc123 --email user@example.com --role writer

# Storage
gdrive --agent storage quota

```

## Authentication

- Method: Google OAuth browser login (auto)
- Setup: gdrive agent health  # triggers OAuth flow on first use

## Drive Query Syntax

Applies to: --query flag on search commands

```
# Name contains
name contains 'report'

# By MIME type
mimeType = 'application/vnd.google-apps.document'

# Modified after date
modifiedTime > '2024-01-01T00:00:00'

# In specific folder
'folder_id' in parents

# Owned by me
'me' in owners

# In trash (list what `file restore` can bring back)
trashed = true

```

## Workflows

### Find and Share

```bash
gdrive --agent search query --query "name contains 'quarterly'" --limit 5
gdrive --agent read metadata <file_id>
gdrive --agent share share --id <file_id> --email user@example.com --role reader
```

### Upload and Organize

```bash
gdrive --agent folder list --id root
gdrive --agent file upload --path ./report.pdf --name "Q4 Report" --parent <folder_id>
gdrive --agent file star <file_id>
```

### Co-edit Markdown with Docs Users

```bash
gdrive --agent file upload --path ./notes.md --parent <folder_id>
gdrive --agent read content <file_id>
gdrive --agent file update <file_id> --path ./notes.md
```

### Export Google Doc

```bash
gdrive --agent search query --query "name = 'Design Doc'" --limit 5
gdrive --agent file export <file_id> --mime-type application/pdf --output ./design-doc.pdf
```

## Tips

- Always use --agent for structured JSON output
- Use --limit to control response size (default 25)
- Use --fields to select only needed fields for token efficiency
- Prefer search query over listing entire folders
- Search and folder listings include shared-drive items and leave out trashed files; to see the trash, name `trashed` in `search query --query` (e.g. `trashed = true`)
- Remove a file with `file trash <id>`, which `file restore <id>` undoes; Drive empties the trash after 30 days. `file delete` is permanent and skips the trash
- Use file export for Google Workspace files (Docs, Sheets, Slides) — not download
- Use page tokens for navigating large result sets
- For editing document content (Doc body, Sheet cells, Slides), use the udoc CLI. gdrive handles files and metadata only.
- Keep a .md unconverted when it lives in git or an agent maintains it: Docs users can edit and comment on it as Markdown. Revise it with `file update <id> --path`, and use `--convert-to docs` only when someone wants a real Google Doc
- Run `gdrive agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`gdrive --agent search query --help`); a bare `gdrive --agent --help` returns the whole schema

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| download Google Workspace file directly | Use export with --mime-type instead — native Google formats require conversion |
| edit a Google Doc, Sheet, or Slides body with gdrive | gdrive handles files and metadata only (create, copy, move, rename, share, export); it cannot write document content. Use udoc for content: doc update --body, sheet write-range, slide add. |
| file upload to revise a file that already exists in Drive | upload always creates a second file, and people's edits and comments stay on the original. Use `file update <id> --path` to replace the content in place |
| file upload --convert-to docs for a .md kept in git or maintained by an agent | Conversion turns it into a Google Doc and leaves no .md, so the file can no longer round-trip. Upload it unconverted and revise it with `file update` |
| file delete to remove a file someone may want back | Drive deletes it permanently, skipping the trash, and nothing restores it. Use `file trash <id>`; `file restore <id>` brings it back |
| folder list without --limit | May return thousands of files, wasting tokens |
| search without --limit | Large result sets waste tokens and may timeout |
| read-content --file-id <id> or file read-content <id> | Neither exists — the command is `read content <id>` (positional id, not under `file`, no hyphen) |
| gdrive --agent schema or gdrive --agent api ... | Neither exists — the full command/flag reference is the separate subcommand `gdrive agent schema` (no leading --agent) |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `gdrive file create`

Create a new file (metadata-only)

- `--name`: File name **(required)**
- `--mime-type`: MIME type
- `--parent`: Parent folder ID

### `gdrive file upload`

Upload a file

- `--path`: Local file path **(required)**
- `--name`: File name in Drive
- `--parent`: Parent folder ID
- `--convert-to`: Convert on import to a native Google Workspace file (Drive does the conversion): slides (.pptx), docs (.docx/.md), or sheets (.xlsx/.csv). Omit to store the bytes verbatim. Leave a .md unconverted when it lives in git or an agent maintains it (revise it with `file update`); use docs only when someone wants a real Google Doc

### `gdrive file update`

Replace an existing file's content in place, keeping its id, name, parents, comments, and revision history

- `<id>`: File ID **(required)**
- `--path`: Local file whose bytes become the new content **(required)**

### `gdrive file download`

Download a file

- `<id>`: File ID **(required)**
- `--output`: Output path **(required)**

### `gdrive file export`

Export a Google Workspace file to a different format

- `<id>`: File ID **(required)**
- `--mime-type`: Export MIME type (e.g., application/pdf) **(required)**
- `--output`: Output file path (required for binary formats like PDF)

### `gdrive file delete`

Permanently delete a file, skipping the Drive trash; prefer `file trash`

- `<id>`: File ID **(required)**

### `gdrive file copy`

Copy a file

- `<id>`: File ID **(required)**
- `--name`: New name
- `--parent`: Target folder ID

### `gdrive file move`

Move a file to a different folder

- `<id>`: File ID **(required)**
- `--to`: New parent folder ID **(required)**
- `--from`: Parent folder to remove (default: every current parent except --to)

### `gdrive file rename`

Rename a file

- `<id>`: File ID **(required)**
- `--name`: New name **(required)**

### `gdrive file star`

Star a file

- `<id>`: File ID **(required)**

### `gdrive file unstar`

Unstar a file

- `<id>`: File ID **(required)**

### `gdrive file trash`

Move a file to the Drive trash, where `file restore` can bring it back

- `<id>`: File ID **(required)**

### `gdrive file restore`

Restore a file from the Drive trash (for file content history see `revision restore`)

- `<id>`: File ID **(required)**

### `gdrive search query`

Search files by query

- `--query`: Search query (Drive query syntax) **(required)**
- `--page-token`: Page token for pagination

### `gdrive search recent`

List recently modified files

- `--page-token`: Page token for pagination

### `gdrive search starred`

List starred files

- `--page-token`: Page token for pagination

### `gdrive search shared-with-me`

List files shared with me

- `--page-token`: Page token for pagination

### `gdrive read content`

Read file content

- `<id>`: File ID **(required)**

### `gdrive read metadata`

Get file metadata

- `<id>`: File ID **(required)**

### `gdrive folder list`

List folder contents

- `--id`: Folder ID (use "root" for root folder)
- `--page-token`: Page token for pagination

### `gdrive folder create`

Create a new folder

- `--name`: Folder name **(required)**
- `--parent`: Parent folder ID

### `gdrive folder shared-drives`

List shared drives

- `--page-token`: Page token for pagination

### `gdrive share get-permissions`

Get permissions for a file

- `<id>`: File ID **(required)**

### `gdrive share share`

Share a file with a user

- `--id`: File ID **(required)**
- `--email`: Email address **(required)**
- `--role`: Role: reader, commenter, writer, organizer, file-organizer (alias fileOrganizer)

### `gdrive share unshare`

Remove a permission

- `--id`: File ID **(required)**
- `--permission-id`: Permission ID **(required)**

### `gdrive share create-link`

Create a public sharing link

- `--id`: File ID **(required)**
- `--role`: Role: reader, commenter, writer

### `gdrive comment list`

List comments on a file

- `<id>`: File ID **(required)**
- `--page-token`: Page token for pagination

### `gdrive comment get`

Get a single comment

- `--id`: File ID **(required)**
- `<comment_id>`: Comment ID **(required)**

### `gdrive comment add`

Add a comment to a file

- `--id`: File ID **(required)**
- `--content`: Comment content **(required)**

### `gdrive comment delete`

Delete a comment

- `--id`: File ID **(required)**
- `<comment_id>`: Comment ID **(required)**

### `gdrive comment resolve`

Resolve a comment

- `--id`: File ID **(required)**
- `<comment_id>`: Comment ID **(required)**

### `gdrive comment reopen`

Reopen a resolved comment

- `--id`: File ID **(required)**
- `<comment_id>`: Comment ID **(required)**

### `gdrive revision list`

List revisions of a file

- `<id>`: File ID **(required)**
- `--page-token`: Page token for pagination

### `gdrive revision get`

Get revision metadata

- `--id`: File ID **(required)**
- `<revision_id>`: Revision ID **(required)**

### `gdrive revision restore`

Restore a file to a specific revision

- `--id`: File ID **(required)**
- `--revision`: Revision ID **(required)**

### `gdrive storage quota`

Get storage quota information

### `gdrive auth login`

Log in to Google via browser OAuth (covers Drive, Docs, Sheets, Slides)

### `gdrive auth logout`

Revoke Google access and clear stored tokens

### `gdrive auth status`

Show current Google authentication status

### `gdrive auth setup`

Set up your own Google OAuth client (escapes the shared-client user cap)

- `--client-secret-file`: Path to a downloaded client_secret JSON (skips auto-import from ~/Downloads)
- `--project`: Reuse an existing GCP project (deep-links straight to client creation in it instead of opening the New Project page)
- `--non-interactive`: Print the steps without opening a browser or waiting for a download

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--summary` | Summary mode (counts and statuses only). Alias: --brief | - |
| `--concise` | Concise mode: all fields except body/description/content | - |
| `--full` | Preserve full API payloads, including null-valued fields | - |
| `--limit` | Max items to return (Google Drive accepts 1..=1000) | 25 |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override server URL | - |
| `--read-only` | Disable all write operations (--dry-run still previews them) | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--timeout` | Request timeout in milliseconds (> 0); `[gdrive]`/`[global]` timeout_ms, else 30000 | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--debug` | Print debug info to stderr | - |
