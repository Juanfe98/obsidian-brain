---
description: The skill should offer batch resolution since the same check fails on 12 tickets (well above the 5-ticket threshold) and the fix is uniform (adding a component). Should propose adding 'core-api' to the 8 API tickets and 'core-web' to the 4 frontend tickets — presenting the full list for confirmation. Should also trigger the ticket template recommendation since >50% (80%) of tickets fail the same check. Should NOT attempt to fix these one at a time.
tags: [train, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

I just ran an audit on the CORE project and found that 'Missing Components/Labels' fails on 12 out of 15 audited tickets. The tickets are: CORE-100, CORE-101, CORE-102, CORE-103, CORE-104, CORE-105, CORE-106, CORE-107, CORE-108, CORE-109, CORE-110, CORE-111. The project uses components 'core-api', 'core-web', and 'core-worker'. Based on the ticket descriptions, 8 of them are API work and 4 are web frontend work.
