# Senior Engineer Interview — Preparation Checklist

Last updated: 2026-03-19

Use this as your master tracker. Review each topic, mark it when you feel confident, and use the linked file to study.

**Legend:** ✅ Documented | ❌ Not yet documented

---

## Java Core

| Concept | Status | File |
|---------|--------|------|
| OOP (Encapsulation, Inheritance, Polymorphism, Abstraction) | ✅ | `Java/oop-principles.md` |
| Abstract classes vs Interfaces | ✅ | `Java/abstract-classes-vs-interfaces.md` |
| Method overloading | ✅ | `Java/method-overloading.md` |
| Method overriding | ✅ | `Java/oop-principles.md` |
| `final` keyword | ✅ | `Java/final-keyword.md` |
| `static` vs instance | ✅ | `Java/static-vs-instance-methods.md` |
| `this` vs `super` | ✅ | `Java/this-vs-super.md` |
| Generics (bounded, wildcards, PECS, type erasure) | ✅ | `Java/generics.md` |
| Lambdas, streams, functional programming | ✅ | `Java/lambdas-streams-functional.md` |
| Optional | ✅ | `Java/optional.md` |
| Exception handling | ✅ | `Java/exception-handling.md` |
| String / StringBuilder / StringBuffer | ✅ | `Java/string-stringbuilder-stringbuffer.md` |
| Equals & hashCode contract | ✅ | `Java/equals-hashcode.md` |
| Comparable vs Comparator | ✅ | `Java/comparable-vs-comparator.md` |
| Deep vs shallow copy | ✅ | `Java/deep-copy-vs-shallow-copy.md` |
| Java memory model (Stack, Heap, GC) | ✅ | `Java/java-memory-model.md` |
| Collections (List, Set, Map, Queue) | ✅ | `Java/collections.md` |
| HashMap internals | ✅ | `Java/hashmap-internals.md` |
| Immutability as a concept | ✅ | `Java/immutability.md` |
| Java Records | ❌ | — |
| Sealed classes | ❌ | — |

---

## Concurrency

| Concept | Status | File |
|---------|--------|------|
| Thread lifecycle (6 states) | ✅ | `Java/thread-lifecycle.md` |
| Race conditions & deadlocks | ✅ | `Java/concurrency-advanced.md` |
| `synchronized`, `volatile` | ✅ | `Java/concurrency-advanced.md` |
| `ReentrantLock` | ✅ | `Java/concurrency-advanced.md` |
| Atomic classes | ✅ | `Java/concurrency-advanced.md` |
| ExecutorService & thread pools | ✅ | `Java/concurrency-advanced.md` |
| Callable vs Runnable | ✅ | `Java/concurrency-advanced.md` |
| CompletableFuture | ✅ | `Java/concurrency-advanced.md` |
| ConcurrentHashMap / BlockingQueue | ✅ | `Java/concurrency-advanced.md` |
| Happens-before relationship | ❌ | — |
| Fork/Join framework | ❌ | — |

---

## Design Patterns

| Concept | Status | File |
|---------|--------|------|
| Singleton | ✅ | `Java/design-patterns.md` |
| Builder | ✅ | `Java/design-patterns.md` |
| Strategy | ✅ | `Java/design-patterns.md` |
| Factory Method | ✅ | `Java/factory-method.md` |
| Observer | ❌ | — |
| Decorator | ❌ | — |
| Adapter | ❌ | — |
| Facade | ❌ | — |
| Template Method | ❌ | — |
| Proxy | ❌ | — |
| Command | ❌ | — |
| Chain of Responsibility | ❌ | — |

---

## SOLID & Clean Code

| Concept | Status | File |
|---------|--------|------|
| SOLID (5 principles) | ✅ | `Java/solid-principles.md` |
| DRY, KISS, YAGNI | ❌ | — |
| Clean code principles (naming, functions, comments) | ❌ | — |

---

## Software Architecture

| Concept | Status | File |
|---------|--------|------|
| 10 architectural styles (monolithic, microservices, hexagonal, CQRS, etc.) | ✅ | `Software-architecture/Software Architecture vs Architectural Styles.md` |
| Domain-Driven Design (DDD) | ❌ | — |
| Event sourcing | ❌ | — |
| REST API design best practices | ❌ | — |
| Microservices patterns (Saga, anti-corruption layer) | ❌ | — |

---

## Spring Boot

