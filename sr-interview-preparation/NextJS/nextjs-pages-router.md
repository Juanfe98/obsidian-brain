# Next.js — Pages Router

> **Context:** Pages Router is the original Next.js routing system (`pages/` directory). Still widely used in production. Many companies haven't migrated to App Router yet — knowing this deeply is essential for senior interviews.

## Glossary

| Term | Meaning |
|------|---------|
| **`getServerSideProps`** | Runs on the server on every request — fetches data and passes it as props to the page |
| **`getStaticProps`** | Runs at build time — fetches data and generates a static HTML page |
| **`getStaticPaths`** | Required with `getStaticProps` for dynamic routes — tells Next.js which paths to pre-render |
| **`getInitialProps`** | Legacy data fetching method — runs on server (first load) and client (navigation). Discouraged |
| **`_app.tsx`** | Global wrapper for every page — persists layout, global styles, state across navigations |
| **`_document.tsx`** | Customizes the HTML shell (`<html>`, `<head>`, `<body>`) — runs server-side only |
| **`_error.tsx`** | Custom error page for 4xx/5xx errors |
| **`pages/api/`** | API routes — each file becomes a serverless API endpoint |
| **`useRouter`** | Hook from `next/router` — access route params, pathname, query, navigation methods |
| **Fallback** | `getStaticPaths` option — controls behavior for paths not pre-rendered at build time |
| **ISR** | Incremental Static Regeneration — `getStaticProps` + `revalidate` to refresh static pages |

---

## File-based Routing

```
pages/
  index.tsx              → /
  about.tsx              → /about
  blog/
    index.tsx            → /blog
    [slug].tsx           → /blog/:slug       (dynamic)
    [...slug].tsx        → /blog/a/b/c       (catch-all)
    [[...slug]].tsx      → /blog  OR  /blog/a/b/c  (optional catch-all)
  api/
    users.ts             → /api/users
    users/
      [id].ts            → /api/users/:id
  _app.tsx               → global wrapper (not a route)
  _document.tsx          → HTML shell (not a route)
  _error.tsx             → error page (not a route)
  404.tsx                → custom 404
  500.tsx                → custom 500
```

### Dynamic route variants

```tsx
// pages/blog/[slug].tsx  →  /blog/hello-world
// params: { slug: 'hello-world' }

// pages/blog/[...slug].tsx  →  /blog/2024/01/hello
// params: { slug: ['2024', '01', 'hello'] }
// Does NOT match /blog (requires at least one segment)

// pages/blog/[[...slug]].tsx  →  /blog  OR  /blog/2024/01/hello
// params: {}  OR  { slug: ['2024', '01', 'hello'] }
// Matches with zero or more segments
```

---

## Data Fetching Methods

### `getStaticProps` — build-time data fetching (SSG)

Runs at build time on the server. The page is pre-rendered to static HTML and served from CDN.

```tsx
// pages/blog/index.tsx
import type { GetStaticProps, InferGetStaticPropsType } from 'next';

type Post = { id: number; title: string; slug: string };

export const getStaticProps: GetStaticProps<{ posts: Post[] }> = async () => {
    const res = await fetch('https://api.example.com/posts');
    const posts: Post[] = await res.json();

    return {
        props: { posts },
        revalidate: 60, // ISR: re-generate this page at most every 60 seconds
    };
};

export default function BlogIndex({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <ul>
            {posts.map(post => <li key={post.id}>{post.title}</li>)}
        </ul>
    );
}
```

**Return options:**
```tsx
// Success — render with props
return { props: { data }, revalidate: 60 }

// Not found — render 404 page
return { notFound: true }

// Redirect
return { redirect: { destination: '/login', permanent: false } }
```

---

### `getStaticPaths` — pre-render dynamic routes

Required when a dynamic route uses `getStaticProps`. Tells Next.js which paths to build at compile time.

```tsx
// pages/blog/[slug].tsx
import type { GetStaticPaths, GetStaticProps } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
    const res = await fetch('https://api.example.com/posts');
    const posts = await res.json();

    return {
        paths: posts.map((post: { slug: string }) => ({
            params: { slug: post.slug },
        })),
        fallback: false, // any path not in `paths` → 404
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const res = await fetch(`https://api.example.com/posts/${params!.slug}`);
    const post = await res.json();

    return { props: { post }, revalidate: 300 };
};
```

### `fallback` options — critical to know

| Value | Behavior |
|-------|----------|
| `false` | Paths not in `paths` return 404 immediately |
| `true` | Paths not in `paths` serve a fallback version instantly (must handle `router.isFallback`), then the real page is generated and cached |
| `'blocking'` | Paths not in `paths` wait for SSR on first request, then cache the result (no fallback state needed) |

```tsx
// fallback: true — must handle loading state
export default function Post({ post }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>; // shown while page generates
    }

    return <article>{post.title}</article>;
}
```

**When to use each:**
- `false` — small, known set of paths (documentation, fixed catalog)
- `'blocking'` — large or unknown set of paths, no loading flicker acceptable
- `true` — large set of paths, instant response more important than no loading state

---

### `getServerSideProps` — per-request server rendering (SSR)

Runs on the server on every request. Page is never cached as static HTML.

```tsx
// pages/profile.tsx
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res, params, query, resolvedUrl } = context;

    // Access cookies, headers — common for auth
    const token = req.cookies['auth-token'];
    if (!token) {
        return {
            redirect: { destination: '/login', permanent: false },
        };
    }

    const user = await fetchUser(token);
    if (!user) return { notFound: true };

    return { props: { user } };
};

