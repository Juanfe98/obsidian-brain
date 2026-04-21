# Next.js — App Router & Core Concepts

## Glossary

| Term | Meaning |
|------|---------|
| **App Router** | New Next.js routing system (v13+) based on the `app/` directory — supports Server Components, nested layouts, and streaming by default |
| **Pages Router** | Legacy routing system based on the `pages/` directory — every file becomes a route, all components are client-side by default |
| **Server Component (RSC)** | A React component that runs only on the server — zero client JS, can access databases directly, cannot use hooks or browser APIs |
| **Client Component** | A component marked with `'use client'` — runs in the browser, can use hooks, event handlers, and browser APIs |
| **Server Action** | An async function marked with `'use server'` — runs server-side, can be called from Client Components like a regular function |
| **Layout** | A UI shell that wraps pages and preserves state across navigations — does not re-render when child route changes |
| **Template** | Like a layout but creates a NEW instance on every navigation — state is NOT preserved |
| **Route Group** | A folder wrapped in `(parentheses)` — groups routes without affecting the URL path |
| **Parallel Route** | A slot (`@folder`) that renders multiple pages simultaneously in the same layout |
| **Intercepting Route** | A route that intercepts a navigation to show a different UI (e.g., a modal) while keeping the original route accessible via direct URL |
| **Slot** | Named content area in a layout defined by `@folderName` — used by parallel routes |
| **`server-only`** | npm package — causes a build-time error if a marked module is imported in a Client Component, preventing secrets from leaking to the browser |
| **`use()` hook** | React 19 hook — unwraps a Promise inside a Client Component, enabling the Server Component to pass unawaited promises as props |
| **params as Promise** | v15 breaking change — `params` and `searchParams` props are now Promises and must be `await`-ed |

---

## App Router vs Pages Router

The two routing systems coexist — you can have both in the same project during migration.

```
pages/                  ← Pages Router (legacy)
  index.tsx             ← /
  about.tsx             ← /about
  api/
    users.ts            ← /api/users (API route)

app/                    ← App Router (modern)
  layout.tsx            ← root layout (required)
  page.tsx              ← /
  about/
    page.tsx            ← /about
  api/
    users/
      route.ts          ← /api/users (Route Handler)
```

### Key differences

| Feature | Pages Router | App Router |
|---------|-------------|------------|
| Default component type | Client Component | Server Component |
| Data fetching | `getServerSideProps`, `getStaticProps` | `async/await` directly in component |
| Layouts | Custom `_app.tsx` (one global layout) | Nested layouts per route segment |
| Loading states | Manual | `loading.tsx` files (automatic Suspense) |
| Error handling | Custom `_error.tsx` | `error.tsx` files per segment |
| Streaming | Not supported | Built-in via Suspense |
| Caching | Minimal | Aggressive multi-layer caching |

### Real-world example

```
// Pages Router — data fetching requires special functions
// pages/products/[id].tsx
export async function getServerSideProps({ params }) {
    const product = await fetchProduct(params.id);
    return { props: { product } };
}

export default function ProductPage({ product }) {
    return <div>{product.name}</div>;
}

// App Router — just async/await in the component
// app/products/[id]/page.tsx
// v15: params is a Promise — must be awaited
export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params; // ← v15: must await params
    const product = await fetchProduct(id);
    return <div>{product.name}</div>;
}
```

---

## Server Components vs Client Components

This is the most important concept in modern Next.js.

### Server Components — the default

```tsx
// app/users/page.tsx — Server Component by default (no 'use client')
// Can directly query databases, call internal services, read env secrets

import { db } from '@/lib/database';

export default async function UsersPage() {
    // This runs on the server — database credentials never reach the browser
    const users = await db.query('SELECT * FROM users');

    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
}
// Zero JS sent to client for this component
// No useEffect, no loading state needed — data is ready when the HTML is rendered
```

### Client Components — opt-in

