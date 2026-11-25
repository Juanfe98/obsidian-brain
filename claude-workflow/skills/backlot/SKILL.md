---
name: backlot
description: >
  Publish, version, and manage Backlot creations — static sites, Rive
  animations, images, and videos shared internally at Disney. Use when the
  user says "share to Backlot", "publish my site", "remix this creation",
  "make this roadmap editable", "add a status to each milestone", or asks
  about uploading visual work to a shareable URL.
roles:
  - design
version: "0.1.3"
author: Disney Design Technology
keywords:
  - backlot
  - publishing
  - creations
  - static-sites
  - rive
  - design
  - sharing
  - dynamic-data
  - mcp
---

# Backlot

Backlot is Disney's design-publishing platform. Designers and engineers ship
static sites, Rive animations, images, and videos through their editor (Claude
Code, Cursor, VS Code — the surfaces that can reach a Disney-internal endpoint;
see design-tools-in-cowork for why Cowork cannot) and get a permanent shareable
URL with version history, optional collaborators, and a built-in per-Creation
key-value store for stateful UIs.

The MCP server lives at <https://mcp.design.twdc.com/mcp> (OAuth via Disney
SSO; tokens cached in the OS keychain). The web app and docs live at
<https://design.twdc.com>.

## When to use this

Trigger this skill when the user wants to:

- **Publish something** — "share this site", "upload this image", "post my
  Rive animation", "publish my Figma export to Backlot".
- **Update a published Creation** — "ship a new version", "replace the
  content", "roll back to v2".
- **Manage metadata** — change title, description, visibility (public /
  private), or write-mode (owners only / anyone signed in).
- **Collaborate** — invite a teammate, remove a collaborator, list who can
  edit.
- **Remix** — fork someone else's public Creation into your own space.
- **Make a Creation stateful** — "let me click to update each milestone",
  "save votes on this page", "remember toggle state".
- **Find work** — list the user's own Creations, look up a Creation by id or
  by username/slug.

## How it's organized

Each Backlot Creation has:

- `id` — UUID assigned at create time.
- `title`, `description`, `slug` — metadata. Slug is unique per user.
- `type` — `image`, `video`, `html`, or `rive`.
- `visibility` — `public` (in the feed, remixable by others) or `private`
  (owner-only).
- `writeMode` — `owners` (default; only owner + collaborators write data)
  or `signed_in` (any signed-in Disney user writes data).
- `versions` — every replacement mints a new version under the same URL.
- `data` — per-Creation key-value JSON store, accessible from the
  published HTML via same-origin `fetch`.

## Publishing flow (most common)

Two MCP calls, with file upload in between:

1. `creation_create` — reserve a row, get a presigned upload URL. The user
   tells you the type (image/video/html/rive), title, and whether it's
   public.
2. **Upload the bytes** to the presigned URL (HTTP `PUT`).
3. `creation_finalize` — publishes. For zips, the server extracts and
   auto-detects `index.html` as the entry. For Rive, wraps in a player
   page. Returns the public URL.

Optional: `creation_thumbnail_create` + `creation_thumbnail_finalize` to
attach a feed preview image for non-image Creations.

## Updating an existing Creation

- **New version of the same content**:
  `creation_replace_content` → upload → `creation_finalize_replacement`.
  Canonical URL is preserved; viewers see the latest by default.
- **Roll back / pin**: `creation_versions_list`, then `creation_set_version`.
- **Metadata only** (title, description, visibility, writeMode):
  `creation_update`.
- **Delete**: `creation_delete` removes the row and all stored assets.

## Dynamic data (stateful Creations)

Every Creation has a built-in KV store. Use it when the user wants UI that
remembers state — roadmaps with editable statuses, vote boards, suggestion
lists, settings panels, anything where "static HTML" isn't enough.

Auth rules:

- **Read** follows visibility: public/published is anyone, private is
  owner/collaborators.