| Concept                                    | Status | File                                   |
| ------------------------------------------ | ------ | -------------------------------------- |
| Core annotations & layers                  | ✅      | `Java/spring-boot.md`                  |
| Dependency injection (3 types)             | ✅      | `Java/spring-boot.md`                  |
| Bean lifecycle                             | ✅      | `Java/spring-boot.md`                  |
| Spring Data JPA                            | ✅      | `Java/spring-boot.md`                  |
| Spring Security                            | ✅      | `Java/security.md`                     |
| `@Transactional`                           | ✅      | `Database/transactions-and-locking.md` |
| Spring Boot testing                        | ✅      | `Java/testing.md`                      |
| Spring AOP                                 | ❌      | —                                      |
| Spring Profiles & configuration management | ❌      | —                                      |
| Spring Actuator                            | ❌      | —                                      |
| Spring WebFlux / Reactive                  | ❌      | —                                      |

---

## Testing

| Concept | Status | File |
|---------|--------|------|
| JUnit 5 + AAA pattern | ✅ | `Java/testing.md` |
| Mockito (mocking, stubbing, verify) | ✅ | `Java/testing.md` |
| Integration testing | ✅ | `Java/testing.md` |
| `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest` | ✅ | `Java/testing.md` |
| Test coverage | ✅ | `Java/testing.md` |
| TDD (Test-Driven Development) | ❌ | — |
| Test pyramid | ❌ | — |
| Contract testing (Pact) | ❌ | — |
| React Testing Library | ❌ | — |

---

## System Design

| Concept | Status | File |
|---------|--------|------|
| Scalability (vertical vs horizontal) | ✅ | `System-Design/scalability-and-load-balancing.md` |
| Load balancing (algorithms, L4 vs L7) | ✅ | `System-Design/scalability-and-load-balancing.md` |
| Stateless design | ✅ | `System-Design/scalability-and-load-balancing.md` |
| CDN | ✅ | `System-Design/scalability-and-load-balancing.md` |
| Caching (Redis, strategies, eviction) | ✅ | `System-Design/caching.md` |
| CAP theorem & consistency models | ✅ | `System-Design/cap-theorem.md` |
| Message queues (Kafka, RabbitMQ) | ✅ | `System-Design/message-queues.md` |
| Resilience patterns (circuit breaker, retry, bulkhead) | ✅ | `System-Design/resilience-patterns.md` |
| Rate limiting | ✅ | `System-Design/resilience-patterns.md` |
| Database sharding & partitioning | ❌ | — |
| Consistent hashing | ❌ | — |
| API Gateway pattern | ❌ | — |
| Service discovery | ❌ | — |
| Distributed tracing | ❌ | — |

---

## Database

| Concept | Status | File |
|---------|--------|------|
| SQL optimization & EXPLAIN | ✅ | `Database/sql-and-indexes.md` |
| Index types (B-tree, composite, covering) | ✅ | `Database/sql-and-indexes.md` |
| Database normalization (1NF–3NF) | ✅ | `Database/sql-and-indexes.md` |
| ACID properties | ✅ | `Database/transactions-and-locking.md` |
| Isolation levels & anomalies | ✅ | `Database/transactions-and-locking.md` |
| Optimistic vs pessimistic locking | ✅ | `Database/transactions-and-locking.md` |
| JPA N+1 problem & solutions | ✅ | `Database/jpa-best-practices.md` |
| LAZY vs EAGER fetching | ✅ | `Database/jpa-best-practices.md` |
| NoSQL vs SQL trade-offs | ❌ | — |
| Database sharding | ❌ | — |
| Connection pooling | ❌ | — |

---

## Security

| Concept | Status | File |
|---------|--------|------|
| Authentication vs Authorization | ✅ | `Java/security.md` |
| JWT structure & validation flow | ✅ | `Java/security.md` |
| OAuth 2.0 / OpenID Connect | ✅ | `Java/security.md` |
| Spring Security config | ✅ | `Java/security.md` |
| BCrypt password hashing | ✅ | `Java/security.md` |
| SQL injection, XSS, CSRF | ✅ | `Java/security.md` |
| HTTPS / TLS | ✅ | `Java/security.md` |
| CORS | ❌ | — |

---

## React