```tsx
// app/components/SearchBar.tsx
'use client'; // ← this directive makes it a Client Component

import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
    const [query, setQuery] = useState('');

    return (
        <input
            value={query}
            onChange={e => {
                setQuery(e.target.value);
                onSearch(e.target.value);
            }}
            placeholder="Search..."
        />
    );
}
// useState, event handlers — only possible in Client Components
```

### The composition model — passing Server Components into Client Components

```tsx
// ❌ WRONG — you cannot import a Server Component inside a Client Component
'use client';
import ServerComponent from './ServerComponent'; // ← breaks

// ✅ CORRECT — pass Server Components as children (props)
// app/layout.tsx (Server Component)
import ClientWrapper from './ClientWrapper';
import ServerData from './ServerData';

export default function Layout() {
    return (
        <ClientWrapper>
            <ServerData /> {/* Server Component passed as children prop */}
        </ClientWrapper>
    );
}

// app/components/ClientWrapper.tsx
'use client';
export default function ClientWrapper({ children }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setOpen(!open)}>Toggle</button>
            {open && children} {/* children is already rendered by the server */}
        </div>
    );
}
```

### Decision rule: when to use each

```
Server Component (default):
  ✓ Fetch data
  ✓ Access backend resources (DB, file system, env secrets)
  ✓ Keep sensitive logic server-side
  ✓ Large dependencies that don't need to ship to browser

Client Component ('use client'):
  ✓ useState, useEffect, useReducer, useContext
  ✓ Event listeners (onClick, onChange)
  ✓ Browser APIs (localStorage, window, geolocation)
  ✓ Custom hooks that use state or effects
  ✓ Class components
```

### `server-only` — prevent secrets from leaking to the client

```tsx
// lib/data.ts — WITHOUT server-only
// Problem: nothing stops a Client Component from importing this
export async function getAdminData() {
    const res = await fetch('https://internal-api.company.com/admin', {
        headers: { authorization: process.env.ADMIN_API_KEY }, // secret!
    });
    return res.json();
}

// lib/data.ts — WITH server-only
import 'server-only'; // ← install with: npm install server-only

export async function getAdminData() {
    const res = await fetch('https://internal-api.company.com/admin', {
        headers: { authorization: process.env.ADMIN_API_KEY },
    });
    return res.json();
}
// If a Client Component tries to import this: BUILD-TIME ERROR
// "You're importing a component that needs server-only..."

// Complementary: 'client-only' marks modules with browser-only APIs
import 'client-only'; // throws if imported in a Server Component
```

> Real-world use: mark any module that accesses `process.env` secrets, database connections, or internal services with `import 'server-only'`. It's a zero-overhead safety net that catches mistakes at build time, not production.

---

## Server Actions

Server Actions let you call server-side functions directly from Client Components — like an RPC call, without manually creating API endpoints.

```tsx
// app/actions/userActions.ts
'use server'; // ← makes every export a Server Action

import { db } from '@/lib/database';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    // Runs on the server — can access DB, send emails, etc.
    await db.insert('users', { name, email });

    // Invalidate cache so the user list refreshes
    revalidatePath('/users');
}
```

### Using Server Actions in forms (progressive enhancement)

```tsx
// Works even WITHOUT JavaScript enabled (HTML native form behavior)
export default function CreateUserForm() {
    return (
        <form action={createUser}> {/* action takes the Server Action directly */}
            <input name="name" placeholder="Name" />
            <input name="email" placeholder="Email" />
            <button type="submit">Create User</button>
        </form>
    );
}
```

### Using Server Actions from Client Components

```tsx
'use client';

import { createUser } from '@/app/actions/userActions';
import { useTransition } from 'react';

export default function CreateUserForm() {
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            await createUser(formData); // calls server function — no API route needed
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" />
            <input name="email" />
            <button disabled={isPending}>
                {isPending ? 'Creating...' : 'Create User'}
            </button>
        </form>
    );
}
```

### Real-world use cases for Server Actions

