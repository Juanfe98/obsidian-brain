---
name: teams-cli
version: 0.59.0
description: >
  Agent-friendly Microsoft Teams CLI. Use when user mentions: teams, chat, channel, message, meeting, recording, transcript, presence, microsoft teams.
metadata:
  generated: true
  requires:
    bins: ["teams"]
---

# Agent-friendly Microsoft Teams CLI

## Quick Reference

```bash
# Chat
teams --agent chat list --limit 10
teams --agent chat favorites --limit 10
teams --agent chat activity --limit 20
teams --agent chat get 19:abc123@thread.v2
teams --agent chat get-chat --user-id user@example.com
teams --agent chat members 19:abc123@thread.v2
teams --agent chat create-group --members "8:orgid:aaa,8:orgid:bbb" --topic "Project chat"
teams --agent chat saved --limit 10
teams --agent chat followed --limit 20
teams --agent chat save --conversation-id 19:abc@thread.v2 --message-id 1776959766132
teams --agent chat unsave --conversation-id 19:abc@thread.v2 --message-id 1776959766132

# Channels
teams --agent channel teams
teams --agent channel teams --filter "Growth Life"
teams --agent channel list --team-id <team-id>
teams --agent channel get --team-id <team-id> --channel-id <channel-id>
teams --agent channel messages --team-id <team-id> --channel-id <channel-id> --limit 20
teams --agent channel messages --team-id <id> --channel-id <id> --since 3d
teams --agent channel messages --team-id <id> --channel-id <id> --since 2026-07-06 --until 2026-07-07
teams --agent channel replies --team-id <team-id> --channel-id <channel-id> --message-id <msg-id>
teams --agent channel send --team-id <team-id> --channel-id <channel-id> --content "Hello!"
teams --agent channel send --team-id <id> --channel-id <id> --content "Status update" --subject "Weekly Update"
teams --agent channel send --team-id <id> --channel-id <id> --content "See screenshot" --image /tmp/shot.png
teams --agent channel send --team-id <id> --channel-id <id> --content "Logs attached" --attach /tmp/run.log
teams --agent channel reply --team-id <team-id> --channel-id <channel-id> --message-id <msg-id> --content "Done"
teams --agent channel members --team-id <team-id> --channel-id <channel-id>
teams --agent channel tags --team-id <team-id>
teams --agent channel files --team-id <team-id> --channel-id <channel-id>

# Messages
teams --agent message list --chat-id 19:abc123@thread.v2 --limit 20
teams --agent message list --chat-id 19:abc123@thread.v2 --since 2h
teams --agent message list --chat-id 19:abc123@thread.v2 --since 2026-07-06 --until 2026-07-07
teams --agent message list --from-url "https://teams.microsoft.com/l/message/19%3A...%40thread.tacv2/170?parentMessageId=169" --limit 50
teams --agent message get --chat-id 19:abc@thread.v2 --message-id 1234567890
teams --agent message send --chat-id 19:abc123@thread.v2 --content "Hello!"
teams --agent message send --chat-id <id> --content "Please review" --mention "John Doe:aad-guid"
teams --agent message send --chat-id <id> --content "Hello!" --schedule "2026-04-22T14:00:00Z"
teams --agent message send --chat-id <id> --content "See screenshot" --image /tmp/shot.png
teams --agent message send --chat-id <id> --content "File attached" --attach /tmp/report.pdf
teams --agent message send --chat-id <id> --content "add to the **prod** flag"  # Markdown auto-renders as rich text (default --content-type auto)
teams --agent message edit --chat-id <id> --message-id <msg-id> --content "Updated text"
teams --agent message delete --chat-id <id> --message-id <msg-id>
teams --agent message react --chat-id <id> --message-id <msg-id> --emoji like
teams --agent message mark-read --chat-id <id> --message-id <msg-id>
teams --agent message wait --chat-id 19:abc123@thread.v2 --max-wait 300
teams --agent message wait --chat-id 19:abc123@thread.v2 --after 1700000000000 --max-wait 300

# Meetings
teams --agent meeting list --days 3 --limit 10
teams --agent meeting list --start-date 2026-03-17 --days 1
teams --agent meeting get <event-id>
teams --agent meeting recordings --thread-id "19:meeting_xxx@thread.v2"
teams --agent meeting transcript --recording-id "<recording-id>"
teams --agent meeting transcript --thread-id "19:meeting_xxx@thread.v2"
teams --agent meeting transcript --thread-id "19:meeting_xxx@thread.v2" --meeting-date 2026-03-17

# Search (--query is required, not positional)
teams --agent search messages --query "deployment status"
teams --agent search messages --query "deployment" --team "Growth Life Orchestrator"
teams --agent search messages --query "release" --channel "general"
teams --agent search emails --query "quarterly report"
teams --agent search channels --query "general"

# Emoji
teams --agent emoji list
teams --agent emoji list --refresh
teams --agent emoji list --chat-id 19:abc123@thread.v2

# People
teams --agent people search --query "John Smith"
teams --agent people frequent --limit 10
teams --agent user me
teams --agent user get user@domain.com
teams --agent user presence

# Agent schema and skill helpers
teams agent schema
teams agent schema --compact
teams --agent agent health
teams skills list
teams skills install --target cursor

```

