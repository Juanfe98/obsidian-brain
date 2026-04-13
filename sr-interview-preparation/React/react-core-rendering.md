# React — Core & Rendering

## Glossary

| Term                       | Meaning                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Virtual DOM**            | A lightweight JavaScript representation of the real DOM — React diffs it to compute minimal real DOM changes              |
| **Reconciliation**         | The process React uses to compare the new virtual DOM tree with the previous one and compute what changed                 |
| **Fiber**                  | React's internal reconciliation engine (since React 16) — makes rendering interruptible and prioritizable                 |
| **Commit phase**           | The phase where React applies computed changes to the real DOM — cannot be interrupted                                    |
| **Render phase**           | The phase where React calls your components and builds the new virtual DOM tree — can be interrupted                      |
| **Pure component**         | A component that, given the same props and state, always renders the same output                                          |
| **Batching**               | React groups multiple state updates from the same event into a single re-render (React 18: automatic batching everywhere) |
| **Stale closure**          | A function that "captured" a variable from its creation scope and never sees updates to that variable                     |
| **Effect**                 | Side effects in React: data fetching, subscriptions, DOM manipulation — managed by `useEffect`                            |
| **Controlled component**   | A form element whose value is driven by React state — React is the source of truth                                        |
| **Uncontrolled component** | A form element that manages its own value internally — you read it via `ref`                                              |
| **Hydration**              | The process where React attaches event listeners and state to server-rendered HTML — making static markup interactive      |

---

## Virtual DOM & Reconciliation

React never modifies the real DOM directly on every render.
Instead it builds a **virtual DOM** (a plain JS object tree), diffs it with the previous version, and computes the minimal set of real DOM operations needed.

```
Render → new Virtual DOM tree
Diff   → compare with previous Virtual DOM
Commit → apply only the changes to the real DOM
```

### The diffing algorithm — 3 rules

**Rule 1: Elements of different type → unmount + remount**
```jsx
// Previous render:
<div><Counter /></div>

// Next render:
<span><Counter /></span>  // ← type changed: div → span
// React unmounts the entire subtree (Counter is destroyed + re-created)
// Even though Counter itself didn't change
```

**Rule 2: Same type elements → update in place**
```jsx
// Previous: <div className="before" />
// Next:     <div className="after" />
// React updates only the className attribute — no unmount
```

**Rule 3: Keys for lists — always stable, unique, not index**
```jsx
// BAD — index as key
{items.map((item, index) => <Item key={index} {...item} />)}
// If an item is inserted at position 0, ALL items get new keys
// → React thinks everything changed → destroys and recreates all items

// GOOD — stable unique id
{items.map(item => <Item key={item.id} {...item} />)}
// Inserting an item → only the new item gets mounted
// Existing items keep their key → React knows they just moved
```

**When to use index as key:** only if the list is static (never reordered, never filtered).

---

## React Fiber — the mental model

Fiber is React's reimplementation of the reconciler (React 16+).

Key idea: rendering is split into two phases:
- **Render phase** — can be paused, aborted, restarted (async-capable)
- **Commit phase** — synchronous, applies all DOM changes at once

This enables:
- **Concurrent Mode** — React can interrupt low-priority renders to handle urgent updates
- **Suspense** — React can pause rendering a subtree while data loads
- **Time slicing** — spread heavy rendering work across multiple frames

---

## Hooks — Rules and Why They Exist

React stores hook state in a **linked list** associated with each component instance.
The Nth call to `useState` always corresponds to the Nth node in the list.

```
Component fiber: [state0] → [state1] → [effect0] → [state2]
```

This is why hooks have strict rules:

**Rule 1: Only call hooks at the top level**
```jsx
// WRONG — conditional hook breaks the linked list order
function Component({ show }) {
    if (show) {
        const [value, setValue] = useState(0); // ← only exists sometimes
    }
    const [other, setOther] = useState('');    // ← React expects this to be hook #1, not #2
}

// CORRECT — conditions go inside the hook
function Component({ show }) {
    const [value, setValue] = useState(0);   // always hook #1
    const [other, setOther] = useState('');  // always hook #2
    // use `show` inside the component logic, not to conditionally call hooks
}
```