```tsx
// Inline in a Server Component (no separate file needed for simple cases)
export default function DeleteButton({ id }: { id: string }) {
    async function deletePost() {
        'use server'; // inline Server Action
        await db.delete('posts', id);
        revalidatePath('/posts');
    }

    return <form action={deletePost}><button>Delete</button></form>;
}
```

---

## File-based Routing

Every file named `page.tsx` in the `app/` directory becomes a route.

```
app/
  page.tsx              → /
  about/
    page.tsx            → /about
  blog/
    page.tsx            → /blog
    [slug]/
      page.tsx          → /blog/my-post  (dynamic segment)
    [...slug]/
      page.tsx          → /blog/a/b/c    (catch-all: matches any depth)
    [[...slug]]/
      page.tsx          → /blog          (optional catch-all: also matches /blog)
  (marketing)/          → route group: no URL segment added
    landing/
      page.tsx          → /landing       (NOT /marketing/landing)
```

### Dynamic segments

> **v15 breaking change:** `params` and `searchParams` are now **Promises** and must be `await`-ed.

```tsx
// app/products/[id]/page.tsx
// Matches: /products/42, /products/abc-123

export default async function ProductPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ color?: string }>; // URL query string: ?color=red
}) {
    const { id } = await params;           // ← must await in v15
    const { color } = await searchParams;  // ← must await in v15

    const product = await fetchProduct(id);
    const selectedColor = color ?? product.defaultColor;

    return <ProductDetail product={product} color={selectedColor} />;
}
```

### Catch-all segments

```tsx
// app/docs/[...path]/page.tsx
// Matches: /docs/intro, /docs/api/users, /docs/api/v2/endpoints

export default async function DocsPage({
    params,
}: {
    params: Promise<{ path: string[] }>; // ['api', 'v2', 'endpoints']
}) {
    const { path } = await params;
    const breadcrumb = path.join(' > '); // "api > v2 > endpoints"
    return <DocViewer path={path} />;
}
```

---

## Client-Side Navigation Hooks

These hooks come from `next/navigation` and are **only available in Client Components** (`'use client'`). They replace the Pages Router's `useRouter` from `next/router`.

| Hook | What it does |
|------|-------------|
| `useSearchParams()` | Read URL query string (`?key=value`) — **read-only** |
| `usePathname()` | Read the current URL pathname (e.g. `/products/42`) |
| `useRouter()` | Programmatic navigation: `push`, `replace`, `back`, `refresh` |
| `useParams()` | Read dynamic segment params (e.g. `{ id: '42' }`) |

### `useSearchParams` — reading and updating query params

> **Important:** `useSearchParams` reads a **read-only** snapshot of the URL search params. To update the URL, combine it with `useRouter` and `usePathname`.

```tsx
// app/components/ProductFilters.tsx
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export default function ProductFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Read current values
    const category = searchParams.get('category') ?? 'all';
    const sort = searchParams.get('sort') ?? 'newest';

    // Update a single param without losing the others
    const updateParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(key, value);
            router.push(`${pathname}?${params.toString()}`);
        },
        [searchParams, router, pathname],
    );

    return (
        <div>
            <select
                value={category}
                onChange={e => updateParam('category', e.target.value)}
            >
                <option value="all">All</option>
                <option value="shoes">Shoes</option>
                <option value="bags">Bags</option>
            </select>

            <select
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
            >
                <option value="newest">Newest</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
            </select>
        </div>
    );
}
// URL becomes: /products?category=shoes&sort=price-asc
// Other existing params are preserved — not wiped
```

### Suspense requirement

`useSearchParams` **suspends** during rendering if it's not wrapped in a `<Suspense>` boundary. Next.js will throw a build error without it.

```tsx
// app/products/page.tsx (Server Component)
import { Suspense } from 'react';
import ProductFilters from '@/components/ProductFilters';
import ProductList from '@/components/ProductList';

export default function ProductsPage() {
    return (
        <div>
            {/* ✅ Wrap the component that uses useSearchParams in Suspense */}
            <Suspense fallback={<FiltersSkeleton />}>
                <ProductFilters />
            </Suspense>
            <ProductList />
        </div>
    );
}

// ❌ Without Suspense — Next.js throws at build time:
// "useSearchParams() should be wrapped in a Suspense boundary"
```

