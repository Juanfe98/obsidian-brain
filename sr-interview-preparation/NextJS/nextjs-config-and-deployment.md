# Next.js — Configuration, Optimization & Deployment

## Glossary

| Term | Meaning |
|------|---------|
| **Edge Runtime** | A lightweight V8-based runtime (no Node.js) — ultra-fast cold starts, runs geographically close to users, limited API surface |
| **Node.js Runtime** | Full Node.js environment — access to all Node APIs, larger cold start, runs in a single region by default |
| **next.config.js** | Main configuration file for the Next.js compiler, routing, images, headers, and more |
| **Rewrite** | Maps an incoming URL to a different destination path — user sees the original URL |
| **Redirect** | Sends the browser to a different URL with an HTTP 3xx response |
| **next/image** | Next.js Image component — automatic resizing, format optimization (WebP/AVIF), lazy loading |
| **next/font** | Next.js Font system — self-hosts Google Fonts with zero layout shift, no external requests |
| **Metadata API** | Next.js built-in way to define `<head>` content (title, description, Open Graph) — replaces `next/head` |
| **NextAuth / Auth.js** | The most common authentication library for Next.js — supports OAuth, credentials, magic links |
| **Session** | Server-side stored user context, usually via a cookie containing a session ID |
| **JWT** | Stateless token containing user claims, signed and verified without hitting the database |

---

## Edge Runtime vs Node.js Runtime

Every Next.js route (page, Route Handler, Middleware) runs in one of two runtimes.

### The mental model

```
Node.js Runtime              Edge Runtime
─────────────────────        ─────────────────────
Full Node.js APIs            Subset of Web APIs only
File system access           No file system
All npm packages             Limited npm packages
Runs in one region           Runs in 30+ edge locations
Cold start: ~100-300ms       Cold start: ~1-5ms
Memory: up to 1GB            Memory: up to 128MB
```

### Setting the runtime

```tsx
// app/api/heavy-processing/route.ts
export const runtime = 'nodejs'; // default — full Node.js

// app/api/auth/route.ts
export const runtime = 'edge'; // opt into Edge Runtime

// middleware.ts — ALWAYS runs on Edge (can't change this)
```

### When to use Edge Runtime

```tsx
// ✅ Good for Edge:
// - Authentication checks (JWT verification with jose)
// - A/B testing / feature flags
// - Geolocation-based redirects
// - Lightweight personalization
// - Reading/setting cookies and headers

// app/api/geo/route.ts
export const runtime = 'edge';

export function GET(request: Request) {
    // NextRequest has geo data on Edge
    const country = (request as any).geo?.country ?? 'US';
    return Response.json({ country });
}

// ❌ Not good for Edge:
// - Database connections (Prisma, pg, mongoose)
// - File system operations
// - Most Node.js-specific npm packages
// - Heavy computation
```

### Practical example: JWT on Edge vs Node.js

```tsx
// ✅ Edge-compatible JWT verification (uses jose, pure JS)
import { jwtVerify } from 'jose';

export const runtime = 'edge';

export async function GET(request: Request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    try {
        const { payload } = await jwtVerify(token!, secret);
        return Response.json({ userId: payload.sub });
    } catch {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

// ❌ Node.js-only JWT (jsonwebtoken uses Node crypto — breaks on Edge)
import jwt from 'jsonwebtoken'; // will throw on Edge Runtime
```

---

## next.config.js

The central configuration file for Next.js — controls build, routing, and runtime behavior.

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {

    // ── Images ──────────────────────────────────────────────────────────
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.example.com',    // allow images from this domain
                pathname: '/images/**',         // only this path pattern
            },
        ],
    },

    // ── Redirects ───────────────────────────────────────────────────────
    async redirects() {
        return [
            {
                source: '/old-blog/:slug',      // old URL pattern
                destination: '/blog/:slug',     // new URL
                permanent: true,                // 308 (permanent) vs 307 (temporary)
            },
            {
                source: '/dashboard',
                has: [{ type: 'cookie', key: 'auth-token', value: undefined }], // no cookie
                destination: '/login',
                permanent: false,
            },
        ];
    },

    // ── Rewrites ────────────────────────────────────────────────────────
    async rewrites() {
        return [
            {
                // Proxy API calls — user sees /api/data but it hits external service
                source: '/api/data/:path*',
                destination: 'https://internal-service.company.com/:path*',
            },
            {
                // White-label: serve different content based on hostname
                source: '/:path*',
                has: [{ type: 'host', value: 'partner.example.com' }],
                destination: '/partner/:path*',
            },
        ];
    },

    // ── Headers ─────────────────────────────────────────────────────────
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: 'https://myapp.com' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                ],
            },
        ];
    },

    // ── Environment ─────────────────────────────────────────────────────
    env: {
        // Statically inlined at build time — baked into the JS bundle
        // Use for non-sensitive, build-time constants
        BUILD_VERSION: process.env.BUILD_VERSION,
    },

    // ── Experimental / Misc ─────────────────────────────────────────────
    experimental: {
        serverActions: { bodySizeLimit: '2mb' }, // increase Server Action body limit
    },

    // Custom webpack config (use sparingly)
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Don't bundle server-only packages on client
            config.resolve.fallback = { fs: false, net: false };
        }
        return config;
    },
};

