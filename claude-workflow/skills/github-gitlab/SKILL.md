---
name: github-gitlab
version: "2.1.2"
author: AIX Team
description: >-
  How to reach Disney/TWDC GitHub Enterprise and GitLab from chat/Cowork via the
  read-only unvrs gateway (`unvrs_gh` / `unvrs_glab`, wrapping `gh api` / `glab
  api`). There is no public github.com here — only five GitHub Enterprise hosts
  plus one GitLab. `unvrs_gh` takes a `host` selector to pick which one; each is
  authenticated by its own pat-manager service. TRIGGER when the user asks about
  repos, pull/merge requests, issues, CI/Actions/pipelines, releases, or code on
  any Disney/TWDC GitHub or GitLab host; names github.twdcgrid.net / Hulu /
  BAMTech / Disney / ESPN GitHub or gitlab.disney.com; or when a gh/glab gateway
  tool reports it is not authenticated.
roles:
  - engineer
keywords:
  - github
  - gitlab
  - gh
  - glab
  - pull request
  - merge request
  - repo
  - actions
  - ci
  - pat-manager
  - github enterprise
  - unvrs gateway
  - twdcgrid
  - host routing
---

# GitHub & GitLab via AIX

AIX exposes GitHub and GitLab to chat/Cowork **read-only** through the **unvrs
gateway** — the MCP tools `unvrs_gh` and `unvrs_glab`, which run `gh api` and
`glab api` (GET only; no writes, no `gh auth`, no shell access). There is **no
public github.com** here: every GitHub host is a separate **GitHub Enterprise**
instance with its own Personal Access Token.

## Picking a host (`unvrs_gh`)

`unvrs_gh` reaches **five** GitHub Enterprise instances. Pass the **`host`**
parameter to choose one (it is the pat-manager service id); omit it to use the
default, **`github-twdc`** (github.twdcgrid.net — where `aix-registry` and the
AIX platform repos live). The gateway points `gh` at that host and uses that
host's token for the single call, so a request never reaches the wrong host.

When the user names a repo or org, infer the host: a `*.twdcgrid.net` / AIX /
platform repo → `github-twdc`; Hulu → `github-hulu`; BAMTech → `github-bamtech`;
Disney corp → `github-disney`; ESPN → `github-espn`. If it is genuinely
ambiguous (the same org name can exist on more than one host), ask which
instance rather than guessing.

`unvrs_glab` has a single host (gitlab.disney.com) and needs no selector.

## The hosts, and how each is authenticated

Each instance authenticates **independently**, and the gateway accepts **either**
a pat-manager PAT **or** the host's own native `gh`/`glab` login. The `host` value
you pass to `unvrs_gh` **is** the pat-manager service id. Per call the gateway
resolves, in order: the per-host token env var → pat-manager(service) → the CLI's
own host-keyed credential (from `gh auth login --hostname <host>` / `glab auth
login`). If none is present, the call is cleanly "not authenticated for <host>".

<!-- generated: host-table:start (source of truth: pat-manager/src/schemas/config.ts; verified by scripts/lint-gh-host-parity.py) -->

| pat-manager service (`host`) | Host | Token env var |
|---|---|---|
| `github-twdc` | `github.twdcgrid.net` | `GITHUB_TWDC_TOKEN` |
| `github-hulu` | `github.prod.hulu.com` | `GITHUB_HULU_TOKEN` |
| `github-bamtech` | `github.bamtech.co` | `GITHUB_BAMTECH_TOKEN` |
| `github-disney` | `github.disney.com` | `GITHUB_DISNEY_TOKEN` |
| `github-espn` | `code.espn.com` | `GITHUB_ESPN_TOKEN` |
| `gitlab` | `gitlab.disney.com` | `GITLAB_TOKEN` |

<!-- generated: host-table:end -->

## Using the gateway

- **List/read** PRs, issues, check runs, releases, repo/org metadata, and search
  through `gh api <path>` / `glab api <path>`. Both return JSON natively.
- **Read-only only** — create/update/merge/delete, running `gh auth` *as a gateway
  subcommand*, the `--hostname` host-redirect, and gh's `--jq`/`--template`
  transforms are blocked by design. (Setting up native auth with `gh auth login
  --hostname <host>` in your own terminal is fine — the gateway then uses that
  stored credential; see remediation below.)
- **Writes run in Claude Code.** GitHub and GitLab writes, PR title or body
  edits included, are not available in Claude Desktop chat or Cowork. Tell the
  user that Claude Code can make them; the gateway's refusal says the same.
- **`unvrs_gh`** picks the host from the `host` parameter (default
  `github-twdc`) and injects that host's token. **`unvrs_glab`** always targets
  gitlab.disney.com.

## If a gateway tool reports "not authenticated"

It means the **selected host** has no token connected — `unvrs_gh` against
`github-hulu` needs the `github-hulu` service connected, independently of the
others. Connect it, then **retry the call** (the gateway resolves auth live per
call — a newly stored PAT or a fresh `gh auth login` is picked up on the next
call, no Claude Desktop restart needed).

<!-- chat / Cowork: AIX Manager only — never emit a terminal or pat-manager command on this surface -->
**In Claude Desktop chat / Cowork:** tell the user to open the **AIX Manager**
desktop app → **Home** and connect GitHub or GitLab there (it walks them through
sign-in to the host; on an older AIX Manager with an Auth tab on the left, sign in there instead, then update AIX Manager). Do not suggest pasting a PAT into the chat, and do not give terminal
or `pat-manager` commands here.

<!-- Claude Code / Cursor / terminal only -->
**In Claude Code / Cursor (terminal available):** two ways to authenticate a
host — either works through the gateway:
- **Native login (nothing to mint):** `gh auth login --hostname <host>` (e.g.
  `gh auth login --hostname github.twdcgrid.net`), or `glab auth login` for
  gitlab.disney.com. With no pat-manager PAT set, the gateway falls back to this
  host-keyed credential automatically.
- **pat-manager PAT:** `pat-manager set <service> <token>` (e.g. `pat-manager set
  github-twdc <token>`); check with `pat-manager status`. A PAT takes precedence
  over a native login.
