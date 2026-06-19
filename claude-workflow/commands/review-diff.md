# Review Current Diff

Review the current git diff as a senior software engineer.

## Workflow

1. Check `git status --short`.
2. Inspect the current diff.
3. Identify only high-signal issues.
4. Do not edit files unless explicitly asked.

## Focus on

- correctness
- edge cases
- security
- accessibility, if UI code is involved
- performance
- type safety, if applicable
- test coverage
- unnecessary complexity
- scope creep
- public API or contract compatibility

## Ignore

- subjective style preferences
- naming nitpicks unless they affect clarity
- formatting-only issues
- broad rewrites unless there is real risk

## Output

1. Must fix
2. Should fix
3. Optional
4. Missing tests
5. PR readiness verdict
