# Graph Report - /Users/juanfelipe.montana/Documents/obsidian-notes/globant  (2026-04-10)

## Corpus Check
- 53 files · ~74,553 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 286 nodes · 284 edges · 39 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Immutable Object` - 11 edges
2. `GraphQL Schema` - 9 edges
3. `Next.js App Router` - 9 edges
4. `Architectural Styles` - 9 edges
5. `Caching Overview` - 9 edges
6. `TypeScript Type System Fundamentals` - 8 edges
7. `Apollo Client` - 8 edges
8. `Senior Engineer Interview Preparation Checklist` - 7 edges
9. `Transactions & Locking` - 7 edges
10. `TypeScript Generics, Utility Types & Advanced Types` - 7 edges

## Surprising Connections (you probably didn't know these)
- `GraphQL Union and Interface Types` --semantically_similar_to--> `Interface`  [INFERRED] [semantically similar]
  GraphQL/graphql-core-schema.md → Java/abstract-classes-vs-interfaces.md
- `Apollo Normalized Cache` --semantically_similar_to--> `Caching Overview`  [INFERRED] [semantically similar]
  GraphQL/graphql-client-apollo.md → System-Design/caching.md
- `Apollo Fetch Policy` --semantically_similar_to--> `Cache-Aside Pattern`  [INFERRED] [semantically similar]
  GraphQL/graphql-client-apollo.md → System-Design/caching.md
- `Next.js Four Caching Layers` --semantically_similar_to--> `Caching Overview`  [INFERRED] [semantically similar]
  NextJS/nextjs-rendering-and-caching.md → System-Design/caching.md
- `CDN (Content Delivery Network)` --semantically_similar_to--> `Next.js Four Caching Layers`  [INFERRED] [semantically similar]
  System-Design/scalability-and-load-balancing.md → NextJS/nextjs-rendering-and-caching.md

## Hyperedges (group relationships)
- **JPA N+1 Solution Pattern** — concept_n_plus_1, concept_lazy_eager, concept_spring_data_jpa [EXTRACTED 0.95]
- **TypeScript Type Safety: Generics + Utility + Conditional + Mapped Types** — concept_ts_generics, concept_utility_types, concept_mapped_types, concept_conditional_types [INFERRED 0.85]
- **Java OOP Four Pillars** — concept_encapsulation, concept_inheritance, concept_polymorphism, concept_abstraction [EXTRACTED 1.00]
- **Thread Safety: volatile + AtomicInteger + synchronized form a complementary toolset for safe concurrent state** — concurrency_advanced_volatile, concurrency_advanced_atomicinteger, concurrency_advanced_reentrantlock [EXTRACTED 0.90]
- **SOLID Principles + Strategy Pattern + Dependency Injection form a cohesive design philosophy** — solid_ocp, design_patterns_strategy, solid_dip [EXTRACTED 0.95]
- **GraphQL Context + JWT + Spring Security together implement request-level authentication in GraphQL APIs** — graphql_schema_context, security_jwt, security_spring_security [INFERRED 0.80]
- **Next.js PPR Rendering Model (Static Shell + Suspense + Streaming)** — nextjs_rendering_ppr, react_perf_suspense, nextjs_rendering_streaming [EXTRACTED 0.95]
- **Combined Resilience Pattern Stack (Rate Limiter → Bulkhead → Circuit Breaker → Retry → Timeout)** — sysdesign_resilience_rate_limiter, sysdesign_resilience_bulkhead, sysdesign_resilience_circuit_breaker, sysdesign_resilience_retry, sysdesign_resilience_timeout [EXTRACTED 0.95]
- **Apollo Cache Mutation Strategies (Optimistic UI + refetchQueries + Cache Update)** — graphql_apollo_optimistic_ui, graphql_apollo_normalized_cache, graphql_apollo_use_mutation [EXTRACTED 0.90]

## Communities

### Community 0 - "Java Immutability & Object Design"
Cohesion: 0.1
Nodes (22): clone() Method, Copy Constructor, Deep Copy, Shallow Copy, Builder Pattern, Lombok @Builder, Constants (static final), final Class (+14 more)

### Community 1 - "Next.js App Router & Components"
Cohesion: 0.1
Nodes (22): Next.js App Router, Next.js Client Components, Next.js Error Handling (error.tsx), Intercepting Routes, Nested Layouts, Next.js Pages Router, Parallel Routes, Server Actions (+14 more)

### Community 2 - "GraphQL Schema & Types"
Cohesion: 0.12
Nodes (19): GraphQL Context, GraphQL Directive, GraphQL Fragment, GraphQL Mutation, GraphQL Query, GraphQL Resolver, GraphQL Schema, Schema Definition Language (SDL) (+11 more)

### Community 3 - "Cross-Domain Core Concepts"
Cohesion: 0.11
Nodes (18): Abstraction, Spring Bean Lifecycle, B-tree Index, Composite Index & Leftmost Prefix Rule, Covering Index, Encapsulation, SQL EXPLAIN / Query Execution Plan, Inheritance (+10 more)

### Community 4 - "Java Abstract Classes & Interfaces"
Cohesion: 0.12
Nodes (18): Abstract Class, Default Method (Java 8+), Interface, Multiple Interface Implementation, Comparator Chaining, Comparable Interface, Comparator Interface, Natural Ordering (+10 more)

### Community 5 - "Next.js Rendering & Caching"
Cohesion: 0.12
Nodes (18): Partial Pre-Rendering (PPR), Static Site Generation (SSG), Next.js Streaming, React Fiber, useReducer Hook, Virtual DOM & Reconciliation, Context Performance Pitfall, React.lazy & Code Splitting (+10 more)

### Community 6 - "ACID Transactions & Functional Java"
Cohesion: 0.15
Nodes (17): ACID Properties, Database Deadlock, Java Functional Interfaces, Database Isolation Levels, Java Lambda Expressions, LAZY vs EAGER Fetching, Lazy Evaluation in Streams, JPA N+1 Problem (+9 more)

### Community 7 - "System Design: Caching Strategies"
Cohesion: 0.13
Nodes (17): Cache-Aside Pattern, Cache Eviction Policies (LRU/LFU/TTL), Cache Stampede / Thundering Herd, Caching Overview, Redis, Write-Behind Cache, Write-Through Cache, ACID Properties (+9 more)

### Community 8 - "Software Architecture Patterns"
Cohesion: 0.13
Nodes (16): Architectural Styles, Clean Architecture, CQRS (Command Query Responsibility Segregation), Event-Driven Architecture, Hexagonal Architecture (Ports & Adapters), Layered Architecture, Microservices Architecture, Monolithic Architecture (+8 more)

### Community 9 - "Java Concurrency Fundamentals"
Cohesion: 0.14
Nodes (14): BlockingQueue, Callable, CompletableFuture, ExecutorService, Future, Thread Pool, Bucket (HashMap), Hash Collision (+6 more)

### Community 10 - "TypeScript Advanced Types"
Cohesion: 0.2
Nodes (11): TypeScript any vs unknown vs never, Checked vs Unchecked Exceptions, Discriminated Unions, TypeScript satisfies Operator, Structural Typing, try-with-resources, TypeScript Type Narrowing, type vs interface in TypeScript (+3 more)

### Community 11 - "TypeScript Generics & Declaration Merging"
Cohesion: 0.22
Nodes (11): TypeScript Conditional Types & infer, Declaration Merging & Module Augmentation, Java Generics Wildcards, TypeScript Mapped Types, PECS Rule (Producer Extends Consumer Super), TypeScript Template Literal Types, TypeScript Generics with Constraints, Java Type Erasure (+3 more)

### Community 12 - "Apollo Client & GraphQL Queries"
Cohesion: 0.18
Nodes (11): Apollo Client, Apollo Link Chain, Cursor-based Pagination with fetchMore, Apollo Fetch Policy, Apollo Normalized Cache, Optimistic UI, Reactive Variables (Apollo Local State), Apollo TypeScript Code Generation (+3 more)

### Community 13 - "Java Testing (JUnit5 & Mockito)"
Cohesion: 0.22
Nodes (9): AAA Pattern (Arrange-Act-Assert), @DataJpaTest, Integration Test, JUnit 5, @Mock vs @Spy, Mockito, @SpringBootTest, Unit Test (+1 more)

### Community 14 - "Concurrency: Singleton & Volatile"
Cohesion: 0.29
Nodes (8): volatile Keyword, Double-Checked Locking, Enum Singleton (Bill Pugh), Singleton Pattern, Factory Method Pattern, Private Constructor, Singleton via Factory Method, Single Responsibility Principle (SRP)

### Community 15 - "System Design: Resilience Patterns"
Cohesion: 0.29
Nodes (8): Bulkhead Pattern, Circuit Breaker Pattern, Exponential Backoff with Jitter, Fallback / Graceful Degradation, Rate Limiter Pattern, Resilience4j Library, Retry Pattern, Timeout Pattern

### Community 16 - "Thread Lifecycle & Locks"
Cohesion: 0.29
Nodes (6): AtomicInteger, ReentrantLock, Deadlock, Race Condition, Runnable vs Extending Thread, Thread States (NEW/RUNNABLE/BLOCKED/WAITING/TIMED_WAITING/TERMINATED)

### Community 17 - "HashMap & Collections Internals"
Cohesion: 0.4
Nodes (4): equals() and hashCode() Contract, HashMap Internals, Java Collections Framework (List, Set, Map, Queue), Java Collections

### Community 18 - "React Hooks & Effects"
Cohesion: 0.4
Nodes (5): React Hooks Rules, Stale Closure Bug, useEffect Hook, useState Hook, Custom Hooks Pattern

### Community 19 - "JVM Memory: Stack, Heap & GC"
Cohesion: 0.5
Nodes (4): Garbage Collection, Java Pass-by-Value Semantics, JVM Stack vs Heap Memory, Java Memory Model (Stack, Heap, GC)

### Community 20 - "Java Inheritance: this vs super"
Cohesion: 0.5
Nodes (4): Constructor Chaining, Inheritance (this vs super context), super Keyword, this Keyword

### Community 21 - "Web Security (XSS, CSRF, SQLi)"
Cohesion: 0.67
Nodes (3): CSRF (Cross-Site Request Forgery), SQL Injection, XSS (Cross-Site Scripting)

### Community 22 - "GraphQL N+1 & DataLoader"
Cohesion: 1.0
Nodes (2): DataLoader, N+1 Problem (GraphQL)

### Community 23 - "React Refs & Forward Refs"
Cohesion: 1.0
Nodes (2): useRef Hook, forwardRef & useImperativeHandle

### Community 24 - "Db Readme"
Cohesion: 1.0
Nodes (1): Database Interview Preparation Overview

### Community 25 - "Ts Readme"
Cohesion: 1.0
Nodes (1): TypeScript Interview Preparation Overview

### Community 26 - "Java Interview Prep"
Cohesion: 1.0
Nodes (1): Java String Pool (Interview Prep)

### Community 27 - "Java Static Vs Instance"
Cohesion: 1.0
Nodes (1): Static vs Instance Methods

### Community 28 - "Concept String Pool"
Cohesion: 1.0
Nodes (1): Java String Pool

### Community 29 - "Nextjs Rendering Ssr"
Cohesion: 1.0
Nodes (1): Server-Side Rendering (SSR)

### Community 30 - "Nextjs Config Next Config"
Cohesion: 1.0
Nodes (1): next.config.js

### Community 31 - "Nextjs Config Metadata Api"
Cohesion: 1.0
Nodes (1): Next.js Metadata API & SEO

### Community 32 - "Nextjs Config Next Image"
Cohesion: 1.0
Nodes (1): next/image Optimization

### Community 33 - "Nextjs Config Next Font"
Cohesion: 1.0
Nodes (1): next/font Self-hosting

### Community 34 - "Nextjs Config Deployment Docker"
Cohesion: 1.0
Nodes (1): Docker Self-hosting (Next.js)

### Community 35 - "Sysdesign Scalability Vertical Scaling"
Cohesion: 1.0
Nodes (1): Vertical Scaling (Scale Up)

### Community 36 - "React Core Controlled Components"
Cohesion: 1.0
Nodes (1): Controlled vs Uncontrolled Components

### Community 37 - "React Perf Portals"
Cohesion: 1.0
Nodes (1): React Portals

### Community 38 - "React Ts Generic Components"
Cohesion: 1.0
Nodes (1): Generic Components in TSX

## Knowledge Gaps
- **144 isolated node(s):** `Database Interview Preparation Overview`, `TypeScript Interview Preparation Overview`, `Java String Pool (Interview Prep)`, `Static vs Instance Methods`, `ACID Properties` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `GraphQL N+1 & DataLoader`** (2 nodes): `DataLoader`, `N+1 Problem (GraphQL)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Refs & Forward Refs`** (2 nodes): `useRef Hook`, `forwardRef & useImperativeHandle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Db Readme`** (1 nodes): `Database Interview Preparation Overview`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Ts Readme`** (1 nodes): `TypeScript Interview Preparation Overview`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Java Interview Prep`** (1 nodes): `Java String Pool (Interview Prep)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Java Static Vs Instance`** (1 nodes): `Static vs Instance Methods`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Concept String Pool`** (1 nodes): `Java String Pool`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nextjs Rendering Ssr`** (1 nodes): `Server-Side Rendering (SSR)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nextjs Config Next Config`** (1 nodes): `next.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nextjs Config Metadata Api`** (1 nodes): `Next.js Metadata API & SEO`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nextjs Config Next Image`** (1 nodes): `next/image Optimization`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nextjs Config Next Font`** (1 nodes): `next/font Self-hosting`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nextjs Config Deployment Docker`** (1 nodes): `Docker Self-hosting (Next.js)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sysdesign Scalability Vertical Scaling`** (1 nodes): `Vertical Scaling (Scale Up)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Core Controlled Components`** (1 nodes): `Controlled vs Uncontrolled Components`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Perf Portals`** (1 nodes): `React Portals`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Ts Generic Components`** (1 nodes): `Generic Components in TSX`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Caching Overview` connect `System Design: Caching Strategies` to `Next.js App Router & Components`, `Apollo Client & GraphQL Queries`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Next.js Four Caching Layers` connect `Next.js App Router & Components` to `System Design: Caching Strategies`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Immutable Object` (e.g. with `Optional<T>` and `String Class`) actually correct?**
  _`Immutable Object` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Caching Overview` (e.g. with `Next.js Four Caching Layers` and `Apollo Normalized Cache`) actually correct?**
  _`Caching Overview` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Database Interview Preparation Overview`, `TypeScript Interview Preparation Overview`, `Java String Pool (Interview Prep)` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Java Immutability & Object Design` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Next.js App Router & Components` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._