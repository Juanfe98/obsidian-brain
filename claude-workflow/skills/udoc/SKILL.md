---
name: udoc
version: "1.1.0"
author: AIX Team
scope: global
description: >-
  How to read, edit and build Google Docs, Sheets and Slides content from Claude
  Desktop chat / Cowork (no shell) and from Claude Code / Cursor terminals. In
  chat, the udoc service is an aix-mcp tool reached via aix-mcp:search_tools then
  aix-mcp:run_tool (e.g. udoc_doc_read, udoc_doc_outline, udoc_sheet_read_range,
  udoc_slide_get) — reads work on a connected account; any edit inside a Doc,
  Sheet or Slides deck needs per-service write-mode in the AIX Manager app;
  deleting a file or a comment and removing sharing are a separate destructive
  opt-in. TRIGGER when the user wants to read, summarize, edit, rewrite, restyle,
  comment on or build the content of a Google Doc, Sheet or Slides deck, check a
  slide render, or when a udoc tool reports it is not connected, read-only or
  needs the destructive grant. SKIP for finding, moving or sharing Drive files
  and folders (use gdrive).
keywords:
  - udoc
  - google doc
  - google sheet
  - google slides
  - edit document
  - spreadsheet
  - slide deck
  - doc://
  - aix-mcp
  - write mode
  - destructive
---

# Google Docs, Sheets and Slides content via AIX

AIX exposes udoc to chat/Cowork through the local **aix-mcp** server and to
terminals through the **udoc** CLI. Read the section that matches your surface.
Finding files and managing folders, sharing and Drive search belong to the
**gdrive** skill.

<!-- chat / Cowork: AIX Manager only — never emit a terminal, pat-manager, or aix command on this surface -->
## In Claude Desktop chat / Cowork (no shell)

There is no shell here. The individual `udoc_*` tools are **not** pre-listed:
`tools/list` shows only the meta-tools. Call `aix-mcp:search_tools` to find a
capability, then `aix-mcp:run_tool` to invoke it. Tools are named
`udoc_<command_path>`:

- Docs: `udoc_doc_resolve`, `udoc_doc_read`, `udoc_doc_outline`,
  `udoc_doc_edit_replace`, `udoc_doc_edit_insert`, `udoc_doc_edit_style`,
  `udoc_doc_edit_apply`
- Sheets: `udoc_sheet_describe`, `udoc_sheet_locate`, `udoc_sheet_read_range`,
  `udoc_sheet_write_range`, `udoc_sheet_clear`
- Slides: `udoc_slide_list`, `udoc_slide_get`, `udoc_slide_edit`,
  `udoc_slide_render`

`aix-mcp:cli_guide` with `cli=udoc` returns the chat-safe udoc CLI command
reference.

**Handles.** A `doc://` handle returned by a search or by `udoc_doc_resolve`
passes straight into the read tools.

**Reads work immediately** on a connected account.

**Write mode covers every change inside a Doc, Sheet or Slides deck**, deletes
included: editing, inserting, restyling and replacing text, writing and clearing
sheet ranges (`udoc_sheet_clear`), adding, renaming or deleting sheet tabs
(`udoc_sheet_manage`), deleting a named-range anchor, `udoc_doc_update` and the
three batch-update tools (except the comment and suggestion requests below).
Writes stay hidden until **write mode is on for `udoc`** in **AIX Manager**; it
takes effect on the next request, no restart.
The user can undo these changes from the file's version history in the Google
Docs, Sheets or Slides editor; udoc's own revision restore refuses native Google
files, so do not offer it as the undo.

**The separate destructive opt-in** (**Allow deleting** for udoc in AIX
Manager, on top of write mode) covers only what version history cannot undo:

- deleting a file: `udoc_doc_delete` and `udoc_batch_delete` (they skip the
  Drive trash)
- deleting a comment: `udoc_comment_delete`
- removing a sharing permission: `udoc_share_unset`

Never claim a change was made when the tool refused it.

**Comments and suggestions never go through batch-update.** All three
batch-update tools refuse `deleteComment`, `deleteCommentReply` and
`updateCommentPost` requests under any grant, and `udoc_doc_batch_update` also
refuses `deleteSuggestion` and `rejectSuggestion`. To delete a comment, use
`udoc_comment_delete`, which needs **Allow deleting** and removes the whole
comment with every reply; udoc cannot delete a single reply or edit a comment's
text. To remove or reject a suggestion, ask the user to do it in the Docs editor.

**Removing text.** `udoc_doc_edit_replace` and `udoc_doc_edit_apply` take an
empty `with` and delete the matched text. If `udoc_doc_edit_replace` refuses an
empty `with` as a missing argument (an older aix-mcp), use `udoc_doc_edit_apply`
with `[{"op":"replace","find":"…","with":""}]`. `udoc_slide_edit` refuses an
empty replacement; to remove slide text (not a comment), send an explicit delete
request through `udoc_slide_batch_update`.

**Fix-and-verify loop for slides.** Call `udoc_slide_get` for the current
revision, apply the change with `udoc_slide_edit`, then call `udoc_slide_render`
and look at the returned image to confirm the result. When a write's response
carries a `next_action`, it names the read that shows the write's effect; run
that read with its `udoc_*` tool before moving on.

**Batch-update input.** `doc batch-update`, `sheet batch-update` and
`slide batch-update` all take the JSON body inline as `requests` in the tool call
(up to 4 MiB; aix-mcp pipes it to the declared stdin route). A `file` argument
names a file on the user's computer, which chat cannot create, so do not use it.
Prefer the typed edit tools when one covers the change.

**Bytes in chat.** `doc export` without `output` returns a text format inline as
`content` and any other format as `content_base64`; `doc download` without
`output` returns `content_base64`. `doc upload` takes `content-base64` (up to
2 MiB decoded) plus a `name` and creates a new file. To read a doc's content,
prefer `udoc_doc_read` with `format: markdown` over a PDF export; without
`format` it returns plain text and drops headings, lists and links.

**Global flags.** Only `limit`, `offset`, `fields`, `cursor` and `page-token` pass
through a tool call as global flags. The global `dry-run`, `page-all`,
`page-limit` and `format` are not accepted, so a tool call cannot preview a
write. A command's own `format` field is different: `doc export` requires it,
and `doc read` and `sheet read-range` take it, whenever the tool's input schema
lists it. Before a large or hard-to-check write, tell the user what will change
and get their go-ahead.

**Auth is done ONLY in the AIX Manager desktop app, from Home.** If the tool
reports it is **not connected**, tell the user to open **AIX Manager → Home**,
connect Google, and start a **new Cowork session**.

<!-- Claude Code / Cursor / terminal only -->
## In Claude Code / Cursor (terminal available)

Use the **udoc** CLI directly. For the full command and flag reference, use the
generated **udoc-cli** skill, and `udoc agent schema` for the complete
machine-readable command tree — don't restate commands here.

## Try this

- "Read this Google Doc and give me an outline."
- "Replace 'Q3' with 'Q4' throughout this doc."
- "Fix the title on slide 2, then show me how it renders."
- "Clear the old totals in the Budget sheet and write these in" (enable write
  mode for `udoc` in AIX Manager first).
