# React + TypeScript Integration

## Glossary

| Term | Meaning |
|------|---------|
| **`FC<Props>`** | `React.FunctionComponent<Props>` — a type for functional components (now discouraged in favor of plain functions) |
| **`PropsWithChildren`** | Adds `children?: ReactNode` to your props type |
| **`ComponentProps`** | Utility type to extract props of any component |
| **`ReactNode`** | Any valid React renderable value: JSX, string, number, null, array |
| **`ReactElement`** | A specific JSX element — narrower than `ReactNode` |
| **`SyntheticEvent`** | React's cross-browser wrapper around native browser events |
| **`forwardRef`** | Allows a component to expose a ref to its parent |
| **`useRef` mutable vs readonly** | `useRef<T>(null)` → `RefObject<T>` (readonly). `useRef<T | null>(null)` → `MutableRefObject<T | null>` |

---

## Typing Component Props

### Preferred pattern — plain function (not FC)

```tsx
// PREFERRED — TypeScript infers the return type
interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "danger";
}

function Button({ label, onClick, disabled = false, variant = "primary" }: ButtonProps) {
    return (
        <button onClick={onClick} disabled={disabled} className={`btn-${variant}`}>
            {label}
        </button>
    );
}

// OUTDATED — FC<Props> has issues (used to include children implicitly)
const Button: React.FC<ButtonProps> = ({ label }) => <button>{label}</button>;
```

### Children — PropsWithChildren and ReactNode

```tsx
import { PropsWithChildren, ReactNode } from "react";

// Option 1: PropsWithChildren — adds optional children?: ReactNode
interface CardProps extends PropsWithChildren<{
    title: string;
    className?: string;
}> {}

// Option 2: explicit children in props
interface PanelProps {
    title: string;
    children: ReactNode;          // any renderable React content
    footer?: ReactNode;           // optional footer
    header: React.ReactElement;   // only JSX elements (not string/null)
}

function Panel({ title, children, footer, header }: PanelProps) {
    return (
        <div>
            {header}
            <h2>{title}</h2>
            {children}
            {footer}
        </div>
    );
}
```

### Extending HTML element props

```tsx
import { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

// Extend all native button attributes + add your own
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: string;
    label: string;
}

function IconButton({ icon, label, className, ...rest }: IconButtonProps) {
    // ...rest passes all native button attributes (onClick, disabled, type, etc.)
    return (
        <button className={`icon-btn ${className}`} {...rest}>
            <span>{icon}</span>
            {label}
        </button>
    );
}
```

### ComponentProps — extract props from any component

```tsx
import { ComponentProps } from "react";

// Extract props from a native HTML element
type InputProps = ComponentProps<"input">;    // all <input> attributes
type DivProps   = ComponentProps<"div">;      // all <div> attributes

// Extract props from a custom component
type ButtonProps = ComponentProps<typeof Button>;

// Useful for extending third-party components
interface EnhancedButtonProps extends ComponentProps<typeof ThirdPartyButton> {
    analyticsId: string;
}
```

---

## Discriminated Union Props — exclusive prop combinations

Enforce that certain prop combinations are mutually exclusive.

```tsx
// Either href (link) OR onClick (button) — never both, never neither
type LinkOrButton =
    | { href: string; onClick?: never }
    | { href?: never; onClick: () => void };

type ActionProps = LinkOrButton & {
    children: ReactNode;
    className?: string;
};

function Action({ href, onClick, children, className }: ActionProps) {
    if (href) {
        return <a href={href} className={className}>{children}</a>;
    }
    return <button onClick={onClick} className={className}>{children}</button>;
}

// Usage
<Action href="/dashboard">Go to Dashboard</Action>  // ✅
<Action onClick={handleClick}>Click me</Action>      // ✅
<Action href="/a" onClick={fn}>Both</Action>          // ❌ TypeScript error
<Action>Neither</Action>                             // ❌ TypeScript error
```

---

## Typing Event Handlers

