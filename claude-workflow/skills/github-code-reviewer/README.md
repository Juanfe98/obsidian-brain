# GitHub Code Reviewer



A Claude Code skill for senior-level PR reviews. High signal, low noise.

## What It Does

Reviews GitHub pull requests and flags only high-severity issues:
- **Bugs** - Logic errors, null derefs, race conditions, unhandled edge cases
- **Security** - Injection, XSS, auth bypass, credential leaks
- **Performance** - N+1 queries, inefficient algorithms, memory leaks
- **Breaking changes** - API incompatibilities, migration issues
- **Architecture violations** - Layer breaks, major pattern deviations

It explicitly ignores style, naming, nits, minor improvements, and "nice to have" suggestions.

## Installation

Copy this skill folder to your Claude Code skills directory:

```bash
cp -r github-code-reviewer ~/.claude/skills/
```

Requires:
- `gh` CLI installed and authenticated
- Python 3

## Usage

```bash
# Review a PR by number (from within a repo)
/github-code-reviewer 123

# Review a PR by URL
/github-code-reviewer https://github.com/owner/repo/pull/123

# Review and post comments directly to GitHub
# Only use this when you intentionally want comments posted.
/github-code-reviewer https://github.com/owner/repo/pull/123 --post
```

## How It Works

1. **Loads PR context** - Fetches PR metadata and diff via `gh` CLI
2. **Deep analysis** - Reads related files, traces call sites, checks tests, verifies assumptions
3. **Validates findings** - Confirms each issue is reachable and impactful before flagging
4. **Outputs review** - Creates `/tmp/pr-review.json` and prints human-readable preview
5. **Posts only when authorized** - Submits comments only if `--post` was passed or the user explicitly approves after preview

## Output

**If no issues:**
```
No high-severity issues found.
```

**If issues found:**
```
## Review Comments

**src/services/user.service.ts:42**
bug: Null dereference - user.profile can be undefined when account is deactivated (see UserRepository.findById:78)

**src/db/queries.ts:89**
security: SQL injection via userId - string concatenation, user input flows from controller:42
```

Comments are also saved to `/tmp/pr-review.json` for optional posting. They are not posted unless `--post` was passed or the user explicitly approves posting after seeing the preview.

## Comment Format

Each comment follows `category: issue + evidence`:

```
bug: Race condition - concurrent calls to updateBalance() can lose writes (no lock, see handler at api/routes.ts:156)
```

```
security: SQL injection via userId parameter - string concatenation at line 89, user input flows from controller:42
```

```
performance: N+1 query - fetches user.orders in loop, will be 100+ queries for large accounts
```

Evidence (line numbers, call sites, code paths) is required. Vague comments like "this might cause issues" are not produced.

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/get_pr_info.py` | Fetches PR metadata (title, body, files, reviews) |
| `scripts/get_pr_diff.py` | Fetches PR diff, optionally filtered by file |
| `scripts/submit_review.py` | Submits review comments to GitHub; requires `--confirm-post` and only uses review event `COMMENT` |

### Manual script usage

```bash
# Get PR info
python3 scripts/get_pr_info.py https://github.com/owner/repo/pull/123

# Get PR diff
python3 scripts/get_pr_diff.py 123 --repo owner/repo

# Get diff for specific file
python3 scripts/get_pr_diff.py 123 --repo owner/repo --file src/main.ts

# Submit review comments after explicit approval
python3 scripts/submit_review.py 123 --repo owner/repo --comments-file /tmp/pr-review.json --confirm-post
```

## Design Philosophy

This skill is opinionated:

1. **Quality over speed** - Claude is instructed to read surrounding code, trace execution paths, and verify assumptions before flagging issues. A 10-line diff might require reading 500 lines of context.

2. **No false positives** - If impact can't be confirmed, the issue isn't flagged. This prevents noise.

3. **Evidence required** - Every comment must cite the line numbers or code paths that prove the issue exists.

4. **Humans approve** - The skill only submits GitHub review comments. It never approves or requests changes. That's your job.

5. **No surprise posting** - The default behavior is preview-only. The skill must not create GitHub comments without `--post` or explicit user approval.

## Customization

Edit `SKILL.md` to adjust:
- Severity thresholds (what counts as "high-severity")
- Output format
- Posting behavior
