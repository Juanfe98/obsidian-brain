---
description: The skill should present a summary report first and let the user choose which tickets to work on, rather than automatically iterating through all 45. Should respect the 'large audit' principle and offer options like working through critical issues first or focusing on a subset.
tags: [heldout, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

We have about 45 open tickets in the CORE project backlog that haven't been groomed. Can you run an audit and help me figure out which ones need work?
