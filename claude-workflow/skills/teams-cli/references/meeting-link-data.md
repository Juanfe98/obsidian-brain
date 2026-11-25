# Teams Meeting Links: A Field Guide

There is no single link to a Teams meeting recording. At least seven formats turn
up around one, and only four of them address the recording or its transcript at
all. They are not interchangeable, and the differences leak Microsoft's storage
internals at you: SharePoint drive ids, Stream share tokens, Outlook global object
ids. Choosing wrong fails quietly — video with no transcript, a timestamp that
vanishes, a link that belongs to a different recording in the same series, or a
permission error where the reader expected a page.

This is a guide to telling them apart and knowing what each one costs.

## Prefer these three

Reach for one of these and stop; everything after them is a worse answer to the
same question.

1. **Stream share link** (`shareUrl`) — the default. Opens a browser page with the
   player *and* the transcript, no app handoff. It is also the only format that
   takes a time code and the only one whose permissions you can widen. There is no
   axis on which another format beats it.
2. **Recap deep link** (`recapUrl`) — the fallback, because it hands off to the
   Teams app. Reach for it when `shareUrl` is `null`, which happens when Teams
   posted no recording card. It carries a route to the browser page rather than
   being one.
3. **Raw file URL** (`videoUrl`) — only when you need the file itself, for a
   download or a player.

The four formats below those point at *where* a recording lives rather than at the
recording, or hand back a payload instead of a page. They are documented so you
can recognize one, not because you should choose one.

## Link formats in descending usefulness

