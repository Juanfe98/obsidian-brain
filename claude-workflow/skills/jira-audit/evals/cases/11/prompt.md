---
description: 'The skill should FAIL check #1 (Acceptance Criteria) even though AC text is technically present. The criteria ''works as expected and handles all cases properly'' is a restatement of the summary, not testable, and provides no specific conditions. Should flag this and suggest concrete, testable criteria.'
tags: [heldout, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Audit FD-3100. It's a Story titled 'Implement webhook retry logic' with a description explaining that webhooks need retry capability. The acceptance criteria field contains: 'The webhook retry logic works as expected and handles all cases properly.' Story points: 3, assigned, has component label.