export default function ProfilePage({ user }) {
    return <h1>Hello, {user.name}</h1>;
}
```

**`getServerSideProps` context:**
```tsx
context.params        // dynamic route params: { id: '123' }
context.query         // query string: { tab: 'settings' }
context.req           // IncomingMessage (Node.js HTTP request)
context.res           // ServerResponse (Node.js HTTP response)
context.resolvedUrl   // the actual URL string
context.locale        // active locale (if i18n configured)
```

---

### `getInitialProps` — legacy, avoid

Runs on the server for the initial page load and on the client for client-side navigations.
**Problem:** it runs on the client too, so it can't safely access server-only resources. Also prevents automatic static optimization.

```tsx
// Avoid — shown for recognition only
Page.getInitialProps = async (ctx) => {
    const res = await fetch('/api/data');
    return { data: await res.json() };
};
```

**Why it's discouraged:**
- Runs on both server and client — can't use server-only resources safely
- Disables automatic static optimization for the entire page
- Replaced by `getServerSideProps` / `getStaticProps`

---

## `_app.tsx` — Global Wrapper

Wraps every page. Persists across navigations (unlike pages, which unmount/remount).

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Layout from '@/components/Layout';
import '@/styles/globals.css'; // global CSS must be imported here

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </SessionProvider>
    );
}
```

**What `_app.tsx` is for:**
- Global CSS imports (only place you can import global CSS in Pages Router)
- Persistent layout wrapping all pages
- Global state providers (context, Redux, Zustand)
- Authentication providers
- Page transition animations

**What it is NOT for:**
- Customizing `<html>` or `<body>` tags — use `_document.tsx`
- Per-page layouts — use the layout pattern below

### Per-page layouts pattern

```tsx
// types/next.d.ts
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

// pages/_app.tsx
export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? ((page) => page);
    return getLayout(<Component {...pageProps} />);
}

// pages/dashboard.tsx — uses a specific layout
DashboardPage.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};
export default function DashboardPage() {
    return <h1>Dashboard</h1>;
}
```

---

## `_document.tsx` — HTML Shell

Customizes the `<html>`, `<head>`, and `<body>` tags. Runs **server-side only** — never on the client.

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Static meta tags, fonts, preconnect links */}
                {/* Do NOT put dynamic data here — this is rendered once */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
            </Head>
            <body className="antialiased">
                <Main />       {/* required — renders the page */}
                <NextScript /> {/* required — injects Next.js scripts */}
            </body>
        </Html>
    );
}
```

**Rules:**
- Never import CSS here
- Never use React hooks — this runs server-side only
- `<Main />` and `<NextScript />` are required
- For dynamic `<head>` content (title, meta per page) use `next/head` inside page components

---

## `useRouter` — Navigation & Params

```tsx
import { useRouter } from 'next/router'; // Pages Router — next/router (NOT next/navigation)

export default function BlogPost() {
    const router = useRouter();

    // Route info
    router.pathname    // '/blog/[slug]'
    router.query       // { slug: 'hello-world', tab: 'comments' }
    router.asPath      // '/blog/hello-world?tab=comments'
    router.locale      // 'en'
    router.isFallback  // true while fallback page is generating

    // Programmatic navigation
    router.push('/dashboard');
    router.push({ pathname: '/blog/[slug]', query: { slug: 'hello' } });
    router.replace('/login');         // no history entry
    router.back();
    router.reload();

    // Route events
    useEffect(() => {
        const handleStart = (url: string) => console.log(`Navigating to ${url}`);
        router.events.on('routeChangeStart', handleStart);
        return () => router.events.off('routeChangeStart', handleStart);
    }, [router.events]);

    return <p>Post: {router.query.slug}</p>;
}
```

**Pages Router vs App Router navigation:**

| | Pages Router | App Router |
|---|---|---|
| Import | `next/router` | `next/navigation` |
| Hook | `useRouter()` | `useRouter()`, `useParams()`, `usePathname()`, `useSearchParams()` |
| Params | `router.query` | `useParams()` |
| Query string | `router.query` | `useSearchParams()` |

---

## API Routes (`pages/api/`)

Every file in `pages/api/` becomes a serverless API endpoint.

```tsx
// pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

