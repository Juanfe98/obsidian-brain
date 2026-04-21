# React — Component Patterns

> **Senior-level focus:** Interviewers use these to test design thinking — can you recognize when abstraction is warranted, what trade-offs each pattern carries, and when NOT to use them?

## Glossary

| Term | Meaning |
|------|---------|
| **HOC** | Higher-Order Component — a function that takes a component and returns an enhanced component |
| **Render props** | A component that accepts a function as a prop and calls it to delegate rendering |
| **Compound components** | A group of components that share implicit state via Context — designed to work together |
| **Controlled component pattern** | Parent drives the component's state via props + callbacks |
| **Composition** | Building UI by nesting components rather than inheriting — React's primary reuse model |

---

## Higher-Order Components (HOC)

A HOC is a function that takes a component and returns a new component with added behavior.

```tsx
// Pattern: withAuth — redirect unauthenticated users
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { ComponentType } from 'react';

function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
    function AuthenticatedComponent(props: P) {
        const { user, isLoading } = useAuth();
        const router = useRouter();

        if (isLoading) return <Spinner />;

        if (!user) {
            router.replace('/login');
            return null;
        }

        return <WrappedComponent {...props} />;
    }

    // Preserve the display name for DevTools
    AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name})`;

    return AuthenticatedComponent;
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedSettings = withAuth(Settings);
```

**Another HOC example: `withErrorBoundary`**

```tsx
function withErrorBoundary<P extends object>(
    WrappedComponent: ComponentType<P>,
    fallback: ReactNode
) {
    return function (props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}
```

### HOC trade-offs

| Pros | Cons |
|------|------|
| Reuse cross-cutting logic across many components | Prop collision — HOC props can clash with wrapped component props |
| Works with class components | "Wrapper hell" — deeply nested HOC chains in DevTools |
| Can wrap any component without modifying it | Harder to trace where props come from |
| | TypeScript generics get complex |

**When to use HOCs:**
- Cross-cutting concerns applied to many components (auth, analytics, error boundaries)
- Working with class components (hooks aren't available)
- Wrapping third-party components you can't modify

**When to prefer hooks instead:**
- Logic reuse in functional components — custom hooks are simpler and more composable

---

## Render Props

A component that accepts a function as a prop (or `children`) and calls it to delegate what to render. The component owns the logic; the caller owns the UI.

```tsx
// Pattern: MouseTracker — provides mouse position, caller decides how to render
type MousePosition = { x: number; y: number };

type MouseTrackerProps = {
    render: (position: MousePosition) => ReactNode;
    // or: children: (position: MousePosition) => ReactNode;
};

function MouseTracker({ render }: MouseTrackerProps) {
    const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

    useEffect(() => {
        function handleMove(e: MouseEvent) {
            setPosition({ x: e.clientX, y: e.clientY });
        }
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    return <>{render(position)}</>;
}

// Usage — caller controls rendering, MouseTracker controls the logic
function App() {
    return (
        <MouseTracker
            render={({ x, y }) => (
                <div>
                    <p>Mouse: {x}, {y}</p>
                    <div
                        style={{
                            position: 'fixed',
                            left: x,
                            top: y,
                            width: 10,
                            height: 10,
                            background: 'red',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                        }}
                    />
                </div>
            )}
        />
    );
}
```

**Children as function (more common)**

```tsx
// DataFetcher — same pattern with children prop
type DataFetcherProps<T> = {
    url: string;
    children: (state: { data: T | null; loading: boolean; error: Error | null }) => ReactNode;
};

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch(url)
            .then(r => r.json())
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [url]);

    return <>{children({ data, loading, error })}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
    {({ data, loading, error }) => {
        if (loading) return <Spinner />;
        if (error) return <p>Error: {error.message}</p>;
        return <UserList users={data!} />;
    }}
</DataFetcher>
```

### Render props trade-offs

| Pros | Cons |
|------|------|
| Maximum flexibility — caller controls all rendering | Can cause "callback hell" in JSX when nested |
| Logic and UI are cleanly separated | Harder to read than hooks |
| Works with class components | Performance: function creates a new reference each render |

**Modern replacement:** Custom hooks. Render props predate hooks — today the same logic sharing is done with custom hooks, which are simpler. Render props are still useful when you need to render from a class component or share render logic (not just state logic).

---

## Compound Components

A group of components that share implicit state through Context. They're designed to be composed together, like HTML's `<select>` and `<option>`.

```tsx
// Pattern: Tabs — Tab.Root, Tab.List, Tab.Tab, Tab.Panel
import { createContext, useContext, useState, type ReactNode } from 'react';

// Internal context — not exported
type TabsContextValue = {
    activeTab: string;
    setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error('Tab components must be used inside <Tabs.Root>');
    return ctx;
}

// Sub-components
function Root({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div>{children}</div>
        </TabsContext.Provider>
    );
}

function List({ children }: { children: ReactNode }) {
    return <div role="tablist">{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
    const { activeTab, setActiveTab } = useTabsContext();
    return (
        <button
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            style={{ fontWeight: activeTab === id ? 'bold' : 'normal' }}
        >
            {children}
        </button>
    );
}

function Panel({ id, children }: { id: string; children: ReactNode }) {
    const { activeTab } = useTabsContext();
    if (activeTab !== id) return null;
    return <div role="tabpanel">{children}</div>;
}

// Export as a namespace
export const Tabs = { Root, List, Tab, Panel };

// Usage — caller controls structure, components share state automatically
function SettingsPage() {
    return (
        <Tabs.Root defaultTab="profile">
            <Tabs.List>
                <Tabs.Tab id="profile">Profile</Tabs.Tab>
                <Tabs.Tab id="security">Security</Tabs.Tab>
                <Tabs.Tab id="billing">Billing</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel id="profile"><ProfileSettings /></Tabs.Panel>
            <Tabs.Panel id="security"><SecuritySettings /></Tabs.Panel>
            <Tabs.Panel id="billing"><BillingSettings /></Tabs.Panel>
        </Tabs.Root>
    );
}
```

### Compound components with controlled mode

Great components support both **uncontrolled** (internal state) and **controlled** (parent drives state) modes:

```tsx
type TabsRootProps = {
    defaultTab?: string;       // uncontrolled
    activeTab?: string;        // controlled
    onTabChange?: (id: string) => void; // controlled
    children: ReactNode;
};

function Root({ defaultTab, activeTab: controlledTab, onTabChange, children }: TabsRootProps) {
    const [internalTab, setInternalTab] = useState(defaultTab ?? '');

    // If parent passes activeTab, use that; otherwise use internal state
    const activeTab = controlledTab ?? internalTab;
    const setActiveTab = (id: string) => {
        if (controlledTab === undefined) setInternalTab(id); // uncontrolled
        onTabChange?.(id);                                    // always notify parent
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </TabsContext.Provider>
    );
}
```

### Compound components trade-offs

| Pros | Cons |
|------|------|
| Flexible, expressive API — caller controls structure | More code than a single monolithic component |
| Components can be reordered, nested, conditionally rendered | Internal Context adds a layer of indirection |
| Shared state is implicit — no prop drilling | Sub-components must be used together (throws if used outside Root) |
| Pattern used by Radix UI, Headless UI, React Aria | |

**When to use compound components:**
- UI primitives with multiple moving parts (Tabs, Accordion, Dropdown, Dialog)
- When callers need control over structure and layout, not just behavior
- Building a component library

---

## Controlled Component Pattern (external state)

Beyond form elements — applying the controlled/uncontrolled pattern to custom components.

```tsx
// A custom Select component that supports both modes
type SelectProps = {
    options: { value: string; label: string }[];
    // Uncontrolled mode
    defaultValue?: string;
    // Controlled mode
    value?: string;
    onChange?: (value: string) => void;
};

function Select({ options, defaultValue, value: controlledValue, onChange }: SelectProps) {
    const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? '');

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    function handleChange(newValue: string) {
        if (!isControlled) setInternalValue(newValue);
        onChange?.(newValue);
    }

    return (
        <select value={currentValue} onChange={e => handleChange(e.target.value)}>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}

// Uncontrolled — internal state
<Select options={options} defaultValue="option-1" />

// Controlled — parent drives state
<Select options={options} value={selected} onChange={setSelected} />
```

---

## Composition over Configuration

Prefer composing components via `children` over adding more props.

```tsx
// BAD — configuration-based (props explosion)
<Card
    title="Hello"
    subtitle="World"
    imageUrl="/img.png"
    footerText="Learn more"
    footerHref="/more"
    showBadge={true}
    badgeColor="green"
    badgeText="New"
/>

// GOOD — composition-based (caller decides structure)
<Card>
    <Card.Header>
        <Badge color="green">New</Badge>
        <Card.Title>Hello</Card.Title>
        <Card.Subtitle>World</Card.Subtitle>
    </Card.Header>
    <Card.Image src="/img.png" alt="..." />
    <Card.Footer>
        <a href="/more">Learn more</a>
    </Card.Footer>
</Card>
```

**Why composition wins:**
- Props don't need to anticipate every use case
- Callers add/remove/reorder parts without new props
- Each sub-component can be tested independently

---

## Interview Answers

### What is a Higher-Order Component and when would you use it today?
A HOC is a function that takes a component and returns a new component with added behavior — like wrapping with auth checks or error boundaries. In modern React, most logic reuse is done with custom hooks, which are simpler and don't add wrapper components. I'd reach for a HOC when I need to wrap a component I can't modify (third-party), when working with class components, or when applying the same error boundary or auth pattern across many components via a wrapping factory.

### What are render props and what replaced them?
Render props is a pattern where a component calls a function prop to delegate rendering, letting it share logic while giving callers full control over UI. The pattern was very common before hooks — `react-router`'s Route, `react-motion`, and many libraries used it. Custom hooks replaced render props for logic sharing in functional components. Render props are still useful when you need to share rendering logic (not just state/effect logic), or when integrating with class components.

### What are compound components and what problem do they solve?
Compound components are a group of components that share implicit state via Context, designed to work together — like `<Tabs.Root>`, `<Tabs.Tab>`, `<Tabs.Panel>`. They solve the flexibility problem: instead of adding more and more props to a monolithic component, callers control the structure and layout while the components handle the shared behavior. Radix UI and Headless UI use this pattern extensively. The trade-off is more code and an indirection layer through Context.

### What is the difference between controlled and uncontrolled components?
A controlled component has its state driven by the parent via props + a callback — the parent is always the source of truth. An uncontrolled component manages its own state internally and optionally accepts a `defaultValue`. Well-designed components support both modes. The rule: if the parent needs to read, reset, or react to the component's value programmatically, make it controlled. If it's a simple "set and forget", uncontrolled with `defaultValue` is cleaner.

### When would you choose composition over a prop-heavy component API?
When a component needs to be flexible in structure, not just behavior. Props are good for configuring well-defined variations. But when callers need to control layout, add/remove sections, or nest arbitrary content, composition via `children` and sub-components is far more scalable. The heuristic: if you're adding boolean flags like `showHeader`, `showFooter`, `hasIcon` — you've hit the limit of props. Switch to composition.