module.exports = nextConfig;
```

### Redirects vs Rewrites — key difference

```
Redirect: browser knows about it
  User visits /old-page
  ← 308 Redirect → /new-page
  Browser URL bar changes to /new-page
  Use: URL migrations, auth redirects

Rewrite: browser doesn't know
  User visits /api/products
  Server internally proxies to https://api.backend.com/products
  Browser URL bar still shows /api/products
  Use: API proxying, white-labeling, A/B test routing
```

---

## Environment Variables & Config

```bash
# .env.local — local development only, never committed to git
DATABASE_URL="postgresql://localhost/mydb"
JWT_SECRET="my-local-secret"

# .env.production — production defaults (can be committed if non-sensitive)
NEXT_PUBLIC_API_URL="https://api.example.com"

# .env — shared defaults for all environments
NEXT_PUBLIC_APP_NAME="MyApp"
```

### NEXT_PUBLIC prefix — the crucial rule

```tsx
// Variables WITHOUT prefix: server-only (never sent to browser)
process.env.DATABASE_URL    // ✅ only accessible in Server Components, API routes
process.env.JWT_SECRET      // ✅ secure — never shipped to client bundle

// Variables WITH NEXT_PUBLIC_ prefix: inlined into client bundle at build time
process.env.NEXT_PUBLIC_API_URL  // ✅ accessible everywhere (server + client)
// ⚠️ WARNING: NEXT_PUBLIC_ values are baked into the JS bundle and visible to everyone
//    Never put secrets, API keys, or passwords in NEXT_PUBLIC_ variables

// Accessing in code
// Server Component — can access ALL env vars
async function ServerComp() {
    const db = await connectToDatabase(process.env.DATABASE_URL); // works
}

// Client Component — can only access NEXT_PUBLIC_ vars
'use client';
function ClientComp() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL; // works
    const secret = process.env.JWT_SECRET;          // undefined at runtime (stripped)
}
```

---

## Metadata API & SEO

Replaces `next/head` — generates `<title>`, `<meta>`, Open Graph, and more from Server Components.

```tsx
// Static metadata — same for all visitors
// app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | MyCompany',
    description: 'Learn about our mission and team.',
    openGraph: {
        title: 'About Us | MyCompany',
        description: 'Learn about our mission and team.',
        images: [{ url: 'https://example.com/og-about.png' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Us | MyCompany',
    },
};

export default function AboutPage() { ... }
```

### Dynamic metadata — different per page

```tsx
// app/products/[id]/page.tsx
import type { Metadata } from 'next';

// generateMetadata runs on the server, can fetch data
export async function generateMetadata(
    { params }: { params: { id: string } }
): Promise<Metadata> {
    const product = await fetchProduct(params.id);

    return {
        title: `${product.name} | MyShop`,
        description: product.description,
        openGraph: {
            title: product.name,
            images: [{ url: product.imageUrl }],
        },
        // Canonical URL to avoid duplicate content issues
        alternates: { canonical: `/products/${params.id}` },
    };
}
```

### Title templates — avoid repeating site name

```tsx
// app/layout.tsx — root layout sets the template
export const metadata: Metadata = {
    title: {
        default: 'MyShop',           // fallback when page has no title
        template: '%s | MyShop',     // %s replaced by page's title
    },
};

// app/products/page.tsx
export const metadata: Metadata = {
    title: 'Products',               // renders as "Products | MyShop"
};
```

---

## next/image & next/font Optimizations

### next/image

```tsx
import Image from 'next/image';

// Basic usage — always provide width and height to prevent layout shift
<Image
    src="/hero.jpg"
    alt="Hero banner"
    width={1200}
    height={600}
    priority           // load immediately (don't lazy-load above-the-fold images)
/>

// Fill mode — image fills its container (use for responsive hero images)
<div style={{ position: 'relative', height: '400px' }}>
    <Image
        src="/banner.jpg"
        alt="Banner"
        fill
        style={{ objectFit: 'cover' }}
        sizes="100vw"
    />
</div>

// Remote images — must be whitelisted in next.config.js
<Image
    src="https://cdn.example.com/product.jpg"
    alt="Product"
    width={400}
    height={400}
    // Next.js automatically: resizes, converts to WebP/AVIF, lazy-loads, serves from CDN
/>
```

**What next/image does automatically:**
- Converts to WebP or AVIF (smaller file size, same quality)
- Resizes to device's actual display size (no serving 4K images to mobile)
- Lazy loads by default (below-the-fold images load as they enter the viewport)
- Prevents layout shift by reserving space with the width/height

### next/font

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

// Font is downloaded at BUILD TIME and self-hosted — no Google request at runtime
// Zero layout shift — font is loaded before the page renders
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter', // CSS variable for use in Tailwind or CSS modules
});

const mono = Roboto_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${mono.variable}`}>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}