```tsx
import { ChangeEvent, FormEvent, MouseEvent, KeyboardEvent } from "react";

function Form() {
    // Input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);   // string
        console.log(e.target.checked); // boolean (for checkboxes)
    };

    // Textarea change
    const handleTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
        console.log(e.target.value);
    };

    // Select change
    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        console.log(e.target.value);
    };

    // Form submit — always prevent default
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // access form data
    };

    // Button click
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        console.log(e.currentTarget); // HTMLButtonElement
    };

    // Keyboard events
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") { /* submit */ }
        if (e.key === "Escape") { /* cancel */ }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input onChange={handleInputChange} onKeyDown={handleKeyDown} />
            <button onClick={handleClick}>Submit</button>
        </form>
    );
}
```

---

## Typing Hooks

### useState — explicit vs inferred

```tsx
// TypeScript infers the type from the initial value
const [count, setCount] = useState(0);           // number
const [name, setName]   = useState("");           // string
const [active, setActive] = useState(false);     // boolean

// Explicit type needed when initial value doesn't convey the full type
const [user, setUser]   = useState<User | null>(null);  // couldn't infer User from null
const [items, setItems] = useState<string[]>([]);       // couldn't infer string[] from []
const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
```

### useRef — two patterns

```tsx
// Pattern 1: DOM element ref — starts as null, React fills it
// RefObject<T> — .current is readonly
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
    inputRef.current?.focus(); // .current is HTMLInputElement | null
}, []);

return <input ref={inputRef} />;

// Pattern 2: Mutable value container — NOT a DOM ref
// MutableRefObject<T> — .current is read/write
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function startTimer() {
    timerRef.current = setTimeout(() => {}, 1000); // ✅ assignable
}
function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
}
```

### useReducer with typed actions

```tsx
interface CartState {
    items: CartItem[];
    total: number;
    loading: boolean;
}

// Discriminated union for actions
type CartAction =
    | { type: "ADD_ITEM";    payload: CartItem }
    | { type: "REMOVE_ITEM"; payload: { id: string } }
    | { type: "CLEAR" }
    | { type: "SET_LOADING"; payload: boolean };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "ADD_ITEM":
            return {
                ...state,
                items: [...state.items, action.payload],       // ✅ CartItem available
                total: state.total + action.payload.price,
            };
        case "REMOVE_ITEM":
            return {
                ...state,
                items: state.items.filter(i => i.id !== action.payload.id), // ✅ id available
            };
        case "CLEAR":
            return { ...state, items: [], total: 0 };
        case "SET_LOADING":
            return { ...state, loading: action.payload };     // ✅ boolean available
        default:
            const _exhaustive: never = action; // compile error if case is missing
            return state;
    }
}

function Cart() {
    const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, loading: false });

    dispatch({ type: "ADD_ITEM", payload: cartItem });     // ✅
    dispatch({ type: "REMOVE_ITEM", payload: { id: "1" } }); // ✅
    dispatch({ type: "CLEAR" });                          // ✅
    dispatch({ type: "UNKNOWN" });                        // ❌ TypeScript error
}
```

---

## Typing Context

```tsx
interface ThemeContextType {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

// Pattern: createContext with undefined default + custom hook that throws
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function useTheme(): ThemeContextType {
    const ctx = useContext(ThemeContext);
    if (ctx === undefined) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx; // guaranteed non-undefined here
}

function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    const value = useMemo<ThemeContextType>(
        () => ({
            theme,
            toggleTheme: () => setTheme(t => t === "light" ? "dark" : "light"),
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Usage — no need to check for undefined
function Header() {
    const { theme, toggleTheme } = useTheme(); // guaranteed to have value
    return <button onClick={toggleTheme}>{theme}</button>;
}
```

---

## forwardRef — expose a ref to the parent

