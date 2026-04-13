# GraphQL — Apollo Client

## Glossary

| Term | Meaning |
|------|---------|
| **Apollo Client** | A fully-featured GraphQL client library for JavaScript/React |
| **Normalized cache** | A flat store where every object is stored once by `__typename + id`, referenced by pointers |
| **InMemoryCache** | Apollo's default cache implementation |
| **Fetch policy** | Controls how Apollo resolves queries — from cache, network, or both |
| **`useQuery`** | React hook for executing a GraphQL query when a component renders |
| **`useMutation`** | React hook that returns a function to execute a GraphQL mutation |
| **`useSubscription`** | React hook for subscribing to real-time GraphQL events |
| **Optimistic response** | A fake mutation result applied immediately to the UI before the server responds |
| **`refetchQueries`** | Triggers re-execution of specified queries after a mutation |
| **`fetchMore`** | Fetches more data (next page) and merges it with existing cached data |
| **Reactive variable** | An Apollo mechanism for local state that triggers re-renders like a regular query |
| **Apollo Link** | Middleware in Apollo's request pipeline (auth, error handling, retry) |
| **`TypedDocumentNode`** | A document node with TypeScript types embedded — enables typed hooks without codegen boilerplate |

---

## Apollo Client Architecture

```
Component
  │
  │ useQuery / useMutation
  ▼
ApolloClient
  ├── InMemoryCache     ← normalized store
  │     ├── User:1     → { id, name, email }
  │     ├── User:2     → { id, name, email }
  │     └── Order:10   → { id, total, user: REF(User:1) }
  │
  └── Link Chain        ← request pipeline
        ├── AuthLink    → adds Authorization header
        ├── ErrorLink   → handles network/GraphQL errors
        ├── RetryLink   → retries on network failure
        └── HttpLink    → final HTTP request to server
```

### Setup

```typescript
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Auth link — adds token to every request
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("authToken");
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

// Error link — global error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions }) => {
            if (extensions?.code === "UNAUTHORIZED") {
                // Redirect to login
                window.location.href = "/login";
            }
            console.error(`GraphQL error: ${message}`);
        });
    }
    if (networkError) {
        console.error(`Network error: ${networkError}`);
    }
});

const httpLink = createHttpLink({ uri: "/graphql" });

const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]), // order matters — error → auth → http
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    // Merge function for paginated results
                    users: {
                        keyArgs: ["filter"], // only re-fetch if filter changes (not page)
                        merge(existing = [], incoming) {
                            return [...existing, ...incoming];
                        },
                    },
                },
            },
        },
    }),
});

// Wrap the app
<ApolloProvider client={client}>
    <App />
</ApolloProvider>
```

---

## Normalized Cache — how it works

Apollo normalizes every object by `__typename + id`.
All objects of the same type with the same id are deduplicated.

```typescript
// Query result:
{
    users: [
        { __typename: "User", id: "1", name: "Juan",  role: "ADMIN" },
        { __typename: "User", id: "2", name: "Maria", role: "USER" },
    ],
    orders: [
        { __typename: "Order", id: "10", user: { __typename: "User", id: "1", name: "Juan" } }
    ]
}

// Stored in cache (normalized):
{
    "User:1":  { id: "1", name: "Juan",  role: "ADMIN" },
    "User:2":  { id: "2", name: "Maria", role: "USER" },
    "Order:10": { id: "10", user: { __ref: "User:1" } },  // ← reference, not a copy
    "ROOT_QUERY": {
        "users": [{ __ref: "User:1" }, { __ref: "User:2" }],
        "orders": [{ __ref: "Order:10" }]
    }
}
```

**Key benefit:** if you update User:1 (e.g., via a mutation), every query that references User:1
automatically sees the updated data — without refetching.

### Custom key fields

```typescript
new InMemoryCache({
    typePolicies: {
        // Use different field as unique identifier
        Product: { keyFields: ["sku"] },

        // Use multiple fields as composite key
        Booking: { keyFields: ["flightId", "date"] },

        // No caching for a type (always re-fetch)
        SearchResult: { keyFields: false },
    },
})
```

---

## Fetch Policies

| Policy | Cache first? | Network? | Use when |
|--------|-------------|---------|----------|
| `cache-first` (default) | ✅ Returns from cache | Only on miss | Stable data that rarely changes |
| `cache-and-network` | ✅ Returns from cache immediately | Always fetches too | Show stale data fast, then update |
| `network-only` | ❌ | Always | Must have fresh data (dashboard, balance) |
| `cache-only` | ✅ | Never | Offline mode, data always in cache |
| `no-cache` | ❌ | Always, no write | Sensitive data, real-time pricing |
| `standby` | ✅ | No auto-fetch | Manual fetch only |

