# React — State Management

> **Senior-level focus:** The question isn't "how does Redux work" — it's "how do you decide what state management to use, and why?" This is what separates senior candidates.

## Glossary

| Term | Meaning |
|------|---------|
| **Local state** | State owned by a single component — `useState`, `useReducer` |
| **Lifted state** | State moved up to a common ancestor so multiple children can share it |
| **Context** | React's built-in mechanism for passing values through the tree without prop drilling |
| **Zustand** | Lightweight external store — subscription-based, no Provider needed |
| **Redux Toolkit (RTK)** | Opinionated Redux wrapper — reducers, actions, selectors, thunks in one API |
| **Server state** | Data that lives on the server — fetched, cached, and synchronized (React Query / SWR) |
| **URL state** | State encoded in the URL — shareable, bookmarkable, survives refresh |
| **Derived state** | Values computed from existing state — should NOT be stored, only computed |

---

## The Decision Framework

The most important senior skill: picking the right tool for the right state type.

```
What kind of state is this?
│
├─ UI state (open/closed, active tab, form values)
│   └─ Does only one component need it?
│       ├─ YES → useState / useReducer (local)
│       └─ NO  → lift up or Context (if shallow tree)
│
├─ Shared app state (user session, theme, cart, permissions)
│   └─ How often does it change?
│       ├─ Rarely (theme, user) → Context
│       └─ Frequently (cart, notifications) → Zustand or RTK
│
├─ Server data (posts, products, user profiles)
│   └─ → React Query or SWR (not Redux, not Context)
│
└─ Shareable / bookmarkable state (filters, pagination, selected item)
    └─ → URL (searchParams / useSearchParams)
```

---

## Local State — `useState` and `useReducer`

Use local state by default. Only reach for something else when you have a clear reason.

```tsx
// useState — simple, independent values
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);

// useReducer — when state has multiple related fields or complex transitions
type CartState = {
    items: CartItem[];
    isCheckingOut: boolean;
    coupon: string | null;
};

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'APPLY_COUPON'; payload: string }
    | { type: 'START_CHECKOUT' };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM':
            return { ...state, items: [...state.items, action.payload] };
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(i => i.id !== action.payload) };
        case 'APPLY_COUPON':
            return { ...state, coupon: action.payload };
        case 'START_CHECKOUT':
            return { ...state, isCheckingOut: true };
    }
}
```

**Prefer `useReducer` when:**
- 3+ related state fields that change together
- Next state depends on current state in non-trivial ways
- You want to extract + test state logic independently

---

## Context — built-in sharing without prop drilling

Context is NOT a state manager — it's a dependency injection mechanism. It distributes a value; you still need `useState` or `useReducer` to manage that value.

### The correct pattern

```tsx
// 1. Create context with a null default (forces consumers to be inside Provider)
type AuthContextValue = {
    user: User | null;
    login: (credentials: Credentials) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// 2. Custom hook — throws if used outside Provider (catches bugs early)
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

// 3. Provider owns the state
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = useCallback(async (credentials: Credentials) => {
        const user = await authService.login(credentials);
        setUser(user);
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    // Memoize the value to prevent unnecessary re-renders
    const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### Context performance problem — and how to fix it

Every consumer re-renders when the context value changes — even if they only care about part of the value.

```tsx
// PROBLEM: ThemeContext holds both theme and language
// A component that only needs theme re-renders when language changes
const AppContext = createContext({ theme: 'dark', language: 'en', user: null });

// FIX 1: Split contexts by update frequency
const ThemeContext = createContext<'light' | 'dark'>('light');
const LanguageContext = createContext<string>('en');
const UserContext = createContext<User | null>(null);
// Now a theme consumer doesn't re-render when language changes

// FIX 2: Keep context value stable with useMemo
const value = useMemo(() => ({ theme, setTheme }), [theme]);
// Only re-renders consumers when theme actually changes

// FIX 3: For high-frequency updates, use Zustand instead
```

**When Context is the right choice:**
- Low-frequency updates (theme, locale, current user)
- Avoiding prop drilling for values used across 3+ levels
- Values that are "ambient" rather than frequently changing

**When Context is NOT enough:**
- High-frequency updates (every keystroke, real-time data)
- Complex update logic shared across many unrelated components
- You need to subscribe to a slice of state (avoid unnecessary re-renders)

---

## Zustand — lightweight external store

No Provider needed. Components subscribe to slices — only re-render when their slice changes.

```tsx
// store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // optional: persist to localStorage

type CartItem = { id: string; name: string; price: number; qty: number };

type CartStore = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    total: () => number;
    clear: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find(i => i.id === item.id);
                    if (existing) {
                        return {
                            items: state.items.map(i =>
                                i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                            ),
                        };
                    }
                    return { items: [...state.items, { ...item, qty: 1 }] };
                }),

            removeItem: (id) =>
                set((state) => ({ items: state.items.filter(i => i.id !== id) })),

            updateQty: (id, qty) =>
                set((state) => ({
                    items: state.items.map(i => (i.id === id ? { ...i, qty } : i)),
                })),

            total: () =>
                get().items.reduce((sum, item) => sum + item.price * item.qty, 0),

            clear: () => set({ items: [] }),
        }),
        { name: 'cart-storage' } // localStorage key
    )
);

// Usage — subscribe to a slice (only re-renders when items change, not total)
function CartBadge() {
    const count = useCartStore(state => state.items.length); // selector
    return <span>{count}</span>;
}

