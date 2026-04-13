# Next.js — Rendering, Data Fetching & Caching

> **Version note:** This document reflects **Next.js v15+** behavior.
> Critical v15 change: `fetch` is **no longer cached by default**. The old `cache: 'force-cache'` default was removed. Use the `'use cache'` directive to opt into caching explicitly.

## Glossary

| Term | Meaning |
|------|---------|
| **SSG** | Static Site Generation — HTML built at build time, served from CDN |
| **SSR** | Server-Side Rendering — HTML generated on the server per request |
| **ISR** | Incremental Static Regeneration — static pages re-generated on a schedule or on demand |
| **Dynamic rendering** | Route rendered at request time — triggered by dynamic APIs like `cookies()`, `headers()`, or `searchParams` |
| **PPR** | Partial Pre-Rendering — static shell served instantly from CDN + dynamic holes streamed in at request time, within a single route |
| **`'use cache'`** | New v15 directive that opts a function/component/file into persistent caching — replaces the old `fetch` cache options |
| **`dynamicIO`** | Experimental Next.js config flag that enforces explicit caching — all data fetching is uncached by default, `'use cache'` required to cache |
| **Request memoization** | Deduplicates identical `fetch` calls within a single request/render — automatic, no config needed |
| **Data Cache** | Persistent server-side cache — in v15 requires explicit `'use cache'` opt-in |
| **Full Route Cache** | Caches the complete rendered HTML + RSC payload of static routes on the server/CDN |
| **Router Cache** | Client-side in-memory cache of RSC payloads for previously visited routes |
| **RSC Payload** | Binary representation of the Server Component tree sent to the browser |
| **revalidation** | Purging and regenerating a cache entry — time-based or on-demand |
| **Streaming** | Sending HTML to the browser progressively as parts become ready |
| **Route Handler** | API endpoint in App Router — defined in `route.ts` files |

---

## Rendering Strategies

### The four modes — when each applies

```tsx
// 1. STATIC — default when no dynamic APIs are used
// HTML generated at build time, served from CDN
// app/about/page.tsx
export default async function AboutPage() {
    const content = await fetchAboutContent(); // fetched at build time
    return <div>{content.text}</div>;
}
// → Next.js detects no dynamic APIs → renders statically at build time

// 2. DYNAMIC — when dynamic APIs are used
// HTML generated per request
// app/profile/page.tsx
import { cookies } from 'next/headers';

export default async function ProfilePage() {
    const cookieStore = await cookies(); // ← v15: cookies() is async, must await
    const token = cookieStore.get('auth-token');
    const user = await fetchUser(token?.value);
    return <div>Hello, {user.name}</div>;
}
// → cookies() used → Next.js renders this at request time

// 3. FORCED STATIC — always render at build time regardless of dynamic APIs
export const dynamic = 'force-static';

// 4. FORCED DYNAMIC — always render at request time
export const dynamic = 'force-dynamic';
```

> **v15 note:** `headers()`, `cookies()`, `draftMode()` are now **async** and must be awaited.

### ISR — revalidate static pages

```tsx
// Route-level time-based ISR
// app/blog/page.tsx
export const revalidate = 60; // re-generate every 60 seconds

export default async function BlogPage() {
    const posts = await fetchPosts();
    return <PostList posts={posts} />;
}

// On-demand ISR — trigger revalidation from a webhook or Server Action
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updatePost(postId: string) {
    'use server';
    await db.updatePost(postId);
    revalidatePath('/blog');           // revalidate the blog page
    revalidateTag('posts');            // revalidate all cache entries tagged 'posts'
}
```

### Choosing the right strategy

```
Content changes rarely (docs, marketing)?         → Static (SSG)
Content changes on a schedule (blog, catalog)?    → ISR with revalidate
Content is user-specific (profile, dashboard)?    → Dynamic (SSR)
Content is real-time (chat, live scores)?         → Dynamic + streaming/websockets
Static shell + dynamic personalization?           → PPR (see below)
```