type User = { id: string; name: string };
type ErrorResponse = { message: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<User | ErrorResponse>
) {
    const { id } = req.query; // dynamic param

    if (req.method === 'GET') {
        const user = await db.findUser(id as string);
        if (!user) return res.status(404).json({ message: 'Not found' });
        return res.status(200).json(user);
    }

    if (req.method === 'DELETE') {
        await db.deleteUser(id as string);
        return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
```

**API route config:**
```tsx
// Increase body size limit or disable body parsing (e.g. for file upload)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb',
        },
        // bodyParser: false,  // disable entirely for raw streams
    },
};
```

**Middleware alternative:** For auth checks across many routes, use `middleware.ts` at the root (works for both Pages and App Router).

---

## Error Pages

```tsx
// pages/404.tsx — static 404, always pre-rendered
export default function Custom404() {
    return <h1>Page Not Found</h1>;
}

// pages/500.tsx — static 500
export default function Custom500() {
    return <h1>Server Error</h1>;
}

// pages/_error.tsx — dynamic error page (handles all other errors)
// Receives statusCode prop
import type { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode: number }) {
    return (
        <p>
            {statusCode
                ? `Server error ${statusCode}`
                : 'Client-side error'}
        </p>
    );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
```

---

## Client-side Data Fetching

`getStaticProps` / `getServerSideProps` handle server-side data. For client-side data (user-specific, real-time), use SWR or React Query.

```tsx
// pages/dashboard.tsx
// getStaticProps for initial shell, SWR for live data
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Dashboard() {
    const { data, error, isLoading, mutate } = useSWR('/api/user', fetcher, {
        refreshInterval: 30000, // re-fetch every 30s
        revalidateOnFocus: true, // re-fetch when tab regains focus
    });

    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage />;

    return (
        <div>
            <h1>Hello, {data.name}</h1>
            <button onClick={() => mutate()}>Refresh</button>
        </div>
    );
}
```

---

## Pages Router → App Router Migration

Key mental model shifts:

| Pages Router | App Router equivalent |
|---|---|
| `getServerSideProps` | `async` Server Component with `cookies()`/`headers()` |
| `getStaticProps` | `async` Server Component (no dynamic APIs = static) |
| `getStaticProps` + `revalidate` | Server Component + `revalidate` export or `'use cache'` |
| `getStaticPaths` | `generateStaticParams()` |
| `_app.tsx` | Root `layout.tsx` |
| `_document.tsx` | Root `layout.tsx` (with `<html lang>` etc.) |
| `pages/api/` | `app/api/route.ts` (Route Handlers) |
| `useRouter` (next/router) | `useRouter` + `useParams` + `usePathname` (next/navigation) |
| `_error.tsx` | `error.tsx` per segment |
| `404.tsx` | `not-found.tsx` |

**Migration strategy:** Both routers can coexist. Migrate route by route. `app/` takes precedence over `pages/` for the same path.

---

## Interview Answers

### What is the difference between `getStaticProps` and `getServerSideProps`?
`getStaticProps` runs at build time — the page is rendered once and served as static HTML from CDN. Fast and cheap but data can be stale until the next build (or ISR revalidation). `getServerSideProps` runs on every request — always fresh data but requires a server and adds latency. Use `getStaticProps` for content that doesn't change per user; use `getServerSideProps` when data is request-specific (auth, personalization).

### What is `getStaticPaths` and what does `fallback` do?
`getStaticPaths` is required when a dynamic route uses `getStaticProps`. It returns the list of paths to pre-render at build time. `fallback: false` means any unlisted path returns 404. `fallback: true` serves a loading state immediately and generates the page in the background, then caches it. `fallback: 'blocking'` waits for the page to generate on first request (like SSR), then caches the result — no loading state needed.

### What is the difference between `_app.tsx` and `_document.tsx`?
`_app.tsx` wraps every page component — use it for global CSS, persistent layouts, and context providers. It runs on both server and client. `_document.tsx` customizes the HTML shell (`<html>`, `<head>`, `<body>`) — it runs server-side only and is rendered once. Never use hooks or import CSS in `_document.tsx`.

### Why is `getInitialProps` discouraged?
It runs on both the server (initial load) and the client (client-side navigation), which means you can't safely use server-only resources. It also disables automatic static optimization for the page. `getServerSideProps` and `getStaticProps` replaced it with clearer, safer semantics.

### How does ISR work in Pages Router?
Add `revalidate: N` to the `getStaticProps` return value. After N seconds, the next request triggers a background regeneration of the page. The user gets the stale page immediately; subsequent users get the fresh one. For on-demand ISR, call `res.revalidate('/path')` from an API route (a webhook, for example).

### How do you handle per-page layouts in Pages Router?
The pattern is to attach a `getLayout` function as a static property on the page component. `_app.tsx` checks for `Component.getLayout` and calls it if present, otherwise renders the page directly. This allows each page to opt into a different layout without wrapping everything in `_app.tsx`.

### What is the difference between `useRouter` in Pages Router vs App Router?
Pages Router: `import { useRouter } from 'next/router'` — one hook gives you params, query, pathname, and navigation methods all in one. App Router: `import { useRouter } from 'next/navigation'` — concerns are split across `useRouter()` (navigation), `useParams()` (route params), `usePathname()` (current path), and `useSearchParams()` (query string). App Router hooks also require `'use client'`.
