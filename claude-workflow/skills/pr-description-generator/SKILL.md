---
name: pr-description
description: Generate senior-level PR descriptions from your current branch diff. Includes context, changes, breaking changes, and QA steps.
allowed-tools: Read, Glob, Grep, Bash(python3 scripts/*), Bash(git *)
argument-hint: [--base <branch>]
disable-model-invocation: true
---

# Senior-Level PR Description Generator

Generate a well-structured PR description that gives reviewers the context they need.

## Inputs

- Base branch: $ARGUMENTS (optional, defaults to main/master)

## Procedure

### 1. Gather Context

```bash
python3 scripts/get_branch_diff.py $ARGUMENTS --all
```

This returns stat summary, commit messages, and full diff in one call.

### 2. Handle Edge Cases

**If no changes detected:**

```
No changes found between current branch and base branch. Nothing to describe.
```

Stop here.

**If diff is very large (50+ files or 2000+ lines):**

- Focus on the stat summary and commit messages
- Group changes by directory/component
- Don't try to describe every file

### 3. Deep Analysis

Review the diff to understand:

**The "Why":**

- What problem is being solved?
- Why was this approach chosen over alternatives?
- Look at commit messages for context

**The "What":**

- What are the main changes?
- What files/components are affected?

**Breaking Changes Detection:**

- API signature changes (new required params, removed endpoints, changed response shapes)
- Database schema changes (new required columns, dropped tables, renamed fields)
- Config/environment changes (new required env vars, changed defaults)
- Removed or renamed public functions/classes/exports

**Issue/Ticket Detection:**

- Look for issue references in commit messages (e.g., #123, JIRA-456, fixes #789)
- Extract these to link in the description

If needed, use Read/Grep/Glob to understand context around the changes.

### 4. Generate PR Description

Output the description in this exact format:

```markdown
## Description

[1-2 sentences: What problem does this solve and WHY this approach was chosen]

[If issue/ticket found: Closes #XXX or Relates to #XXX]

### Changes

- [Main change 1 - focus on behavior, not files]
- [Main change 2]
- [Main change 3]

### Breaking Changes

[If none detected:]
None.

[If breaking changes detected:]

- **[Type]**: [Description of what breaks and migration path]

Example:

- **API**: `GET /users` now requires `org_id` query param. Clients must update their calls.
- **Database**: New required column `users.email_verified`. Run migration before deploying.

## Steps to QA

### Setup

[Any prerequisites: branch to checkout, env vars to set, data to seed. Omit section if none.]

### Test Steps

1. [Specific action - include exact commands, URLs, or UI paths]
2. [Next action]
3. [Verification - what should the tester see/confirm as success?]

### Edge Cases to Verify

- [Edge case 1 to test, if any critical ones exist]
- [Edge case 2]
  [Omit section if no notable edge cases]
```

## Guidelines

**Description section:**

- Lead with WHY, not what. What problem exists? Why does this fix matter?
- Keep it to 1-2 sentences - don't repeat what's in the Changes list
- Include issue links if found in commit messages
- The Changes list should be 3-5 items max, grouped logically
- Describe behavior changes, not file changes ("Add rate limiting to API" not "Update api.ts")

**Breaking Changes section:**

- Always include this section
- If no breaking changes, write "None." - this explicitly signals you checked
- If breaking changes exist, include migration path (what consumers need to do)
- Be specific: which endpoint, which field, which function

**Steps to QA section:**

- Write steps a teammate can follow without asking questions
- Be specific: exact URLs, exact commands, exact UI paths
- Include expected results ("should see...", "should return...")
- Add edge cases section only if there are non-obvious scenarios to test
- For backend: include curl commands or API paths
- For frontend: include which pages/flows to check
- For both: include any test credentials or data needed

**Keep it concise:**

- Don't list every file changed - that's what the diff is for
- Don't explain obvious things
- Don't add implementation details unless they affect how to test
- One good edge case is better than five obvious ones

## Output

Print the PR description directly in a markdown code block so the user can copy it.
