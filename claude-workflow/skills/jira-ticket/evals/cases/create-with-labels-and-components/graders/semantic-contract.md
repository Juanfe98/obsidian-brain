---
type: llm
focus: trace
---

Evaluate the agent response and available trajectory against each criterion below. Do not accept unsupported claims about tool calls or file changes.

1. create-executed: Runs jira issue create Verification: mock-jira log contains 'issue create'
2. has-labels: Both labels appear as separate -l flags Verification: tool-calls.txt Bash command for issue create contains '-l' with both 'backend' and 'infrastructure'
3. has-component: Component uses -C flag Verification: tool-calls.txt Bash command for issue create contains '-C payments' or '-C' with 'payments'
4. labels-and-components-separate: Labels use -l and components use -C — they are not mixed Verification: tool-calls.txt Bash command uses '-l' for labels and '-C' for components (different flags)
5. correct-type: Uses -t Bug since user said 'bug' Verification: mock-jira log line for 'issue create' contains '-t Bug'
6. Expected outcome: Should use -l backend -l infrastructure (repeatable) and -C payments. Labels and components use different flags.

PASS only if every criterion is satisfied; otherwise FAIL.
