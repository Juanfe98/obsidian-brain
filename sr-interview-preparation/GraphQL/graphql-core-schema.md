# GraphQL — Core Concepts & Schema

## Glossary

| Term | Meaning |
|------|---------|
| **Schema** | The contract between client and server — defines all types, queries, mutations, and subscriptions |
| **SDL** | Schema Definition Language — the syntax used to write GraphQL schemas |
| **Resolver** | A function that fetches the data for a specific field in the schema |
| **Query** | A read operation — fetches data without side effects |
| **Mutation** | A write operation — creates, updates, or deletes data |
| **Subscription** | A real-time operation — server pushes data to client over a persistent connection (WebSocket) |
| **Scalar** | A primitive type: `String`, `Int`, `Float`, `Boolean`, `ID` |
| **Object type** | A type with fields — the building block of GraphQL schemas |
| **Input type** | An object type used exclusively as an argument (not a return type) |
| **Interface** | An abstract type that other types can implement |
| **Union** | A type that can be one of several other types |
| **Fragment** | A reusable selection of fields |
| **DataLoader** | A batching/caching utility that solves the N+1 problem in resolvers |
| **Context** | An object shared across all resolvers per request — used to pass auth, DB connections, DataLoaders |

---

## GraphQL vs REST

| | REST | GraphQL |
|--|------|---------|
| **Data fetching** | Fixed endpoints, fixed response shapes | One endpoint, client specifies exact fields needed |
| **Over-fetching** | Common — endpoint returns all fields even if you need 2 | Never — you request exactly what you need |
| **Under-fetching** | Common — need multiple requests for related data | Never — one query fetches all related data |
| **Type system** | Optional (OpenAPI) | Built-in, enforced |
| **Versioning** | `/v1/`, `/v2/` | Evolve schema with deprecation, no versions |
| **Real-time** | Polling or WebSocket custom | Subscriptions built-in |
| **Caching** | HTTP cache headers, CDN works well | HTTP caching harder; client-side normalized cache |

**When to choose GraphQL:**
- Multiple clients (mobile, web, third-party) with different data needs
- Complex, interconnected data (social graphs, product catalogs with variants)
- Need to aggregate data from multiple services in one request

**When to stick with REST:**
- Simple CRUD APIs
- File uploads/downloads
- Heavy HTTP caching requirements (public APIs)
- Simple client with a fixed interface

---

## Schema Definition Language (SDL)

### Basic types

```graphql
# Object type — the building block
type User {
    id: ID!             # ID scalar, non-null (! = required)
    name: String!       # String, non-null
    email: String!
    age: Int            # nullable (no !)
    score: Float
    active: Boolean!
    createdAt: String!
    orders: [Order!]!   # non-null list of non-null Orders
    role: Role!         # enum type
}

# Enum
enum Role {
    ADMIN
    USER
    GUEST
}

# Input type — used for mutation arguments only
input CreateUserInput {
    name: String!
    email: String!
    role: Role = USER   # default value
}

# Interface — shared fields across types
interface Node {
    id: ID!
}

type Product implements Node {
    id: ID!
    name: String!
    price: Float!
}

# Union — can be one of several types
union SearchResult = User | Product | Order

# Custom scalar
scalar DateTime
scalar JSON
```

### Non-null (`!`) rules

```graphql
String      # nullable — can return null
String!     # non-null — always returns a string, never null
[String]    # nullable list of nullable strings: null, [], ["a", null]
[String!]   # nullable list of non-null strings: null, [], ["a", "b"]
[String]!   # non-null list of nullable strings: [], ["a", null]
[String!]!  # non-null list of non-null strings: [], ["a", "b"] — most common
```

### Queries, Mutations, Subscriptions

```graphql
type Query {
    # Single item — returns null if not found
    user(id: ID!): User

    # Paginated list
    users(page: Int = 1, pageSize: Int = 20, filter: UserFilterInput): UserPage!

    # Search returning a union
    search(query: String!): [SearchResult!]!
}

type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    login(email: String!, password: String!): AuthPayload!
}

type Subscription {
    orderUpdated(orderId: ID!): Order!
    newMessage(chatId: ID!): Message!
}

type UserPage {
    nodes: [User!]!
    pageInfo: PageInfo!
    totalCount: Int!
}

type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
}

type AuthPayload {
    token: String!
    user: User!
}
```

---

## Resolvers — how data is fetched

A resolver is a function that fetches the value for a specific field.
Every field in GraphQL ultimately resolves to a scalar (leaf value) via its resolver chain.

### Resolver signature

