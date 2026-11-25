---
name: confluence
version: "1.1.0"
author: AIX Team
description: >-
  How to reach Confluence wiki content from Claude Desktop chat / Cowork (no
  shell) and from Claude Code / Cursor terminals. In chat, Confluence is an
  aix-mcp tool reached via aix-mcp:search_tools then aix-mcp:run_tool (e.g.
  confluence_search_query with CQL, confluence_page_get, confluence_page_tree,
  confluence_space_list) — searching, reading pages, browsing spaces and page
  trees, and listing comments/labels/attachments work immediately on a
  connected account; creating or updating pages, adding comments, changing
  labels, or uploading attachments need per-service write-mode in the AIX
  Manager app (takes effect on the next request, no restart); deleting a page
  is a separate destructive opt-in. In a terminal, use the confluence CLI and
  its confluence-cli skill / `confluence agent schema`. TRIGGER when the user
  mentions Confluence, a wiki page, a space, docs or a knowledge base, CQL,
  page content, or finding/reading/writing a doc; or when a Confluence tool
  reports it is not connected or read-only.
keywords:
  - confluence
  - wiki
  - page
  - space
  - cql
  - documentation
  - knowledge base
  - page tree
  - comment
  - label
  - attachment
  - aix-mcp
  - cowork
  - storage format
  - write-mode
---

# Confluence via AIX

The same Confluence service is reached two different ways depending on where you
are running. **In Claude Desktop chat / Cowork there is no shell** — Confluence
is a tool on the local **aix-mcp** server. **In Claude Code / Cursor** you have a
terminal and use the **`confluence` CLI**. Pick the section for your surface.

<!-- chat / Cowork: AIX Manager only — never emit a terminal, pat-manager, or aix command on this surface -->
## In Claude Desktop chat / Cowork (no shell)

Confluence is reached through the single local **aix-mcp** server, which uses
**progressive disclosure**: `tools/list` shows only the 6 meta-tools
(`aix-mcp:search_tools`, `aix-mcp:run_tool`, `aix-mcp:read_result`,
`aix-mcp:activate_tools`, `aix-mcp:auth_status`, `aix-mcp:cli_guide`). The
individual `confluence_*` tools are **not** pre-listed — an empty-looking list is
**by design**.

**The pattern:** call `aix-mcp:search_tools` to find the capability, then
`aix-mcp:run_tool` to invoke it. `run_tool` reaches inactive tools without a
`tools/list` refresh — this is the path that works on Claude Desktop. Tools are
named `confluence_<command_path>`, e.g. `confluence_search_query`,
`confluence_page_get`, `confluence_page_get_by_title`, `confluence_page_tree`,
`confluence_space_list`, `confluence_comment_list`.

### Reads work immediately on a connected account

**One Atlassian deployment at a time.** Disney runs two Confluence sites,
Atlassian Cloud (`*.atlassian.net`, the default) and Data Center
(`confluence.disney.com`), and they hold different pages on similar topics. This
surface is bound to whichever one AIX is configured for and cannot switch per
call, so a search that comes back short or empty may simply be pointed at the
other one. Say that rather than reporting that nothing exists;
`confluence_search_query` carries the same note on the tool itself.

- **Search (CQL):** `confluence_search_query`. Quick hints: `space=ENG AND
  type=page`, `text~"on-call runbook"`. For the full CQL syntax and recipe set,
  fetch the chat-safe guide via `aix-mcp:cli_guide` (service `confluence`).
- **Read a page:** `confluence_page_get` by id, or `confluence_page_get_by_title`
  by space + title.
- **Browse structure:** `confluence_page_tree` to walk children, and
  `confluence_space_list` to list visible spaces.
- **Page metadata:** list versions and compare them, plus
  `confluence_comment_list`, label list, and attachment list.

### Auth — AIX Manager only
If Confluence reports it is **not connected**, tell the user to open the **AIX
Manager** desktop app → **Home**, connect Confluence, then **start a new
Cowork session**. Never tell a chat user to run a terminal, `pat-manager`, or any
`aix` command — auth on this surface is the app's job.

### Writes are hidden until you opt in
Confluence is **chat_writable**, but writes are **off by default**. Page
create / update / create-from-template, comment add, label add/remove, and
attachment upload appear only once **per-service write-mode** is enabled for
`confluence` in **AIX Manager** (on the `.mcpb` extension path: Claude Desktop →
Settings → Extensions → AIX Enterprise Tools, `write_services`). **Page delete is
a separate destructive opt-in** (`destructive_services`). Approving in AIX
Manager makes the grant live on Claude's **next request — no restart** (a small
custom tool set may need one restart).

Note: page bodies use Confluence **storage format** (HTML-like), and a page
update **replaces the whole body** — always **read the page first** so an edit
preserves the existing content.

<!-- Claude Code / Cursor / terminal only -->
## In Claude Code / Cursor (terminal available)

Use the **`confluence` CLI** directly, e.g. `confluence --agent search query
--cql ...`, `confluence --agent page get <id>`.

For the full command/flag reference, the complete CQL recipe set, and the
workflow recipes, see the generated **`confluence-cli`** skill, or run
**`confluence agent schema`** for the machine-readable command tree — don't
restate those here.

**Terminal auth:** Cloud is the default (`confluence` →
`https://disney-enterprise.atlassian.net`): `pat-manager login confluence` runs
the fully-automatic browser sign-in (creates and stores the Cloud API token and
account email — no paste), or run `confluence auth login` (manual email + API
token, HTTP Basic) / `confluence auth login --oauth` (OAuth 2.0 3LO) as
fallbacks. Data Center (`confluence.disney.com`) is demoted but still reachable
from a terminal via `CONFLUENCE_SERVER` / `--server` (chat / Cowork is pinned to
one site and has no per-call equivalent); authenticate it with
`pat-manager login confluence --dc` (browser SSO) or
`pat-manager set confluence <token>`, or set a `CONFLUENCE_TOKEN` env var. (Auth
this way belongs to the terminal only — never on the chat surface above.)

## Try this
- "Search Confluence for the on-call runbook and read it to me."
- "Show me the page tree under the <space> team space, depth 2."
- "Find pages I edited in the last week" (CQL: `creator=currentUser() AND
  lastModified>now("-7d")`).
- "What comments and labels are on page <id>?"
- "Draft an update to this page's overview section" (enable write-mode in AIX
  Manager to publish it).
