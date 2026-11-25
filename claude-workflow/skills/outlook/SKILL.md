---
name: outlook
version: "1.1.0"
author: AIX Team
description: >-
  How to reach Microsoft Outlook mail and calendar from Claude Desktop chat /
  Cowork (no shell) and from Claude Code / Cursor terminals. In chat, Outlook is
  an aix-mcp tool reached via aix-mcp:search_tools then aix-mcp:run_tool (e.g.
  outlook_mail_list, outlook_mail_get, outlook_calendar_list,
  outlook_search_messages) — reading inbox, searching mail, listing folders, and
  viewing calendar work immediately on a connected account; sending, replying,
  forwarding, moving, flagging, creating events, or making inbox rules need
  per-service write-mode in the AIX Manager app (takes effect on the next
  request, no restart); deleting is a separate destructive opt-in. In a terminal, use the
  outlook CLI and its outlook-cli skill / `outlook agent schema`. TRIGGER when
  the user mentions email, Outlook, their inbox, a mail message, sending /
  replying / forwarding mail, calendar / meetings / invites, folders, drafts,
  contacts, or inbox rules; or when an Outlook tool reports it is not connected
  or read-only.
keywords:
  - outlook
  - email
  - mail
  - inbox
  - calendar
  - meeting invite
  - reply
  - forward
  - send email
  - folder
  - draft
  - contacts
  - inbox rule
  - aix-mcp
  - write mode
  - microsoft
---

# Microsoft Outlook via AIX

AIX exposes Outlook mail and calendar to chat/Cowork through the local
**aix-mcp** server and to terminals through the **outlook** CLI. The two
surfaces are reached differently — read the section that matches yours.

<!-- chat / Cowork: AIX Manager only — never emit a terminal, pat-manager, or aix command on this surface -->
## In Claude Desktop chat / Cowork (no shell)

There is no shell here. Outlook is reached through the single local **aix-mcp**
server, which uses **progressive disclosure**: `tools/list` shows only the six
meta-tools — `aix-mcp:search_tools`, `aix-mcp:run_tool`, `aix-mcp:read_result`,
`aix-mcp:activate_tools`, `aix-mcp:auth_status`, `aix-mcp:cli_guide`. The
individual `outlook_*` tools are **not** pre-listed; the empty-looking list is
by design.

**The pattern:** call `aix-mcp:search_tools` to find the capability, then
`aix-mcp:run_tool` to invoke it (`run_tool` reaches inactive tools without a
`tools/list` refresh — the path that works on Claude Desktop). Tools are named
`outlook_<command_path>`, e.g. `outlook_mail_list`, `outlook_mail_get`,
`outlook_search_messages`, `outlook_calendar_list`, `outlook_folder_list`.
`aix-mcp:cli_guide` fetches the chat-safe Outlook guide on demand.

**Reads work immediately** on a connected account:
- List/triage the inbox (filter unread, flagged, or from a sender), get a single
  message, full-text search messages.
- List folders and a folder's messages.
- List upcoming calendar events and get one; list contacts and inbox rules.

**Auth is done ONLY in the AIX Manager desktop app, from Home.** If Outlook
reports it is **not connected**, tell the user to open **AIX Manager → Home**,
connect Outlook, and start a **new Cowork session**. Never tell a chat user to
run a terminal, `pat-manager`, or `aix` command — that is server-enforced.

**Writes are hidden until you opt in.** Sending, replying, forwarding,
drafting, moving, marking read, and flagging mail; creating events and
responding to invites; creating folders; and creating / updating / enabling /
disabling inbox rules are exposed only after **per-service write-mode is on for
`outlook`** in **AIX Manager** (on the `.mcpb` extension path: Claude Desktop →
Settings → Extensions → AIX Enterprise Tools → `write_services`). **Deleting**
mail/events and **deleting inbox rules** are a **separate destructive opt-in**
(`destructive_services`). Approving in AIX Manager makes the grant live on
Claude's **next request — no restart** (a small custom tool set may need one
restart). `outlook` is chat-writable.

<!-- Claude Code / Cursor / terminal only -->
## In Claude Code / Cursor (terminal available)

Use the **outlook** CLI directly (e.g. `outlook --agent mail list`,
`outlook --agent mail send`). For the full command and flag reference, use the
generated **outlook-cli** skill, and `outlook agent schema` for the complete
machine-readable command tree — don't restate commands here.

Terminal auth is `outlook auth login` / `outlook auth status` /
`outlook auth refresh` (Microsoft browser token capture). This belongs to the
terminal only — never surface it in the chat section above.

## Try this

- "Summarize my unread Outlook email from today."
- "Find the latest email from <person> about the budget and show me the thread."
- "What meetings do I have tomorrow?"
- "Draft a reply to this message thanking them and proposing Thursday" (enable
  write-mode in AIX Manager to send it).
- "Search my mail for the quarterly report and tell me which folder it's in."