```typescript
// Every resolver receives 4 arguments:
type Resolver<Parent, Args, Context, Return> =
    (parent: Parent, args: Args, context: Context, info: GraphQLResolveInfo) => Return;

// parent: the resolved value of the parent field (null for root Query/Mutation)
// args:   the arguments passed to this field in the query
// context: shared per-request object (auth, DB, DataLoaders)
// info:   query execution info (field name, path, selection set)
```

### Resolver chain example

```typescript
const resolvers = {
    Query: {
        // parent = undefined (root), args = { id: "123" }, context = { db, currentUser }
        user: async (_, { id }, context) => {
            return context.db.users.findById(id);
        },

        users: async (_, { page, pageSize }, context) => {
            const offset = (page - 1) * pageSize;
            const [nodes, totalCount] = await Promise.all([
                context.db.users.findAll({ offset, limit: pageSize }),
                context.db.users.count(),
            ]);
            return { nodes, totalCount, pageInfo: { hasNextPage: offset + pageSize < totalCount } };
        },
    },

    Mutation: {
        createUser: async (_, { input }, context) => {
            // Authorization check
            if (!context.currentUser) throw new GraphQLError("Unauthorized", {
                extensions: { code: "UNAUTHORIZED" }
            });

            const existing = await context.db.users.findByEmail(input.email);
            if (existing) throw new GraphQLError("Email already taken", {
                extensions: { code: "BAD_USER_INPUT" }
            });

            return context.db.users.create(input);
        },
    },

    User: {
        // parent = the User object returned by Query.user
        // This resolver fetches orders for a specific user
        orders: async (user, _, context) => {
            return context.db.orders.findByUserId(user.id);
        },

        // Computed field — not stored in DB
        fullName: (user) => `${user.firstName} ${user.lastName}`,
    },

    // Union resolver
    SearchResult: {
        __resolveType(obj) {
            if (obj.price !== undefined) return "Product";
            if (obj.email !== undefined) return "User";
            return "Order";
        },
    },

    // Interface resolver
    Node: {
        __resolveType(obj) {
            return obj.__typename; // assumes objects carry their typename
        },
    },
};
```

### Context — auth injection pattern

```typescript
// Create context once per request
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        // Extract and validate JWT on every request
        const token = req.headers.authorization?.replace("Bearer ", "");
        let currentUser = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                currentUser = await db.users.findById(decoded.sub);
            } catch {
                // Invalid token — user stays null
            }
        }

        return {
            db,              // database client
            currentUser,     // null if unauthenticated
            dataloaders: {   // DataLoaders per request (not shared)
                users: new UserDataLoader(db),
                orders: new OrderDataLoader(db),
            },
        };
    },
});

// In any resolver — authorization is simple
createUser: (_, args, { currentUser }) => {
    if (!currentUser) throw new GraphQLError("Must be logged in");
    if (currentUser.role !== "ADMIN") throw new GraphQLError("Must be admin");
    // proceed...
}
```

---

## N+1 Problem & DataLoader — critical topic

The GraphQL N+1 problem: when fetching a list of entities, each entity's resolver triggers a separate DB query for related data.

### The problem

```typescript
// Schema
type Order { user: User! }

// Query
query {
    orders {   # 1 query: SELECT * FROM orders → returns 100 orders
        user { # 100 queries: SELECT * FROM users WHERE id = ? (one per order)
            name
        }
    }
}
// Total: 101 queries for a simple operation
```

### DataLoader — the solution

DataLoader **batches** multiple individual loads into a single batch query,
and **caches** within a single request.

```typescript
import DataLoader from "dataloader";

// Batch function: receives array of IDs, returns array of results in same order
const userLoader = new DataLoader<string, User>(async (userIds) => {
    // ONE query for ALL IDs — regardless of how many resolvers requested users
    const users = await db.query(
        "SELECT * FROM users WHERE id = ANY($1)",
        [userIds]
    );

    // CRITICAL: must return results in same order as input keys
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    return userIds.map(id => userMap[id] || new Error(`User ${id} not found`));
});

// In resolver — looks like a single load
const resolvers = {
    Order: {
        user: (order, _, { dataloaders }) => {
            return dataloaders.users.load(order.userId); // batched automatically
        },
    },
};

// What happens:
// 100 Order.user resolvers call dataloaders.users.load(userId)
// DataLoader collects all 100 IDs (batches in next tick)
// ONE query: SELECT * FROM users WHERE id IN (1, 2, ..., 100)
// Results distributed back to each resolver
// Total: 2 queries instead of 101 ✅
```

### Important: create DataLoaders per request, NOT globally