### `usePathname` — reading the current path

```tsx
// app/components/NavLink.tsx — highlight the active nav item
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, label }: { href: string; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={isActive ? 'font-bold underline' : 'text-gray-500'}
        >
            {label}
        </Link>
    );
}
```

### `useRouter` — programmatic navigation

```tsx
// app/components/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
    const router = useRouter();

    return (
        <button onClick={() => router.back()}>← Go back</button>
    );
}

// Common router methods:
// router.push('/path')          → navigate, adds to history
// router.replace('/path')       → navigate, replaces current history entry
// router.back()                 → go back (like browser back button)
// router.refresh()              → re-fetch server data for current route (no full reload)
// router.prefetch('/path')      → preload a route on hover
```

### Server Component vs Client Component: accessing search params

```tsx
// Server Component — access searchParams as a prop (no hook needed)
// app/products/page.tsx
export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; sort?: string }>; // v15: must await
}) {
    const { category, sort } = await searchParams;
    const products = await fetchProducts({ category, sort });
    return <ProductList products={products} />;
}

// Client Component — use useSearchParams hook
// app/components/ActiveFilters.tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function ActiveFilters() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    return category ? <p>Filtering by: {category}</p> : null;
}
```

> **Rule of thumb:** prefer passing `searchParams` from a Server Component down as props. Only reach for `useSearchParams` in a Client Component when you need to *react* to URL changes (e.g., a filter UI that the user controls).

---

## Layouts, Templates, and Nested Layouts

### Layouts — preserve state, wrap child routes

```tsx
// app/layout.tsx — root layout (required, wraps every page)
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Header />     {/* rendered once, never re-mounts on navigation */}
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}

// app/dashboard/layout.tsx — nested layout for /dashboard/* routes
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard">
            <Sidebar />        {/* keeps state (e.g., open/close) across dashboard pages */}
            <div className="content">{children}</div>
        </div>
    );
}

// app/dashboard/page.tsx — rendered inside DashboardLayout inside RootLayout
export default function DashboardPage() {
    return <h1>Dashboard Home</h1>;
}
```

### Templates — reset state on every navigation

```tsx
// app/dashboard/template.tsx
// Use when you WANT state to reset between navigations
// e.g., page transition animations, analytics page views, form state that should clear

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
    return (
        <div className="fade-in"> {/* new instance = animation re-triggers */}
            {children}
        </div>
    );
}
```

### Real-world nested layout: e-commerce

```
app/
  layout.tsx            → RootLayout (Header, Footer)
  (shop)/
    layout.tsx          → ShopLayout (CategoryNav)
    products/
      layout.tsx        → ProductsLayout (Filters sidebar)
      page.tsx          → /products (list)
      [id]/
        page.tsx        → /products/42 (detail)
  (account)/
    layout.tsx          → AccountLayout (ProfileSidebar)
    orders/
      page.tsx          → /orders
    settings/
      page.tsx          → /settings
```

---

## Route Groups & Parallel Routes

### Route Groups — organize without affecting URLs

```tsx
// app/(auth)/login/page.tsx  → /login   (no "(auth)" in the URL)
// app/(auth)/register/page.tsx → /register

// Useful for: sharing layouts between a subset of routes
// app/(auth)/layout.tsx — AuthLayout only wraps login and register, NOT other routes
export default function AuthLayout({ children }) {
    return (
        <div className="auth-container">
            <Logo />
            {children}
        </div>
    );
}
```

### Parallel Routes — render multiple pages simultaneously