## Authentication

- Method: Microsoft browser token capture (Graph + Skype + Substrate + CSA via Playwright)
- Setup: teams auth login
- Requires a Chromium-based browser (Chrome, Edge, or Brave) for the browser token-capture login.
- Set `AITOOLS_MS_SYSTEM_BROWSER=1` to open the sign-in URL in your OS default browser instead of the isolated CDP window when a registered/compliant-device requirement is suspected (no Chromium install or auto-fill; the one-time code is copied to your clipboard and printed). It changes browser context, not the corporate network location or egress.
- No pat-manager service for teams: `pat-manager token teams` fails, so auth is browser-based only.
- The SPA refresh token expires 24h after login; `teams auth refresh` works only within that window.
- On `AADSTS700084`, or when the refresh token is expired or revoked, run a full `teams auth login` to re-capture tokens. For `POLICY_BLOCKED` / `AADSTS53003`, follow the Conditional Access diagnostics instead of assuming re-login is the fix.
- Troubleshooting Conditional Access error 53003 on `teams auth login` or a background refresh: Microsoft refused token issuance, but the code alone does not identify the failed criterion. Possible causes include network location or egress, device registration or compliance, and other tenant policy grants. AIX auto-binds the token socket only when its macOS/Windows routing probe detects that `login.microsoftonline.com` diverges from the default VPN route; otherwise it leaves routing unchanged. A tunnel route is not proof of acceptance: a `utunX`/tunnel adapter only identifies the selected interface, not whether Entra accepts the public egress. On macOS run `dscacheutil -flushcache` before `route -n get login.microsoftonline.com`; on Windows use `Find-NetRoute -RemoteIPAddress <login IP>` or `route print`. For the network branch: on a Mac on Prisma, follow steps 6 (turn on the GlobalProtect network extension, which needs Admin on Demand) and 8 (turn off IPv6) of the Prisma Access Troubleshooting page (https://disney-enterprise.atlassian.net/wiki/spaces/mediaeng/pages/1937293157/Prisma+Access+Troubleshooting), reconnect and sign in again. Otherwise sign in over an approved full-tunnel path: ask IT whether your account can get full tunnel on global-connect-me. A ds-connect-me FULL gateway or Backstage Pass works only if you still have access. None of this is proof that Prisma or egress caused this 53003. Changing browsers does not change egress; use the system-browser option only for suspected device context. If it still fails, contact IT to identify the matched policy and include the AADSTS code plus any correlation or request IDs.

## KQL Search Syntax

Applies to: search messages / emails / channels

```
# Combine terms with OR (uppercase) in one call instead of many separate searches
teams --agent search messages --query "Azure OR Entra OR app registration OR identity access"

# Scope by sender with from:
teams --agent search messages --query "deployment failure from:john.doe"

# Scope to a team and channel without paging through every message
teams --agent search messages --query "deployment" --team "Growth Life Orchestrator" --channel "releases"

# Operators: OR (uppercase), AND (default between terms), NOT, from:, to:, sent>, sent<, hasAttachment:true
teams --agent search messages --query "error NOT resolved from:jane sent>2026-01-01"

```

## Workflows

### Send a message to a person

```bash
teams --agent people search --query "<person name>"   # relevance graph only: zero hits means "not in your people graph", NOT "no such person" -- fall back to `user get <upn-or-object-id>`
teams --agent chat get-chat --user-id <user-id-or-email>   # composed locally, then read back from Teams -- see best practices
teams --agent message send --chat-id <chat-id> --content "<message>"
```

### Find and reply to a channel thread

```bash
teams --agent search messages --query "<topic>"
teams --agent channel replies --team-id <team-id> --channel-id <channel-id> --message-id <msg-id>
teams --agent channel reply --team-id <team-id> --channel-id <channel-id> --message-id <msg-id> --content "<reply>"
```

### Get a meeting's recording and transcript

```bash
teams --agent meeting list --start-date <date> --days 1
teams --agent meeting recordings --thread-id "<threadId-from-meeting-list>"
teams --agent meeting transcript --recording-id "<recordingId-from-recordings>"
```

### Check unread activity and respond

```bash
teams --agent chat activity --limit 20
teams --agent message list --chat-id <chat-id> --limit 10
teams --agent message send --chat-id <chat-id> --content "<response>"
```

### Find unread chats

```bash
teams --agent chat list --limit 50   # keep rows with isRead: false (clear one with `message mark-read --message-id <lastMessageId>`). A missing isRead is unknown, not read; readState: unavailable means the Graph fallback served the list, so do not conclude nothing is unread. Run metadata.next_action for the next page
teams --agent message list --chat-id <chat-id> --limit 20
```

## Tips

- Do not run `teams --help` or `teams <subcommand> --help` when this skill is loaded; every command and flag is documented here and in the Full Command Reference below. Use `teams agent schema` only if you need the complete machine-readable reference.
- Always use --agent for structured JSON output
- Use --limit to control response size (default varies by command)
- Use `teams user me` first to get your user ID and email
- `people search` and `people frequent` both read Graph's RELEVANCE endpoint (`/me/people`) -- the people YOU interact with, ranked by your own interaction history -- not the org directory; `frequent` is the same call without the query. A colleague you have never messaged is simply absent, so an empty result means "not in your people graph", NEVER "no such person": do not report the person as nonexistent and do not retry with a differently spelled query. Escalate instead -- `user get <upn-or-object-id>` is directory-backed and resolves anyone in the tenant whose UPN or object ID you already have, and `people frequent` is the cold-start listing when you have no name to search on yet. `user get` reads Graph `/users/{id}`, which accepts an object ID or a UPN and nothing else, so an arbitrary mail address is NOT a directory identifier: a secondary SMTP alias returns not found even though the person exists, and the CLI has no directory search that resolves one. When the address you hold is not the UPN, ask the person or find them through a chat or channel they appear in rather than reporting them as nonexistent
- Use `teams chat list` or `teams chat favorites` to discover chat IDs before reading messages
- Use `chat get-chat --user-id <email-or-id>` to derive a 1:1 chat ID (an email/UPN resolves to an object ID); the returned chatId works directly with `message send` and `message list`. The ID is composed locally from the two participants' object IDs (sorted, so the order you pass them in never matters) and then read back from Teams. The payload always says `composed: true`; `verified: true` with `exists: true` means the thread read back, and `chatId` is the ID that did (if the sorted ID answers 404, the reversed participant order is tried, since one of 32 surveyed threads was stored unsorted -- one account's snapshot, not a rate). `exists: false` with `verified: false` means neither order exists yet: that is normal, and `message send` creates the thread on first send, so keep going. A missing `exists` with `verified: false` means the check itself failed (auth, throttling, access denied, server or network error): a `metadata.warnings` entry names the class, and the chatId is the unverified composed one. Each call costs one or two extra chatsvc reads. To confirm a thread otherwise, use `message list --chat-id <id>` or `chat members <id>`, or find the thread by filtering `chat list` on `chatType` = `oneOnOne`
- `chatType` is reported by `chat list`, `chat get`, and `chat get-chat`, derived from the thread ID alone, and is one of exactly four values: `oneOnOne` (a 1:1 -- the unique-roster form `19:<objId>_<objId>@unq.gbl.spaces` that `get-chat` composes, and also bot threads such as `48:notifications`), `group` (`19:<guid>@thread.v2`), `meeting` (`19:meeting_...@thread.v2`), `channel` (`19:...@thread.tacv2`). To find a person's DM, filter `chat list` on `chatType` = `oneOnOne`, not on `group`
- Use `teams channel teams` to discover team and channel IDs
- Use `message list` and `message get` for chat threads; use `channel messages` for team channels. `message list` and `message get` also accept a channel id (`19:...@thread.tacv2`)
- Paste a Teams message/thread URL into `message list --from-url "<url>"` instead of extracting the chat ID by hand
- Use `channel files --conversation-id <id>` for shared files in either chats or channels
- Use `meeting list --start-date <YYYY-MM-DD>` for past-meeting discovery before fetching transcripts
- `meeting recordings` and `meeting transcript --thread-id` take the meeting-chat thread ID (form `19:meeting_...@thread.v2`). `meeting list` and `meeting get` emit a ready-to-use `threadId` field on every online-meeting event -- pass it straight to `meeting recordings`, no URL parsing needed
- Start from `meeting recordings --thread-id <id>`: it returns the thread's calls, each with its recordings nested inside (`recordingId`, links, start/end times). Pass a recording's `recordingId` to `meeting transcript --recording-id <recordingId>` for that exact transcript (self-sufficient -- no `--thread-id` needed). `callId` groups a call's recordings: one normally, more than one only for a stop/resume, so cardinality is visible instead of hidden. Prefer this over `meeting transcript --meeting-date`, which is ambiguous when a thread has multiple recordings in a window
- Recording and transcript URLs from `meeting recordings`/`meeting transcript` require the caller's existing Teams/SharePoint authorization; access and expiration are provider-controlled and the CLI does not guarantee a URL stays valid or extend its lifetime
- Each `meeting recordings` recording carries `recapUrl` -- the Teams recap deep link that opens the video and its transcript together. Prefer it over `videoUrl`/`sharePointUrl`, which open the raw .mp4 with no path to the transcript. It is composed from the recording's own SharePoint identity, so it is null only when that identity is incomplete, never merely because the meeting conversation was unreadable
- `shareUrl` is the SharePoint/Stream share link for the recording: the only one that opens in a plain browser, the only one whose permissions you can widen to a company-wide audience, and the only one that accepts a time code (`nav`). Use it for timestamped links instead of digging `sitePath` out of `recapUrl`
- `shareLinks` reports the sharing links recorded on a recording. Each entry is `{id, roles, hasPassword, expirationDateTime, link: {scope, type, webUrl, preventsDownload}}` -- the URL is at `link.webUrl`, NOT at a top-level `url`, and there is no `additional` object. `link.scope` is who it works for (`users` = named people, `organization` = anyone in the company, `anonymous` = anyone holding the link, no sign-in). `roles` is what they can do (`read` = view, `write` = EDIT) and `link.type` says the same in Graph's words (`view`, `edit`, `blocksDownload`). Values are text -- treat one outside these lists as unknown, not harmless. `shareLinks` is `null` when the lookup did not complete and `[]` when it completed and there are none: never read `null` as "not shared": `shareLinksUndetermined` on the same recording says why -- `{graphStatus, retryAfterSeconds}` when Graph answered for it, `{reason}` when no request was made. Permissions carrying no link (an owner's direct access) are excluded, so `roles` = `owner` never appears here. Use `id` to target one link when widening permissions. `shareUrl` is a different thing: the link Teams published on the recording card, null when no card was found. Neither is ranked and neither overrides the other -- pick by audience, and for a NON-ATTENDEE look for `link.scope` = `organization` rather than assuming `shareUrl` works. Match `roles` = `read` too: a recording carries a `write` link alongside its `read` one, differing only in an opaque token, so choosing on scope alone can hand over EDIT access. Both being absent does not affect `recapUrl`
- Building anything that links into a recording (a summary table, a timestamped index, a report)? Read references/meeting-link-data.md FIRST. The link formats are not interchangeable: only `recapUrl` opens video and transcript together, and only `shareUrl` accepts a time code (`nav`), so putting `recapUrl` on a timestamped bullet silently drops the timestamp. That file also covers each format's source and limits, and why a link must be matched to its recording by embedded id rather than by position or time
- Use `--schedule` with `message send` to queue a message for future delivery (ISO 8601 datetime)
- Use --cursor from metadata.cursor to paginate beyond the 50-message API cap
- When metadata.has_more is true, use metadata.next_action to fetch next page
- Use `--since` (optionally with `--until`) on `message list` and `channel messages` to read a time window: accepts a date (2026-07-06, UTC midnight), an RFC3339 timestamp, or a relative span (2h, 3d). `--until` requires `--since` and defaults to now. Filters on message creation time, so edited-but-old messages do not resurface. A windowed read is not cursor-paginated (do not pass `--cursor` with it); if the result is incomplete metadata.truncated is true - narrow the window or raise `--limit` for the rest. Not combinable with `channel messages --search`.
- After `message send`, run metadata.next_action (a ready-to-run `message wait`) to block for the reply instead of polling `message list`
- Use `message wait` to block for a reply after sending; it is idempotent, so restart it with the same --after without re-sending
- Use `teams search messages` for full-text search across all chats and channels
- To react with a custom emoji, use the full key from `emoji list` (e.g. `done;0-wus-d6-...`); never mix one emoji's name with another's hash, which creates an irremovable reaction
- Use `teams auth refresh` if token expires mid-session
- Message objects carry sender (a display name, NOT stable) plus senderId (the canonical author MRI, e.g. 8:orgid:<oid>) and fromMe (true if you authored it) - attribute by senderId, never sender. chat list uses lastMessageSenderId / lastMessageFromMe. search results and activity-feed source attributions have senderId: null (no MRI in the payload).
- `chat list` rows carry `isRead`, which compares the row's `consumptionhorizon` (the read position `message mark-read` writes) with its last message id: `false` means the last message is newer, `true` means it is not. `isRead` is absent (null under `--full`) when the row has no horizon or no numeric last message id, and when you sent the last message after your read position, since someone else's unread message can sit between the two; that is unknown, never read. This is not yet checked against live payloads: whether chatsvc returns the horizon on every row, whether Teams sets it for chats you never opened, and whether a system event (a member added, a call ended) can be the last message are unverified, so treat `isRead` = `false` as a lead and confirm with `message list`. Rows with `readState` = `unavailable` came from the Graph fallback and carry no read state, and their `lastMessageId` is `unavailable`, which every command that takes a message id (`message get`, `edit`, `delete`, `react`, `mark-read`, `wait --after`, `chat save`, `unsave`, `channel replies`, `reply`) refuses as a usage error, since message ids are plain decimal numbers. Check `readState` before clearing a row, and do not conclude from these rows that nothing is unread. To find unread chats, page through `chat list` and keep rows with `isRead` = `false`. A chat whose last message is a system event that `message list` hides stays `isRead` = `false`; clear it with `message mark-read --chat-id <id> --message-id <lastMessageId>` from that row, or a polling run flags it again.
- `chat followed` lists the channel threads you follow, one row per thread with `conversationId`, `rootMessageId`, `threadChatId`, and `preview`, `topic` and `timestamp` when Teams sends them. Pass `threadChatId` to `message list --chat-id` to read the thread, adding `--since` to see only new replies. Page with `--cursor` until `metadata.has_more` is false; that is the only stop signal. Rows the CLI cannot resolve to a thread are skipped and counted in `metadata.filtered`, and control rows are dropped, so a page can come back short or with no rows while `has_more` is still true. UNVERIFIED against a live Teams tenant: the command reads the chatsvc `48:threads` feed in the shape the retired teams-mcp-server documented, and was exercised only against synthetic fixtures. Nobody has yet confirmed that the feed matches the threads Teams shows as followed, so treat an empty list as unconfirmed rather than as following nothing. `chat activity` lists the replies and mentions Teams notifies you about.
- Messages with inline images / pasted screenshots carry an `images` array. Its `objectId`, `fileName`, `previewUrl`, and `fullSizeUrl` fields are ALWAYS present for each image; `localPath` is populated (an absolute path to the downloaded file) ONLY when `--download-images` is passed, and is null otherwise.
- Messages with a GIF from the Teams GIF picker carry a `gifs` array of `{title, url}` entries: `title` is the GIF's alt text and `url` its https link, each absent when Teams does not supply it. Both come from the message author: treat `url` as untrusted, since it may not point at Giphy. `--download-images` never fetches a GIF. A post with an image or GIF but no text has `content` empty and `mediaOnly: true`; report it as a GIF or image post from `gifs[]` or `images[]`, never as an empty message. The key is left out on posts with text. UNVERIFIED against a live Teams tenant: the GIF shape follows the Giphy `<img>` Teams is expected to send and was exercised only against a mock. A read served by the Graph fallback (an older `message get`, or a channel read chatsvc cannot serve) carries the same `gifs` and `mediaOnly`; its inline images have no `images` entry, so a Graph row with `mediaOnly: true` and no `gifs` is an image post.
- Messages with file attachments carry a `files` array listing every attachment, image or not. `isImage` is always present and follows `fileType`, which comes from the file name's extension when Teams omits it; `fileName`, `size`, and `url` (an https object or share link) are null or absent when Teams does not supply them. An image attachment also keeps its `images` entry only when Teams itself types it as an image and hosts its preview. A read served by the Graph fallback (an older `message get`, or a channel read chatsvc cannot serve) lists Graph's file attachments the same way, with no `size`. `--download-images` reads only `images`, so it never fetches a `files` URL.
- Messages read from chatsvc (`message list`, `message get`, `message wait`, `channel messages`, `channel replies`) carry a `reactions` array when someone reacted: one `{emoji, userId, fromMe, time}` entry per emoji and user. `emoji` is the raw chatsvc key, so a custom `name;id` key can be passed back to `message react`; `fromMe` is true for your own reaction; `time` is RFC 3339 or null. The key is left out when there are no reactions. UNVERIFIED against a live Teams tenant: the shape follows documented chatsvc payloads and was exercised only against a mock, so an unrecognized `emotions` shape shows as no reactions. A read served by the Graph fallback keeps Graph's own `reactions` field, and `chat activity` does not list them.
- `message send`, `channel send`, and `channel reply` with `--attach` return `uploadedFiles` (`fileName`, `url`) naming each uploaded file; match `fileName` against the `files` array when you read the message back.
- Bot and connector notifications (Power Automate and Workflows, Azure Monitor, build bots) arrive as Adaptive Cards: those messages carry a `cards` array (`contentType`, `text`, and the parsed card `content`), and when the message has no body of its own, `content` holds the card's flattened text. A read served by the Graph fallback (an older `message get`, or a channel read chatsvc cannot serve) keeps Graph's message shape, with the card JSON in `attachments`, and carries the same `cards` array; a post that is only a card has just an attachment placeholder in `body`, so read the card text from `cards[].text`. `--concise` strips `content` and `body` but keeps `cards[].text`.
- `metadata.filtered` counts messages a read could NOT represent (system/control events, unsupported types, a card whose payload it cannot read). Present only when non-zero, it separates an empty conversation (`count: 0`, no `filtered`) from one whose messages were all withheld (`count: 0`, `filtered: N`) - never read an empty `data` as 'no messages' without checking it. `chat followed` is the exception: its `filtered` counts only rows it cannot resolve to a thread, and it drops control rows uncounted, so a `chat followed` page with `count: 0` and no `filtered` is not proof of an empty list; check `metadata.has_more`.
- Run `teams agent schema` for the complete command/flag reference
- In agent mode a `--help` that NAMES a command returns just that command's schema entry (`teams --agent chat list --help`); a bare `teams --agent --help` returns the whole schema