// Local fonts
import localFont from 'next/font/local';

const brandFont = localFont({
    src: './fonts/BrandFont.woff2',
    variable: '--font-brand',
});
```

**Why this matters for interviews:** Self-hosted fonts eliminate the Google Fonts request entirely — no DNS lookup, no connection, no GDPR concern. Zero layout shift because the font is guaranteed available when CSS is parsed.

---

## Authentication Patterns (NextAuth / Auth.js)

### The full flow with NextAuth v5 (Auth.js)

```tsx
// auth.ts — central auth config
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // OAuth provider
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID!,
            clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
        // Username/password
        Credentials({
            async authorize(credentials) {
                const user = await db.findUser(credentials.email as string);
                if (!user) return null;
                const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
                return valid ? user : null;
            },
        }),
    ],
    callbacks: {
        // Add custom data to the session
        async session({ session, token }) {
            session.user.id = token.sub!;
            session.user.role = token.role as string;
            return session;
        },
        async jwt({ token, user }) {
            if (user) token.role = (user as any).role; // persist role in JWT
            return token;
        },
    },
});

// app/api/auth/[...nextauth]/route.ts — expose auth endpoints
export const { GET, POST } = handlers;
```

### Protecting routes in Middleware (most efficient)

```tsx
// middleware.ts — check auth before rendering any page
import { auth } from '@/auth';

export default auth((request) => {
    const isAuthenticated = !!request.auth;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login');

    if (!isAuthenticated && !isAuthPage) {
        return Response.redirect(new URL('/login', request.url));
    }
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Accessing session in Server Components

```tsx
// app/dashboard/page.tsx — Server Component
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth(); // reads session server-side

    if (!session) redirect('/login');

    return <div>Welcome, {session.user.name}</div>;
}
```

### JWT vs Session strategy

```
JWT Strategy (default):
  + Stateless — no database lookup per request
  + Works well on Edge Runtime
  - Token revocation requires workarounds (blocklist)
  - User role changes don't propagate until token expires

Database Session Strategy:
  + Instant revocation — delete the session row
  + Always reflects current user state
  - Database lookup on every request
  - Doesn't work on Edge Runtime without edge-compatible DB
```

---

## Deployment Strategies

### Vercel (simplest, most integrated)

```bash
# Zero-config deployment — Vercel auto-detects Next.js
git push origin main  # → automatic deployment

# Each feature branch gets a Preview URL automatically
# Rollbacks are instant — just select a previous deployment
```

```
Vercel handles:
  ✓ Static assets → CDN (all regions)
  ✓ Server Components → Serverless Functions (auto-scaled)
  ✓ Middleware → Edge Functions (30+ regions)
  ✓ ISR → Incremental Cache (managed globally)
  ✓ Image optimization → Vercel Image CDN
```

### Self-hosting with Node.js

```dockerfile
# Dockerfile — production-optimized multi-stage build
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image — only what's needed to run
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only the standalone build output (much smaller image)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```js
// next.config.js — required for Docker standalone output
const nextConfig = {
    output: 'standalone', // bundles only necessary files — ~50MB instead of 500MB
};
```

### Self-hosting trade-offs vs Vercel

```
Self-hosting:
  ✓ Full control, no vendor lock-in
  ✓ Lower cost at high scale
  ✗ Manual ISR cache management
  ✗ No built-in image optimization CDN (need to set up separately)
  ✗ Must manage scaling, load balancing, health checks yourself
  ✗ Middleware runs as Node.js (not true Edge) unless you use a CDN layer

Vercel:
  ✓ Zero config, instant deployments, preview URLs
  ✓ Native Next.js support (same team)
  ✓ True Edge Middleware in 30+ regions
  ✗ Can get expensive at high traffic
  ✗ Vendor lock-in for advanced features
```

---

## Testing in Next.js

### Unit testing Server Components

```tsx
// __tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '@/app/components/ProductCard';

// Server Components are just async functions — test them like async functions
describe('ProductCard', () => {
    it('renders product name and price', async () => {
        const product = { id: '1', name: 'Widget', price: 9.99 };

        // Render the async Server Component
        const component = await ProductCard({ product });
        render(component);

        expect(screen.getByText('Widget')).toBeInTheDocument();
        expect(screen.getByText('$9.99')).toBeInTheDocument();
    });
});
```

### Mocking next/navigation in Client Components

```tsx
// This is the most common Next.js testing pain point
// useRouter, usePathname, useSearchParams all come from 'next/navigation'

// __tests__/SearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import SearchBar from '@/app/components/SearchBar';

// Mock the entire next/navigation module
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
    useSearchParams: jest.fn(() => new URLSearchParams()),
}));

