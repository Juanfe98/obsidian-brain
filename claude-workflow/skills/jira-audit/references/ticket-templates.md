---
description: "Ticket template recommendation workflow. Read this after an audit when a single check fails on >50% of tickets, suggesting a systemic issue that a Jira template could prevent."
---

# Ticket Template Recommendation

After an audit, if a pattern emerges — the same check consistently fails across the majority of tickets — the root cause may be a missing ticket template rather than per-ticket oversight.

## When to trigger

After presenting results, if any single check fails on >50% of audited tickets, suggest a template fix.

## Workflow

```
Pattern detected: "Missing Acceptance Criteria" fails on 18/26 tickets (69%).

This suggests the team's ticket creation workflow doesn't prompt for AC.
A Jira ticket template with pre-filled sections would prevent this at the source.

Suggested template for Story tickets in VODOX:

  h2. Summary
  [What is being built and why]

  h2. Acceptance Criteria
  * [Testable condition 1]
  * [Testable condition 2]

  h2. Scope
  *In scope:*
  * ...
  *Out of scope:*
  * ...

  h2. Technical Context
  *Service/module:* ...
  *Key files:* ...

  h2. Test Plan
  # [Verification step 1]
  # [Verification step 2]

  h2. Error Handling
  * When [X fails], the system should [Y]

Would you like me to:
1. Format this as a Jira issue template you can install
2. Add it to the project's description template setting
3. Just share it with the team as a reference
```

## Template customization

The suggested template sections are based on whichever checks failed most frequently:
- If "Missing Test Plan" also fails on 60% of tickets → include a Test Plan section
- If "No Error Handling" fails on only 20% → omit from the default template but mention as optional
- If "No Scope Boundaries" fails on 55% → include an In Scope / Out of Scope section

Only suggest templates for checks that fail on >50% of tickets — sporadic failures are better addressed per-ticket.

## Template format

Always use Jira wiki markup (not Markdown) since the template will be pasted directly into Jira's description template configuration. Use `h2.` for section headers, `*` for bullets, `#` for numbered lists.
