# React — Modern Hooks (React 18 & 19)

> **Context:** React 19 shipped with the Next.js 15 App Router. These hooks are increasingly expected in senior interviews, especially `useActionState`, `useOptimistic`, and `use()`.

## Glossary

| Term | Meaning |
|------|---------|
| **`useLayoutEffect`** | Like `useEffect` but fires synchronously after DOM mutations, before the browser paints — used for DOM measurements |
| **`useActionState`** | React 19 — manages state driven by a form action (replaces `useFormState` from React DOM) |
| **`useFormStatus`** | React 19 — reads the pending/error state of the nearest parent `<form>` submission |
| **`useOptimistic`** | React 19 — temporarily applies an optimistic state while an async operation is in flight |
| **`use()`** | React 19 — unwraps a Promise or Context inside a component, including inside conditionals |
| **`useId`** | React 18 — generates a stable, SSR-safe unique ID for accessibility attributes |
| **`flushSync`** | React 18 — forces React to flush state updates synchronously (escape hatch) |

---

## `useLayoutEffect` vs `useEffect`

The most misunderstood distinction. Both take the same signature — the difference is **when** they fire relative to the browser paint.

```
Render → commit DOM changes → useLayoutEffect fires → browser paints → useEffect fires
```

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Fires | After browser paint (async) | After DOM mutation, before paint (sync) |
| Blocks paint? | No | Yes — use sparingly |
| SSR | Safe (skipped on server) | Warning on server (no DOM) |
| Use for | Side effects, subscriptions, data fetching | DOM measurements, avoiding visual flicker |

### When to use `useLayoutEffect`

**Use case 1: DOM measurement that affects render**

```tsx
// BAD with useEffect — causes visible flicker
// Component renders, browser paints with wrong position, then useEffect fires and corrects it
function Tooltip({ anchorRef, children }) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    // useEffect: browser paints BEFORE this runs → tooltip flickers at wrong position
    useLayoutEffect(() => {
        const anchor = anchorRef.current!.getBoundingClientRect();
        const tooltip = tooltipRef.current!.getBoundingClientRect();

        setPosition({
            top: anchor.bottom + 8,
            left: anchor.left + anchor.width / 2 - tooltip.width / 2,
        });
    }, []); // fires before paint → no flicker

    return (
        <div ref={tooltipRef} style={{ position: 'absolute', ...position }}>
            {children}
        </div>
    );
}
```

**Use case 2: Preventing scroll position jumps**

```tsx
// Restore scroll position before the user sees the page
function ScrollRestorer({ savedPosition }: { savedPosition: number }) {
    useLayoutEffect(() => {
        window.scrollTo(0, savedPosition); // fires before paint — no visible jump
    }, [savedPosition]);

    return null;
}
```

**Rule:** If your effect reads from the DOM (layout, dimensions, scroll position) and uses that to update state/style — use `useLayoutEffect`. For everything else, use `useEffect`.

---

## `useId` — SSR-safe unique IDs (React 18)

Generates a stable unique ID that is the same on server and client — prevents hydration mismatches when using IDs for accessibility.

```tsx
// BAD — Math.random() differs between server and client → hydration mismatch
function Input({ label }: { label: string }) {
    const id = Math.random().toString(); // different every render!
    return (
        <>
            <label htmlFor={id}>{label}</label>
            <input id={id} />
        </>
    );
}

// GOOD — useId is stable across server and client
function Input({ label }: { label: string }) {
    const id = useId(); // ':r0:', ':r1:', etc. — stable, unique, SSR-safe
    return (
        <>
            <label htmlFor={id}>{label}</label>
            <input id={id} />
        </>
    );
}

// Multiple IDs from one useId call — use a suffix
function PasswordField() {
    const id = useId();
    return (
        <div>
            <label htmlFor={`${id}-input`}>Password</label>
            <input id={`${id}-input`} type="password" aria-describedby={`${id}-hint`} />
            <p id={`${id}-hint`}>Must be at least 8 characters</p>
        </div>
    );
}
```

**Note:** Never use `useId` for list keys — only for HTML `id` attributes.

---

## React 19 — `use()` hook

`use()` unwraps a Promise or Context value. Unlike all other hooks, it can be called **inside conditionals and loops**.

### Unwrapping a Promise

```tsx
// Server Component passes an unawaited Promise to Client Component
// app/page.tsx (Server Component)
export default function Page() {
    const userPromise = fetchUser(); // NOT awaited — passed as-is
    return <Profile userPromise={userPromise} />;
}

// Profile.tsx ('use client')
'use client';
import { use, Suspense } from 'react';

function ProfileContent({ userPromise }: { userPromise: Promise<User> }) {
    const user = use(userPromise); // suspends until resolved
    return <h1>{user.name}</h1>;
}

export function Profile({ userPromise }: { userPromise: Promise<User> }) {
    return (
        <Suspense fallback={<Spinner />}>
            <ProfileContent userPromise={userPromise} />
        </Suspense>
    );
}
```

**Why pass an unawaited Promise?** The Server Component starts fetching immediately (at render time), not after the Client Component mounts. The data is already in-flight by the time `use()` reads it — better performance than `useEffect` fetching.

### Unwrapping Context (conditionally)

```tsx
// use() can read Context inside conditions — regular useContext cannot
function Button({ isModal }: { isModal: boolean }) {
    if (isModal) {
        const theme = use(ThemeContext); // valid — use() works in conditionals
        return <button style={{ background: theme.primary }}>Close</button>;
    }
    return <button>Close</button>;
}
```

---

## React 19 — `useActionState`

Manages state derived from a form action. Replaces the old `useFormState` from `react-dom`.

