# PR Description Generator

A Claude Code skill that generates senior-level PR descriptions from your current branch.

## What It Does

Analyzes the diff between your current branch and main/master, then generates a PR description with:
- **Description** - Why this change matters and the approach taken
- **Changes** - Behavior changes (not file lists)
- **Breaking Changes** - Explicit section, always present
- **Steps to QA** - Structured setup, test steps, and edge cases

## Installation

Copy this skill folder to your Claude Code skills directory:

```bash
cp -r pr-description-generator ~/.claude/skills/
```

Requires:
- Git
- Python 3

## Usage

```bash
# From your feature branch
/pr-description

# Compare against a specific base branch
/pr-description --base develop
```

## Example Output

```markdown
## Description

Prevent duplicate charges when users double-click the checkout button. The current implementation allows multiple submissions, causing billing issues reported in #342.

Closes #342

### Changes
- Add request deduplication using idempotency keys
- Disable submit button after first click
- Return cached response for duplicate requests within 5-minute window

### Breaking Changes

None.

## Steps to QA

### Setup
1. Checkout this branch
2. Seed a test user with a valid payment method: `npm run seed:test-user`

### Test Steps
1. Navigate to `/checkout` with items in cart
2. Click "Pay Now" and immediately click again rapidly
3. Verify only one charge appears in Stripe dashboard
4. Verify user sees success page (not error)

### Edge Cases to Verify
- Refresh the page after payment - should show order confirmation, not retry payment
- Open checkout in two tabs, submit both simultaneously - only one should succeed
```

## Features

| Feature | Description |
|---------|-------------|
| **Issue detection** | Finds `#123`, `JIRA-456`, `fixes #789` in commits and links them |
| **Breaking change detection** | Flags API changes, schema changes, config changes |
| **Behavior-focused changes** | Lists what changed, not which files |
| **Structured QA** | Setup → Test Steps → Edge Cases format |
| **Large diff handling** | Warns and summarizes when diff exceeds 2000 lines |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No changes | Outputs "No changes found..." and stops |
| Large diff (50+ files or 2000+ lines) | Warns and focuses on stat summary + commits |
| No breaking changes | Outputs "None." explicitly |
| No issue references found | Omits the "Closes #XXX" line |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/get_branch_diff.py` | Gets diff between current branch and base |

### Script options

```bash
# Get everything at once (recommended)
python3 scripts/get_branch_diff.py --all

# Get diff stat summary only
python3 scripts/get_branch_diff.py --stat

# Get commit messages only
python3 scripts/get_branch_diff.py --commits

# Get full diff only
python3 scripts/get_branch_diff.py

# Compare against specific branch
python3 scripts/get_branch_diff.py --base develop --all
```

## Customization

Edit `SKILL.md` to adjust:
- PR description template/format
- Breaking change detection rules
- QA steps structure
- What to include/exclude