**Rule 2: Only call hooks from React functions**
Not from regular JS functions, class methods, or event listeners.

---

## useState — key behaviors

```jsx
const [count, setCount] = useState(0);

// Functional update — use when new state depends on old state
setCount(prev => prev + 1); // safe in concurrent mode

// Direct update — fine when independent of previous value
setCount(42);

// Lazy initializer — expensive computation runs only once
const [data, setData] = useState(() => computeExpensiveInitialState());

// React 18: automatic batching — multiple setState in async code are batched
async function handleClick() {
    setCount(c => c + 1);
    setName('Juan');
    // Before React 18: two re-renders
    // React 18+: ONE re-render (batched automatically)
}
```

---

## useReducer — for complex state

Prefer `useReducer` over `useState` when:
- State has multiple sub-values that change together
- Next state depends on the previous state in complex ways
- You want to extract state logic and test it independently

```jsx
// Discriminated union for type-safe actions
type Action =
    | { type: 'INCREMENT' }
    | { type: 'DECREMENT' }
    | { type: 'RESET'; payload: number }
    | { type: 'SET_LOADING'; payload: boolean };

type State = { count: number; loading: boolean };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'INCREMENT':   return { ...state, count: state.count + 1 };
        case 'DECREMENT':   return { ...state, count: state.count - 1 };
        case 'RESET':       return { ...state, count: action.payload };
        case 'SET_LOADING': return { ...state, loading: action.payload };
        default:
            // Exhaustiveness check — TypeScript errors if a case is missed
            const _exhaustive: never = action;
            return state;
    }
}

function Counter() {
    const [state, dispatch] = useReducer(reducer, { count: 0, loading: false });

    return (
        <div>
            <p>Count: {state.count}</p>
            <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
            <button onClick={() => dispatch({ type: 'RESET', payload: 0 })}>Reset</button>
        </div>
    );
}
```

---

## useRef — two distinct use cases

### Use case 1: Access a DOM element imperatively

```jsx
function AutoFocusInput() {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus(); // focus the input on mount
    }, []);

    return <input ref={inputRef} />;
}
```

### Use case 2: Mutable value that does NOT trigger re-render

```jsx
function Timer() {
    const [count, setCount] = useState(0);
    const intervalRef = useRef<number>(null); // stores interval id without causing re-renders

    function start() {
        intervalRef.current = setInterval(() => setCount(c => c + 1), 1000);
    }

    function stop() {
        clearInterval(intervalRef.current!);
    }

    return <button onClick={start}>Start</button>;
}
```

**Key difference from state:** updating a ref does NOT trigger a re-render.
Use ref when you need to persist a value across renders but don't need the UI to update when it changes.

---

## useEffect — the synchronization model

The most misunderstood hook. **`useEffect` is NOT a lifecycle hook.**
It's a mechanism to **synchronize your component with an external system**.

> "Think of effects as saying: after rendering, make the outside world match this state."

```jsx
// Mental model:
// "Keep an event listener on window synchronized with this component's existence"
useEffect(() => {
    window.addEventListener('resize', handleResize); // sync: connect
    return () => {
        window.removeEventListener('resize', handleResize); // sync: disconnect
    };
}, []); // [] = synchronize once (on mount/unmount)

// "Keep a subscription to userId synchronized with the current user"
useEffect(() => {
    const subscription = subscribe(userId);       // sync: connect
    return () => subscription.unsubscribe();      // sync: disconnect
}, [userId]); // re-sync when userId changes
```

### Dependency array rules

```jsx
useEffect(() => { ... });           // runs after EVERY render — almost never what you want
useEffect(() => { ... }, []);       // runs once on mount, cleanup on unmount
useEffect(() => { ... }, [a, b]);   // runs when a or b changes (+ on mount)
```

