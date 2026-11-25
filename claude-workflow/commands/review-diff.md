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

## Test Hygiene Check (when the diff touches `*.test.*` files)

The diff alone hides test duplication: a changed test can become a twin of a
sibling test that is NOT in the diff. This is common in experiment-cleanup PRs
that re-point a test's mock/flag to a still-alive flag.

When a test file is modified:

1. Read the WHOLE test file, not just the diffed hunks.
2. For each test the diff changed, compare its title AND body against every
   sibling `it()`/`test()` in the file.
3. Flag a test as a redundant duplicate when another test, after the change,
   has the same mock setup, same render/invocation, and the same observable
   assertions — even if fixtures differ in a way no assertion observes
   (e.g. sorted vs. unsorted input where the asserted element is first either way).
4. Distinguish true duplicates from legitimate cross-`describe` reuse (same
   title, genuinely different behavior/assertions). Only the former should be deleted.
5. When a mock/flag was re-pointed during cleanup, explicitly check whether the
   re-pointed test now duplicates a test already living under the block that
   owns that flag.

Report duplicates under "Should fix" with the file, both line ranges, and which
one to delete and why.

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
5. Test hygiene (duplicate / redundant tests)
6. High-control diff check
7. PR readiness verdict
