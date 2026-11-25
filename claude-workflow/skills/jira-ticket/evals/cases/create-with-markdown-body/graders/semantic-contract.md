---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. create-executed: Actually runs jira issue create Verification: mock-jira log contains 'issue create'
2. has-body-flag: The create command includes a -b flag for the body Verification: tool-calls.txt Bash command for issue create contains '-b'
3. no-wiki-markup: Body is Markdown, not Jira wiki markup (no h3., {{code}}, or [text|url]) Verification: tool-calls.txt Bash command body content does not contain wiki-markup tokens ('h3.', '{{', '|]')
4. markdown-formatting: If it has a list, uses Markdown bullets ('- ' or '* ') or numbers ('1.'); Cloud renders Markdown to ADF Verification: tool-calls.txt Bash command body uses Markdown list/formatting, or uses no list at all
5. Expected outcome: Should create with a Markdown body (Cloud is the default; the CLI renders Markdown to ADF). Bullet lists use '- item' or '1.'; bold uses '**text**'. Do NOT use Jira wiki markup (h3., {{code}}, [text|url]). The body should be passed via -b flag.

PASS only if every criterion is satisfied; otherwise FAIL.
