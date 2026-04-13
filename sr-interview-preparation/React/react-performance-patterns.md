# React — Performance & Patterns

## Glossary

| Term | Meaning |
|------|---------|
| **React.memo** | HOC that memoizes a component — skips re-render if props haven't changed (shallow compare) |
| **useMemo** | Memoizes an expensive computed value — recomputes only when dependencies change |
| **useCallback** | Memoizes a function reference — returns the same function instance across renders |
| **Referential equality** | Two objects/functions are equal only if they are the same reference in memory, not if they have the same content |
| **useTransition** | Marks a state update as non-urgent — React can interrupt it to handle higher-priority updates |
| **useDeferredValue** | Defers updating a value — UI shows stale value while computing the fresh one |
| **Suspense** | React feature that lets components "pause" rendering while waiting for async data |
| **React.lazy** | Dynamically imports a component — enables code splitting |
| **Code splitting** | Breaking the JS bundle into smaller chunks loaded on demand |
| **Error boundary** | A class component that catches rendering errors in its subtree and shows a fallback |
| **Portal** | Renders a component's DOM output into a different DOM node (outside the React tree) |
| **Custom hook** | A function starting with `use` that composes built-in hooks to encapsulate reusable logic |

---

## When (and when NOT) to optimize

Premature optimization is the root of most React performance problems.

**Before optimizing, measure** using React DevTools Profiler.
Most performance issues come from:
1. Components re-rendering too often
2. Expensive computations on every render
3. Large bundle downloaded upfront

**Don't optimize if:**
- The component is fast enough (renders in <1ms)
- The component rarely re-renders
- The optimized code is harder to read

---

## React.memo — skip re-renders for unchanged props

By default, when a parent re-renders, ALL child components re-render too,
even if their props didn't change.

`React.memo` wraps a component and skips its re-render if props are shallowly equal.

```jsx
// Without memo — re-renders every time Parent re-renders
function ExpensiveChild({ title, count }) {
    console.log('ExpensiveChild rendered');
    return <div>{title}: {count}</div>;
}

// With memo — only re-renders if title or count actually changed
const ExpensiveChild = React.memo(function ExpensiveChild({ title, count }) {
    return <div>{title}: {count}</div>;
});
```

### The trap: object/function props break memo

```jsx
function Parent() {
    const [count, setCount] = useState(0);

    // PROBLEM: new object on every render → memo never works
    const config = { theme: 'dark', size: 'large' };
    const handleClick = () => console.log('clicked');

    return (
        <>
            <button onClick={() => setCount(c => c + 1)}>+</button>
            <MemoizedChild config={config} onClick={handleClick} />
            {/* ↑ re-renders every time, config and handleClick are new references */}
        </>
    );
}

// FIX: stabilize the references with useMemo and useCallback
function Parent() {
    const [count, setCount] = useState(0);

    const config = useMemo(() => ({ theme: 'dark', size: 'large' }), []);
    const handleClick = useCallback(() => console.log('clicked'), []);

    return (
        <>
            <button onClick={() => setCount(c => c + 1)}>+</button>
            <MemoizedChild config={config} onClick={handleClick} />
            {/* ↑ now memo works — config and handleClick are stable references */}
        </>
    );
}
```

---

## useMemo — memoize expensive computations

```jsx
// WITHOUT useMemo — runs on every render
function ProductList({ products, filter }) {
    // If products has 10,000 items, this filters on every render
    // Even when only an unrelated state changes
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase())
    );

    return filtered.map(p => <ProductItem key={p.id} product={p} />);
}

// WITH useMemo — only recomputes when products or filter changes
function ProductList({ products, filter }) {
    const filtered = useMemo(
        () => products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase())),
        [products, filter]  // only re-run when these change
    );

    return filtered.map(p => <ProductItem key={p.id} product={p} />);
}
```

### Rule of thumb for useMemo

Use `useMemo` when:
- The computation is genuinely expensive (sorting/filtering large arrays, complex calculations)
- The result is passed as a prop to a memoized component

