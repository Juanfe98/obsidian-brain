---
description: The skill should recognize this ticket passes all applicable checks and report it as ready for development. Should NOT invent issues or force findings where none exist. A short confirmation with a clean audit table showing all passes.
tags: [train, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Can you audit PLAT-500? It's a Story titled 'Add pagination to search results API' with a full description explaining the offset/limit approach, acceptance criteria covering 6 testable scenarios, a test plan, story points of 3, assigned to J. Martinez, linked to the Search Improvements epic, components set to 'search-service', and scope boundaries stating 'cursor-based pagination is out of scope for this iteration'. It went through grooming last week.
