# Database — Interview Preparation

Senior engineers are expected to understand databases beyond basic CRUD.
Interviewers test query optimization, indexing strategy, transaction handling, and ORM pitfalls.

---

## Files in this folder

| File | Topics |
|------|--------|
| `sql-and-indexes.md` | Query optimization, index types, EXPLAIN, common pitfalls |
| `transactions-and-locking.md` | ACID, isolation levels, dirty read, deadlock, optimistic vs pessimistic locking |
| `jpa-best-practices.md` | N+1 problem, fetch strategies, @Transactional, common JPA mistakes |

---

## Quick reference

| Concept | Key point |
|---------|-----------|
| Index | Speeds up reads, slows writes. Use on columns in WHERE, JOIN, ORDER BY |
| Composite index | Column order matters — leftmost prefix rule |
| N+1 problem | 1 query + N queries for related data. Fix with JOIN FETCH or @EntityGraph |
| Isolation levels | READ COMMITTED is the safe default. SERIALIZABLE is slowest but safest |
| Optimistic locking | Use @Version — good for low-contention, fails fast on conflict |
| Pessimistic locking | Use SELECT FOR UPDATE — good for high-contention, holds DB lock |
| EXPLAIN | Shows query execution plan — use it to find missing indexes |