```tsx
import { forwardRef, useImperativeHandle } from "react";

interface InputProps {
    label: string;
    defaultValue?: string;
}

// forwardRef<RefType, PropsType>
const TextInput = forwardRef<HTMLInputElement, InputProps>(function TextInput(
    { label, defaultValue },
    ref  // forwarded ref from parent
) {
    return (
        <div>
            <label>{label}</label>
            <input ref={ref} defaultValue={defaultValue} />
        </div>
    );
});

// Parent — can access the underlying input element
function Form() {
    const inputRef = useRef<HTMLInputElement>(null);

    function focusInput() {
        inputRef.current?.focus();
    }

    return (
        <>
            <TextInput ref={inputRef} label="Name" />
            <button onClick={focusInput}>Focus input</button>
        </>
    );
}
```

### useImperativeHandle — expose a custom API instead of the DOM node

```tsx
interface DialogRef {
    open: () => void;
    close: () => void;
}

const Dialog = forwardRef<DialogRef, { children: ReactNode }>(function Dialog(
    { children },
    ref
) {
    const [isOpen, setIsOpen] = useState(false);

    // Expose only open/close — not the entire DOM element
    useImperativeHandle(ref, () => ({
        open:  () => setIsOpen(true),
        close: () => setIsOpen(false),
    }));

    if (!isOpen) return null;
    return <div className="dialog">{children}</div>;
});

function App() {
    const dialogRef = useRef<DialogRef>(null);

    return (
        <>
            <button onClick={() => dialogRef.current?.open()}>Open</button>
            <Dialog ref={dialogRef}>Dialog content</Dialog>
        </>
    );
}
```

---

## Generic Components in TSX

The `<T>` syntax in JSX files conflicts with JSX's `<T>` tag syntax.
Fix: use a comma after T or add `extends unknown`.

```tsx
// The comma tells the parser this is a generic, not a JSX tag
function List<T,>({ items, renderItem }: {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
}) {
    return <ul>{items.map((item, i) => <li key={i}>{renderItem(item, i)}</li>)}</ul>;
}

// Or use extends unknown as a constraint to disambiguate
function Select<T extends { id: string; label: string }>({ options, onSelect }: {
    options: T[];
    onSelect: (option: T) => void;
}) {
    return (
        <select onChange={e => {
            const selected = options.find(o => o.id === e.target.value);
            if (selected) onSelect(selected);
        }}>
            {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
    );
}

// Usage — TypeScript infers T from the items
<List items={[1, 2, 3]} renderItem={n => <span>{n}</span>} />
<List items={users} renderItem={u => <UserCard user={u} />} />
```

---

## Interview answers

### Why is the plain function preferred over React.FC for components?
`React.FC` (formerly `React.FunctionComponent`) historically included implicit `children?: ReactNode` in all components regardless of whether they accepted children. Since React 18 removed this, plain functions are cleaner: TypeScript infers the return type, there's no wrapper, and children must be explicitly declared in props.

### How do you type a ref to a DOM element vs a mutable value container?
For DOM elements: `useRef<HTMLInputElement>(null)` — TypeScript infers `RefObject<HTMLInputElement>` where `.current` is readonly. For mutable containers: `useRef<number | null>(null)` where `.current` is writable. The key: if you're passing the ref to a DOM element's `ref` prop, start with `null` and use the element type.

### How do you prevent null context issues with createContext?
Create the context with `createContext<T | undefined>(undefined)`, then write a custom hook that checks for `undefined` and throws a descriptive error. This guarantees the hook can only be used inside the correct provider, and callers get a non-nullable type from the hook.

### How do you type useReducer for type safety?
Define a discriminated union for actions — each action has a unique `type` string literal and a specific `payload` type. In the reducer's switch statement, TypeScript narrows to the correct action shape for each case. Add a `never` check in the `default` branch for exhaustiveness.

### What is forwardRef and when do you use it?
`forwardRef` allows a component to receive a `ref` from its parent and attach it to an internal DOM element or expose a custom imperative API via `useImperativeHandle`. Used when a parent needs to directly call focus/blur/scroll on a child's DOM element, or to expose component methods like `open()`/`close()` on a dialog.