**DON'T use useMemo for:**
```jsx
// Overkill — simple object creation is cheap
const style = useMemo(() => ({ color: 'red' }), []); // unnecessary
const style = { color: 'red' }; // perfectly fine if not passed to memo'd component

// Overkill — primitive values are always equal by value
const doubled = useMemo(() => count * 2, [count]); // unnecessary
const doubled = count * 2; // fine
```

---

## useCallback — stabilize function references

```jsx
// WITHOUT useCallback
function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    // New function reference on every render of SearchPage
    const handleSearch = async (term) => {
        const data = await fetchResults(term);
        setResults(data);
    };

    // If SearchBar is memoized, it still re-renders because handleSearch is always new
    return <SearchBar onSearch={handleSearch} />;
}

// WITH useCallback — stable reference
function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = useCallback(async (term) => {
        const data = await fetchResults(term);
        setResults(data);
    }, []); // no dependencies — function never changes

    return <SearchBar onSearch={handleSearch} />;
}
```

**Summary:**

| Hook | What it memoizes | Use when |
|------|-----------------|----------|
| `React.memo` | Component render output | Child component with stable props |
| `useMemo` | Computed value | Expensive calculation |
| `useCallback` | Function reference | Function passed to memoized component or used as useEffect dependency |

---

## Context — the performance pitfall

Every component that calls `useContext` re-renders whenever the context **value** changes —
even if the part of the value it uses hasn't changed.

```jsx
// PROBLEM: any change to AuthContext re-renders ALL consumers
const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');

    return (
        // This object is NEW on every render → ALL consumers re-render
        <AuthContext.Provider value={{ user, setUser, theme, setTheme }}>
            {children}
        </AuthContext.Provider>
    );
}
```

**Fixes:**

```jsx
// Fix 1: Memoize the context value
function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');

    const value = useMemo(
        () => ({ user, setUser, theme, setTheme }),
        [user, theme] // only changes when user or theme changes
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Fix 2 (better): Split into separate contexts
const UserContext   = createContext(null); // changes when user changes
const ThemeContext  = createContext(null); // changes when theme changes
// Components that only need theme don't re-render on user changes
```

---

## Concurrent React — useTransition & useDeferredValue

React 18 introduced concurrent features: React can interrupt rendering to keep the UI responsive.

### useTransition — mark slow updates as non-urgent

```jsx
function SearchPage() {
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPending, startTransition] = useTransition();

    function handleChange(e) {
        setInputValue(e.target.value); // urgent: update input immediately

        startTransition(() => {
            setSearchQuery(e.target.value); // non-urgent: can be interrupted
        });
    }

    return (
        <>
            <input value={inputValue} onChange={handleChange} />
            {isPending && <Spinner />}
            <SearchResults query={searchQuery} /> {/* potentially slow */}
        </>
    );
}
```

Without `useTransition`: typing in the input is laggy because `SearchResults` blocks it.
With `useTransition`: input updates instantly; results update when React has time.

### useDeferredValue — defer a value update

```jsx
function SearchResults({ query }) {
    const deferredQuery = useDeferredValue(query);
    // deferredQuery lags behind query — shows stale results while computing fresh ones

    const isStale = query !== deferredQuery;

    return (
        <div style={{ opacity: isStale ? 0.5 : 1 }}> {/* dim while updating */}
            <ResultList query={deferredQuery} />
        </div>
    );
}
```

**useTransition vs useDeferredValue:**
- `useTransition`: you control the state update (wraps `setState`)
- `useDeferredValue`: you receive a value from outside (wraps a prop or derived value)

---

## Suspense & lazy loading

### Code splitting with React.lazy

```jsx
import { lazy, Suspense } from 'react';

// Component is NOT included in the main bundle
// Loaded on demand when first rendered
const HeavyDashboard = lazy(() => import('./HeavyDashboard'));
const AdminPanel     = lazy(() => import('./AdminPanel'));

function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            {/* HeavyDashboard JS is downloaded when this route is rendered */}
            <Routes>
                <Route path="/dashboard" element={<HeavyDashboard />} />
                <Route path="/admin"     element={<AdminPanel />} />
            </Routes>
        </Suspense>
    );
}
```

### Suspense boundaries — placement matters

