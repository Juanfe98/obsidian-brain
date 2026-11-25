---
name: meeting-recap
description: Read a meeting transcript (Teams/Zoom/Whisper .vtt, .srt, .txt, .md or .docx) and write a self-contained HTML recap page next to it — overview, decisions, action items with the user's own items highlighted, open questions, and a "learn from this" section that teaches the technical concepts and knowledge transfer from the meeting. Use this whenever the user asks to read, summarize, recap, digest, or "go through" a meeting transcript or recording text — backlog refinement, Jira ticket refinement, daily standup, sprint planning, technical deep-dive, knowledge-transfer, or 1:1 — or points at a folder of transcript files and asks what was discussed, what they need to do, or what was decided, even if they don't say "HTML" or "recap".
---

# Meeting Recap

Turn a raw meeting transcript into a single HTML page the user can come back to weeks later and immediately recall: what the meeting was about, what was decided, what *they* have to do, and what they should learn from it.

The page lives **next to the transcript** (same folder) so the recording, the transcript and the recap stay together.

## Who "me" is

The user is **Juan** (Juan Felipe Montaña). They are a software engineer on the Flex team (`growth-life-client-api`, Disney+/Hulu/ESPN+ commerce and subscription screens). English is their second language. When the transcript says "Juan", "Felipe", "JF", or someone addresses "the Flex engineer", that's likely them.

If the user's request or `~/.claude/CLAUDE.md` gives a different name or role, use that instead.

## Step 1 — Find and read the transcript

The user may give a file or a folder. Transcript tools often export the *same* meeting in several formats (e.g. `name.txt`, `name.srt`, `name.vtt`). Read only **one** of them — preferring, in order:

1. `.vtt` — has timestamps, and Teams VTT has speaker tags (`<v Jane Doe>`)
2. `.srt` — timestamps, no speakers
3. `.docx` — Teams exports often include speaker names (use `pandoc` or `textutil -convert txt` to read)
4. `.txt` / `.md`

Only if the folder contains clearly *different* meetings, ask which one (or recap each into its own page).

Read the whole transcript before writing anything. Note the first and last timestamps — the duration is useful, and if the first line starts mid-sentence the recording probably missed the beginning; say so on the page rather than pretending it's complete.

**Work from the transcript only.** Don't explore code repositories, the current working directory, git history, Jira, or other files to add context — even if the session happens to be inside a repo the meeting talks about. The page is a faithful record of the meeting; repo research makes the recap slower and mixes in claims nobody made in the room. If something in the meeting would clearly be worth checking in code, list it under *Open questions & follow-ups* instead. General background knowledge (e.g. what "TVE" usually means) is still fine in the learning section, marked as background.

## Step 2 — Understand the meeting

Transcripts are messy: no punctuation, mis-heard words, cross-talk, and often **no speaker labels**. Do the interpretive work a good human note-taker would.

**Classify the meeting** — refinement, daily, planning, technical deep-dive / knowledge transfer, stakeholder sync, 1:1, other. The type changes what matters most:
- *Refinement*: what the ticket/experiment is, scope, acceptance criteria, open questions, estimates, engineering gotchas.
- *Daily*: per-person updates, blockers, and anything the user said they'd do today.
- *Technical / KT*: concepts, how a system works, ownership, diagrams that were shared — the learning section becomes the centrepiece.

**Infer speakers carefully.** Without labels, use turn-taking ("Does anyone have questions?" → facilitator), role cues ("a reminder for engineering…" → product/PM), first-person commitments ("I will…", "I'll send you…"), names used in address ("Agnes, they don't need you…"), and domain vocabulary. Refer to people by role ("PM", "facilitator", "ESPN product partner") when you don't know the name. Never invent a name.

**Identify the user's lines.** Look for the speaker who matches Juan's profile — the engineer asking about Flex/API/analytics/implementation details, someone with non-native phrasing, or anyone addressed as Juan. When you attribute something to them, record *why* (the cue) and a confidence level (high / medium / low). A wrongly-attributed action item is worse than a "possibly yours" one, so be honest about uncertainty.

**Fix mis-heard terms when context makes the correction obvious** (e.g. "Datadoc" → Datadog, "Shoot fleet" may be a team name you can't resolve — keep the original in quotes). Keep a short list of these corrections for the page so the user can verify them.

**Extract**:
- **Decisions** — things agreed or announced as settled. Distinguish from proposals.
- **Action items** — owner (name/role/"Juan" with confidence/"team"/"unassigned"), what, any due date or "next Thursday"-style timing, and timestamp.
- **Open questions / risks** — things raised but not resolved.
- **References** — Jira keys (e.g. `GCIEX-20466`, `FLEX-1234`; the filename often contains one), screens, services, repos, tools, dashboards, links "in the chat" that the user may want to go find. Just list them; don't call external systems.
- **Concepts to learn** — any domain or technical idea that was explained, assumed, or that someone new might not know: product flows, experiment design (control vs treatment), system ownership, acronyms (L4L, TVE, KT…), analytics events, architecture. These are the heart of the "learn" section.

## Step 3 — Write the HTML page

Copy `assets/recap-template.html` (next to this file) as the starting point and fill it in. It already has the styling (light/dark aware, print-friendly, no external resources), so focus on content. Remove any section that would be empty rather than leaving "None" — except **Action items for you**, which should say explicitly when nothing was assigned to the user (that itself is useful to know).

**Filename**: `<transcript-basename>.recap.html` in the transcript's folder (e.g. `GCIEX-20466-refinement.recap.html`). If it already exists, overwrite it only if the user is clearly re-running the recap; otherwise ask.

**Sections, in order:**

1. **Header** — a descriptive title (not the filename), meeting type, date if known (filename, transcript, or file mtime — say which), duration, inferred participants by role, and related Jira keys.
2. **TL;DR** — 3–5 sentences: why the meeting happened, the most important outcome, and what the user needs to do.
3. **For you (Juan)** — highlighted box. Their action items, things they committed to, questions they asked and the answers they got, and anything that changes their work even if not assigned to them (e.g. "engineering needs to update Glimpse analytics for the cadence step" when they're the Flex engineer). Each with confidence + the cue.
4. **Decisions** — each with a one-line "why" if it was given, and timestamp.
5. **All action items** — table: owner · task · when · timestamp.
6. **Discussion** — the main topics in the order they came up, each as a short heading with a few sentences or bullets. Capture the *reasoning* and the examples people used, not just conclusions — this is what makes the recap useful weeks later.
7. **Learn from this meeting** — for each concept: what it is in plain English, how it was used in this meeting, and why it matters for the user's work. A small flow diagram (inline SVG or a styled step list) helps a lot when a user flow or pipeline was described step by step. You may add general background knowledge to make an explanation complete, but visually mark it as *background* so the user can tell what was said in the meeting from what you added.
8. **Open questions & follow-ups** — unresolved items, things "to be sent in the chat", things to verify.
9. **References** — Jira keys, systems, screens, tools mentioned.
10. **Transcript notes** — which file was used, whether the start/end looks truncated, speaker-inference caveats, and the mis-heard-term corrections you made.

**Writing style**: clear, plain English (the user reads English as a second language — prefer short sentences and avoid idioms). Use the meeting's own vocabulary so they can search for it. Add `[mm:ss]` timestamps when the transcript has them, so they can jump back into the recording.

## Step 4 — Report back

Keep the chat reply short: the path to the HTML file, a 2–3 line TL;DR, and the user's own action items. Offer `open <path>` so they can view it. Don't publish the page anywhere — meeting content is internal and the file stays local.