describe('SearchBar', () => {
    it('navigates on search submit', () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (usePathname as jest.Mock).mockReturnValue('/products');

        render(<SearchBar />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'shoes' } });
        fireEvent.submit(screen.getByRole('form'));

        expect(mockPush).toHaveBeenCalledWith('/products?q=shoes');
    });
});
```

### Integration testing with Route Handlers

```tsx
// __tests__/api/users.test.ts
import { GET, POST } from '@/app/api/users/route';
import { NextRequest } from 'next/server';

// Mock the database
jest.mock('@/lib/database', () => ({
    db: {
        findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'Alice' }]),
        insert: jest.fn().mockResolvedValue({ id: '2', name: 'Bob' }),
    },
}));

describe('GET /api/users', () => {
    it('returns list of users', async () => {
        const request = new NextRequest('http://localhost/api/users');
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual([{ id: '1', name: 'Alice' }]);
    });
});

describe('POST /api/users', () => {
    it('creates a user and returns 201', async () => {
        const request = new NextRequest('http://localhost/api/users', {
            method: 'POST',
            body: JSON.stringify({ name: 'Bob', email: 'bob@example.com' }),
            headers: { 'Content-Type': 'application/json' },
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
    });
});
```

### E2E testing with Playwright

```tsx
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in and see dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // After login, should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login'); // middleware redirects
});
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    webServer: {
        command: 'npm run build && npm run start', // test against production build
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
    use: { baseURL: 'http://localhost:3000' },
});
```

---

## Interview Answers

### What is the difference between Edge Runtime and Node.js Runtime?
Edge Runtime is a lightweight V8 isolate (no Node.js APIs) that runs at CDN edge locations worldwide. It has near-zero cold start (~1ms) and is great for low-latency, lightweight operations like auth checks, redirects, and cookie manipulation. Node.js Runtime is the full Node.js environment — access to all APIs, npm packages, database drivers, file system. Cold start is ~100-300ms, runs in one region. Middleware always runs on Edge. Route Handlers and pages default to Node.js, but you can opt into Edge per-route with `export const runtime = 'edge'`.

### What does next.config.js let you control?
It controls the build process (webpack customization, output mode), routing (redirects with HTTP codes, rewrites that proxy without changing the URL, custom headers), image optimization (allowed remote domains), environment variables inlined at build time, and experimental features. The key distinction between redirects and rewrites: redirects change the browser URL (user sees the new path), rewrites are invisible (the browser URL stays the same but a different route or service handles the request).

### What is the NEXT_PUBLIC_ prefix and why does it matter?
Next.js strips all environment variables from the client bundle at build time — server secrets never ship to the browser. The `NEXT_PUBLIC_` prefix is how you explicitly opt a variable into the client bundle. These values are statically inlined during the build — they can't change at runtime. Critically, `NEXT_PUBLIC_` variables are visible to anyone who inspects your JavaScript bundle, so never put secrets, API keys, or credentials in them.

### How would you test a Server Action?
Server Actions are `async` functions — test them by importing and calling them directly. Mock their dependencies (database calls, external APIs). Test that they call `revalidatePath`/`revalidateTag` when appropriate. For testing the form that calls the action, use React Testing Library for the Client Component side and mock the Server Action itself as a jest mock. For end-to-end tests, use Playwright to submit the actual form and verify the result.

### How do you mock next/navigation in tests?
`useRouter`, `usePathname`, and `useSearchParams` from `next/navigation` are not available in the test environment. Mock the entire module with `jest.mock('next/navigation', () => ({ useRouter: jest.fn(), usePathname: jest.fn(), ... }))`. Then in each test, use `(useRouter as jest.Mock).mockReturnValue({ push: mockFn })` to control what the mock returns. This is the standard approach — the alternative (testing with a real Next.js server) is reserved for E2E tests.
