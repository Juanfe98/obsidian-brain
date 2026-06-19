# Close Session

Close the current work session.

## Workflow

1. Check `git status --short`.
2. Summarize completed work.
3. Summarize important decisions.
4. Summarize validation run.
5. List known risks or follow-ups.
6. If `docs/ai/session-summary.md` exists, ask before updating it unless the user explicitly requested persistence.
7. If no session summary file exists, ask before creating one.
8. Do not create, update, stage, commit, or push any session file without explicit approval.

## Persistence Rules

Default behavior is summary-only.

Only update or create a session summary file when:

- The user explicitly asked to persist the session, or
- You ask for approval and the user approves.

If persistence is approved:

- Prefer updating `docs/ai/session-summary.md` if it exists.
- If no summary file exists, ask where to create one.
- Use `templates/session-summary.md` as the structure when applicable.
- Keep the update factual and concise.
- Do not include secrets, credentials, or private environment details.

## Output

1. Completed work
2. Files changed
3. Decisions made
4. Validation run
5. Risks/follow-ups
6. Suggested next step
7. Persistence status: not requested / requested approval / updated `<path>`