---

## Partial Pre-Rendering (PPR)

PPR is Next.js's answer to the age-old tradeoff: static is fast but stale, dynamic is fresh but slow.
PPR lets **both** coexist within the same route.

### How it works

```
Without PPR: Choose static OR dynamic for the whole route
             Static → fast, but no personalization
             Dynamic → personalized, but slower (no CDN edge caching)

With PPR: Static shell + dynamic holes in a single route
          Shell → pre-rendered at build time → served from CDN instantly
          Holes → wrapped in Suspense → streamed in at request time
```

```tsx
// next.config.js — enable PPR (experimental in v14/v15, incremental mode in v15)
const nextConfig = {
    experimental: {
        ppr: 'incremental', // 'incremental' = opt in per route; true = all routes
    },
};

// app/product/[id]/page.tsx — opt this route into PPR
export const experimental_ppr = true;

import { Suspense } from 'react';

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await getProduct(id); // static data — pre-rendered at build time

    return (
        <div>
            {/* Static shell — served from CDN instantly */}
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <img src={product.imageUrl} />

            {/* Dynamic hole — streamed in at request time */}
            <Suspense fallback={<p>Loading recommendations...</p>}>
                <Recommendations productId={id} />  {/* reads cookies for personalization */}
            </Suspense>

            {/* Dynamic hole — streamed in at request time */}
            <Suspense fallback={<p>Loading cart...</p>}>
                <CartButton productId={id} />  {/* reads user session */}
            </Suspense>
        </div>
    );
}
```

### PPR vs Streaming vs ISR

| | Static/ISR | Streaming | PPR |
|--|-----------|-----------|-----|
| Static shell from CDN? | ✅ whole page | ❌ server-rendered | ✅ shell only |
| Dynamic/personalized content? | ❌ | ✅ | ✅ |
| Single route? | ✅ | ✅ | ✅ |
| Suspense required? | ❌ | ✅ | ✅ for dynamic parts |

> **Real-world example:** E-commerce product page. The product title, images, and description are the same for everyone (static shell). The "Add to Cart" button and "Recommended for you" section depend on the user (dynamic holes). With PPR, the product info is served from CDN in milliseconds and the personalized parts stream in.

---

## The 4 Caching Layers

These layers work in sequence — a hit at an earlier layer skips later ones.

```
Request
  │
  ▼
1. Request Memoization     ← deduplicates fetch() within a single render — automatic
  │
  ▼
2. Data Cache              ← persists results across requests — v15: OPT-IN required
  │
  ▼
3. Full Route Cache        ← caches entire rendered HTML + RSC payload (static routes)
  │
  ▼
4. Router Cache            ← client in-memory cache of visited routes (browser)
```

### Layer 1: Request Memoization

Deduplicates identical `fetch` calls during a single server render. Automatic — no config needed.

```tsx
// UserProfile.tsx and UserAvatar.tsx both call the same endpoint
// Without memoization: 2 HTTP requests
// With memoization: 1 HTTP request (Next.js deduplicates automatically)

async function UserProfile({ id }: { id: string }) {
    const user = await fetch(`/api/users/${id}`).then(r => r.json());
    return <div>{user.name}</div>;
}

async function UserAvatar({ id }: { id: string }) {
    const user = await fetch(`/api/users/${id}`).then(r => r.json()); // same URL
    return <img src={user.avatar} />;
}
// Result: ONE fetch to /api/users/${id} — both components receive the same data
// Scope: per-request only — cleared after the response is sent
```

### Layer 2: Data Cache

> ⚠️ **v15 breaking change:** `fetch` is **no longer cached by default**.
> In v14, `fetch` used `force-cache` by default. In v15, it defaults to `no-store`.
> Use the `'use cache'` directive (new) or `next: { revalidate }` to opt into caching.

