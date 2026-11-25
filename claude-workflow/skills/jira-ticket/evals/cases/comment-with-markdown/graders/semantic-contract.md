---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. comment-executed: Runs jira issue comment add Verification: mock-jira log contains 'issue comment'
2. correct-issue-key: Comment targets SLQA-100 Verification: mock-jira log line for 'issue comment' contains 'SLQA-100'
3. has-body-flag: The comment command includes a -b flag for the body Verification: tool-calls.txt Bash command for 'issue comment' contains '-b'
4. no-wiki-markup: Body is Markdown, not Jira wiki markup (no h3., {{code}}, or [text|url]) Verification: tool-calls.txt Bash command body content does not contain wiki-markup tokens ('h3.', '{{', '|]')
5. markdown-formatting: Body uses Markdown for the listed items ('- ' or '1.'); Cloud renders Markdown to ADF Verification: tool-calls.txt Bash command body uses Markdown list formatting for the listed items
6. structured-not-flat: Body has structure (headings or separate lists), not a single paragraph Verification: tool-calls.txt Bash command body contains multiple '- ' items or '1.' items or '### ' headings
7. Expected outcome: Should add a comment with a Markdown body for the structured content (Cloud renders Markdown to ADF). Lists use '- item' or '1.'. May use Markdown headings like '### Findings' and '### Next steps'. Do NOT use Jira wiki markup. Body passed via -b flag.

PASS only if every criterion is satisfied; otherwise FAIL.