```tsx
// app/dashboard/layout.tsx
// @analytics and @team are "slots" — parallel routes
export default function DashboardLayout({
    children,
    analytics,  // maps to app/dashboard/@analytics/page.tsx
    team,       // maps to app/dashboard/@team/page.tsx
}: {
    children: React.ReactNode;
    analytics: React.ReactNode;
    team: React.ReactNode;
}) {
    return (
        <div className="dashboard-grid">
            <div>{children}</div>
            <div>{analytics}</div>  {/* loads independently */}
            <div>{team}</div>        {/* loads independently */}
        </div>
    );
}

// app/dashboard/@analytics/page.tsx — fetches analytics data independently
export default async function AnalyticsSlot() {
    const data = await fetchAnalytics(); // doesn't block @team from loading
    return <AnalyticsChart data={data} />;
}
```

---

## Intercepting Routes

Let you "intercept" a navigation to show different UI in context vs. via direct URL.

### Real-world example: photo modal

```
app/
  photos/
    page.tsx              → /photos (grid view)
    [id]/
      page.tsx            → /photos/42 (full page when accessed directly)
  (.)photos/              → intercepts navigation from same level
    [id]/
      page.tsx            → /photos/42 (modal overlay when navigating from grid)
```

```tsx
// app/(.)photos/[id]/page.tsx — intercepted route shows a modal
export default async function PhotoModal({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <Modal>
            <Photo id={id} />
        </Modal>
    );
}

// app/photos/[id]/page.tsx — full page when accessed directly (share link, refresh)
export default async function PhotoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const photo = await fetchPhoto(id);
    return <FullPagePhoto photo={photo} />;
}
```

**Interception conventions:**
- `(.)folder` — same level
- `(..)folder` — one level up
- `(...)folder` — from root

---

## Loading UI & Suspense Boundaries

`loading.tsx` files automatically wrap the page in a Suspense boundary.

```tsx
// app/dashboard/loading.tsx — shown while dashboard/page.tsx is loading
export default function DashboardLoading() {
    return (
        <div className="skeleton">
            <div className="skeleton-header" />
            <div className="skeleton-body" />
        </div>
    );
}

// app/dashboard/page.tsx — this async component is automatically wrapped in Suspense
export default async function DashboardPage() {
    const data = await fetchDashboardData(); // loading.tsx shown while this resolves
    return <Dashboard data={data} />;
}
```

### Manual Suspense for granular loading

```tsx
// app/dashboard/page.tsx — load sections independently
import { Suspense } from 'react';

export default function DashboardPage() {
    return (
        <div>
            <h1>Dashboard</h1>
            {/* Each section loads independently — non-blocking */}
            <Suspense fallback={<RevenueCardSkeleton />}>
                <RevenueCard />   {/* async Server Component */}
            </Suspense>
            <Suspense fallback={<UserTableSkeleton />}>
                <UserTable />     {/* async Server Component */}
            </Suspense>
        </div>
    );
}
```

---

## Error Handling

### error.tsx — catches errors in a route segment

```tsx
// app/dashboard/error.tsx
// Must be a Client Component — uses useEffect for error logging
'use client';

import { useEffect } from 'react';

export default function DashboardError({
    error,
    reset, // retry: re-renders the error boundary's children
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to error reporting service
        logErrorToSentry(error);
    }, [error]);

    return (
        <div>
            <h2>Something went wrong!</h2>
            <p>{error.message}</p>
            <button onClick={reset}>Try again</button>
        </div>
    );
}
```

### not-found.tsx — 404 pages

```tsx
// app/products/[id]/not-found.tsx — shown when notFound() is called
export default function ProductNotFound() {
    return (
        <div>
            <h2>Product Not Found</h2>
            <p>This product doesn't exist or has been removed.</p>
        </div>
    );
}

// app/products/[id]/page.tsx — trigger not-found
import { notFound } from 'next/navigation';

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product) notFound(); // renders not-found.tsx instead

    return <ProductDetail product={product} />;
}
```

### Error boundary hierarchy

```
app/
  error.tsx             ← catches errors from any route (root boundary)
  dashboard/
    error.tsx           ← catches only dashboard errors (more specific)
    settings/
      error.tsx         ← catches only settings errors (most specific)
  layout.tsx            ← errors in layout.tsx are NOT caught by sibling error.tsx
                           → use global-error.tsx for root layout errors
  global-error.tsx      ← catches errors in root layout (must have <html><body>)
```

