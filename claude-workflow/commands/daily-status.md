# Daily Status

Draft Juan's daily status: one block per Jira ticket assigned to him in the current sprint, written in his voice, ready to paste into Teams.

This command is read-only. It never posts to Teams, never comments on or transitions Jira tickets, and never pushes anything. The output is a draft in the chat.

Optional arguments: `$ARGUMENTS` (for example a date, a ticket to add or skip, or "short" for a one-line-per-ticket version).

## 1. Gather the tickets

```bash
jira --agent issue search \
  --jql 'assignee = currentUser() AND sprint in openSprints() ORDER BY status' \
  --fields key,summary,status,updated --limit 30
```

If the result is empty, check the Jira auth recipe in memory before concluding there are no tickets (a stale token makes Jira answer as anonymous and return nothing).

## 2. Gather the evidence for each ticket

Use only what is needed for that ticket. Run independent lookups in parallel.

- **Jira:** status, recent comments, linked tickets that gate it (bugs, QA tickets, upstream tickets).
- **Memory:** read the ticket's checkpoint or scope memory file if one exists (`<ticket>-checkpoint.md`, `<ticket>-scope.md`, and similar). It names the channels, filters, PRs and open items to check. Treat it as a pointer, not as current state.
- **Pull requests:** `gh pr list --author @me --state open --json number,title,reviewDecision,updatedAt,url,statusCheckRollup` in the repos the ticket touches (growth-life-client-api, growth-life-client-templates, cgi-web when relevant). Report review decision and check results.
- **Teams:** for tickets that depend on channel activity (support, QA and launch-monitoring tickets), read the channels named in memory with `teams --agent channel messages --since 1d` (use `3d` on Mondays), and `teams --agent search messages` for the ticket key. Read whole threads, not single messages.
- **Local work:** `git status --short` and `git log --oneline -5` in the ticket's worktree when the ticket is in development.

## 3. Write the draft

Read `~/.claude/profiles/juan-voice-profile.md` first and write in that voice: clear, direct, first person, contractions, no corporate wording.

Format:

```
Daily status - <MM/DD>

<KEY> - <short title> (<Jira status>)
- <what happened since the last status, as plain facts>
- <open item or dependency, with who owns it>
- Next: <the next concrete step>

<next ticket...>

Blockers: <none, or the one thing he is waiting on and from whom>
```

Rules for the draft:

- Two to four bullets per ticket. One line each.
- Shorten the Jira summary to a title a teammate would recognize.
- Every bullet must come from something read in step 2. No filler bullets.
- Match the strength of the source. "The goal is 11/30" is not "planned for 11/30". A scheduled meeting is "set up a meeting", not "met". A person active in a thread is "is in that thread", not "owns it", unless someone said so.
- Attribute dates and decisions that came from one person's message ("Abhi mentioned...").
- When Jira and Teams disagree (a bug reported fixed in a channel but still Open in Jira), say what each one shows.
- Never claim Juan did something (asked, pushed, merged, posted) unless it is visible in Jira, GitHub, Teams or git.
- Ticket keys and PR numbers stay as plain text. Use bare URLs only if a link is needed.

## 4. Report the confidence below the draft

After the draft, add a short "Check before sending" list with:

- anything in the draft that is an assumption or could not be verified, and what it is based on;
- anything Juan needs to do first for a line to be true (for example, a message he has not posted yet);
- date or status conflicts between sources.

If every line is verified, say so in one sentence instead of the list.

## 5. Do not

- Do not post the status anywhere. Juan sends it himself.
- Do not update memory with the status itself. Save only new durable facts found while gathering (a new gating ticket, a moved launch date), following the memory rules.
- Do not include tickets outside the current sprint unless asked through the arguments.
