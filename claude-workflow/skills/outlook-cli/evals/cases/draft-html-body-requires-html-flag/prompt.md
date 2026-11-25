---
description: Checks that the plan to draft an HTML-bodied email includes the --html flag on mail draft, since the CLI never infers content type from the body.
tags: [behavior, draft]
runs: 1
max_turns: 20
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
append_system_prompt: This is a sandboxed evaluation run. There is no shell, no installed command-line tool, no network access and no credentials, so no command can run and no service can be reached; do not try. When a request needs commands, give the exact commands you would run. Write a file only when the request asks for one, in the current working directory.
---

I need to draft (not send) an email to a colleague using the mail command-line tool for Outlook. The body should contain a heading and a bulleted list, e.g. <h2>Weekly Update</h2><ul><li>Shipped feature A</li><li>Fixed bug B</li></ul>. Write the exact command you would run in agent mode to create this as a draft without sending it, and save that command to a file named plan.sh instead of executing it.