---

## Middleware

Middleware runs before a request is processed — before the page or route handler. It executes at the **Edge Runtime** (no Node.js APIs).

```
Request → Middleware → Route Handler / Page
```

```tsx
// middleware.ts — must be at the project root (same level as app/ or pages/)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Auth check — redirect unauthenticated users
    const token = request.cookies.get('auth-token')?.value;
    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/settings');

    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname); // preserve destination
        return NextResponse.redirect(loginUrl);
    }

    // Rewrite — serve /old-path from /new-path without changing the URL
    if (pathname === '/old-path') {
        return NextResponse.rewrite(new URL('/new-path', request.url));
    }

    // Add response headers
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    return response;
}

// Matcher — which routes middleware runs on (avoid running on static assets)
export const config = {
    matcher: [
        // Match all routes except static files and Next.js internals
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|gif|webp)).*)',
    ],
};
```

### Common middleware use cases

| Use case | How |
|---|---|
| Auth redirect | Read cookie/header, redirect if missing |
| Role-based access | Decode JWT, check role, redirect or 403 |
| A/B testing | Set a cookie with variant, rewrite to variant URL |
| Locale detection | Read `Accept-Language`, redirect to `/en/` or `/fr/` |
| Rate limiting | Check request count in Edge KV store |
| Bot protection | Check user agent, return 403 |

### What middleware cannot do
- Use Node.js APIs (`fs`, `crypto`, `bcrypt`) — Edge Runtime only
- Access databases directly (no TCP connections at the edge) — use a lightweight token check instead
- Return large responses — keep it fast, delegate heavy work to route handlers

---

## `next/link` — Prefetching Behavior

`<Link>` is the primary navigation component. Understanding its prefetching behavior is a senior differentiator.

```tsx
import Link from 'next/link';

// Basic usage
<Link href="/about">About</Link>

// Disable prefetching
<Link href="/heavy-page" prefetch={false}>Heavy Page</Link>

// Programmatic navigation equivalent
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/about');         // adds history entry
router.replace('/about');      // replaces current history entry
router.prefetch('/about');     // manually trigger prefetch
```

### How prefetching works

| Router | Behavior |
|---|---|
| **App Router** | Links visible in the viewport are prefetched automatically in production. Static routes: full page prefetched. Dynamic routes: only the loading.tsx shell is prefetched (not the full data). |
| **Pages Router** | Links visible in the viewport are prefetched in production. The full page including data (`getStaticProps` result) is prefetched for static pages. |

```tsx
// Static route — full HTML prefetched when link enters viewport
<Link href="/about">About</Link>

// Dynamic route (App Router) — only loading.tsx shell is prefetched
// Data is NOT prefetched (would be stale anyway)
<Link href="/dashboard">Dashboard</Link>

// Opt out — for pages that are expensive or change per-user
<Link href="/account" prefetch={false}>My Account</Link>

// Prefetching only happens in production (next build + next start)
// In development (next dev), no prefetching occurs
```

### `router.prefetch` — manual prefetch on hover

```tsx
// Prefetch on hover before user clicks — common pattern for faster navigation
function NavLink({ href, children }: { href: string; children: ReactNode }) {
    const router = useRouter();

    return (
        <Link
            href={href}
            onMouseEnter={() => router.prefetch(href)} // fire early
        >
            {children}
        </Link>
    );
}
```

---

## Interview Answers

### What is the main difference between App Router and Pages Router?
App Router uses the `app/` directory and makes Server Components the default — components run on the server, fetch data with `async/await`, and ship zero JS to the client unless marked `'use client'`. Pages Router uses `pages/` and makes all components client-side, requiring `getServerSideProps`/`getStaticProps` for server-side data. App Router also introduces nested layouts, file-based loading/error states, and streaming.

