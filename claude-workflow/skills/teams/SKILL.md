---
name: teams
version: "1.2.0"
author: AIX Team
description: >-
  How to reach Microsoft Teams from Claude Desktop chat / Cowork (no shell) and
  from Claude Code / Cursor terminals. In chat, Teams is an aix-mcp tool reached
  via aix-mcp:search_tools then aix-mcp:run_tool (e.g. teams_chat_list,
  teams_message_list, teams_meeting_transcript) — reads work immediately on a
  connected account; sending, editing, deleting, or reacting to messages need
  per-service write-mode enabled in the AIX Manager app;
  the grant takes effect on the next request, no restart. In a terminal, use the teams CLI and its
  teams-cli skill / `teams agent schema`. TRIGGER when the user mentions
  Microsoft Teams, a Teams chat/channel/message, posting or replying in Teams, a
  meeting or meeting transcript, presence, or @mentioning someone; or when a
  Teams tool reports it is not connected or read-only.
keywords:
  - teams
  - microsoft teams
  - chat
  - channel
  - message
  - meeting
  - transcript
  - presence
  - mention
  - reply
  - react
  - aix-mcp
  - search_tools
  - run_tool
  - write-mode
  - AIX Manager
  - not connected
---

# Microsoft Teams via AIX

AIX exposes Microsoft Teams to two surfaces. In **Claude Desktop chat / Cowork**
there is **no shell** — Teams is reached as tool calls through the local
**aix-mcp** server. In **Claude Code / Cursor** there is a shell — use the
**`teams` CLI** directly. Pick the section that matches your surface.

<!-- chat / Cowork: AIX Manager only — never emit a terminal, pat-manager, or aix command on this surface -->
## In Claude Desktop chat / Cowork (no shell)

Teams lives behind the single local **aix-mcp** server, which uses **progressive
disclosure**: `tools/list` shows only the **6 meta-tools** — `aix-mcp:search_tools`,
`aix-mcp:run_tool`, `aix-mcp:read_result`, `aix-mcp:activate_tools`,
`aix-mcp:auth_status`, `aix-mcp:cli_guide`. The individual `teams_*` tools are
**not** pre-listed; an empty-looking list is **by design**.

**Reaching Teams:** call `aix-mcp:search_tools` to find the capability, then
`aix-mcp:run_tool` to invoke it. `run_tool` reaches inactive tools without a
`tools/list` refresh — the path that works on Claude Desktop. Tools are named
`teams_<command_path>`, e.g. `teams_chat_list`, `teams_message_list`,
`teams_meeting_transcript`, `teams_search_messages`, `teams_people_search`. Use
`aix-mcp:cli_guide` to pull the chat-safe Teams guide on demand.

**Reads work immediately** on a connected account (list / get / search /
transcript / presence). Common ones:
- List chats; read a chat thread (`teams_message_list` / `teams_message_get`).
- Read channel messages and replies for a team channel, optionally filtered to a time window (a `since`/`until` range, e.g. the last 3 days).
- Search across messages, emails, and channels (`teams_search_messages`).
- List meetings and pull a **meeting transcript** (`teams_meeting_transcript`).
- Look up people (`teams_people_search`) and check **presence**
  (`teams_user_presence` — who's online).

**Auth is done ONLY in the AIX Manager desktop app, from Home.** Never tell a
chat user to run a terminal, `teams auth login`, `pat-manager`, or `aix` command
— it is server-enforced. If Teams is **"not connected"**, point them to **AIX
Manager → Home**, connect, then **start a new Cowork session**.

**Writes are hidden until you opt in, per service.** Message send / edit /
react, channel send / reply, and create-group are gated behind **write-mode for
`teams`**, enabled in **AIX Manager** (or, on the `.mcpb` extension path, **Claude
Desktop → Settings → Extensions → AIX Enterprise Tools**, `write_services`
field). **Deleting a message** is a **separate destructive opt-in**
(`destructive_services`). Approving in AIX Manager makes the grant live on
Claude's **next request — no restart** (a small custom tool set may need one
restart). `teams` is on the chat-writable list, so it can expose writes once
opted in.

So a typical "draft then send" flow: read the thread and draft the reply now;
to actually send it, the user enables `teams` write-mode in AIX Manager — the
grant is live on the next request, no restart — then `run_tool` can reach
`teams_message_send` / `teams_channel_reply`.

<!-- Claude Code / Cursor / terminal only -->
## In Claude Code / Cursor (terminal available)

Use the **`teams` CLI** directly with `--agent` for structured JSON, e.g.
`teams --agent chat list`, `teams --agent message send ...`,
`teams --agent meeting transcript ...`.

- For the **full command / flag reference**, use the generated **`teams-cli`
  skill**, and **`teams agent schema`** (or `--compact`) for the machine-readable
  command tree. Don't restate the command catalogue here.
- **Auth** is `teams auth login` / `teams auth status` / `teams auth refresh` —
  terminal only. Never surface these on the chat / Cowork surface above.

## Try this

- "List my most recent Teams chats and summarize the unread ones."
- "Pull the transcript of my 'Growth Life' sync from yesterday and give me action items."
- "Search Teams for messages mentioning the release cutover this week."
- "Check whether <coworker> is online right now."
- "Draft a reply to the last message in my chat with <person>" (then enable `teams` write-mode in AIX Manager to actually send it).
