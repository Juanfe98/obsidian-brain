# SQL & Indexes

## Glossary

| Term | Meaning |
|------|---------|
| **Index** | A data structure that speeds up row lookups at the cost of extra storage and slower writes |
| **B-tree index** | The default index type — a balanced tree sorted by key value. Good for range and equality queries |
| **Hash index** | Only supports equality (`=`) — no range queries. Faster than B-tree for exact lookups |
| **Composite index** | An index on multiple columns — leftmost prefix rule applies |
| **Covering index** | Index that includes all columns needed by a query — no need to touch the actual table |
| **Cardinality** | Number of distinct values in a column. High cardinality = better index candidate |
| **Full table scan** | Reading every row in the table — happens when no index can be used |
| **EXPLAIN** | SQL command that shows the query execution plan — tells you if indexes are used |
| **Index selectivity** | How many rows are filtered out by the index. High selectivity = fewer rows returned |
| **Query planner** | The DB engine component that decides how to execute a query (which index to use) |

---

## How indexes work — B-tree

Without an index, finding all users with email "juan@test.com" requires scanning every row:

```sql
SELECT * FROM users WHERE email = 'juan@test.com';
-- Without index: O(n) — reads all 1,000,000 rows
-- With index:    O(log n) — traverses B-tree, ~20 steps for 1M rows
```

A B-tree index on `email` stores sorted email values with pointers to table rows.
The database navigates the tree in O(log n) instead of scanning O(n) rows.

```
B-tree structure:
                [m]
               /   \
          [d, j]   [r, z]
         /  |  \   /  |  \
       [a] [e][k] [n][s] [w]
```

---

## Types of indexes

### Primary key index (always exists)
Every table has a primary key index. Rows are physically ordered by PK (clustered index in MySQL InnoDB).

### Unique index
Enforces uniqueness AND speeds up lookups.
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
-- Equivalent to: ALTER TABLE users ADD UNIQUE (email);
```

### Regular (non-unique) index
Speeds up lookups without enforcing uniqueness.
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### Composite index — multiple columns
```sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

**The leftmost prefix rule:** a composite index (A, B, C) is usable for:
- Queries filtering on A
- Queries filtering on A + B
- Queries filtering on A + B + C

But NOT usable for:
- Queries filtering only on B (skipped A)
- Queries filtering only on C

```sql
-- Index on (user_id, status, created_at)
SELECT * FROM orders WHERE user_id = 1;                       -- ✅ uses index (leftmost)
SELECT * FROM orders WHERE user_id = 1 AND status = 'OPEN';   -- ✅ uses index (A + B)
SELECT * FROM orders WHERE user_id = 1 AND status = 'OPEN' AND created_at > '2024-01-01'; -- ✅ (A+B+C)
SELECT * FROM orders WHERE status = 'OPEN';                   -- ❌ skips user_id (first col)
SELECT * FROM orders WHERE created_at > '2024-01-01';         -- ❌ skips user_id and status
```

### Covering index
An index that includes all columns the query needs — the DB never has to touch the actual table rows.

```sql
-- Query: get user_id and status for recent orders
SELECT user_id, status FROM orders WHERE created_at > '2024-01-01';

-- Covering index: includes all selected columns + WHERE column
CREATE INDEX idx_covering ON orders(created_at, user_id, status);
-- DB reads only the index, never touches the table → fastest possible
```

---

## EXPLAIN — reading the query plan

Always use `EXPLAIN` (or `EXPLAIN ANALYZE` in PostgreSQL) to understand what the DB is doing.

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 123 AND status = 'PENDING';
```

### Key fields to look for

| Field | Bad sign | Good sign |
|-------|----------|-----------|
| `type` | `ALL` (full scan) | `ref`, `range`, `const` |
| `rows` | Large number | Small number |
| `key` | `NULL` (no index used) | Index name |
| `Extra` | `Using filesort`, `Using temporary` | `Using index` (covering) |

```sql
-- Example output (MySQL)
+----+-------------+--------+------+---------------+---------+---------+-------+------+-------------+
| id | select_type | table  | type | possible_keys | key     | key_len | ref   | rows | Extra       |
+----+-------------+--------+------+---------------+---------+---------+-------+------+-------------+
|  1 | SIMPLE      | orders | ref  | idx_user_id   | idx_user_id | 8   | const |   15 | Using where |
```

- `type = ref` → good, using index
- `rows = 15` → only 15 rows examined
- `key = idx_user_id` → this index is being used

---

## Common query optimization techniques

### 1. Select only what you need

```sql
-- BAD: loads all columns, possibly large text fields
SELECT * FROM users WHERE id = 1;