```jsx
// Coarse boundary — entire page shows spinner
<Suspense fallback={<PageSpinner />}>
    <UserProfile />
    <UserPosts />
    <UserFollowers />
</Suspense>

// Fine-grained boundaries — each section loads independently
<UserProfile />   {/* no suspend */}
<Suspense fallback={<PostsSkeleton />}>
    <UserPosts />   {/* loads independently */}
</Suspense>
<Suspense fallback={<FollowersSkeleton />}>
    <UserFollowers /> {/* loads independently */}
</Suspense>
```

---

## Custom hooks — encapsulate and reuse logic

A custom hook is just a function prefixed with `use` that calls other hooks.
**Rule:** if two components share stateful logic, extract it into a custom hook.

```jsx
// Custom hook: encapsulates fetch logic
function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        fetch(url)
            .then(res => res.json())
            .then(data => { if (!cancelled) { setData(data); setLoading(false); } })
            .catch(err => { if (!cancelled) { setError(err); setLoading(false); } });

        return () => { cancelled = true; };
    }, [url]);

    return { data, loading, error };
}

// Usage — clean components, logic is reusable
function UserProfile({ userId }) {
    const { data: user, loading, error } = useFetch<User>(`/api/users/${userId}`);

    if (loading) return <Spinner />;
    if (error)   return <Error message={error.message} />;
    return <div>{user.name}</div>;
}
```

More custom hook examples:

```jsx
// useLocalStorage — sync state with localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialValue;
    });

    const setStoredValue = useCallback((newValue: T) => {
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
    }, [key]);

    return [value, setStoredValue] as const;
}

// useDebounce — debounce a value
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
```

---

## Error Boundaries

React's try-catch equivalent for render errors. Must be a class component.
Catches errors thrown during render, in lifecycle methods, or in constructors of child components.

```jsx
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        logErrorToService(error, errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || <h2>Something went wrong.</h2>;
        }
        return this.props.children;
    }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
    <UserDashboard /> {/* any render error here is caught */}
</ErrorBoundary>
```

**What error boundaries do NOT catch:**
- Event handlers (use try-catch there)
- Async code (`setTimeout`, `fetch`)
- Errors in the error boundary itself

---

## Portals — render outside the component tree

```jsx
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    // Renders into document.body, NOT into the parent component's DOM node
    // Useful for modals, tooltips, dropdowns that need to escape overflow:hidden
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body  // target DOM node
    );
}
```

**Key property:** Even though the Portal renders into `document.body`, React event bubbling
follows the React component tree (not the DOM tree).
Clicking inside a Portal still bubbles up to the Portal's React parent component.

---

## Interview answers

### What is React.memo and when should you use it?
`React.memo` wraps a component to skip re-rendering if its props haven't changed (shallow comparison). Use it for components that render often but with the same props, or for expensive pure components. Don't use it everywhere — the overhead of comparison can cost more than just re-rendering.

### What is the difference between useMemo and useCallback?
`useMemo` memoizes the return value of a function. `useCallback` memoizes the function itself (its reference). Use `useMemo` for expensive computed values; use `useCallback` for functions passed as props to memoized child components or used as `useEffect` dependencies where referential stability matters.

### Why does Context cause performance issues?
Every component consuming a context re-renders when the context value changes. If the context value is a new object created on every parent render, all consumers re-render on every parent render. Fix: `useMemo` the context value, or split the context into separate contexts for independent parts of state.

### What is useTransition?
A React 18 hook that marks a state update as non-urgent. React can interrupt the transition to handle more urgent updates (like typing in an input). `isPending` tells you if the transition is still in progress. Used to keep UI responsive while computing expensive state updates.

### How does React.lazy enable code splitting?
`React.lazy` wraps a dynamic `import()`. The component's code is not included in the main bundle — it's downloaded on demand when the component is first rendered. Combined with `Suspense`, you show a fallback while the code loads. This reduces initial bundle size and load time.

### What is an error boundary and what are its limitations?
A class component that catches JavaScript errors thrown during rendering in its child tree and shows a fallback UI. It does NOT catch errors in event handlers (use try-catch), async operations, or server-side rendering.
