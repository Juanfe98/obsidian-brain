# JPA Best Practices

## Glossary

| Term | Meaning |
|------|---------|
| **JPA** | Java Persistence API — specification for ORM in Java |
| **Hibernate** | The most common JPA implementation (used by Spring Boot by default) |
| **Entity** | A Java class mapped to a database table via `@Entity` |
| **Lazy loading** | Related data is NOT loaded until accessed — loaded on demand |
| **Eager loading** | Related data is loaded immediately with the parent entity |
| **N+1 problem** | 1 query to fetch N entities + N additional queries to fetch their relations |
| **Fetch join** | A JPQL JOIN FETCH that loads entity + relations in ONE query |
| **@EntityGraph** | Annotation to define a loading strategy for a specific query |
| **Persistence context** | Hibernate's first-level cache — tracks managed entities in the current session |
| **Dirty checking** | Hibernate automatically detects changes to managed entities and syncs to DB on commit |
| **DTO projection** | Querying only the needed columns into a DTO instead of loading full entities |
| **Batch size** | How many related entities Hibernate loads in one IN query |

---

## The N+1 Problem — the most common JPA pitfall

### What it is

You fetch a list of entities, then access a lazy-loaded relation on each — triggering one extra query per entity.

```java
// Example: Orders with their Users
List<Order> orders = orderRepository.findAll(); // Query 1: SELECT * FROM orders → 100 orders

for (Order order : orders) {
    System.out.println(order.getUser().getName()); // Query 2...101: SELECT * FROM users WHERE id = ?
}
// Result: 1 + 100 = 101 queries!
```

### Why it happens

JPA defaults relations to `LAZY` (except `@ManyToOne` and `@OneToOne` which default to `EAGER`).
When you access `order.getUser()`, Hibernate fires a new query to load the user.

### Fix 1 — JOIN FETCH in JPQL

```java
// Repository method
@Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.status = :status")
List<Order> findByStatusWithUser(@Param("status") String status);

// Result: ONE query
// SELECT o.*, u.* FROM orders o INNER JOIN users u ON o.user_id = u.id WHERE o.status = ?
```

### Fix 2 — @EntityGraph

```java
// Define on the entity
@Entity
@NamedEntityGraph(
    name = "Order.withUser",
    attributeNodes = @NamedAttributeNode("user")
)
public class Order { ... }

// Use in repository
@EntityGraph("Order.withUser")
List<Order> findByStatus(String status);
```

Or inline:

```java
@EntityGraph(attributePaths = {"user", "items"})
List<Order> findAll();
// Loads orders + user + items in ONE query (or efficient batch)
```

### Fix 3 — Batch size (for collection relations)

For `@OneToMany` relations, use batch fetching instead of one-by-one:

```java
@Entity
public class User {
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @BatchSize(size = 50)  // loads 50 users' orders at once using IN clause
    private List<Order> orders;
}
```

```sql
-- Instead of 100 separate queries:
SELECT * FROM orders WHERE user_id = 1;
SELECT * FROM orders WHERE user_id = 2;
...

-- Batch fetches in groups:
SELECT * FROM orders WHERE user_id IN (1, 2, 3, ..., 50);
SELECT * FROM orders WHERE user_id IN (51, 52, ..., 100);
-- 100 queries → 2 queries
```

### Fix 4 — DTO projections for read-only queries

If you don't need full entities, project directly into DTOs:

```java
// DTO
public record OrderSummary(Long id, String userEmail, String status) {}

// Repository
@Query("SELECT new com.example.dto.OrderSummary(o.id, o.user.email, o.status) FROM Order o")
List<OrderSummary> findOrderSummaries();

// ONE query, only fetches needed columns, no entity tracking overhead
```

---

## Fetch types — LAZY vs EAGER

```java
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY)    // load user only when accessed
    private User user;

    @OneToMany(fetch = FetchType.LAZY)    // load items only when accessed
    private List<OrderItem> items;

    @ManyToOne(fetch = FetchType.EAGER)   // load payment immediately with order
    private Payment payment;              // use EAGER sparingly
}
```

**General rule: always use LAZY loading.**
Load relations explicitly when needed using JOIN FETCH or @EntityGraph.
EAGER loading on collections is particularly dangerous — can cause cartesian products.

---

## Common JPA mistakes

### Mistake 1 — Bidirectional relation not properly maintained

```java
@Entity
public class Order {
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items = new ArrayList<>();

    // Helper method to maintain BOTH sides of the relation
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this); // ← MUST set the owning side too
    }
}

// WRONG: only setting one side
order.getItems().add(item); // ← items list updated
// item.setOrder(order) missing → DB INSERT will have null order_id!
```