function CartTotal() {
    const total = useCartStore(state => state.total()); // different slice
    return <span>${total.toFixed(2)}</span>;
}
```

**Why Zustand over Context for frequent updates:**
- Components only re-render when their selected slice changes
- No Provider boilerplate
- Works outside React components (in event handlers, utilities)
- Middleware: `persist`, `devtools`, `immer`

---

## Redux Toolkit — for large, complex apps

RTK is the modern way to use Redux. Reduces boilerplate significantly.

```tsx
// store/cartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

type CartState = {
    items: CartItem[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
};

// Async thunk — for API calls
export const fetchCart = createAsyncThunk('cart/fetchCart', async (userId: string) => {
    const response = await fetch(`/api/cart/${userId}`);
    return response.json() as Promise<CartItem[]>;
});

const cartSlice = createSlice({
    name: 'cart',
    initialState: { items: [], status: 'idle', error: null } as CartState,
    reducers: {
        addItem(state, action: PayloadAction<CartItem>) {
            state.items.push(action.payload); // immer allows "mutations"
        },
        removeItem(state, action: PayloadAction<string>) {
            state.items = state.items.filter(i => i.id !== action.payload);
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchCart.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message ?? 'Unknown error';
            });
    },
});

export const { addItem, removeItem } = cartSlice.actions;
export default cartSlice.reducer;

// Selector — derive data from state
export const selectCartTotal = (state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
```

**When to use Redux Toolkit:**
- Large teams needing strict conventions and predictable data flow
- Complex state with many cross-cutting concerns
- Need for time-travel debugging (Redux DevTools)
- App already uses Redux and migration cost isn't worth it

**When NOT to use Redux Toolkit:**
- Most apps — Zustand or Context + useReducer is simpler and sufficient
- Server state — use React Query / SWR instead

---

## Server State — React Query / SWR

Data from the server is fundamentally different from client state — it has caching, staleness, background refetching, deduplication. **Do not put server data in Redux or Context.**

```tsx
// React Query — the gold standard for server state
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user', userId],     // cache key — unique per user
        queryFn: () => fetchUser(userId),
        staleTime: 5 * 60 * 1000,      // data is fresh for 5 minutes
    });

    const queryClient = useQueryClient();

    const updateUser = useMutation({
        mutationFn: (updates: Partial<User>) => patchUser(userId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] }); // refetch
        },
    });

    if (isLoading) return <Spinner />;
    if (error) return <Error />;

    return (
        <div>
            <h1>{user.name}</h1>
            <button onClick={() => updateUser.mutate({ name: 'New Name' })}>
                {updateUser.isPending ? 'Saving...' : 'Edit'}
            </button>
        </div>
    );
}
```

**What React Query handles automatically:**
- Deduplicates identical requests in the same render
- Caches responses with configurable staleness
- Background refetch on window focus
- Retry on failure
- Optimistic updates via `onMutate`
- Pagination and infinite scroll

---

## URL State — for shareable UI state

If state should survive a page refresh or be shareable via URL, put it in the URL.

```tsx
// Next.js App Router — read and update URL params
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function ProductFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const category = searchParams.get('category') ?? 'all';
    const sort = searchParams.get('sort') ?? 'newest';

    function updateFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div>
            <select value={category} onChange={e => updateFilter('category', e.target.value)}>
                <option value="all">All</option>
                <option value="electronics">Electronics</option>
            </select>
            <select value={sort} onChange={e => updateFilter('sort', e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price ↑</option>
            </select>
        </div>
    );
}
```

**Good candidates for URL state:** filters, sort order, pagination, selected tab, search query, modal open state (if deep-linkable).

---

## Summary Decision Table

| State type | Tool | Reason |
|---|---|---|
| Simple local UI | `useState` | Default choice — no overhead |
| Complex local UI | `useReducer` | Multiple related fields, complex transitions |
| Shared, low-frequency | Context + `useState` | Theme, user, locale — changes rarely |
| Shared, high-frequency | Zustand | Cart, notifications — fine-grained subscriptions |
| Large app, strict conventions | Redux Toolkit | Teams, time-travel debugging, complex async flows |
| Server data | React Query / SWR | Caching, staleness, deduplication — built for this |
| Shareable / bookmarkable | URL params | Survives refresh, works with browser back/forward |
| Derived values | Computed inline | Never store what you can compute |

---

## Interview Answers

### How do you decide what state management solution to use?
I categorize the state first. Local UI state (open/closed, form input) stays in `useState` or `useReducer`. Shared low-frequency state (theme, current user) goes in Context. Shared high-frequency state (cart, real-time data) goes in Zustand — because Context re-renders all consumers on every update, while Zustand lets components subscribe to slices. Server data (posts, products) belongs in React Query or SWR, never in Redux — those tools are built for caching, staleness, and deduplication. State that should be bookmarkable or sharable goes in the URL.

### What is the performance problem with Context and how do you fix it?
Every component that consumes a Context re-renders when the context value changes — even if the component only cares about part of the value. Fixes: (1) split one large context into multiple smaller ones grouped by update frequency, (2) memoize the context value with `useMemo` so it only changes when the data actually changes, (3) for high-frequency updates, switch to Zustand which supports fine-grained subscriptions.

### When would you use Redux Toolkit over Zustand?
In most new projects I'd reach for Zustand — it has far less boilerplate and covers most use cases. I'd choose Redux Toolkit when the team is large and needs strict conventions, when the app has complex async flows that benefit from RTK Query, or when the codebase already uses Redux and migration isn't justified. For most mid-size apps, RTK is more complexity than needed.

### What is derived state and why shouldn't you store it?
Derived state is a value computed from existing state — for example, a cart total computed from items. Storing it creates two sources of truth that can go out of sync. Instead, compute it inline or with `useMemo`. If you find yourself writing `useEffect(() => setTotal(items.reduce(...)), [items])`, that's a red flag — you're synchronizing state with state, which is error-prone.
