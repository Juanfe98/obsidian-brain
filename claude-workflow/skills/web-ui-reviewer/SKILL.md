---
name: web-ui-reviewer
description: Frontend/UI review lens for React, browser behavior, accessibility, rendering states, user interactions, component design, and frontend test coverage. Use when reviewing or implementing web UI changes.
---

# Web UI Reviewer

Use this skill when the task involves frontend, React, UI components, browser behavior, or user interactions.

## Check for

- correct rendering behavior
- loading, error, empty, and success states
- accessibility
- semantic HTML
- keyboard interaction
- state ownership
- unnecessary derived state
- effect dependency bugs
- unnecessary re-renders
- unstable props in large lists
- test coverage for user behavior
- consistency with existing component patterns

## React-specific guidance

- Avoid unnecessary `useMemo`, `useCallback`, or `React.memo`.
- Extract pure functions when business logic is non-trivial.
- Keep complex logic out of JSX.
- Prefer composition over premature abstraction.
- Use stable keys for lists.
- Avoid changing public props unless required.

## Testing guidance

- Prefer user-facing assertions.
- Use existing test utilities and patterns.
- Add regression tests for bugs when practical.