| Concept                                         | Status | File                                    |
| ----------------------------------------------- | ------ | --------------------------------------- |
| Virtual DOM, reconciliation, Fiber              | ✅      | `React/react-core-rendering.md`         |
| Hooks (useState, useEffect, useRef, useReducer) | ✅      | `React/react-core-rendering.md`         |
| useMemo, useCallback, React.memo                | ✅      | `React/react-performance-patterns.md`   |
| useTransition, useDeferredValue                 | ✅      | `React/react-performance-patterns.md`   |
| Context API + performance pitfalls              | ✅      | `React/react-performance-patterns.md`   |
| Custom hooks                                    | ✅      | `React/react-performance-patterns.md`   |
| Error boundaries                                | ✅      | `React/react-performance-patterns.md`   |
| Suspense & lazy loading / code splitting        | ✅      | `React/react-performance-patterns.md`   |
| Portals                                         | ✅      | `React/react-performance-patterns.md`   |
| TypeScript integration                          | ✅      | `React/react-typescript-integration.md` |
| State management (Redux / Zustand)              | ❌      | —                                       |
| React Router                                    | ❌      | —                                       |
| React Testing Library                           | ❌      | —                                       |
| Server Components (React 19)                    | ❌      | —                                       |

---

## TypeScript

| Concept                                           | Status | File                                         |
| ------------------------------------------------- | ------ | -------------------------------------------- |
| Structural typing                                 | ✅      | `TypeScript/typescript-type-system.md`       |
| `any` vs `unknown` vs `never`                     | ✅      | `TypeScript/typescript-type-system.md`       |
| Union, intersection, discriminated unions         | ✅      | `TypeScript/typescript-type-system.md`       |
| Type narrowing (all mechanisms)                   | ✅      | `TypeScript/typescript-type-system.md`       |
| `type` vs `interface`                             | ✅      | `TypeScript/typescript-type-system.md`       |
| Enums vs string literal unions                    | ✅      | `TypeScript/typescript-type-system.md`       |
| `satisfies` operator                              | ✅      | `TypeScript/typescript-type-system.md`       |
| Generics with constraints                         | ✅      | `TypeScript/typescript-advanced-generics.md` |
| Utility types (Partial, Pick, Omit, Record, etc.) | ✅      | `TypeScript/typescript-advanced-generics.md` |
| Mapped types                                      | ✅      | `TypeScript/typescript-advanced-generics.md` |
| Conditional types + `infer`                       | ✅      | `TypeScript/typescript-advanced-generics.md` |
| Template literal types                            | ✅      | `TypeScript/typescript-advanced-generics.md` |
| `keyof`, `typeof`, index access                   | ✅      | `TypeScript/typescript-advanced-generics.md` |
| Declaration merging & module augmentation         | ✅      | `TypeScript/typescript-advanced-generics.md` |
| `tsconfig` strict flags                           | ✅      | `TypeScript/typescript-advanced-generics.md` |

---

## GraphQL

| Concept | Status | File |
|---------|--------|------|
| GraphQL vs REST | ✅ | `GraphQL/graphql-core-schema.md` |
| SDL (all type kinds, non-null rules) | ✅ | `GraphQL/graphql-core-schema.md` |
| Queries, mutations, subscriptions | ✅ | `GraphQL/graphql-core-schema.md` |
| Resolver chain (4 arguments) | ✅ | `GraphQL/graphql-core-schema.md` |
| Context & auth pattern | ✅ | `GraphQL/graphql-core-schema.md` |
| N+1 problem + DataLoader | ✅ | `GraphQL/graphql-core-schema.md` |
| Fragments & directives | ✅ | `GraphQL/graphql-core-schema.md` |
| Apollo Client architecture & link chain | ✅ | `GraphQL/graphql-client-apollo.md` |
| Normalized cache | ✅ | `GraphQL/graphql-client-apollo.md` |
| Fetch policies | ✅ | `GraphQL/graphql-client-apollo.md` |
| useQuery, useMutation, optimistic UI | ✅ | `GraphQL/graphql-client-apollo.md` |
| Cursor-based pagination | ✅ | `GraphQL/graphql-client-apollo.md` |
| Schema federation / stitching | ❌ | — |

---

## Next.js

