---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. gets-epic-details: Fetches the epic itself first Verification: mock-jira log contains 'issue get' with 'SLQA-500'
2. lists-existing-children: Lists the epic's current children via a parent JQL search Verification: mock-jira log contains an 'issue search' whose --jql references 'parent = SLQA-500'
3. children-read-bounded: The children search is bounded with --limit Verification: the 'issue search' log line for children contains '--limit'
4. does-gap-analysis: Compares the epic goal against existing children and does not duplicate them Verification: output identifies missing work relative to the existing children rather than re-proposing them
5. uses-fibonacci-estimates: Sizes proposed children only on Fibonacci values (1,2,3,5,8,13) Verification: any point estimates in the output are drawn from 1, 2, 3, 5, 8, or 13
6. covers-dependencies-and-order: Calls out dependencies, an implementation order, and spikes for unknowns Verification: output includes dependency/ordering notes and flags spikes for high-uncertainty work
7. waits-for-approval: Does not silently bulk-create children Verification: mock-jira log does NOT contain 'issue create' before the user approves the breakdown
8. Expected outcome: Gets the epic details with jira --agent issue get SLQA-500, lists current children via issue search on parent = SLQA-500 (bounded --limit), then proposes a decomposition that does gap analysis against the existing children, drafts acceptance criteria, sizes each new child on the Fibonacci scale, and notes dependencies, implementation order, and any spikes. Presents for approval before creating anything.

PASS only if every criterion is satisfied; otherwise FAIL.