```tsx
// v15: fetch is NOT cached — behaves like a plain fetch every time
const data = await fetch('https://api.example.com/products');
// → no cache, fresh on every request

// Opt INTO caching with 'use cache' directive
async function getProducts() {
    'use cache'; // ← this function's result will be cached
    const data = await fetch('https://api.example.com/products');
    return data.json();
}

// Opt INTO caching with fetch option (still works in v15)
const data = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // cache for 1 hour
});

// Tag for on-demand invalidation
const data = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }
});
// Later: revalidateTag('posts') purges this entry
```

### Layer 3: Full Route Cache

Caches the complete rendered HTML + RSC payload of statically rendered routes. Only applies when the route has no dynamic APIs.

```
Build time:
  /about    → rendered → stored in Full Route Cache → served from CDN

Runtime:
  GET /about → Full Route Cache hit → HTML served instantly, no server work
```

```tsx
// Force out of Full Route Cache — always render fresh
export const dynamic = 'force-dynamic';

// Any dynamic API also opts out automatically:
import { headers } from 'next/headers';
const headersList = await headers(); // this alone makes the route dynamic → no Full Route Cache
```

### Layer 4: Router Cache

Client-side in-memory cache. Stores RSC payloads of routes the user has visited. Makes back/forward navigation instant.

```
User visits /dashboard → RSC payload stored in Router Cache
User navigates to /settings → fresh fetch
User presses Back → /dashboard served from Router Cache (instant, no server round-trip)

Duration:
  Static routes:  5 minutes
  Dynamic routes: 30 seconds
```

```tsx
// Invalidate Router Cache programmatically
import { useRouter } from 'next/navigation';

function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await logout();
        router.refresh(); // clears Router Cache for current route and re-fetches
    }

    return <button onClick={handleLogout}>Logout</button>;
}
```

---

## The `'use cache'` Directive (v15+)

The new explicit caching model. Add it to a file, component, or function to cache its output.

```tsx
// 1. File-level: cache ALL exports in this file
'use cache';

export async function getProducts() {
    return db.query('SELECT * FROM products');
}

export async function getCategories() {
    return db.query('SELECT * FROM categories');
}
// Both functions are cached

// 2. Function-level: cache only this function
export async function getProduct(id: string) {
    'use cache'; // ← inline, only this function is cached
    return db.findById('products', id);
}

// 3. Component-level: cache the component's rendered output
export async function ProductList() {
    'use cache';
    const products = await db.query('SELECT * FROM products');
    return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### `cacheLife` — control cache duration

```tsx
import { unstable_cacheLife as cacheLife } from 'next/cache';

export async function getNews() {
    'use cache';
    cacheLife('hours'); // built-in profiles: 'seconds', 'minutes', 'hours', 'days', 'weeks', 'max'

    return fetchNews();
}

// Custom duration
export async function getProduct(id: string) {
    'use cache';
    cacheLife({
        stale: 300,   // serve stale for 5 minutes
        revalidate: 3600, // revalidate every hour
        expire: 86400,    // expire after 1 day
    });
    return fetchProduct(id);
}
```

### `cacheTag` — tag for on-demand invalidation

```tsx
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { revalidateTag } from 'next/cache';

export async function getUserProfile(userId: string) {
    'use cache';
    cacheTag(`user-${userId}`, 'users'); // tag with specific and group tags
    return fetchUser(userId);
}