| Concept                                                                          | Status | File |
| -------------------------------------------------------------------------------- | ------ | ---- |
| App Router vs Pages Router                                                       | ✅      | `NextJS/nextjs-app-router.md`              |
| Server Components vs Client Components                                           | ✅      | `NextJS/nextjs-app-router.md`              |
| Server Actions                                                                   | ✅      | `NextJS/nextjs-app-router.md`              |
| SSG vs SSR vs ISR vs dynamic rendering                                           | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| File-based routing (dynamic, catch-all, optional)                                | ✅      | `NextJS/nextjs-app-router.md`              |
| Layouts, templates, and nested layouts                                           | ✅      | `NextJS/nextjs-app-router.md`              |
| Route Groups & parallel routes                                                   | ✅      | `NextJS/nextjs-app-router.md`              |
| Intercepting routes                                                              | ✅      | `NextJS/nextjs-app-router.md`              |
| Loading UI & Suspense boundaries                                                 | ✅      | `NextJS/nextjs-app-router.md`              |
| Error handling (`error.tsx`, `not-found.tsx`)                                    | ✅      | `NextJS/nextjs-app-router.md`              |
| Caching layers (request memoization, data cache, full route cache, router cache) | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| Data fetching patterns (fetch options, revalidation)                             | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| Route Handlers (API routes in App Router)                                        | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| Middleware                                                                       | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| Metadata API & SEO                                                               | ✅      | `NextJS/nextjs-config-and-deployment.md`   |
| `next/image` & `next/font` optimizations                                         | ✅      | `NextJS/nextjs-config-and-deployment.md`   |
| Authentication patterns (NextAuth / Auth.js)                                     | ✅      | `NextJS/nextjs-config-and-deployment.md`   |
| Environment variables & config                                                   | ✅      | `NextJS/nextjs-config-and-deployment.md`   |
| Streaming & partial rendering                                                    | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| Deployment strategies (Vercel, self-hosting, Docker)                             | ✅      | `NextJS/nextjs-config-and-deployment.md`   |
| Edge Runtime vs Node.js runtime                                                  | ✅      | `NextJS/nextjs-config-and-deployment.md`   |
| `next.config.js` (rewrites, redirects, headers, custom webpack)                 | ✅      | `NextJS/nextjs-config-and-deployment.md`   |
| Testing in Next.js (Server Components, mocking `next/navigation`, e2e)          | ✅      | `NextJS/nextjs-config-and-deployment.md`   |
| Partial Pre-Rendering (PPR) — static shell + dynamic holes                      | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| `'use cache'` directive & `cacheLife` / `cacheTag` (v15+)                       | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| `server-only` package — prevent secrets leaking to client                       | ✅      | `NextJS/nextjs-app-router.md`              |
| `use()` hook — pass Promise from Server to Client Component                     | ✅      | `NextJS/nextjs-rendering-and-caching.md`   |
| `params` / `searchParams` as Promises (v15 breaking change)                     | ✅      | `NextJS/nextjs-app-router.md`              |

---

## Behavioral & Leadership

| Concept | Status | File |
|---------|--------|------|
| STAR method | ❌ | — |
| Technical decision-making examples | ❌ | — |
| Handling technical debt | ❌ | — |
| Code review practices | ❌ | — |
| Mentoring junior developers | ❌ | — |

---

## DevOps Awareness

| Concept | Status | File |
|---------|--------|------|
| Docker fundamentals | ❌ | — |
| Kubernetes basics | ❌ | — |
| CI/CD pipeline concepts | ❌ | — |
| Git branching strategies | ❌ | — |

---

## Algorithms & Data Structures *(situational — depends on company)*

| Concept | Status | File |
|---------|--------|------|
| Big O notation | ❌ | — |
| Arrays, strings, two pointers | ❌ | — |
| Trees & graphs (BFS/DFS) | ❌ | — |
| Dynamic programming | ❌ | — |
| Sorting algorithms | ❌ | — |

---

## Gap Summary

### High Priority
- Design patterns: Observer, Decorator, Adapter, Facade, Template Method, Proxy, Command, Chain of Responsibility
- REST API design best practices
- DRY / KISS / YAGNI + Clean Code principles
- State management (Redux / Zustand)
- TDD + Test pyramid
- NoSQL vs SQL trade-offs
- Database sharding + Connection pooling
- CORS

### Medium Priority
- DDD basics + Event sourcing
- Spring AOP + Spring Profiles + Spring WebFlux
- API Gateway + Service discovery + Distributed tracing
- React Testing Library + React Router
- Behavioral / STAR method
- Java Records + Sealed classes + Immutability

### Lower Priority / Situational
- Docker + Kubernetes + CI/CD
- Consistent hashing
- Schema federation
- Fork/Join + Happens-before
- Algorithms & Data Structures (FAANG-adjacent companies)

### Next.js (all topics pending)
- App Router, Server/Client Components, Server Actions
- Rendering strategies (SSG, SSR, ISR, dynamic)
- Caching layers, data fetching, streaming
- Routing (layouts, parallel, intercepting)
- Middleware, Route Handlers, Auth patterns
- Optimizations (image, font, metadata/SEO)