### What is a Server Component and why does it matter?
A Server Component runs exclusively on the server. It can access databases, file systems, and environment secrets directly. It never ships its component code to the browser — reducing bundle size to zero for that component. The trade-off: no hooks, no event handlers, no browser APIs. Most of a Next.js app should be Server Components; add `'use client'` only at the leaves of the component tree where interactivity is needed.

### What is the difference between layout.tsx and template.tsx?
Both wrap child routes. The difference is lifecycle: layouts are persistent — they mount once and never re-render when you navigate between their child routes, preserving state. Templates create a new instance on every navigation, resetting all state. Use layouts for persistent UI (sidebar, nav); use templates when you need animation resets or per-page analytics tracking.

### What is a Server Action and when would you use it instead of an API route?
A Server Action is an `async` function marked with `'use server'` that runs on the server but can be called directly from a Client Component like a regular function. Use them for form submissions and mutations — they eliminate the need for manually creating API endpoints for client-initiated server operations. Under the hood, Next.js creates a POST endpoint automatically. Use a Route Handler (API route) instead when you need: a public API consumed by external clients, GET requests, fine-grained HTTP control, or webhook endpoints.

### How do parallel routes differ from nested layouts?
Nested layouts are sequential (parent wraps child). Parallel routes render multiple independent page segments simultaneously in the same layout via `@slots`. This enables: independent loading states per slot, different error boundaries per slot, conditional rendering of slots. Real use case: a dashboard that loads analytics, user activity, and revenue widgets independently — if analytics is slow, it doesn't block the other widgets.

### How do you read URL query params in a Client Component?
Use `useSearchParams()` from `next/navigation` — it returns a read-only `URLSearchParams` object. To update query params, combine it with `useRouter` and `usePathname`: build a new `URLSearchParams` from the current snapshot, call `.set()` on the new param, then call `router.push(pathname + '?' + params.toString())`. This preserves existing params instead of wiping them. Critical: any component that calls `useSearchParams` must be wrapped in a `<Suspense>` boundary — Next.js enforces this at build time.

### What is the difference between `searchParams` prop and `useSearchParams`?
`searchParams` is a prop available on Server Components (page.tsx) — it's a Promise in v15 that resolves to the URL query string object. `useSearchParams()` is a hook for Client Components that returns a live, read-only snapshot of the current URL params and re-renders the component when params change. Prefer `searchParams` prop + pass down as props when the data is needed for initial render on the server. Use `useSearchParams` when a client component needs to read or react to URL changes interactively (e.g., filter UI).

### What are intercepting routes good for?
They let a route "intercept" navigation to show contextual UI (like a modal) while keeping the original URL. Classic example: Instagram-style photo grid — clicking a photo shows it in a modal overlay, but if you share the link or refresh, you see the full photo page. The intercepted route handles in-context navigation; the real route handles direct URL access.

### What is Next.js Middleware and what runtime does it run on?
Middleware runs before any request is processed — before pages, layouts, or route handlers. It runs on the Edge Runtime, not Node.js, which means no Node.js APIs (`fs`, `crypto`, TCP connections). It's ideal for auth redirects, locale detection, A/B testing, and adding security headers — lightweight checks that apply globally without loading the full app. The `matcher` config controls which routes it applies to, and you should always exclude static assets to avoid unnecessary overhead.

### What is the difference between Middleware, Server Components, and Server Actions for auth?
Middleware handles auth at the network edge — fast redirects before the page even loads. It reads cookies/headers and redirects unauthenticated requests without running any app code. Server Components handle auth inside the page — for fine-grained, data-aware authorization (can this user see this specific resource?). Server Actions handle auth for mutations — verify the session before performing a write. In practice: use Middleware for coarse-grained route protection, Server Components for data-level checks.

### How does `next/link` prefetching work in App Router?
In production, links that are visible in the viewport are prefetched automatically. For static routes, the full HTML is prefetched. For dynamic routes, only the `loading.tsx` shell is prefetched — not the data, since it would be stale. Prefetching doesn't happen in development. You can disable it with `prefetch={false}` for expensive or highly personalized pages, or trigger it manually with `router.prefetch(href)` for hover-based prefetching.