```typescript
// cache-first (default) — fastest, may show stale data
const { data } = useQuery(GET_USER, { variables: { id }, fetchPolicy: "cache-first" });

// cache-and-network — good for dashboards
const { data, loading } = useQuery(GET_ORDERS, { fetchPolicy: "cache-and-network" });
// data is available immediately from cache while network fetches fresh data

// network-only — financial data, availability
const { data } = useQuery(GET_BALANCE, { fetchPolicy: "network-only" });
```

---

## useQuery — complete example

```typescript
import { useQuery, gql } from "@apollo/client";

const GET_USER = gql`
    query GetUser($id: ID!) {
        user(id: $id) {
            id
            name
            email
            orders {
                id
                total
                status
            }
        }
    }
`;

interface User {
    id: string;
    name: string;
    email: string;
    orders: Order[];
}

function UserProfile({ userId }: { userId: string }) {
    const { data, loading, error, refetch, networkStatus } = useQuery<
        { user: User },     // data type
        { id: string }      // variables type
    >(GET_USER, {
        variables: { id: userId },
        fetchPolicy: "cache-and-network",
        skip: !userId,              // don't run if userId is empty
        onCompleted: (data) => {
            console.log("Query completed:", data.user.name);
        },
        onError: (error) => {
            console.error("Query failed:", error);
        },
    });

    if (loading && !data) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;
    if (!data?.user) return <NotFound />;

    return (
        <div>
            <h1>{data.user.name}</h1>
            <button onClick={() => refetch()}>Refresh</button>
        </div>
    );
}
```

---

## useMutation — complete example

```typescript
const CREATE_ORDER = gql`
    mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
            id
            total
            status
            user { id name }
        }
    }
`;

function OrderForm() {
    const [createOrder, { loading, error, data }] = useMutation<
        { createOrder: Order },
        { input: CreateOrderInput }
    >(CREATE_ORDER, {
        // Option 1: refetch related queries after mutation
        refetchQueries: ["GetOrders", "GetUserBalance"],

        // Option 2: optimistic response (UI updates immediately)
        optimisticResponse: {
            createOrder: {
                __typename: "Order",
                id: "temp-id",
                total: 99.99,
                status: "PENDING",
                user: currentUser,
            },
        },

        // Option 3: manually update cache (no refetch needed)
        update: (cache, { data }) => {
            const newOrder = data?.createOrder;
            if (!newOrder) return;

            // Read existing orders from cache
            const existing = cache.readQuery<{ orders: Order[] }>({ query: GET_ORDERS });

            // Write updated list
            cache.writeQuery({
                query: GET_ORDERS,
                data: {
                    orders: [newOrder, ...(existing?.orders ?? [])],
                },
            });
        },

        onCompleted: (data) => toast.success(`Order ${data.createOrder.id} created!`),
        onError: (error) => toast.error(error.message),
    });

    async function handleSubmit(input: CreateOrderInput) {
        try {
            const result = await createOrder({ variables: { input } });
            console.log("Created:", result.data?.createOrder);
        } catch (e) {
            // error is also available in the `error` variable above
        }
    }

    return (
        <form onSubmit={...}>
            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Place Order"}
            </button>
            {error && <ErrorMessage error={error} />}
        </form>
    );
}
```

---

## Optimistic UI — instant feedback

```typescript
// When a user likes a post, update the count immediately without waiting for server
const LIKE_POST = gql`
    mutation LikePost($postId: ID!) {
        likePost(postId: $postId) {
            id
            likeCount
            isLikedByMe
        }
    }
`;

function LikeButton({ post }: { post: Post }) {
    const [likePost] = useMutation(LIKE_POST, {
        optimisticResponse: {
            likePost: {
                __typename: "Post",
                id: post.id,
                likeCount: post.likeCount + 1,   // optimistic — instant update
                isLikedByMe: true,
            },
        },
    });

    return (
        <button onClick={() => likePost({ variables: { postId: post.id } })}>
            ❤️ {post.likeCount}
        </button>
        // UI updates immediately. If mutation fails, Apollo rolls back to previous value.
    );
}
```

---

## Cursor-based Pagination with fetchMore

```graphql
type Query {
    orders(first: Int!, after: String): OrderConnection!
}

type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
}
type OrderEdge {
    node: Order!
    cursor: String!
}
type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
}
```

