---
name: gdrive
version: "1.2.0"
author: AIX Team
description: >-
  How to reach Google Drive from Claude Desktop chat / Cowork (no shell) and from
  Claude Code / Cursor terminals. In chat, Google Drive is an aix-mcp tool reached
  via aix-mcp:search_tools then aix-mcp:run_tool (e.g. gdrive_search_query,
  gdrive_read_metadata, gdrive_read_content, gdrive_folder_list) — searching
  files, listing folders and shared drives, and reading or exporting
  Doc/Sheet/Slide content work immediately on a connected account; creating,
  uploading, copying, moving, renaming, starring, or sharing files need
  per-service write-mode in the AIX Manager app (takes effect on the next
  request, no restart); deleting is a separate destructive opt-in. In a terminal, use the gdrive CLI
  and its gdrive-cli skill. TRIGGER when the user mentions Google Drive, a Google
  Doc / Sheet / Slide, a drive file or folder, shared drives, uploading,
  downloading, exporting, sharing, or starring a file, or finding a document in
  Drive; or when a Google Drive tool reports it is not connected or read-only.
keywords:
  - gdrive
  - google drive
  - drive
  - google doc
  - google sheet
  - google slides
  - file
  - folder
  - shared drive
  - upload
  - download
  - export
  - share file
  - starred
  - aix-mcp
  - write mode
  - google
---

# Google Drive via AIX

AIX exposes Google Drive to chat/Cowork through the local **aix-mcp** server and
to terminals through the **gdrive** CLI. The two surfaces are reached
differently — read the section that matches yours.

<!-- chat / Cowork: AIX Manager only — never emit a terminal, pat-manager, or aix command on this surface -->
## In Claude Desktop chat / Cowork (no shell)

There is no shell here. Google Drive is reached through the single local
**aix-mcp** server, which uses **progressive disclosure**: `tools/list` shows
only the six meta-tools — `aix-mcp:search_tools`, `aix-mcp:run_tool`,
`aix-mcp:read_result`, `aix-mcp:activate_tools`, `aix-mcp:auth_status`,
`aix-mcp:cli_guide`. The individual `gdrive_*` tools are **not** pre-listed; the
empty-looking list is by design.

**The pattern:** call `aix-mcp:search_tools` to find the capability, then
`aix-mcp:run_tool` to invoke it (`run_tool` reaches inactive tools without a
`tools/list` refresh — the path that works on Claude Desktop). Tools are named
`gdrive_<command_path>`, e.g. `gdrive_search_query`, `gdrive_search_recent`,
`gdrive_read_metadata`, `gdrive_read_content`, `gdrive_folder_list`.
`aix-mcp:cli_guide` fetches the chat-safe Google Drive guide on demand.

**Reads work immediately** on a connected account:
- Search Drive — by name/query, recent, starred, or shared-with-me.
- Read a file's metadata and read or export its content (Google Docs, Sheets,
  and Slides export to PDF/Office formats).
- List a folder's contents and list shared drives.

**Auth is done ONLY in the AIX Manager desktop app, from Home.** If Google Drive
reports it is **not connected**, tell the user to open **AIX Manager → Home**,
connect Google Drive, and start a **new Cowork session**. Never tell a chat user
to run a terminal, `pat-manager`, or `aix` command — that is server-enforced.

**A not-found or access-denied on a file the user can open in their browser is
usually the wrong Google account.** Drive answers not-found for a file the
signed-in account cannot see, so the identity, not the ID, is the likely cause —
the Google account migration moved people to `@disney.com`, and the file may be
shared with the account that is not connected. The error names the account the
request ran as: compare it with the account that has the file, then tell the user
to open **AIX Manager → Home**, sign in to Google Drive and Docs again with that
account, and start a **new Cowork session**.

**Writes are hidden until you opt in.** Creating files, uploading, updating a
file's content, copying, moving, renaming, starring/unstarring, and sharing
files are exposed only after
**per-service write-mode is on for `gdrive`** in **AIX Manager** (on the `.mcpb`
extension path: Claude Desktop → Settings → Extensions → AIX Enterprise Tools →
`write_services`). **Deleting** files is a **separate destructive opt-in**
(`destructive_services`). Approving in AIX Manager makes the grant live on
Claude's **next request — no restart** (a small custom tool set may need one
restart). `gdrive` is chat-writable.

**Revise a shared Markdown file in place.** People can edit and comment on a
`.md` file in Google Docs without converting it. To change one, use
`gdrive_file_update` (the file id plus a local file path, like
`gdrive_file_upload`): the file keeps its id, name, folder, comments, and
revision history. Uploading again creates a second copy, and people's edits and
comments stay on the original. Keep a `.md` unconverted when it lives in git or
an agent maintains it. Use `gdrive_file_upload` with `convert-to: docs` only
when someone wants a real Google Doc; conversion leaves no `.md` behind.

<!-- Claude Code / Cursor / terminal only -->
## In Claude Code / Cursor (terminal available)

Use the **gdrive** CLI directly (e.g. `gdrive --agent search query`,
`gdrive --agent read content <id>`, `gdrive --agent file upload`). For the full
command and flag reference, use the generated **gdrive-cli** skill, and
`gdrive agent schema` for the complete machine-readable command tree — don't
restate commands here.

Terminal auth is `gdrive auth login` / `gdrive auth status` /
`gdrive auth logout` (Google browser OAuth; `gdrive auth setup` configures your
own OAuth client). This belongs to the terminal only — never surface it in the
chat section above.

## Try this

- "Search my Google Drive for the Q4 planning doc and show me the highlights."
- "What did I edit in Drive this week?"
- "Export this Google Doc to PDF and summarize it."
- "List what's in my 'Designs' shared drive."
- "Share this doc with <person> as a commenter" (enable write-mode for gdrive in
  AIX Manager first).
