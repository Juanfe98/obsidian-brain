---
description: The skill should apply only the checks that are applicable to Sub-tasks per the applicability matrix (Description, Vague Title, No Assignee in sprint). Should NOT flag missing AC, story points, test plan, epic link, dependencies, or other checks marked 'No' for sub-tasks.
tags: [train, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Audit FD-2850. It's a Sub-task under FD-2847 titled 'Create database migration for notification_preferences table' with a description of the schema (columns, types, indexes), assigned to K. Park, status To Do.