```typescript
const GET_ORDERS = gql`
    query GetOrders($first: Int!, $after: String) {
        orders(first: $first, after: $after) {
            edges {
                cursor
                node { id total status }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

function OrderList() {
    const { data, loading, fetchMore } = useQuery(GET_ORDERS, {
        variables: { first: 20 },
    });

    function loadMore() {
        fetchMore({
            variables: {
                first: 20,
                after: data?.orders.pageInfo.endCursor,
            },
            // Merge new page with existing data
            updateQuery: (previous, { fetchMoreResult }) => {
                if (!fetchMoreResult) return previous;
                return {
                    orders: {
                        ...fetchMoreResult.orders,
                        edges: [
                            ...previous.orders.edges,
                            ...fetchMoreResult.orders.edges,
                        ],
                    },
                };
            },
        });
    }

    return (
        <>
            {data?.orders.edges.map(({ node }) => <OrderItem key={node.id} order={node} />)}
            {data?.orders.pageInfo.hasNextPage && (
                <button onClick={loadMore} disabled={loading}>Load more</button>
            )}
        </>
    );
}
```

---

## Local State with Reactive Variables

```typescript
import { makeVar, useReactiveVar } from "@apollo/client";

// Create reactive variables (local state)
const cartItemsVar = makeVar<CartItem[]>([]);
const isCartOpenVar = makeVar(false);

// In any component — works like useState but globally shared
function CartButton() {
    const isOpen  = useReactiveVar(isCartOpenVar);
    const items   = useReactiveVar(cartItemsVar);

    return (
        <button onClick={() => isCartOpenVar(!isOpen)}>
            Cart ({items.length})
        </button>
    );
}

// Update from anywhere
function addToCart(item: CartItem) {
    cartItemsVar([...cartItemsVar(), item]); // read current value, append
}

// You can also mix with server queries
const GET_CART = gql`
    query GetCart {
        cart @client {  # @client = resolved locally, not from server
            items
            total
        }
    }
`;
```

---

## Error Handling

```typescript
// Apollo returns two types of errors — handle both
const { data, error } = useQuery(GET_USER, { variables: { id } });

if (error) {
    // error.graphQLErrors — server returned errors array in response body
    // e.g., validation errors, auth errors, business logic errors
    error.graphQLErrors.forEach(gqlError => {
        console.log(gqlError.message);
        console.log(gqlError.extensions?.code); // "UNAUTHORIZED", "NOT_FOUND", etc.
    });

    // error.networkError — the HTTP request itself failed
    // e.g., 500, connection refused, timeout
    if (error.networkError) {
        console.log("Network failed:", error.networkError);
    }
}

// Error policy — control how partial errors are handled
useQuery(GET_DASHBOARD, {
    errorPolicy: "all", // return both data AND errors (instead of discarding data on any error)
});
```

---

## TypeScript + Apollo Code Generation

In real projects, types are generated automatically from the schema:

```bash
# Install
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo

# codegen.yml
schema: "http://localhost:4000/graphql"
documents: "src/**/*.graphql"
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

```typescript
// Instead of manually typing:
const { data } = useQuery<{ user: User }, { id: string }>(GET_USER, { variables: { id } });

// Generated typed hook:
import { useGetUserQuery } from "../generated/graphql";

const { data } = useGetUserQuery({ variables: { id } });
// data is already typed as { user: User } — no manual annotation needed
```

---

## Interview answers

### How does Apollo's normalized cache work?
Apollo stores every object by `__typename + id` as a key. Instead of duplicating objects across query results, Apollo stores references. When any object is updated (via mutation or direct write), all queries that reference it automatically reflect the change — without refetching.

### What is the difference between cache-first and cache-and-network?
`cache-first` returns data from cache immediately and only hits the network if the cache is empty. `cache-and-network` returns cached data immediately AND fires a network request — updating the UI when fresh data arrives. Use `cache-and-network` for data that changes but where you want instant display.

### What is optimistic UI in Apollo?
Providing a fake mutation result that Apollo applies to the cache immediately, before the server responds. The UI updates instantly. If the mutation succeeds, the real result replaces the fake one. If it fails, Apollo automatically rolls back to the previous state.

### When would you use refetchQueries vs cache update?
`refetchQueries` is simpler — re-runs the specified queries after mutation. Good for complex queries where updating the cache manually is hard. Cache `update` is more efficient — directly modifies the cache without an extra network request. Prefer `update` for simple list additions; use `refetchQueries` when the affected cache is complex.

### How do you handle pagination in Apollo?
Cursor-based pagination: fetch the first page, receive `endCursor` in `pageInfo`, then call `fetchMore` with `after: endCursor`. The cache merge function concatenates the new edges with existing ones. Configure `keyArgs` on the field's type policy so pagination variables (like `after`) don't create separate cache entries.

### What is the Apollo Link chain?
A composable middleware system where each link can inspect and transform requests and responses. Common links: `AuthLink` adds headers, `ErrorLink` handles errors globally, `RetryLink` retries on network failure, `HttpLink` makes the actual HTTP request. Links are composed with `from([...])` and execute in order.
