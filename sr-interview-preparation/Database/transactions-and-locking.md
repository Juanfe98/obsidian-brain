# Transactions & Locking

## Glossary

| Term | Meaning |
|------|---------|
| **Transaction** | A unit of work that either fully succeeds (commit) or fully fails (rollback) |
| **ACID** | Atomicity, Consistency, Isolation, Durability — guarantees of a reliable transaction |
| **Isolation level** | How visible are the effects of in-progress transactions to other concurrent transactions |
| **Dirty read** | Reading data that was written by an uncommitted transaction — dangerous, may be rolled back |
| **Non-repeatable read** | Reading the same row twice in one transaction and getting different values (another TX committed between reads) |
| **Phantom read** | Running the same range query twice and getting different rows (another TX inserted/deleted between reads) |
| **Optimistic locking** | Assume no conflict; check for conflict only at commit time (using a version field) |
| **Pessimistic locking** | Assume conflict; lock the row immediately on read |
| **SELECT FOR UPDATE** | SQL that acquires a write lock on the selected rows |
| **Deadlock** | Two transactions each waiting for a lock the other holds — both stuck forever |
| **@Transactional** | Spring annotation that wraps method execution in a database transaction |

---

## ACID Properties

### Atomicity — all or nothing

A transaction is a single unit. Either ALL operations succeed, or NONE do.
If any step fails, everything rolls back.

```sql
BEGIN TRANSACTION;
    UPDATE accounts SET balance = balance - 500 WHERE id = 1;  -- debit
    UPDATE accounts SET balance = balance + 500 WHERE id = 2;  -- credit
COMMIT;
-- If the credit fails, the debit is rolled back automatically
-- Account 1 never loses money unless Account 2 receives it
```

### Consistency — always valid state

The database must be in a valid state before and after the transaction.
All constraints, triggers, and rules must be satisfied.

```
Before TX: Account 1 = $1000, Account 2 = $0. Total = $1000
After TX:  Account 1 = $500,  Account 2 = $500. Total = $1000
Constraint: total money is conserved ✓
```

### Isolation — transactions don't interfere

Concurrent transactions behave as if they execute sequentially.
One transaction's in-progress changes are invisible to others (to varying degrees, depending on isolation level).

### Durability — committed = permanent

Once a transaction commits, the data survives crashes.
Achieved through write-ahead logging (WAL) — changes are written to disk before confirming commit.

---

## Isolation Levels

Isolation is a spectrum: more isolation = more safety but lower concurrency (more locking).

| Isolation Level | Dirty Read | Non-repeatable Read | Phantom Read | Performance |
|----------------|-----------|---------------------|--------------|-------------|
| **READ UNCOMMITTED** | ✅ possible | ✅ possible | ✅ possible | Fastest |
| **READ COMMITTED** | ❌ prevented | ✅ possible | ✅ possible | Fast |
| **REPEATABLE READ** | ❌ prevented | ❌ prevented | ✅ possible | Medium |
| **SERIALIZABLE** | ❌ prevented | ❌ prevented | ❌ prevented | Slowest |

**Default isolation levels:**
- PostgreSQL: READ COMMITTED
- MySQL InnoDB: REPEATABLE READ
- SQL Server: READ COMMITTED

### READ UNCOMMITTED — dangerous

Can read data from transactions that haven't committed yet.
If that transaction rolls back, you read "phantom" data that never existed.

```
Transaction A: UPDATE salary = 10000 (not committed yet)
Transaction B: SELECT salary → sees 10000 (dirty read!)
Transaction A: ROLLBACK
→ Transaction B made a decision based on data that never existed
```

### READ COMMITTED — safe default

Only reads committed data. Most databases use this as default.
**Risk:** non-repeatable reads — you may see different values if you read the same row twice.

```
Transaction A:
  SELECT price FROM products WHERE id = 1; → $100
  [... some work ...]
  SELECT price FROM products WHERE id = 1; → $120 (Transaction B committed an update between reads!)
```

### REPEATABLE READ

Once you read a row in a transaction, you always get the same value — other commits are invisible.
**Risk:** phantom reads — new rows inserted by others may appear in range queries.

```
Transaction A:
  SELECT * FROM orders WHERE status = 'PENDING'; → 5 rows
  [Transaction B INSERTs a new PENDING order and commits]
  SELECT * FROM orders WHERE status = 'PENDING'; → 6 rows! (phantom)
```

### SERIALIZABLE — strictest

Transactions execute as if completely sequential. No anomalies possible.
Very slow for high-concurrency — requires locking range queries too.

Use for: financial reconciliation, inventory reservation, anything requiring perfect accuracy.

---

## Setting isolation level in Spring

```java
@Transactional(isolation = Isolation.READ_COMMITTED)   // default, safe
public void readData() { ... }

@Transactional(isolation = Isolation.REPEATABLE_READ)   // no non-repeatable reads
public void auditData() { ... }

@Transactional(isolation = Isolation.SERIALIZABLE)     // strictest, slowest
public void criticalFinancial() { ... }
```

---

## Optimistic Locking — assume no conflict

No database lock is held. Instead, a `version` column tracks changes.
At commit time, verify no one else modified the record since you read it.

**Best for:** Low-contention data. Reads are frequent, conflicts are rare.

### How it works

```
Read:     SELECT id, name, version FROM products WHERE id = 1; → version = 5
Modify:   (change locally, no lock held)
Write:    UPDATE products SET name = 'new', version = 6 WHERE id = 1 AND version = 5;
```

If another transaction modified the row between your read and write, `version` changed.
The WHERE clause finds 0 rows → update fails → application retries.

