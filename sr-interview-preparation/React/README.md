# React — Interview Preparation

## Files in this folder

| File | Topics |
|------|--------|
| `react-core-rendering.md` | Virtual DOM, reconciliation, Fiber, keys, hooks rules, useState, useReducer, useRef, useEffect (deep dive), stale closures, controlled vs uncontrolled, hydration |
| `react-performance-patterns.md` | React.memo, useMemo, useCallback, context performance, useTransition, useDeferredValue, Suspense, lazy loading, code splitting, custom hooks, error boundaries, portals |
| `react-typescript-integration.md` | Typing props, PropsWithChildren, ComponentProps, discriminated union props, event handler types, useState/useRef/useReducer typing, context typing, forwardRef, generic components |
| `react-modern-hooks.md` | useLayoutEffect vs useEffect, useId, React 19: use(), useActionState, useFormStatus, useOptimistic, flushSync |
| `react-state-management.md` | Decision framework, useState/useReducer, Context patterns + performance, Zustand, Redux Toolkit, React Query/SWR, URL state, derived state |
| `react-component-patterns.md` | HOC, render props, compound components, controlled/uncontrolled component pattern, composition over configuration |

## Senior-level differentiators

- `useEffect` is **synchronization**, not a lifecycle hook — know the mental model
- Stale closures in `useEffect` — diagnose without a debugger
- When `useMemo` / `useCallback` **hurt** performance (overhead > benefit)
- Context re-render cascades and mitigation strategies
- `useTransition` vs `useDeferredValue` — which wraps a setter, which wraps a value