## Common Mistakes

| Pattern | Why It's Wrong |
|---------|---------------|
| send message without confirming chat ID | Wrong chat-id sends to the wrong person — verify first |
| fetch all messages without --limit | Large result sets waste tokens and may timeout |
| use raw emoji name for custom emojis | Custom emojis require the exact key from `emoji list` — never mix names and hashes |
| skip pagination when metadata.has_more is true | Misses messages — API caps at 50 per page |
| --channel instead of --channel-id on any channel subcommand | The flag is --channel-id everywhere (get, messages, send, replies, reply, members, files) — there is no shorter --channel form |
| channel replies --conversation-id ... | channel replies takes --team-id, --channel-id, and --message-id — there is no --conversation-id flag on this subcommand |
| teams --agent schema, teams --agent api ..., or teams team list | None of these exist — the full command/flag reference is `teams agent schema` (no leading --agent), and teams/channels are listed with `teams --agent channel teams` |

---

## Full Command Reference

*Auto-generated from CLI source. Do not edit manually.*

### `teams copilot license`

Check whether this user has an M365 Copilot license (writes the verdict cache that `aix status` reads for the M365 Copilot platform row)

- `--no-write`: Print the verdict without writing the cache

### `teams user me`

Get the current authenticated user's profile

### `teams user get`

