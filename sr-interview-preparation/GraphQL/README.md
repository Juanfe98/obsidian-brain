# GraphQL — Interview Preparation

## Files in this folder

| File | Topics |
|------|--------|
| `graphql-core-schema.md` | GraphQL vs REST, SDL syntax (types, scalars, enums, unions, interfaces, inputs), resolver architecture (4 args), context/auth pattern, N+1 problem, DataLoader (batching + caching), fragments, directives, schema design principles |
| `graphql-client-apollo.md` | Apollo Client architecture (link chain), normalized cache, custom key fields, all fetch policies, useQuery/useMutation/useSubscription with full options, optimistic UI, cursor-based pagination with fetchMore, reactive variables, error handling, TypeScript code generation |

## Senior-level differentiators

- **N+1 + DataLoader** — explain batch function, order contract, per-request instantiation
- **Normalized cache** — how `__typename + id` keys work, why updates propagate automatically
- **Fetch policy decision** — when to use `cache-and-network` vs `network-only` vs `no-cache`
- **Optimistic UI rollback** — what happens when a mutation fails after an optimistic update
- **Cache update vs refetchQueries** — trade-offs (efficiency vs simplicity)
- **Fragment colocation** — define fragments next to the component that uses them