```
Thread A reads:  version = 5, price = $100
Thread B reads:  version = 5, price = $100
Thread A writes: SET price = $120, version = 6 WHERE version = 5 → SUCCESS
Thread B writes: SET price = $90,  version = 6 WHERE version = 5 → 0 rows updated (version is now 6)
→ Thread B gets OptimisticLockException → must re-read and retry
```

### JPA implementation

```java
@Entity
public class Product {
    @Id
    private Long id;
    private String name;
    private BigDecimal price;

    @Version  // JPA manages version automatically
    private Long version;
}
```

```java
@Transactional
public void updatePrice(Long productId, BigDecimal newPrice) {
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new EntityNotFoundException());

    product.setPrice(newPrice);
    // On save: JPA checks version, throws OptimisticLockException if mismatch
    productRepository.save(product);
}
```

---

## Pessimistic Locking — assume conflict

Lock the row immediately on read. Other transactions that try to lock the same row are blocked.

**Best for:** High-contention data. Conflicts are frequent and expensive to retry.

```
Thread A: SELECT ... FOR UPDATE → acquires lock on row
Thread B: SELECT ... FOR UPDATE → BLOCKS until Thread A commits/rolls back
Thread A: updates, commits → releases lock
Thread B: continues now
```

### JPA implementation

```java
@Transactional
public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
    // Lock both accounts immediately — no one else can touch them
    Account from = accountRepository.findById(fromId, LockModeType.PESSIMISTIC_WRITE);
    Account to   = accountRepository.findById(toId,   LockModeType.PESSIMISTIC_WRITE);

    from.debit(amount);
    to.credit(amount);
    // Locks released on commit
}
```

```java
// In repository
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT a FROM Account a WHERE a.id = :id")
Optional<Account> findByIdForUpdate(@Param("id") Long id);
```

---

## Optimistic vs Pessimistic — comparison

| | Optimistic | Pessimistic |
|--|-----------|------------|
| Lock held? | No | Yes (row-level) |
| Conflict detection | At commit time | Immediately on read |
| Blocking? | No | Yes — others wait |
| Rollback risk | Retry on conflict | No retry needed |
| Throughput | High (no blocking) | Lower (threads wait) |
| Best for | Low contention, reads >> writes | High contention, must not fail |
| Example | Product catalog updates | Bank transfers, inventory |

---

## Deadlock in databases

Two transactions each hold a lock the other needs — both wait forever.

```
Transaction A:
  LOCK row 1 (users table)
  ... (waits for) ...
  LOCK row 2 (orders table)  ← blocked by Transaction B

Transaction B:
  LOCK row 2 (orders table)
  ... (waits for) ...
  LOCK row 1 (users table)   ← blocked by Transaction A
```

**Prevention:**
1. **Lock in consistent order** — always lock users before orders, never the reverse
2. **Keep transactions short** — hold locks for minimal time
3. **Use optimistic locking** when possible — no locks to deadlock on
4. **Set lock timeout** — rather than waiting indefinitely, fail and retry

---

## @Transactional in Spring — important details

```java
@Service
public class OrderService {

    // propagation: what happens when a transactional method calls another
    @Transactional(propagation = Propagation.REQUIRED)   // default: join existing or create new
    @Transactional(propagation = Propagation.REQUIRES_NEW) // always create new transaction
    @Transactional(propagation = Propagation.SUPPORTS)   // use existing or no transaction

    // readOnly: optimization hint — no dirty tracking, no flush on commit
    @Transactional(readOnly = true)
    public List<Order> getOrders() { ... }

    // rollbackFor: by default, Spring only rolls back on RuntimeException
    @Transactional(rollbackFor = Exception.class)  // also rollback on checked exceptions
    public void placeOrder() throws Exception { ... }
}
```

### Common @Transactional pitfall — self-invocation

```java
@Service
public class OrderService {

    @Transactional
    public void placeOrder() {
        // ... places order ...
        sendConfirmation(); // calls THIS class's method — @Transactional IGNORED!
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendConfirmation() {
        // This @Transactional is ignored when called from within the same class
        // Spring's proxy doesn't intercept internal calls
    }
}

// Fix: inject the service into itself, or extract to a separate @Service
```

---

## Interview answers

### What are the ACID properties?
**Atomicity**: a transaction is all-or-nothing. **Consistency**: the DB moves from one valid state to another. **Isolation**: concurrent transactions don't interfere. **Durability**: committed data survives crashes.

### What is a dirty read?
Reading data written by a transaction that hasn't committed yet. If that transaction rolls back, you read data that never actually existed. Prevented by READ COMMITTED isolation level and above.

### What is the difference between optimistic and pessimistic locking?
Optimistic locking assumes conflicts are rare — no lock is held, but a version check at commit time detects conflicts (causing a retry). Pessimistic locking assumes conflicts are likely — a row lock is acquired immediately on read, blocking other writers. Use optimistic for low-contention reads; pessimistic for high-contention financial operations.

### What isolation level would you use for financial transactions?
SERIALIZABLE for the strictest guarantees, or at minimum REPEATABLE READ. For bank transfers, I'd use pessimistic locking with REPEATABLE READ to ensure the balances I read can't change before I write.

### What is a deadlock and how do you prevent it?
Two transactions each waiting for a lock the other holds — both stuck forever. Prevent by: always acquiring locks in the same order, keeping transactions short, using optimistic locking when possible, and setting a lock timeout.

### What is the default behavior of @Transactional in Spring?
It joins an existing transaction if one exists, or creates a new one. It rolls back only on RuntimeException by default (not checked exceptions). Internal method calls within the same class bypass the proxy, so @Transactional on those methods has no effect — a common pitfall.
