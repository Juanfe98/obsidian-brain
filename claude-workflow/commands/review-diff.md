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
- high-control changes: dependencies, lockfiles, generated files, CI/CD, config, env/secret files, schemas, migrations, public contracts

## Ignore

- subjective style preferences
- naming nitpicks unless they affect clarity
- formatting-only issues
- broad rewrites unless there is real risk

## High-Control Diff Check

Explicitly call out whether the diff changed:

- dependencies or lockfiles
- generated files
- CI/CD or deployment configuration
- environment, secret, or private configuration files
- public APIs, contracts, schemas, or data models
- migrations or persistence behavior
- broad formatting, unrelated refactors, or cross-cutting architecture

## Output

1. Must fix
2. Should fix
3. Optional
4. Missing tests
5. High-control diff check
6. PR readiness verdict