### Mistake 2 — equals/hashCode based on mutable or auto-generated fields

```java
// WRONG: using Lombok @Data on entities — uses all fields including id
@Data   // generates equals/hashCode on id — breaks when id is null (new entity)
@Entity
public class Order { ... }

// CORRECT: use @EqualsAndHashCode on a natural business key, or override manually
@Entity
public class Order {
    @Id
    private Long id;

    @NaturalId
    private String orderNumber; // stable business identifier

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Order)) return false;
        Order other = (Order) o;
        return orderNumber != null && orderNumber.equals(other.orderNumber);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode(); // consistent before and after persist
    }
}
```

### Mistake 3 — Open Session in View (OSIV)

Spring Boot enables OSIV by default: the Hibernate session stays open through the HTTP request,
allowing lazy loading anywhere (controllers, serializers).

**Problems:**
- Lazy loading triggered by Jackson serialization fires unexpected DB queries
- Hidden N+1 problems in serialization layer
- Session open longer = more DB connections held

**Best practice:** disable OSIV, use explicit loading strategies

```yaml
# application.yml
spring:
  jpa:
    open-in-view: false  # disable OSIV
```

### Mistake 4 — Not using pagination

```java
// DANGEROUS: loads ALL rows into memory
List<Order> all = orderRepository.findAll();

// SAFE: paginate
Page<Order> page = orderRepository.findAll(PageRequest.of(0, 20, Sort.by("createdAt").descending()));
```

### Mistake 5 — Mutating entities outside a transaction

Dirty checking only works inside an active transaction (persistence context).

```java
@Service
public class OrderService {

    // readOnly = true → no dirty tracking, no flush, no unexpected updates
    @Transactional(readOnly = true)
    public Order getOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus("PENDING"); // change is ignored — readOnly, no flush
        return order;
    }

    @Transactional
    public Order updateOrder(Long id) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus("CONFIRMED"); // automatically saved on commit — no explicit save needed!
        return order;
        // orderRepository.save(order) is NOT required here — dirty checking handles it
    }
}
```

---

## Performance best practices summary

| Practice | Why |
|----------|-----|
| Use `LAZY` loading everywhere | Avoids loading unnecessary data |
| Use `JOIN FETCH` for needed relations | Eliminates N+1, loads in one query |
| Use DTO projections for read-only queries | Less memory, no entity tracking overhead |
| Use `@Transactional(readOnly = true)` for reads | Optimizes Hibernate — disables dirty checking |
| Paginate all list queries | Never load unbounded result sets into memory |
| Disable OSIV | Makes data loading explicit, prevents hidden queries |
| Use `@BatchSize` for collection relations | Reduces N+1 to N/batchSize+1 queries |
| Don't use `@Data` on entities | Breaks equals/hashCode contract |

---

## Interview answers

### What is the N+1 problem in JPA?
Fetching N entities with a lazy-loaded relation, then accessing that relation on each entity — resulting in 1 query for the list + N queries for the relations = N+1 total. Fix with JOIN FETCH in JPQL, @EntityGraph, or @BatchSize.

### What is the difference between LAZY and EAGER loading?
LAZY: the related entity/collection is loaded only when accessed — requires an active persistence context. EAGER: loaded immediately with the parent in the same query. Use LAZY by default; load relations explicitly with JOIN FETCH when needed.

### Why should you avoid @Data on JPA entities?
Lombok's @Data generates equals() and hashCode() based on all fields, including the auto-generated ID. New (unpersisted) entities have null IDs — two new entities would incorrectly be considered equal. Use natural business keys for equals/hashCode instead.

### What does @Transactional(readOnly = true) do?
Tells Hibernate this transaction won't modify data — it disables dirty checking (no entity change tracking) and flush on commit, and allows database drivers to optimize connection settings. Use it on all read-only service methods.

### What is dirty checking in Hibernate?
Hibernate tracks all entities loaded in the current session (persistence context). At transaction commit, it compares the current state of each entity to its snapshot at load time. Changed entities are automatically updated in the DB — no explicit `save()` call needed.

### What is the Open Session In View (OSIV) pattern and why is it problematic?
OSIV keeps the Hibernate session open for the entire HTTP request, allowing lazy loading anywhere. Problem: lazy loading triggered during JSON serialization fires DB queries outside the service layer — hidden N+1 problems, unexpected DB load, and longer-held connections. Best practice: disable OSIV and use explicit JOIN FETCH / @EntityGraph.