```tsx
'use client';
import { useActionState } from 'react';

type State = { error: string | null; success: boolean };

// The action — runs on the server if passed a Server Action
async function submitForm(prevState: State, formData: FormData): Promise<State> {
    const email = formData.get('email') as string;

    if (!email.includes('@')) {
        return { error: 'Invalid email', success: false };
    }

    await saveEmail(email);
    return { error: null, success: true };
}

export function ContactForm() {
    const [state, action, isPending] = useActionState(submitForm, {
        error: null,
        success: false,
    });

    return (
        <form action={action}>
            <input name="email" type="email" />
            {state.error && <p role="alert">{state.error}</p>}
            {state.success && <p>Submitted!</p>}
            <button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
}
```

**What it gives you:**
- `state` — current state (starts as `initialState`)
- `action` — pass this to `<form action={action}>`
- `isPending` — true while the action is running

---

## React 19 — `useFormStatus`

Reads the pending state of the **nearest parent `<form>`**. Must be used in a component rendered inside the form.

```tsx
'use client';
import { useFormStatus } from 'react-dom';

// This component must be rendered INSIDE the <form>
function SubmitButton() {
    const { pending, data, method, action } = useFormStatus();
    //       ↑ true while form is submitting

    return (
        <button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save'}
        </button>
    );
}

// Usage — SubmitButton is inside the form, so useFormStatus works
function ProfileForm() {
    return (
        <form action={updateProfile}>
            <input name="name" />
            <SubmitButton /> {/* reads pending state from parent form */}
        </form>
    );
}
```

**Why a separate component?** `useFormStatus` must be in a child of the form — you can't call it in the same component that renders the `<form>`. This is why the submit button is extracted.

---

## React 19 — `useOptimistic`

Apply a temporary optimistic state while an async operation is pending. Automatically reverts if the operation fails.

```tsx
'use client';
import { useOptimistic, useTransition } from 'react';

type Message = { id: number; text: string; sending?: boolean };

export function MessageList({ messages }: { messages: Message[] }) {
    const [isPending, startTransition] = useTransition();

    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        messages,
        // Reducer: how to apply the optimistic update
        (currentMessages, newText: string) => [
            ...currentMessages,
            { id: Date.now(), text: newText, sending: true }, // temporary item
        ]
    );

    async function handleSend(formData: FormData) {
        const text = formData.get('text') as string;

        startTransition(async () => {
            addOptimisticMessage(text); // immediately shows the new message
            await sendMessage(text);   // actual server call — if it throws, reverts
        });
    }

    return (
        <div>
            {optimisticMessages.map(msg => (
                <p key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
                    {msg.text} {msg.sending && '(sending...)'}
                </p>
            ))}
            <form action={handleSend}>
                <input name="text" />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}
```

**Key behaviors:**
- Optimistic state applies immediately (no waiting for server)
- If the async operation succeeds, real state from the server replaces the optimistic state
- If it fails (throws), the optimistic update is automatically reverted
- Must be wrapped in `startTransition`

---

## `flushSync` — force synchronous flush (escape hatch)

Forces React to flush all pending state updates synchronously. Rarely needed — use only when you must read updated DOM immediately after a state update.

```tsx
import { flushSync } from 'react-dom';

function ChatList() {
    const [messages, setMessages] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    function addMessage(text: string) {
        flushSync(() => {
            setMessages(prev => [...prev, text]); // React flushes this synchronously
        });
        // DOM is updated NOW — safe to read layout
        bottomRef.current?.scrollIntoView(); // scroll to new message
    }

    return (
        <div>
            {messages.map((m, i) => <p key={i}>{m}</p>)}
            <div ref={bottomRef} />
        </div>
    );
}
```

**Without `flushSync`:** `setMessages` is batched — the DOM isn't updated yet when `scrollIntoView` runs.
**With `flushSync`:** React flushes synchronously — DOM is updated before the next line.

---

## Interview Answers

### What is the difference between `useEffect` and `useLayoutEffect`?
Both run after React commits changes to the DOM. The difference is timing: `useEffect` fires asynchronously after the browser paints — it doesn't block the visual update. `useLayoutEffect` fires synchronously after DOM mutations but before the browser paints — it blocks paint. Use `useLayoutEffect` when you need to read DOM layout (dimensions, positions) and apply changes before the user sees anything, to avoid flicker. For everything else (subscriptions, data fetching), use `useEffect`.

### What is the `use()` hook in React 19?
`use()` is a new hook that unwraps a Promise or Context. Unlike other hooks, it can be called inside conditionals and loops. When passed a Promise, it suspends the component until resolved — enabling Server Components to pass unawaited Promises to Client Components as props, so the data fetch starts on the server immediately rather than after client mount.

### What is `useActionState` and what problem does it solve?
`useActionState` manages state driven by form actions. It wraps an action function and returns `[state, action, isPending]`. The state is updated by the action's return value after each submission. It simplifies the common pattern of tracking form submission state (errors, success, loading) without managing that state manually.

### What is `useOptimistic` and when would you use it?
`useOptimistic` lets you show a temporary, optimistic state while an async operation is in flight. You provide the real state and a reducer that describes how to apply an optimistic update. The optimistic state shows immediately; when the async operation completes, it's replaced by the real state. If the operation fails, it automatically reverts. Use it for any UI where you want to feel instant — sending messages, toggling likes, reordering lists.

### What is `useId` and why not use `Math.random()` for IDs?
`useId` generates a stable unique ID that is identical on the server and client. `Math.random()` produces different values server-side vs client-side, causing a hydration mismatch. `useId` is safe for SSR. Use it for accessibility attributes (`htmlFor`, `aria-describedby`) — not for list keys.
