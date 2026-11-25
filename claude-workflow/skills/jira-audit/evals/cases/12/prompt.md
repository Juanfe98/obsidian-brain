---
description: The skill should apply only Spike-applicable checks (Description, Story Points, Vague Title, Scope Boundaries, Components/Labels, Priority, Duplicates). Should NOT flag missing AC, test plan, technical context, error handling, edge cases, or affected files — these don't apply to Spikes. Should pass Description, Story Points, Priority, and Vague Title. May flag Scope Boundaries (no explicit 'done' criteria for the investigation) and Components/Labels (has label but no component).
tags: [validation, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Audit FD-3200. It's a Spike titled '[Spike] Evaluate message queue options for async processing' with a description: 'We need to decide between RabbitMQ, SQS, and Kafka for our async job processing pipeline. Evaluate latency, throughput, operational cost, and team familiarity. Produce a recommendation document with pros/cons.' Story points: 2, priority P3, labels: ['backend']. No acceptance criteria, no test plan, no technical context, no error handling requirements.
