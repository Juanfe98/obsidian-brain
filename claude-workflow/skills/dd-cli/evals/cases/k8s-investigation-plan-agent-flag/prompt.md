---
description: Checks that a k8s investigation plan uses --agent JSON mode and correct subcommands/flags for clusters, pods, workload-health, and events.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

We're investigating pod issues in the 'checkout-prod' Kubernetes cluster, specifically in the 'billing' namespace. Before I run anything, write to plan.sh the exact Datadog CLI commands (do not execute them) to: 1) list the clusters, 2) list pods in checkout-prod, 3) check workload health for the billing namespace in checkout-prod, and 4) get Kubernetes events for checkout-prod.
