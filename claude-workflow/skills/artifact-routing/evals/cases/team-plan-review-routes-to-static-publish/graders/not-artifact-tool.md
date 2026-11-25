---
type: llm
focus: last_message
---

The response sends the plan to a static aix-proto publish (`aix-proto publish <slug>`) for the teammates to review. It does not offer an aix-proto doc app or `publish --doc`. It does not promise that the teammates can comment on the page: it says the page may not take comments, or that whether they can comment is checked after publishing. It does not tell the user to turn comments on for the page. It does not tell the user to put the plan in the built-in Claude Artifact tool. It may mention the Artifact tool only to say it is the wrong place for review by several people.

PASS only if every criterion is satisfied; otherwise FAIL.
