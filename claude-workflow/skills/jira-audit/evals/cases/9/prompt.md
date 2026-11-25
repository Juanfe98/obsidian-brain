---
description: The skill should recognize it CAN draft acceptance criteria directly from the description without asking clarifying questions. Should produce concrete AC derived from the description details (CSV contents, email delivery, password protection, background processing). Tests the 'can you infer enough?' decision in the resolution workflow.
tags: [train, suite-core, draft]
runs: 1
max_turns: 30
timeout_seconds: 300
allowed_tools: [Skill, Read, Glob, Grep, Write, Edit]
---

Audit FD-2900. It's a Story titled 'Allow users to export their data as CSV' with a rich description: 'Users on the Settings > Privacy page should be able to click an Export My Data button that generates a CSV containing all their profile information, activity history, and preferences. The CSV should be emailed to their registered email address since generation may take several minutes for users with large histories. We already have a background job framework (Sidekiq) and the email service is SendGrid. The export should include: profile fields, login history (last 90 days), notification preferences, and saved searches. File should be password-protected with a randomly generated password shown once in the UI.' No formal acceptance criteria section exists, but the description is detailed enough to derive them.