// When user updates their profile:
export async function updateUser(userId: string, data: UserData) {
    'use server';
    await db.updateUser(userId, data);
    revalidateTag(`user-${userId}`); // invalidates only this user's cache
}
```

### `dynamicIO` — enforce explicit caching (experimental)

```js
// next.config.js — opt into strict mode where ALL I/O must be explicitly cached
const nextConfig = {
    experimental: {
        dynamicIO: true,
    },
};
// With dynamicIO: any uncached data fetch causes a build error
// Forces developers to be deliberate about what is cached vs fresh
```

---

## Data Fetching Patterns

### Fetch in Server Components — parallel pattern

```tsx
// app/products/page.tsx
export default async function ProductsPage() {
    // ❌ Sequential — waits for categories before fetching products
    const categories = await fetchCategories();
    const products = await fetchProductsByCategory(categories[0].id); // unnecessary wait

    // ✅ Parallel — kick off independent requests simultaneously
    const [categories, featuredProducts] = await Promise.all([
        fetchCategories(),
        fetchFeaturedProducts(), // these don't depend on each other
    ]);

    return (
        <>
            <CategoryNav categories={categories} />
            <FeaturedGrid products={featuredProducts} />
        </>
    );
}
```

### Colocate data fetching with the component that needs it

```tsx
// app/dashboard/page.tsx — no data fetching here
export default function DashboardPage() {
    return (
        <div>
            <RevenueCard />   {/* fetches its own data */}
            <UserStats />     {/* fetches its own data */}
            <RecentOrders />  {/* fetches its own data */}
        </div>
    );
}

// app/dashboard/RevenueCard.tsx — Server Component, owns its data
async function RevenueCard() {
    const revenue = await fetchRevenue();
    return <Card title="Revenue" value={revenue.total} />;
}
```

### Passing promises to Client Components — the `use()` hook pattern

React 19 / Next.js allows passing an unawaited promise from a Server Component to a Client Component, which unwraps it with the `use()` hook. This enables streaming without moving data fetching to the client.

```tsx
// app/blog/page.tsx — Server Component
import Posts from '@/app/ui/posts';
import { Suspense } from 'react';

export default function Page() {
    const posts = getPosts(); // ← do NOT await — pass the promise directly
    return (
        <Suspense fallback={<div>Loading posts...</div>}>
            <Posts posts={posts} />
        </Suspense>
    );
}

// app/ui/posts.tsx — Client Component
'use client';
import { use } from 'react'; // React 19

export default function Posts({
    posts,
}: {
    posts: Promise<{ id: string; title: string }[]>;
}) {
    const allPosts = use(posts); // ← unwraps the promise, suspends until resolved

    return (
        <ul>
            {allPosts.map(post => (
                <li key={post.id}>{post.title}</li>
            ))}
        </ul>
    );
}
// Benefits: data fetching stays on the server, client gets interactivity
// Suspense handles the loading state
```

---

## Streaming & Partial Rendering

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
    return (
        <div>
            {/* Rendered immediately — no data dependency */}
            <h1>Dashboard</h1>

            {/* Streams in when ready — doesn't block the header */}
            <Suspense fallback={<RevenueCardSkeleton />}>
                <RevenueCard />
            </Suspense>

            {/* Streams in independently — slow query doesn't block revenue card */}
            <Suspense fallback={<TableSkeleton />}>
                <RecentTransactions />
            </Suspense>
        </div>
    );
}
```

### generateStaticParams — pre-render dynamic routes at build time

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
    const posts = await fetch('https://api.example.com/posts').then(r => r.json());
    return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>; // ← v15: params is a Promise
}) {
    const { slug } = await params; // ← must await
    const post = await getPost(slug);
    return <article><h1>{post.title}</h1></article>;
}
// Pre-generated slugs → served from Full Route Cache (instant)
// Unknown slugs → rendered on first request, then cached
```

---

## Route Handlers (API Routes in App Router)

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') ?? '1';
    const users = await fetchUsers({ page: parseInt(page) });
    return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    if (!body.email || !body.name) {
        return NextResponse.json(
            { error: 'Name and email are required' },
            { status: 400 }
        );
    }
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
}
```

### Dynamic Route Handlers — v15 params are a Promise

```tsx
// app/api/users/[id]/route.ts
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ← v15: Promise
) {
    const { id } = await params; // ← must await
    const user = await fetchUser(id);
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(user);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await deleteUser(id);
    return new NextResponse(null, { status: 204 });
}
```

### Route Handler vs Server Action

