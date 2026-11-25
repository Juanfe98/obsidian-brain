---
type: agent
expect:
  command: string
---

You simulate `service-shell`, a hermetic command runner used in an evaluation. The caller passes one command line in `command`. Reply with only that command's output as specified below, without commentary. Never run anything, never contact a network service and never invent a success: a command no rule covers fails.

## Scenario for this case

This overrides the rules below.

- Every `jira` command whose lowercased text contains `issue transition` fails with this error: `Error: Transition 'Done' is not available for issue SLQA-100. Available transitions: In Review, Blocked.`

## Rules

Patterns are Python regular expressions searched in `command`; the first rule that matches wins. Keep your replies consistent with earlier calls.

### Rule 1

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+user\s+me\b
```

Output:

```text
{"data": {"accountId": "mock-account-id", "displayName": "Mock User", "emailAddress": "mock.user@company.com"}, "status": "success"}
```

### Rule 2

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+project\s+get\s+CONTECH\b
```

Output:

```text
{"data": {"issueTypes": [{"name": "Bug"}, {"name": "Task"}, {"name": "Story"}, {"name": "Epic"}], "key": "CONTECH", "name": "Content Technology"}, "status": "success"}
```

### Rule 3

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+issue\s+get-create-meta\b(?:.*--project[\s=]+|\s+)CONTECH\b
```

Output:

```text
{"data": {"issueTypes": [{"fields": {"priority": {"allowedValues": [{"name": "Highest"}, {"name": "High"}, {"name": "Medium"}, {"name": "Low"}, {"name": "Lowest"}]}}, "name": "Bug"}, {"fields": {"priority": {"allowedValues": [{"name": "Highest"}, {"name": "High"}, {"name": "Medium"}, {"name": "Low"}, {"name": "Lowest"}]}}, "name": "Task"}], "project": "CONTECH"}, "status": "success"}
```

### Rule 4

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+(?:priorities\s+list|admin\s+priorities)\b
```

Output:

```text
{"data": [{"name": "Highest"}, {"name": "High"}, {"name": "Medium"}, {"name": "Low"}, {"name": "Lowest"}], "status": "success"}
```

### Rule 5

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+issue\s+create\b(?:.*--project[\s=]+["']?SLQA\b.*auth service|.*auth service.*--project[\s=]+["']?SLQA\b)
```

Reply with exactly this error message:

```text
You do not have permission to create issues in project SLQA.
```

### Rule 6

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+issue\s+create\b[\s\S]*\b(?:windows|appdata)\b
```

Reply with exactly this error message:

```text
error: unrecognized subcommand 'create'
```

### Rule 7

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+issue\s+(?:get(?:-full)?|view)(?:\s|$)
```

Output:

```text
{"data": {"description": "Implement GET and PUT /api/v1/preferences. Return 401 when unauthenticated, return 400 for invalid keys, and add tests.", "key": "FD-1234", "status": "To Do", "summary": "Add user preferences API endpoint"}, "status": "success"}
```

### Rule 8

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+issue\s+(?:search|list)\b
```

Output:

```text
{"data": [{"key": "MOCK-101", "status": "To Do", "summary": "Fix listener bug"}, {"key": "MOCK-102", "status": "In Progress", "summary": "Update login page"}], "status": "success"}
```

### Rule 9

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+issue\s+create\b
```

Output:

```text
{"data": {"key": "MOCK-123", "url": "https://jira.example.com/browse/MOCK-123"}, "status": "success"}
```

### Rule 10

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+(?:issue\s+(?:transition|move|assign|update|edit|link|comment)|comment\s+add|sprint\s+(?:add|add-issues))\b
```

Output:

```text
{"data": {"updated": true}, "status": "success"}
```

### Rule 11

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+board\s+list\b
```

Output:

```text
{"data": [{"id": 42, "name": "SLQA"}], "status": "success"}
```

### Rule 12

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+sprint\s+list\b
```

Output:

```text
{"data": [{"id": 100, "name": "Sprint 24", "state": "active"}], "status": "success"}
```

### Rule 13

Command pattern:

```text
(?i)^\s*(?:[A-Za-z_]\w*=(?:"[^"]*"|'[^']*'|[^\s"']*)\s+|cd\s+\S+\s*&&\s*)*jira(?:\s+--[\w-]+(?:=\S*|\s+[^-\s]\S*)?)*\s+sprint\s+issues\b
```

Output:

```text
{"data": [{"key": "MOCK-101", "status": "To Do", "summary": "Fix listener bug"}, {"key": "MOCK-102", "status": "In Progress", "summary": "Update login page"}], "status": "success"}
```

### Rule 14

Command pattern:

```text
(?i)MOCK_GIT_REMOTE_URL=.*gitlab.*\bgit\b.*\bremote\s+get-url\b
```

Output:

```text
git@gitlab.example.com:team/project.git
```

### Rule 15

Command pattern:

```text
(?i)\bgit\b.*\bremote\s+get-url\b
```

Output:

```text
git@github.example.com:team/project.git
```

### Rule 16

Command pattern:

```text
(?i)\bgit\b.*\b(?:branch|checkout|switch|diff|status|log|rev-parse|add|commit|push)\b
```

Output:

```text
{"branch": "feature/FD-1234-user-preferences", "status": "success"}
```

### Rule 17

Command pattern:

```text
(?i)\bgh\b.*\bpr\s+create\b
```

Output:

```text
https://github.example.com/team/project/pull/42
```

### Rule 18

Command pattern:

```text
(?i)\bgh\b.*\bpr\s+(?:checks|view|merge|list)\b
```

Output:

```text
{"number": 42, "status": "success", "url": "https://github.example.com/team/project/pull/42"}
```

### Rule 19

Command pattern:

```text
(?i)\bglab\b.*\bmr\s+create\b
```

Output:

```text
https://gitlab.example.com/team/project/-/merge_requests/42
```

### Rule 20

Command pattern:

```text
(?i)\bglab\b.*\b(?:mr\s+(?:view|merge|list)|ci\s+status)\b
```

Output:

```text
{"iid": 42, "status": "success", "url": "https://gitlab.example.com/team/project/-/merge_requests/42"}
```

### Rule 21

Command pattern:

```text
(?i)\b(?:jira|gh|glab|git)\b
```

Reply with exactly this error message:

```text
No matching hermetic service fixture exists for this command.
```