### Stale closure — the most common useEffect bug

```jsx
// BUG: stale closure
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log(count); // ← always logs 0! captured the initial value
            setCount(count + 1); // ← always sets to 1, never increments beyond that
        }, 1000);
        return () => clearInterval(interval);
    }, []); // ← empty deps: effect only runs once, captures count = 0 forever
}

// FIX 1: add count to dependencies (but re-creates interval every second)
useEffect(() => {
    const interval = setInterval(() => {
        setCount(count + 1);
    }, 1000);
    return () => clearInterval(interval);
}, [count]);

// FIX 2 (better): functional update — doesn't need count in scope
useEffect(() => {
    const interval = setInterval(() => {
        setCount(prev => prev + 1); // ← always reads latest value
    }, 1000);
    return () => clearInterval(interval);
}, []); // ← stable, runs once, no stale closure
```

### Effect cleanup — why it matters

```jsx
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        let cancelled = false; // cleanup flag

        fetchUser(userId).then(data => {
            if (!cancelled) setUser(data); // skip if component unmounted or userId changed
        });

        return () => {
            cancelled = true; // effect cleanup: cancel pending state update
        };
    }, [userId]);
}
```

Without cleanup, if `userId` changes rapidly, old fetch responses might overwrite newer ones (race condition).

---

## Controlled vs Uncontrolled Components

### Controlled — React owns the value

```jsx
function ControlledInput() {
    const [value, setValue] = useState('');

    return (
        <input
            value={value}                              // React controls the value
            onChange={e => setValue(e.target.value)}   // must update state on every change
        />
    );
}
// When to use: when you need to validate, transform, or react to every keystroke
// Example: search with debounce, form with live validation
```

### Uncontrolled — DOM owns the value

```jsx
function UncontrolledInput() {
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSubmit() {
        console.log(inputRef.current?.value); // read value only when needed
    }

    return (
        <form onSubmit={handleSubmit}>
            <input ref={inputRef} defaultValue="" /> {/* defaultValue, not value */}
            <button type="submit">Submit</button>
        </form>
    );
}
// When to use: simple forms, file inputs, when you only need value on submit
// Benefit: no re-render on every keystroke
```

---

## Hydration

When a page is rendered on the server (SSR/SSG), the browser receives plain HTML — it displays fast but is not interactive yet.
**Hydration** is the process where React takes that existing HTML and "wakes it up": attaches event listeners, connects state, and makes the page fully interactive.

```
Server → renders HTML string → sends to browser
Browser → displays HTML immediately (no blank screen)
React JS bundle loads → React "hydrates" the HTML
         → walks the DOM, matches it to the component tree
         → attaches event listeners and state
         → page is now interactive
```

### What React does during hydration

1. React renders the component tree in memory (same as SSR)
2. Walks the existing server-rendered DOM
3. Matches each DOM node to the corresponding component
4. Attaches event handlers (onClick, onChange, etc.)
5. Initializes state from the serialized data sent with the HTML

React does **not** re-create DOM nodes during hydration — it reuses the server-rendered HTML. This is why SSR pages appear instantly even before JS loads.

### Hydration mismatch — the most common hydration bug

If the HTML React generates on the client differs from what the server sent, React throws a **hydration mismatch** error and falls back to a full client-side re-render (slow, potential flicker).

```tsx
// BUG: date/time rendered on server vs client will differ
export default function Page() {
    return <p>Rendered at: {new Date().toISOString()}</p>;
    //          ↑ server renders "2026-01-01T00:00:00Z"
    //            client renders "2026-01-01T00:00:05Z" → MISMATCH
}

// FIX: render the dynamic value only on the client
'use client';
export default function Page() {
    const [time, setTime] = useState<string | null>(null);

    useEffect(() => {
        setTime(new Date().toISOString()); // runs only in browser, after hydration
    }, []);

    return <p>Rendered at: {time ?? 'loading...'}</p>;
}
```