-- GOOD: load only needed columns
SELECT id, name, email FROM users WHERE id = 1;
```

### 2. Use indexed columns in WHERE and JOIN

```sql
-- BAD: no index on last_login_date → full scan
SELECT * FROM users WHERE last_login_date > '2024-01-01';

-- FIX: add index
CREATE INDEX idx_users_last_login ON users(last_login_date);
```

### 3. Avoid functions on indexed columns

```sql
-- BAD: wrapping column in a function disables index usage
SELECT * FROM users WHERE YEAR(created_at) = 2024;
SELECT * FROM users WHERE LOWER(email) = 'juan@test.com';

-- GOOD: restructure to use the column directly
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
-- For email: store lowercase, or use a functional index
```

### 4. LIMIT for pagination

```sql
-- Offset pagination (slow for large offsets)
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
-- → DB scans 10,020 rows and discards 10,000

-- Keyset pagination (fast — uses index)
SELECT * FROM orders WHERE created_at < :lastSeenDate ORDER BY created_at DESC LIMIT 20;
-- → DB uses index to jump directly to the right position
```

### 5. Use JOINs instead of subqueries (usually)

```sql
-- Correlated subquery (runs N times, once per outer row) — SLOW
SELECT * FROM orders o
WHERE o.user_id IN (SELECT id FROM users WHERE status = 'ACTIVE');

-- JOIN (runs once, optimizer can use indexes properly) — FAST
SELECT o.* FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.status = 'ACTIVE';
```

---

## When indexes hurt

Indexes are not free:

- **Slower writes:** every INSERT, UPDATE, DELETE must update all indexes
- **More storage:** indexes take disk space
- **Index maintenance:** fragmentation over time

**Don't index:**
- Columns with very low cardinality (e.g., `is_deleted BOOLEAN` — only 2 values, full scan faster)
- Columns rarely used in WHERE/JOIN
- Small tables (full scan may be faster than index lookup)

---

## Normalization — quick reference

| Form | Rule |
|------|------|
| **1NF** | No repeating groups — each column holds atomic values, each row is unique |
| **2NF** | 1NF + no partial dependencies — every non-key column depends on the whole PK |
| **3NF** | 2NF + no transitive dependencies — non-key columns depend only on the PK, not other non-key columns |

```
Violation of 3NF example:
orders(order_id, customer_id, customer_name, customer_city)
customer_name and customer_city depend on customer_id (not order_id)
→ transitive dependency → should be in a customers table
```

---

## Interview answers

### What is a database index and how does it work?
An index is a sorted data structure (usually a B-tree) that allows the database to find rows without scanning the entire table. Instead of O(n) row scans, indexed lookups are O(log n). The trade-off: indexes speed up reads but slow down writes (INSERT/UPDATE/DELETE must update all indexes).

### What is a composite index and what is the leftmost prefix rule?
A composite index covers multiple columns. The leftmost prefix rule says the index is only usable when the query's WHERE clause includes the leftmost column(s) of the index. An index on (A, B, C) supports queries on A, A+B, and A+B+C, but not queries that start with B or C.

### What is a covering index?
An index that contains all the columns a query needs. The database can satisfy the entire query from the index without touching the main table rows — significantly faster.

### How do you identify a slow query?
Use EXPLAIN to see the query execution plan. Look for `type = ALL` (full table scan), `key = NULL` (no index used), large `rows` count, or `Extra = Using filesort` (sorting without index). Then add or modify indexes based on what's missing.

### Why should you avoid functions on indexed columns in WHERE?
Wrapping a column in a function (like `YEAR(date)` or `LOWER(email)`) prevents the query planner from using the index on that column because the index stores the raw column values, not the function results.
