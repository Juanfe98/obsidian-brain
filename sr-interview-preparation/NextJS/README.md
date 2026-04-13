# Next.js — Interview Preparation

## Files in this folder

| File | Topics |
|------|--------|
| `nextjs-app-router.md` | App Router vs Pages Router, Server vs Client Components, Server Actions, file-based routing, layouts, templates, route groups, parallel routes, intercepting routes, loading UI, error handling |
| `nextjs-pages-router.md` | Pages Router deep dive — `getStaticProps`, `getServerSideProps`, `getStaticPaths` + fallback, `_app.tsx`, `_document.tsx`, `useRouter` (next/router), API routes, error pages, ISR, per-page layouts, migration to App Router |
| `nextjs-rendering-and-caching.md` | SSG vs SSR vs ISR vs dynamic rendering, the 4 caching layers (request memoization, data cache, full route cache, router cache), data fetching patterns, streaming, Route Handlers, Middleware |
| `nextjs-config-and-deployment.md` | Edge Runtime vs Node.js Runtime, next.config.js (redirects, rewrites, headers, webpack), environment variables, Metadata API & SEO, next/image & next/font, authentication (NextAuth/Auth.js), deployment (Vercel, Docker, self-hosting), testing (unit, integration, E2E) |

## Senior-level differentiators

- Server Components are the default — `'use client'` is **opt-in**, not the norm
- **v15 breaking changes:** `params`/`searchParams` are Promises now; `fetch` not cached by default; `cookies()`/`headers()` are async
- **`'use cache'` directive** — the new v15 caching model. Most candidates won't know this yet
- **PPR (Partial Pre-Rendering)** — static shell served from CDN + dynamic holes streamed in. Solves static vs dynamic tradeoff
- The 4 caching layers and when each applies — most candidates don't know all 4
- `revalidatePath` vs `revalidateTag` for on-demand ISR
- Server Actions vs Route Handlers — know when to use each
- `server-only` package — build-time guard against secret leakage
- `use()` hook — passing Promises from Server to Client Components (React 19 pattern)
- Edge Runtime constraint: no Node.js APIs — `jose` yes, `jsonwebtoken` no
- Parallel routes vs nested layouts — they solve different problems
- `NEXT_PUBLIC_` variables are baked into the bundle at build time — never put secrets there
- `next/font` self-hosts at build time — eliminates runtime Google Fonts request entirely