Other common mismatch causes:
- `window`, `localStorage`, `document` accessed during render (server doesn't have these)
- Browser extensions that modify the DOM before React hydrates
- `Math.random()` or `Date.now()` called during render

### Hydration in Next.js

| Rendering mode | Hydration behavior |
|---|---|
| **SSG** | HTML pre-built at build time → React hydrates on page load |
| **SSR** | HTML built per request on server → React hydrates on page load |
| **Client-only (`'use client'`)** | No server HTML for this subtree → React renders + hydrates from scratch |
| **Server Components (RSC)** | Never hydrated — they send no JS to the browser; only Client Components hydrate |

### Selective hydration (React 18+)

React 18 introduced **selective hydration** via `<Suspense>`: React can hydrate parts of the page independently and prioritize hydrating components the user interacts with first.

```tsx
// React can hydrate Sidebar and Content independently
// If user clicks Content before Sidebar is hydrated, React prioritizes Content
<Suspense fallback={<Spinner />}>
    <Sidebar />
</Suspense>
<Suspense fallback={<Spinner />}>
    <Content />
</Suspense>
```

Before React 18, hydration was all-or-nothing: the entire tree had to hydrate before any of it was interactive.

---

## Interview answers

### How does React's reconciliation work?
React builds a virtual DOM on each render, then diffs it against the previous version using three rules: different element types trigger unmount/remount; same types trigger prop updates; lists use keys to match elements across renders. Only the computed differences are applied to the real DOM.

### Why must hooks be called in the same order every render?
React stores hook state in a linked list. The Nth hook call always maps to the Nth slot. If a hook is conditionally called, the list order shifts — React reads the wrong state for every subsequent hook. This is why you can't put hooks inside conditions or loops.

### What is a stale closure in React?
An effect captures variables from its render scope. If the dependency array doesn't include those variables, the effect runs once and holds a "frozen" reference to the initial values. All subsequent reads see the original value, not the current one. Fix: include the variable in deps, or use a functional updater that doesn't need the value in scope.

### What is the difference between useState and useReducer?
Both manage state. `useState` is simpler — good for independent values. `useReducer` is better when state has multiple related fields, when next state depends on previous state in complex ways, or when you want to extract and test the state transition logic independently.

### What is the difference between useEffect dependencies [] and [value]?
`[]` means: run once after mount, clean up on unmount. `[value]` means: run after mount and re-run every time `value` changes (and clean up before re-running). Omitting the array means: run after every render.

### What is the difference between controlled and uncontrolled components?
Controlled: React state is the source of truth; you set `value` and update it on every change. Uncontrolled: the DOM is the source of truth; you use `defaultValue` and read via `ref` when needed. Use controlled when you need to react to every input change; use uncontrolled for simpler forms where you only care about the final value.

### What is hydration?
Hydration is the process where React takes server-rendered HTML (which is static and non-interactive) and attaches event listeners, initializes state, and connects it to the React component tree — making the page fully interactive. React reuses the existing DOM nodes rather than recreating them, which is why SSR pages appear instantly. A hydration mismatch occurs when the HTML the client renders doesn't match what the server sent, causing React to fall back to a full client re-render.

### What causes a hydration mismatch?
Any difference between what the server renders and what the client renders. Common causes: using `Date.now()`, `Math.random()`, or browser-only APIs (`window`, `localStorage`) during render — the server doesn't have these. Fix: move browser-specific code into `useEffect` (which only runs on the client, after hydration) or use `suppressHydrationWarning` for intentionally differing content.

### What is selective hydration in React 18?
In React 18, wrapping subtrees in `<Suspense>` allows React to hydrate each subtree independently rather than blocking on the entire tree. If the user interacts with a component before it's hydrated, React prioritizes hydrating that component first. Before React 18, hydration was synchronous and all-or-nothing.