```
Route Handler:
  ✓ Public API consumed by external clients (mobile apps, third parties)
  ✓ Webhook endpoints (Stripe, GitHub)
  ✓ GET requests that return data
  ✓ When you need fine-grained HTTP control (headers, status codes)

Server Action:
  ✓ Form submissions from your own frontend
  ✓ Mutations triggered by your own Client Components
  ✓ Type-safe RPC calls without API boilerplate
```

---

## Middleware

```tsx
// middleware.ts — runs before every matched request
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token');
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/dashboard') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const variant = request.cookies.get('variant')?.value ?? (Math.random() > 0.5 ? 'a' : 'b');
    const response = NextResponse.next();
    response.cookies.set('variant', variant);
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Interview Answers

### What is the difference between SSG, SSR, and ISR in Next.js?
SSG generates HTML at build time — fastest, served from CDN, stale until rebuilt. SSR generates HTML per request — always fresh but more server load. ISR is a hybrid: generates static HTML at build time but re-generates in the background after a configurable interval or on-demand via `revalidatePath`/`revalidateTag`. In App Router, you don't choose explicitly — Next.js infers: no dynamic APIs = static; dynamic APIs (cookies, headers) = dynamic. `revalidate` exports add ISR behavior.

### What is Partial Pre-Rendering (PPR)?
PPR combines static and dynamic rendering within a single route. The "static shell" — parts of the page that don't depend on request-time data — is pre-rendered at build time and served from CDN instantly. The "dynamic holes" — parts that need personalization or request-time data — are wrapped in `<Suspense>` boundaries and streamed in at request time. It solves the "static OR dynamic" tradeoff: you get CDN speed for the shell and freshness for the dynamic parts. Enabled with `experimental: { ppr: 'incremental' }` in `next.config.js` and `export const experimental_ppr = true` per route.

### What changed about fetch caching in Next.js v15?
Big breaking change: `fetch` is no longer cached by default. In v14, fetch used `force-cache` by default — results were cached indefinitely. In v15, fetch behaves like a standard HTTP fetch — no caching unless you opt in. To cache in v15: use the `'use cache'` directive on a function or component, or use `next: { revalidate: N }` on individual fetch calls. This makes caching explicit and opt-in rather than the default.

### What is the `'use cache'` directive?
A new Next.js v15 directive for explicit caching. Add it at the top of a file, component, or function. When used on a function, Next.js caches its return value across requests. Pair it with `cacheLife()` to control duration and `cacheTag()` to enable on-demand invalidation via `revalidateTag()`. It replaces the old `fetch` cache options as the primary caching mechanism and works with both fetch-based and non-fetch data sources (like ORM queries).

### Explain the 4 caching layers in Next.js App Router.
1. **Request Memoization** — deduplicates identical `fetch` calls within a single render. Automatic. Per-request scope.
2. **Data Cache** — persistent server-side cache across requests. In v15, opt-in via `'use cache'` directive or `next: { revalidate }`.
3. **Full Route Cache** — caches the complete HTML + RSC payload of statically rendered routes on the server/CDN. Cleared on revalidation or re-deploy.
4. **Router Cache** — client-side in-memory cache of RSC payloads for visited routes. Makes back/forward navigation instant. Static routes: 5 min, dynamic: 30 sec.

### What is streaming and why does it matter?
Streaming sends HTML to the browser in chunks as each piece becomes ready. Without it, the slowest data fetch blocks the entire page render. With streaming + `<Suspense>`, the static parts of the page render immediately while slow data fetches stream in asynchronously. This dramatically improves Time to First Byte and perceived performance. PPR takes this further: the static shell is pre-rendered at build time (true CDN serving), not just rendered fast at request time.

### What is the purpose of Middleware in Next.js?
Middleware runs on the Edge before every matched request — before caching, before routing. Use for: auth checks/redirects, A/B testing, geolocation redirects, rate limiting headers. Key constraint: Edge Runtime only — no Node.js APIs. Keep it lean and fast since it runs on every request.