- **Write** follows `writeMode`: `owners` (default) restricts to owner +
  collaborators; `signed_in` allows any signed-in Disney user. Flip with
  `creation_update writeMode=signed_in` for team dashboards.

Two ways to interact:

1. **From you (the agent)** — `creation_data_list`, `_get`, `_set`,
   `_delete`. Pre-seed initial data, mass-update statuses, mirror an
   external source.
2. **From inside the published HTML** — same-origin `fetch` against
   `/api/creations/{id}/data/{key}`. Cookies attach automatically.
   Derive `{id}` from `location.pathname.split('/')[2]`.

Inline this preamble into generated HTML — Backlot does **not** ship a
runtime SDK and you should not invent one:

```js
const creationId = location.pathname.split("/")[2];
async function getData(key) {
  const r = await fetch(`/api/creations/${creationId}/data/${encodeURIComponent(key)}`);
  if (r.status === 404) return null;
  if (!r.ok) {
    const msg = await r.text().then(t => { try { return JSON.parse(t).error; } catch { return null; } });
    throw new Error(msg || `HTTP ${r.status}`);
  }
  return await r.json();
}
async function setData(key, value) {
  const r = await fetch(`/api/creations/${creationId}/data/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!r.ok) {
    const msg = await r.text().then(t => { try { return JSON.parse(t).error; } catch { return null; } });
    throw new Error(msg || `HTTP ${r.status}`);
  }
  return await r.json();
}
```

Conventions:

- **Slash-namespace keys**: `milestones/q1-launch`, `votes/issue-42`,
  `settings/theme`.
- **Prefer JSON objects** even for single fields (`{ status: "done" }`
  beats `"done"`) so values can evolve without breaking older rows.
- **Small values**: 64 KB cap per key, enforced server-side. Anything
  larger belongs in storage, not the KV.
- **Optimistic UI** with rollback on failure. Surface 401/403 specifically
  ("ask the owner to enable shared writes") rather than a generic error.

## Tool inventory

Publishing:
- `creation_create` — reserve a Creation, get presigned upload URL.
- `creation_finalize` — publish after upload; extracts zips, detects entry.
- `creation_remix` — fork a public Creation into your own space.

Versions:
- `creation_replace_content` — get URL to upload a new version.
- `creation_finalize_replacement` — flip the active version after upload.
- `creation_versions_list`, `creation_set_version` — browse/roll between versions.

Thumbnails (for non-image types):
- `creation_thumbnail_create`, `creation_thumbnail_finalize`.

Collaboration:
- `creation_invite_collaborator`, `creation_remove_collaborator`,
  `creation_list_collaborators`.

Data store:
- `creation_data_list`, `creation_data_get`, `creation_data_set`,
  `creation_data_delete`.

Managing:
- `creation_list_mine`, `creation_get`, `creation_update`, `creation_delete`.

## Recommended flow for "make this stateful"

1. Ask what should be saved (statuses, votes, ordered list of items, etc.).
2. Pick a key scheme with the user (e.g. `milestones/<id>`).
3. Decide `writeMode`. Team dashboard → `signed_in`. Personal → leave at
   `owners`.
4. Generate the HTML with the inline `fetch` preamble. Use the real
   `creationId` only at runtime (`location.pathname.split('/')[2]`), not
   at generation time.
5. (Optional) Seed initial data with `creation_data_set` so the first load
   isn't empty.
6. Publish via `creation_create` → `creation_finalize`, or
   `creation_replace_content` → `creation_finalize_replacement` if
   updating an existing Creation.

A worked example lives at
<https://design.twdc.com/ai/samples/roadmap.html>.

## Auth

Disney SSO via OAuth (MCP discovery uses the standard
`WWW-Authenticate: Bearer resource_metadata=...` header). No tokens in any
config file — refresh tokens cache in the OS keychain via the editor's MCP
client. For CI/scripts, mint a personal access token from
<https://design.twdc.com/account>.