```typescript
// WRONG — shared DataLoader caches stale data across requests
const sharedLoader = new DataLoader(batchFn);

// CORRECT — new DataLoader per request (fresh cache per request)
context: async ({ req }) => ({
    dataloaders: {
        users:  new DataLoader(batchFn),
        orders: new DataLoader(batchFn),
    },
})
```

---

## Fragments — reusable field selections

### Named fragments

```graphql
# Define once
fragment UserBasic on User {
    id
    name
    email
}

fragment UserFull on User {
    ...UserBasic
    role
    createdAt
    orders { id total status }
}

# Reuse across queries
query GetUsers {
    users {
        ...UserBasic
    }
}

query GetUserProfile($id: ID!) {
    user(id: $id) {
        ...UserFull
    }
}
```

### Inline fragments — for unions and interfaces

```graphql
query Search($query: String!) {
    search(query: $query) {
        ... on User {      # only when SearchResult is a User
            id
            name
            email
        }
        ... on Product {   # only when SearchResult is a Product
            id
            name
            price
        }
        ... on Order {
            id
            total
            status
        }
    }
}
```

---

## Directives

```graphql
# Built-in directives
query GetUser($id: ID!, $includeOrders: Boolean!) {
    user(id: $id) {
        id
        name
        orders @include(if: $includeOrders) {   # include field only if condition is true
            id
            total
        }
    }
}

query GetProduct($id: ID!, $isAdmin: Boolean!) {
    product(id: $id) {
        id
        name
        costPrice @skip(if: $isAdmin)   # skip field if condition is true
    }
}

# Schema deprecation
type User {
    name: String!
    fullName: String! @deprecated(reason: "Use `name` instead")
}
```

---

## Schema Design Principles

### Think in graphs, not endpoints

```graphql
# REST-shaped (BAD) — mirrors HTTP endpoints
type Query {
    getUserById(id: ID!): User
    getOrdersByUserId(userId: ID!): [Order]
    getProductsByCategoryId(categoryId: ID!): [Product]
}

# Graph-shaped (GOOD) — traverse relationships
type Query {
    user(id: ID!): User
}
type User {
    orders: [Order!]!
}
type Order {
    items: [OrderItem!]!
}
type OrderItem {
    product: Product!
}
# One entry point, traverse the graph from there
```

### Name mutations as actions (not CRUD)

```graphql
# BAD — database CRUD naming
type Mutation {
    insertUser(input: CreateUserInput!): User
    updateUser(id: ID!, data: UserData!): User
    deleteUser(id: ID!): Boolean
}

# GOOD — domain action naming
type Mutation {
    registerUser(input: RegisterInput!): User!
    updateProfile(input: ProfileInput!): User!
    deactivateAccount(userId: ID!): User!
    placeOrder(input: PlaceOrderInput!): Order!
    cancelOrder(orderId: ID!, reason: String!): Order!
}
```

### Always return the mutated object

```graphql
# BAD — returns boolean (client must refetch)
deleteUser(id: ID!): Boolean!

# GOOD — return what changed (client can update cache)
deactivateAccount(userId: ID!): User!
```

---

## Interview answers

### What is GraphQL and how is it different from REST?
GraphQL is a query language and runtime where clients specify exactly what data they need in a single request. Unlike REST's fixed endpoints returning fixed shapes, GraphQL has one endpoint where clients declare their data requirements. This eliminates over-fetching (getting too much data) and under-fetching (needing multiple requests for related data).

### What is the N+1 problem in GraphQL?
When resolving a list of N items, each item's field resolver fires a separate database query for related data — resulting in 1 + N queries. For 100 orders with their users, that's 101 queries. DataLoader solves this by batching all individual loads into one query within a single event loop tick.

### What is a DataLoader and how does it work?
DataLoader is a batching utility. Instead of each resolver loading data individually, DataLoader collects all `load(key)` calls made within the same tick, then calls the batch function once with all keys. Results are matched back to callers by order. It also caches within a single request so the same key is never loaded twice.

### What is a resolver and what are its 4 arguments?
A resolver is a function that fetches the value for a specific field. Its 4 arguments are: `parent` (the resolved parent object), `args` (the field's arguments from the query), `context` (shared per-request object for auth/DB/DataLoaders), and `info` (execution details like field path and selection set).

### What are fragments in GraphQL?
Reusable selections of fields that can be shared across multiple queries. Named fragments reduce duplication. Inline fragments (`... on Type`) are used with unions and interfaces to conditionally select fields based on the resolved type.

### How do you handle authentication in GraphQL?
Inject the authenticated user into the context during request setup — parse and validate the JWT (or session), look up the user, and attach it to the context object. All resolvers then access `context.currentUser` and throw a GraphQLError if the user is missing or lacks the required role.
