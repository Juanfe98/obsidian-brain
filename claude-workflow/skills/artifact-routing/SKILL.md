---
name: artifact-routing
description: >
  Decide where a generated page, plan, spec, report, diagram, dashboard, or
  prototype should go: the built-in Claude Artifact tool (ephemeral,
  in-conversation, inline review comments, hosted by Anthropic) or aix-proto
  (hosted, MyID-gated, internal-only, linkable, persistent). A markdown plan or
  spec that several people review goes to a static aix-proto publish. Gives the
  content gate, the audience gate, the content that goes to neither, and the
  publish steps for each.
  TRIGGER when the user asks to make an artifact, publish or share a page,
  build a dashboard or status board, put a plan or spec somewhere for review,
  share a codebase report or system design, or asks whether artifacts are
  allowed at Disney; and whenever you are about to call the Artifact tool for
  Disney work.
  SKIP for code changes, documents that belong in Confluence or Google Docs,
  and deploying a dynamic aix-proto app (use the aix-proto skill directly).
version: "1.2.0"
author: daniel.schladweiler
last_updated: "2026-10-23"
keywords:
  - artifact
  - artifacts
  - publish
  - share a page
  - aix-proto
  - dashboard
  - status board
  - plan review
  - spec review
  - system design
  - prototype
  - inline comments
---

# Where does this artifact go?

Two destinations, behind two gates. Run the gates in this order. Gate 2 cannot
lift gate 1, so an answer at gate 2 alone never picks a destination.

## Gate 1: what does it carry?

| Content | Destination |
|---|---|
| Production data, personal data about customers or employees, credentials, API keys, tokens | **Neither.** Say so and stop. |
| Any other non-public Disney content, or content you cannot classify | **aix-proto** |
| Nothing non-public | Continue to gate 2 |

Non-public Disney content means unreleased titles or dates, revenue or
subscriber figures, internal hostnames and architecture that is not already
public.

aix-proto is not the escape hatch for the first row. Its own skill is explicit
about this: nonprod prototype data only, never production or customer data. So
that content has no destination here, and the answer is to name what is
blocking rather than to route it somewhere.

## Gate 2: who opens it?

Reachable only when gate 1 found nothing non-public.

**Will anyone open this outside the conversation?**

| Answer | Destination |
|---|---|
| Yes | **aix-proto** — hosted at `/a/<slug>/`, MyID-gated, internal-network-only, versioned, private by default |
| No | **Built-in Artifact tool** — renders in the conversation, supports inline review comments, hosted by Anthropic. Claude only, so on Cursor, Codex and VS Code answer in the conversation instead |

When you cannot tell, use aix-proto.

Any one of these is a yes, however one-off the ask sounds:

1. Someone will bookmark it, link to it, or send the URL to another person.
2. It has to still be there next week, or it is the canonical copy of anything.
3. It is a prototype, demo, dashboard, or status board, meaning something people
   will use rather than read once.
4. It needs auth, a real backend, persistence, or more than static files.

## Good artifact uses

These are why the Artifact tool is worth having, and each of them clears both gates:

- A plan or spec that one reviewer, in this conversation, comments on inline.
  You act on the comments and the artifact's job is over.
- A codebase report or system design read once in the thread.
- A scratch visualization, chart, or diagram that supports the current answer.
- A quick UI mock you are iterating on with the person you are talking to.

An artifact is a review surface, not a distribution channel. The moment the ask
turns into "send this to the team", it is an aix-proto page.

## Plans and specs that several people review

A markdown plan or spec that several people review goes to a static aix-proto
publish (below), not the Artifact tool, after gate 1 has passed. Doc apps
(`aix-proto publish --doc`) stay off until Security and Data Governance approve
them (AIX/aix-proto#1502), so do not use them. If the user names margin (an
aix-proto app), use margin once gate 1 has passed.

A static page takes comments only when its manifest opts in and the platform
has comments on. Comments wait on the same approval, so do not opt the page in
to get them. After publishing, use the `aix-proto` skill's feedback read to
check, and tell the user plainly whether reviewers can comment on the page.
When they cannot, say so: the page is for reading, and feedback goes back to
the author another way.

## Publishing to aix-proto

Static page, no PR and no git:

```bash
aix-proto publish <slug>
```

It validates locally first (secret scan, 5 MiB per file and 50 MiB per app caps,
no symlinks, an `index.html`), uploads the bytes, and the control plane serves
the page immediately. Republishing the same slug appends a rollback-able
version. Dynamic apps use `aix-proto deploy` and keep the git to PR to CI flow.
Full detail, including access changes and retirement, is in the `aix-proto`
skill.

## Using the built-in Artifact tool

No special step. It is enabled on AIX-managed setups. Run both gates first,
then create the artifact as normal.

Only Claude has this tool, and this skill installs on Cursor, Codex and VS Code
too. There, a two-no answer means answer in the conversation, and use aix-proto
when the output has to be a page.

If you are in Claude Desktop chat or Cowork you have no shell, so
`aix-proto publish` is not available to you. Route the ask to Claude Code and
say why, rather than falling back to an artifact for output that needs hosting.

## Public-facing output

Anything published, posted, or shared externally or with guests needs
brand/legal sign-off before it goes live. That is separate from this routing
decision and applies to both destinations. AI use policy and approvals:
https://ai.disney.com/guiding-principles/safe-use-guidelines