Get a user by object ID or UPN (user@domain.com). Reads Graph `/users/{id}`, so a mail address resolves only when it is the UPN: a secondary SMTP alias returns not found

- `<id>`: User object ID or UPN (a secondary SMTP alias does not resolve) **(required)**

### `teams user presence`

Get the user's presence/status

### `teams chat list`

List the user's chats. Each row's `isRead` is false when its last message is newer than your read position, true when it is not, and absent when that is unknown. `lastMessageId` is the last message's id, including a system event that `message list` hides, and `message mark-read --message-id` takes it. Graph-fallback rows carry `readState: unavailable` and `lastMessageId: unavailable` and no `isRead`; every command that takes a message id refuses `unavailable` as a usage error, so check `readState` first

### `teams chat get`

Get a specific chat by ID

- `<id>`: Chat ID **(required)**

### `teams chat members`

List members of a chat

- `<id>`: Chat ID **(required)**

### `teams chat get-chat`

Get 1:1 chat ID for a user (by email/UPN, MRI, or object ID). The ID is composed locally, then read back from Teams: `verified: true` and `exists: true` when the thread is found (the reversed participant order is tried after a 404); `exists: false` with a note when neither exists (`message send` creates it on first send); no `exists` and a warning when the check itself fails

- `--user-id`: User identifier: email/UPN (resolved via Graph), MRI ("8:orgid:guid"), or raw object ID **(required)**