| It is | Starts with | CLI returns it | Opens in | Video | Transcript | Time code | Widen permissions |
|---|---|---|---|---|---|---|---|
| [Stream share link](#stream-share-link) | `/:v:/g/personal/…/IQ…` | yes — `shareUrl` | **browser** | yes | **yes** | **yes** | **yes — this is the one you widen permissions on** |
| [Recap deep link](#recap-deep-link) | `/l/meetingrecap?` | yes — `recapUrl` | Teams app (offers browser) | yes | yes | no | no |
| [Raw file URL](#raw-file-url) | `/Documents/Recordings/….mp4` | yes — `videoUrl`, `sharePointUrl` | browser | yes | no | unknown | no |
| [Transcript content API URL](#transcript-content-api-url) | `/_api/v2.1/drives/…/items/…/transcripts/…/content` | **no** — older reports only | nothing — raw payload | no | raw text | no | no |
| [Message link](#message-link) | `/l/message/19:…` | yes — `messageLink` | Teams app | — | — | — | no |
| [Conversation link](#conversation-link) | `/l/chat/19:meeting_…` | **no** — built downstream | Teams app | — | — | — | no |
| [Join link](#join-link) | `/l/meetup-join/19:meeting_…` | yes — `onlineMeeting.joinUrl` | Teams app | **the live meeting, not the recording** | — | — | no |

A `/l/` path is on `teams.microsoft.com`; the others are on
`<tenant>[-my].sharepoint.com`.

Formats the CLI does not return are still documented, because you will meet them
in existing reports, in the Teams and SharePoint UIs, and in links people paste
into chat. Each says so in its own section.

---

## Stream share link

**Starts with** `<tenant>-my.sharepoint.com/:v:/g/personal/…/IQ…`

**Where it comes from.** A share link is recorded on the recording's SharePoint
item, and every copy you meet is a copy of one of those: the URL Teams publishes on
the recording card, what the SharePoint UI's "Copy link" hands you, and the
`shareUrl` field on `meeting recordings`.

The CLI consults both: the cards in the meeting conversation and the links recorded
on the item. `shareUrl` is `null` only when neither yields one for that recording,
and `shareLinks` lists everything found. Both reads are best-effort — a failure in
either degrades to fewer links, never to a failed command.

**What it is for.** Everything, when it exists. It is the one link to hand a human.

**Pros.**

- **Opens a browser page with the player and the transcript.** No Teams app, no
  app-handoff prompt, and nothing lost by staying out of the app.
- **It is the link whose permissions you widen to company-wide.** The Share → Copy link → Settings →
  audience workflow operates on this format, which makes it the only route to a
  link a non-attendee can open. Steps in
  [Widening permissions](#widening-permissions--the-procedure).
- Time codes (below) — the only format that takes one.

**Cons and limits.**

- **The `IQ…` token cannot be computed — only obtained.** Its tail is unguessable
  and unique per recording, so there is no per-drive secret to derive it from. It
  is not fully opaque, though: it *begins* with the recording's own id, which is
  enough to match a loose link back to a recording.
- **Obtaining is not the same as computing.** A `null` `shareUrl` is not a dead
  end: the link exists on the item and can be read back. Do not conclude from the
  null that the recording is unshared.
- Two variants exist: with and without an `?e=` token. Card-published links have
  no `e`; links copied through the Share dialog do. `nav` works on either.
- When you have no share link in hand, `recapUrl` is the working answer for that
  recording — at the cost of the app handoff, the time code, and widening.

### A recording has several share links, not one

Each carries a **scope** that decides who can open it — `users` for named people,
`organization` for anyone in the company. They are separate URLs with separate
tokens, which is why the widen-permissions procedure below hands you a *new* link
rather than changing the one you already had. Both remain valid.

So "the share link" for a recording is ambiguous. When you pass one on, what
matters is the scope and roles of the one you passed, not that it came from that
recording.

Three independent axes. `scope` is **who** the link works for; `roles` is **what
they can do with it**; `link.type` is Graph's own name for the same distinction as
`roles`, one level down. All three are text, so a value outside these tables can
appear — treat an unfamiliar one as unknown rather than assuming it is harmless.

| `scope` | Who it works for | Seen |
|---|---|---|
| `users` | specific named people | yes |
| `organization` | anyone in the company | yes |
| `anonymous` | anyone holding the link, no sign-in | not on any recording checked here — the CLI warns if one turns up |

| `roles` | What the holder can do | Seen |
|---|---|---|
| `read` | view | yes |
| `write` | **edit the recording** | yes |
| `owner` | the item's owner; these entries carry no link at all and are excluded from `shareLinks` entirely | yes |

| `link.type` | What it is | Seen |
|---|---|---|
| `view` | a read-only link | yes |
| `edit` | a write link | yes |
| `blocksDownload` | view, with download disabled | yes |

One recording carried all of `read`/`users`/`view`, `write`/`users`/`edit`, and
`read`/`organization`/`view` at once. **The two `users` links differ only in an
opaque token tail, so nothing in the URL tells you which is the edit link — only
`roles` (or, equivalently, `link.type`) does.**

`meeting recordings` reports both without ranking them:

- **`shareUrl`** — the link Teams published on the recording card. `null` when no
  card was found. It is not "the best link", just that one.
- **`shareLinks`** — the sharing links recorded on the recording, allowlisted
  rather than passed through: `id`, `roles`, `hasPassword`, `expirationDateTime`
  (Graph reports this at either the entry level or nested under `link` —
  whichever the response used, unmerged), and a nested `link` object carrying
  `scope`, `type`, `webUrl`, `preventsDownload`, and its own `expirationDateTime`.
  A permission with no `link` (an owner's direct access) is not a share link and
  is excluded, not reported as an empty row. Anything the service returns beyond
  those fields — grantee identities, an invitation, the redundant `shareId` — is
  never included, no matter how many people a link has been granted to.
- **`shareLinks` is `null`, not `[]`, when the lookup did not complete** — no
  Graph token, a `$batch` sub-response that came back throttled or errored, or a
  recording whose SharePoint identity was incomplete. `[]` means the lookup
  completed and found nothing. Do not read a `null` as "not shared": read
  `shareLinksUndetermined` on the same recording, which carries `graphStatus`
  (plus `retryAfterSeconds` on a 429) when Graph answered for it, or `reason`
  when no request was made. It is `null` whenever `shareLinks` is not.

The CLI also warns (stderr, `[teams] Warning: …`) on two share-link shapes that
are easy to hand over by mistake: an `anonymous`-scope link (opens for anyone
holding the URL, no sign-in) and an `organization`-scope link with `write`/`edit`
access (anyone at the company can edit it, not just view it).

Which one to send is yours to decide, because only you know the audience. For a
non-attendee, look for a `scope` of `organization`; do not assume `shareUrl` is it.
Check `roles` for `read` in the same breath — sharing a recording almost never means
handing over the ability to change it.

Where `shareUrl` fits: on the recordings checked, the card's link was
byte-identical to the `read`/`users`/`blocksDownload` entry, so the card appears to
publish a view link with downloads disabled. An observation, not a guarantee — if
it matters, read the `roles` (or `link.type`) of the matching `shareLinks` entry
rather than trusting that.

### Widening permissions — the procedure

Recordings default to the attendees of that **specific instance** — per-instance,
not per-series. This is the workflow that produces a link a colleague who was not
in the meeting can open. It is manual, one recording at a time: no bulk operation,
no admin override, no API.

1. Open the recording in SharePoint — the Stream share link gets you there in the
   browser.
2. **Share.**
3. **Copy link.**
4. Open the link **Settings** (the audience control on the copy-link dialog).
5. Set **"This link works for:"** to **"People in The Walt Disney Company"**.
6. **Apply.** The widened-permission link lands on your clipboard — there is no separate copy
   step.
7. Paste it where it needs to live. It is recorded on the item afterward, scope
   included, so this paste is a convenience rather than the only copy — a widened
   link can be read back later.

Two consequences worth carrying:

- A widened-permission link is genuinely broader than a recap deep link, so where something
  ranks links, an operator-provided one keeps precedence.
- Minting one programmatically (Graph `createLink`) would **change the recording's
  sharing state**. That is a deliberate human decision, not a lookup, and must
  never happen as a side effect of reading.

### Time codes

Append a `nav` parameter carrying base64url-encoded JSON with
`playbackOptions.startTimeInSeconds`, a float measured from the start of the
recording. No `?e=` token is needed. This is the only time-code mechanism
documented here; generated reports use it for every topic bullet.

---

## Recap deep link

**Starts with** `teams.microsoft.com/l/meetingrecap?`

**Where it comes from.** The "Copy link" action on a recap card in the Teams UI.
`teams meeting recordings` also returns one per recording as `recapUrl`.

**What it is for.** Reaching a recording's video and transcript when `shareUrl` is
`null`. It opens in the Teams app and offers a link onward to the browser page, so
it is a hop away from where a `shareUrl` would have put the reader directly.

**Pros.** Available for essentially every recording, because it is composed from
the recording's own SharePoint identity rather than from a card that may never
have been posted. Carries the full meeting context, so Teams shows the recap
around the video rather than a bare player.

**Cons and limits.**

- **Hands off to the Teams app.** A reader who does not live in Teams gets an
  app-handoff prompt before they get the recording. Prefer `shareUrl` when it is
  available.
- **No time code.** It carries no time, seek, or offset parameter. A timestamped
  link built on this loses its timestamp silently — use `shareUrl` instead.
- **`null` only when the recording has no usable SharePoint identity.** The link
  is composed from what Substrate returns for the recording, so a missing card
  costs the parameters that card would have supplied and nothing else. When the
  identity itself is incomplete there is no link that would address the right
  item, and `null` is the correct answer rather than an error.
- **Attendee-scoped.** Requires the reader's own Teams access to that specific
  meeting instance.
- Thirteen parameters of leaked internals from this CLI; the recap links Teams
  itself generates carry up to sixteen. A channel meeting adds none — it only
  flips `threadType` to `Channel`. Do not hand-edit the identifiers; regenerate
  instead.

**Useful property.** For a recap link you found somewhere rather than got from the
CLI, its `sitePath` and `fileUrl` parameters each carry another format, so it is
the cheapest source of one. Either may hold a Stream share token or a plain file
path — read the value, not the parameter name; a share token contains `/:v:/g/`.
From `meeting recordings` you never need this: `shareUrl` and `videoUrl` are
already separate fields.

---

## Raw file URL

**Starts with** `<tenant>-my.sharepoint.com/personal/…/Documents/Recordings/….mp4`

**Where it comes from.** `meeting recordings` returns it as `videoUrl`, and as
`sharePointUrl` when SharePoint offers a separate default-encoding URL. Both are
this shape.

**What it is for.** Reaching the media file itself — a download, or a player that
wants a file rather than a page.

**Pros.** Unambiguous; no tokens; readable — the meeting title and UTC timestamp
are in the filename.

**Cons and limits.**

- No transcript, no recap context.
- Time-code support is unknown. Prefer a Stream share link for that.
- Percent-encoded spaces make it awkward to paste and easy to double-encode.

---

## Transcript content API URL

**Starts with** `<tenant>.sharepoint.com/_api/v2.1/drives/…/items/…/transcripts/…/content`

**Where it comes from.** Not the CLI — older generated meeting-summary reports
are the only place you are likely to meet one.

**What it is for.** Fetching raw transcript content programmatically.

**Cons and limits.**

- Not a page. A human clicking it gets a payload, not a reader.
- **Cannot be constructed.** It needs a transcript GUID that no CLI output
  carries. If you have one, you got it from an existing report.
- Use `teams meeting transcript --recording-id <id>` instead, which returns
  structured entries with speakers and offsets.

---

## Message link

**Starts with** `teams.microsoft.com/l/message/19:…`

**Where it comes from.** `message list`, `message get`, and the channel message
commands return one per message as `messageLink`. Returned by the CLI.

**What it is for.** Opening one specific message in place — the recap card itself,
or whatever someone said. When you want to cite the message rather than the media,
this is the link.

**Two shapes.** In a chat it carries `tenantId` and a `context` object. In a
channel (`@thread.tacv2`) it instead carries `groupId`, `parentMessageId`, and
`createdTime`, because a channel post needs its parent thread to resolve.

**Cons and limits.** Not a link to a recording. It resolves only for people who
can already see that conversation.

---

## Conversation link

**Starts with** `teams.microsoft.com/l/chat/19:meeting_…`

**Where it comes from.** Not the CLI — downstream code builds it from a
`threadId`, as the meeting-summary report generator does. The CLI gives you the
`threadId` (`meeting list` and `meeting get` emit a ready-to-use one for any
online meeting); assembling the URL is the caller's choice.

**What it is for.** The conversation as a whole — chat messages, shared files, and
the recap card.

**Cons and limits.** It is not a link to the recording. A reader lands in the
chat and still has to find the recap card and click it. That extra hop is the
reason the recap deep link exists. Reach for a conversation link when the
discussion is the point, not the video. If you want one specific message, prefer
the message link the CLI already returns.

---

## Join link

**Starts with** `teams.microsoft.com/l/meetup-join/19:meeting_…`

**Where it comes from.** The calendar event's `onlineMeeting.joinUrl`, returned by
`meeting list` and `meeting get`.

**What it is for.** Joining the live meeting — **not** the recording. It is
listed here because it is the most common misidentification: it contains the same
`19:meeting_…@thread.v2` id as every recording link for that meeting.

**Cons and limits.** No video, no transcript, no time code — it addresses the
meeting, not a recording. Its resemblance to the recording links is the whole
hazard: the same thread id, an entirely different destination.

**Useful property.** Its `context` parameter carries the tenant (`Tid`) and
organizer (`Oid`) object ids, and the path segment carries the thread id.

---

## If you have one and need another

- **Need a timestampable link.** Use the `shareUrl` field and append `nav`. Do not
  dig `sitePath` out of a `recapUrl` — that parameter holds a plain file path when
  no card was posted, and `nav` does nothing to one of those.
- **Recap link → file.** `fileUrl` holds either a raw file URL or a share token.
  A token still plays; it is just not a file.
- **Share link → recording id.** Base64url-decode the last path segment — it
  begins with the recording's own id, which is how a loose link gets matched to a
  recording instead of guessed at by timestamp. `recap.rs` does this.
- **Recap link → the browser page.** Open it and follow the link onward that the
  Teams app offers. There is no URL edit that gets you there; if the recap link
  came from `meeting recordings`, use that recording's `shareUrl` instead and skip
  the hop.
- **Any link → thread id.** All meeting link formats carry the same
  `19:meeting_…@thread.v2`. Feed it to `meeting recordings` to get every recording
  on that meeting, each with its own `shareUrl` and `recapUrl`.
- **Recording → transcript text.** `meeting transcript --recording-id <id>`. Do
  not try to reach transcript text through a link.
- **Attendee-only link → something a colleague can open.** Not a URL edit. Take
  the recording's Stream share link into SharePoint's Share dialog and widen its
  permissions — see [Widening permissions](#widening-permissions--the-procedure).

## Pitfalls that bite

Every one of these fails quietly — no error, just a link that is wrong.

| Pitfall | What actually happens | Instead |
|---|---|---|
| Reusing one link across a series | A link belongs to one recording, and one meeting can hold several — a stop/resume produces two under a single call. The link is right for one date and wrong for the rest | Key every link by `recordingId` from `meeting recordings`; emit one row per recording, not per date. The command nests recordings under their call, so a stop/resume stays visible |
| Matching a link to a recording by timestamp | Lands on the wrong recording — the card is published when processing finishes, which can be long after the recording started | Use the `shareUrl`/`recapUrl` `meeting recordings` already attached, matched on the recording id inside the share token. To match a loose link, decode that token instead of comparing times |
| Trusting a link because it built without error | A wrong identifier addresses a *different item*: a permission error if that item belongs to someone else, the wrong recording if it does not | Confirm the link resolves to the recording you intended. A `null` link is a correct answer; a plausible wrong one is not |
| Putting `recapUrl` on a timestamped bullet | The timestamp is dropped and the reader lands at 0:00 | The `shareUrl` field with `nav` appended. If `shareUrl` is null, that recording cannot be timestamped at all |
| Picking a `shareLinks` entry by scope alone | You can hand over a `write` link, giving the reader edit access to the recording. The `read` and `write` links for the same audience differ only in an opaque token, so the URL gives no warning | Match on `roles` as well as `scope` — `read` for anyone you are merely showing the recording to |
| Treating a null `shareUrl` as proof the recording is not shared | You walk the widen-permissions procedure for a recording that already has share links, minting yet another one | A null field means the CLI found no card, not that no link exists. Check what the recording already carries before creating anything |
| Sending a recap link to a non-attendee | Permission error — it is scoped to that meeting instance | Widen permissions on the recording's share link and send that ([procedure](#widening-permissions--the-procedure)) |
| Hand-editing a link's parameters | The identifiers are interdependent, so you get a wrong link rather than an error | Re-run `meeting recordings` for a fresh `recapUrl`. Appending `nav` to a share link is the only safe edit |

## Where the code is

The identifier encodings are undocumented Microsoft internals inferred from
observed links. They are deliberately not transcribed here — read the code:

- `crates/teams-cli/src/commands/recap.rs` — composing and parsing the recap link
  and share tokens, as pure functions with the verified vectors in its tests.
- `crates/teams-cli/src/commands/chatsvc.rs` — `get_meeting_cards`, which harvests
  the card that carries the share link. Tests use real card bodies.
- `crates/teams-cli/src/commands/meeting.rs` — where `recapUrl` is assembled and
  which fields reach the output.

## Parameter quirks worth knowing

- **Most of them are not load-bearing.** The recap page resolves the recording
  from `driveId` and `driveItemId`; `sitePath`, `fileUrl`, `threadId`, and
  `callId` fill in the rest. A link carrying only those six opens. `iCalUid`,
  `masterICalUid`, `organizerId`, `tenantId`, `threadType`, `meetingType`, and
  `subType` are not required — so a shorter link is not a broken one.
- **`masterICalUid` appears on recurring meetings and not on one-offs.** Where
  present it differs from `iCalUid`, and that difference is what marks the meeting
  as recurring. A generated link includes it either way, so a one-off carries a
  parameter Teams itself would omit.
- **`subType` records where the link was copied from, not anything about the
  meeting.** Its value varies. Do not read meaning into it or match on it.
- **`threadType` casing varies** — both `Meeting` and `meeting` occur, so Teams
  appears not to care.
- **Channel meetings carry three extra parameters** that private meetings do not:
  `organizerGroupId`, `channelType`, `replyChainId`. The CLI does not emit them,
  so a generated link for a channel meeting is the one case worth opening
  yourself before you pass it to someone else.