### `teams chat create-group`

Create a group chat with multiple people

- `--members`: Member MRIs or GUIDs (comma-separated)
- `--topic`: Chat topic/name (optional)

### `teams chat favorites`

Get favourite/pinned conversations

### `teams chat activity`

Get activity feed (mentions, reactions, replies)

### `teams chat saved`

Get saved/bookmarked messages

### `teams chat followed`

List the channel threads you follow. Each row's `threadChatId` is accepted by `message list --chat-id`. UNVERIFIED against a live Teams tenant

### `teams chat save`

Save (bookmark) a message

- `--conversation-id`: Conversation ID containing the message **(required)**
- `--message-id`: Message ID to save **(required)**

### `teams chat unsave`

Unsave (unbookmark) a message

- `--conversation-id`: Conversation ID containing the message **(required)**
- `--message-id`: Message ID to unsave **(required)**

### `teams message list`

List messages in a chat or channel thread (uses internal Teams API)

- `--chat-id`: Chat/conversation ID (from `teams chat list`). Mutually exclusive with --from-url
- `--from-url`: A Teams message/thread deep link (https://teams.microsoft.com/l/message/...). Parsed into the chat ID automatically, so you can paste a URL directly
- `--since`: Only messages created at/after this time: a date (2026-07-06), an RFC3339 timestamp, or a relative span (2h, 3d). Interpreted as UTC. A windowed read is not cursor-paginated, so it conflicts with --cursor
- `--until`: Window end (same formats as --since). Defaults to now. Requires --since

### `teams message get`

Get a specific message

- `--chat-id`: Chat or channel thread ID **(required)**
- `--message-id`: Message ID **(required)**

### `teams message send`

Send a message to a chat

- `--chat-id`: Chat ID (use "48:notes" for self-chat) **(required)**
- `--content`: Message content (Markdown by default; plain text and bare URLs are left as-is) **(required)**
- `--content-type`: Content type: auto (default; Markdown-looking content renders as Teams rich text, plain text and bare URLs send as-is), text (send verbatim, no formatting — use this to opt out of auto), html, or markdown (always convert)
- `--mention`: @mention users (repeatable): "DisplayName:AAD_GUID"
- `--schedule`: Schedule message for future delivery (ISO 8601 datetime, e.g. "2026-04-11T09:00:00Z")
- `--image`: Inline image to embed (repeatable): path to a PNG/JPG/GIF/WEBP file
- `--attach`: File to attach (repeatable): path to any local file

### `teams message edit`

Edit a message you sent

- `--chat-id`: Chat ID **(required)**
- `--message-id`: Message ID to edit **(required)**
- `--content`: New content (Markdown by default; plain text and bare URLs are left as-is) **(required)**
- `--content-type`: Content type: auto (default; Markdown-looking content renders as Teams rich text, plain text and bare URLs send as-is), text (send verbatim, no formatting — use this to opt out of auto), html, or markdown (always convert)
- `--mention`: NOT SUPPORTED: Microsoft Teams does not allow attaching new @mention entities to a message after it has been sent, so this always errors. Accepted (rather than omitted) only so the CLI can reject it with a clear explanation instead of clap's generic "unexpected argument" error

### `teams message delete`

Delete a message you sent (soft delete)

- `--chat-id`: Chat ID **(required)**
- `--message-id`: Message ID to delete **(required)**

### `teams message react`

Add or remove a reaction on a message

- `--chat-id`: Chat ID **(required)**
- `--message-id`: Message ID **(required)**
- `--emoji`: Emoji key (like, heart, laugh, surprised, sad, angry) **(required)**
- `--remove`: Remove the reaction instead of adding

### `teams message mark-read`

Mark a conversation as read up to a message

- `--chat-id`: Chat ID **(required)**
- `--message-id`: Numeric message ID to mark as read up to, such as a `chat list` row's `lastMessageId` **(required)**

### `teams message wait`

Block until a new message appears in a chat, then return only the new messages. Polls inside the CLI so a waiting agent spends no tokens until a reply lands. Read-only and idempotent: it never posts (always pair it with a separate `message send`), and re-running with the same `--after` resumes from the same point without reposting anything

- `--chat-id`: Chat/conversation ID. Mutually exclusive with --from-url
- `--from-url`: A Teams message/thread deep link (parsed into the chat ID)
- `--after`: Only return messages newer than this message ID — the idempotent resume token. Defaults to your most recent message in the thread, so a wait restarted after a send needs neither the original message ID nor a re-post. The exact id used and a ready-to-run continuation are echoed back in the response
- `--max-wait`: Maximum seconds to block before returning a timed-out (empty) result. Capped at 1800
- `--interval`: Seconds between polls
- `--include-self`: Include your own messages in the result (default: excluded, since you are waiting for someone else's reply)

### `teams channel list`

List channels in a team

- `--team-id`: Team ID **(required)**

### `teams channel get`

Get a specific channel and its parent team

- `--team-id`: Team ID **(required)**
- `--channel-id`: Channel ID **(required)**

### `teams channel messages`

List messages in a channel

- `--team-id`: Team ID **(required)**
- `--channel-id`: Channel ID **(required)**
- `--search`: Search within channel messages (uses Substrate Search API)
- `--since`: Only messages created at/after this time: a date (2026-07-06), an RFC3339 timestamp, or a relative span (2h, 3d). Interpreted as UTC. Not combinable with --search (server-side full-text) or --cursor (a windowed read is not cursor-paginated)
- `--until`: Window end (same formats as --since). Defaults to now. Requires --since

### `teams channel send`

Send a message to a channel

- `--team-id`: Team ID **(required)**
- `--channel-id`: Channel ID **(required)**
- `--content`: Message content (Markdown by default; plain text and bare URLs are left as-is) **(required)**
- `--content-type`: Content type: auto (default; Markdown-looking content renders as Teams rich text, plain text and bare URLs send as-is), text (send verbatim, no formatting — use this to opt out of auto), html, or markdown (always convert)
- `--subject`: Subject/topic for the message (creates a thread with this subject)
- `--mention`: @mention users (repeatable): "DisplayName:AAD_GUID"
- `--image`: Inline image to embed (repeatable): path to a PNG/JPG/GIF/WEBP file
- `--attach`: File to attach (repeatable): path to any local file

### `teams channel replies`

List replies to a message in a channel (thread replies)

- `--team-id`: Team ID **(required)**
- `--channel-id`: Channel ID **(required)**
- `--message-id`: Message ID (thread root) to get replies for **(required)**

### `teams channel reply`

Reply to a message in a channel

- `--team-id`: Team ID **(required)**
- `--channel-id`: Channel ID **(required)**
- `--message-id`: Message ID to reply to **(required)**
- `--content`: Reply content (Markdown by default; plain text and bare URLs are left as-is) **(required)**
- `--content-type`: Content type: auto (default; Markdown-looking content renders as Teams rich text, plain text and bare URLs send as-is), text (send verbatim, no formatting — use this to opt out of auto), html, or markdown (always convert)
- `--mention`: @mention users (repeatable): "DisplayName:AAD_GUID"
- `--image`: Inline image to embed (repeatable): path to a PNG/JPG/GIF/WEBP file
- `--attach`: File to attach (repeatable): path to any local file

### `teams channel members`

List members of a channel

- `--team-id`: Team ID **(required)**
- `--channel-id`: Channel ID **(required)**

### `teams channel teams`

List all teams and their channels you're a member of

- `--filter`: Filter teams by display name (case-insensitive substring match)

### `teams channel tags`

List tags for a team

- `--team-id`: Team ID (group ID GUID) **(required)**

### `teams channel files`

Get shared files in a channel

- `--team-id`: Team ID (use with --channel-id for direct access)
- `--channel-id`: Channel ID (use with --team-id for direct access)
- `--conversation-id`: Conversation ID (resolved to team/channel if --team-id/--channel-id not provided)

### `teams search messages`

Search Teams messages

- `--query`: Search query **(required)**
- `--team`: Filter by team name
- `--channel`: Filter by channel name
- `--since`: Only messages sent on or after this date (YYYY-MM-DD, inclusive)
- `--until`: Only messages sent on or before this date (YYYY-MM-DD, inclusive)

### `teams search emails`

Search emails

- `--query`: Search query **(required)**

### `teams search channels`

Find Teams channels by name

- `--query`: Channel name to search for **(required)**

### `teams people search`

Search your relevance graph (people you interact with), not the org directory: someone you have never messaged returns zero hits. For a directory lookup use `user get <upn-or-object-id>` (a secondary SMTP alias is not a directory identifier and returns not found); for a cold start use `people frequent`

- `--query`: Search query (name or email) **(required)**

### `teams people frequent`

Show frequently contacted people

### `teams meeting list`

List meetings/events from calendar

- `--days`: Number of days to include from the start date/time (default: 7)
- `--start-date`: Start date/time (RFC3339 or YYYY-MM-DD). Default: now

### `teams meeting get`

Get a specific event by ID

- `<id>`: Event ID **(required)**

### `teams meeting transcript`

Get a meeting transcript. Provide --recording-id (from `meeting recordings`) for an exact recording, or --thread-id for the newest recording on that thread. At least one selector is required

- `--thread-id`: Thread ID of the meeting chat. Optional when --recording-id is given; otherwise selects the newest recording on this thread
- `--meeting-date`: Meeting date (ISO 8601) to narrow a --thread-id search
- `--recording-id`: Exact recording ID (from `meeting recordings`) — returns that one recording's transcript. Self-sufficient; needs no --thread-id

### `teams meeting recordings`

List a meeting thread's recorded calls, grouped by call: each call carries its recordings (recordingId, playback links, and the recapUrl that opens video and transcript together), so >1 recording under one call surfaces a stop/resume rather than hiding it

- `--thread-id`: Thread ID of the meeting chat **(required)**
- `--meeting-date`: Meeting date (ISO 8601) to narrow search

### `teams emoji list`

List custom emojis (from cache, or scan with --refresh)

- `--chat-id`: Chat ID to scan for emoji reactions
- `--refresh`: Rescan messages to discover new emojis and update cache

### `teams auth login`

Log in to Microsoft (interactive browser sign-in). By default opens an isolated sign-in window. Set AITOOLS_MS_SYSTEM_BROWSER=1 to open your OS default browser instead when Conditional Access requires a registered device the isolated profile can't present. This does not change network egress; location-based policy still requires login.microsoftonline.com through an approved company network path. The code is still copied to your clipboard and printed for manual entry

- `--login-events`: Stream machine-readable NDJSON login events on stdout (consumed by the AIX Manager desktop app). Also enabled by the AIX_MANAGER env

### `teams auth refresh`

Refresh session tokens (all scopes, pure HTTP)

- `--force`: Force refresh even if current token is still valid

### `teams auth logout`

Sign out of Microsoft and Copilot, clearing tokens and the shared browser profile

### `teams auth status`

Show current authentication status

### Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--agent` | Force agent mode (structured JSON, auto-approve) | - |
| `--format` | Output format: json, json-pretty, table, csv | - |
| `--fields` | Select specific output fields (comma-separated) | - |
| `--summary` | Summary mode (counts and statuses only). Alias: --brief | - |
| `--concise` | Concise mode: drops body/description/content but KEEPS the reference keys the default projection removes, so it can return more than the default | - |
| `--full` | Preserve full API payloads: null-valued fields, plus the reference keys (`@odata.context`, `@odata.etag`, `channelIdentity`) the default projection drops | - |
| `--limit` | Max items to return | 25 |
| `--offset` | Pagination offset | 0 |
| `--cursor` | Pagination cursor (from previous page's next_action) | - |
| `--no-cache` | Bypass file cache | - |
| `--no-proxy` | Bypass connection proxy | - |
| `--token` | Override auth token. On argv, so visible in `ps` and shell history; prefer the service env var or pat-manager | - |
| `--server` | Override Microsoft Graph API URL | - |
| `--read-only` | Disable all write operations | - |
| `--dry-run` | Preview requests without executing (shows method, URL, headers, body) | - |
| `--timeout` | Request timeout in milliseconds (> 0); `[teams]`/`[global]` timeout_ms, else 30000 | - |
| `--no-rate-limit` | Disable client-side rate limiting (for deployed agents/automation) | - |
| `--keep-html` | Preserve raw HTML in body/content fields (default: convert to text) | - |
| `--max-body` | Truncate body/content fields to N characters (adds "body_truncated": true) | - |
| `--download-images` | Download inline images / pasted screenshots referenced by messages to local files (full resolution) and add their "localPath" to each image. Applies to message/channel reads. Use for multimodal analysis of screenshots that are otherwise stripped from message text | - |
| `--images-dir` | Directory for --download-images output. Defaults to <os-temp>/aix-teams-images. Each downloaded image's absolute path is reported as its "localPath" in the message's images array | - |
| `--debug` | Print debug info to stderr | - |
