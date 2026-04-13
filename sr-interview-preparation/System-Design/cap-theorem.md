# CAP Theorem & Consistency

## Glossary

| Term | Meaning |
|------|---------|
| **CAP theorem** | A distributed system can only guarantee 2 of 3: Consistency, Availability, Partition tolerance |
| **Consistency** | Every read gets the most recent write — all nodes see the same data at the same time |
| **Availability** | Every request gets a response (not necessarily the latest data) — system is always up |
| **Partition tolerance** | System continues operating even when network partitions (nodes can't communicate) occur |
| **Network partition** | A communication failure between nodes in a distributed system |
| **Eventual consistency** | All nodes will converge to the same value — eventually (not immediately) |
| **Strong consistency** | Every read reflects the most recent write — always, everywhere |
| **ACID** | Atomicity, Consistency, Isolation, Durability — traditional database guarantees |
| **BASE** | Basically Available, Soft state, Eventually consistent — distributed system alternative to ACID |
| **Replication lag** | Delay between a write to the primary and propagation to replicas |

---

## The CAP Theorem

**In a distributed system, you can only guarantee 2 of these 3 properties:**

```
        Consistency (C)
           /     \
          /       \
         /   ??? \
        /           \
Availability (A) — Partition Tolerance (P)
```

### Why you can't have all three

When a network partition occurs (nodes can't talk to each other), you must choose:

**Option A — Sacrifice Availability (CP system):**
Stop serving requests until the partition heals (to avoid returning stale data).
→ Consistent but unavailable during partition.

**Option B — Sacrifice Consistency (AP system):**
Continue serving requests even if data might be stale.
→ Available but possibly inconsistent during partition.

### The key insight: Partition Tolerance is not optional

Network partitions happen in any real distributed system — cables fail, routers drop packets.
You MUST tolerate partitions. So the real choice is:

> **CP vs AP — when a partition happens, do you prioritize Consistency or Availability?**

---

## CP Systems — Consistency over Availability

When a partition occurs, the system refuses to serve stale data.
Some nodes may become unavailable until consistency is restored.

```
[Node A] --- PARTITION --- [Node B]

Client requests data from Node B:
→ Node B can't confirm it has the latest data from Node A
→ Node B returns an ERROR or waits → unavailable
→ Data is consistent when available
```

**Examples:** HBase, Zookeeper, etcd, MongoDB (in strong consistency mode)
**Use when:** Financial transactions, inventory management, user account balances

---

## AP Systems — Availability over Consistency

When a partition occurs, nodes keep serving requests — but data may be stale or divergent.
Nodes sync up when the partition heals (eventual consistency).

```
[Node A] --- PARTITION --- [Node B]

User writes "count = 10" to Node A.
Another user reads from Node B → gets old value "count = 8"
After partition heals → both nodes sync to "count = 10"
```

**Examples:** Cassandra, DynamoDB, CouchDB, DNS
**Use when:** Social media likes/views, shopping carts, user preferences, search indexes

---

## Consistency Models spectrum

```
Strong Consistency ←────────────────────────────────→ Eventual Consistency

Linearizability → Sequential → Causal → Read-your-writes → Eventual
   (strongest)                                              (weakest)
```

| Model | Guarantee | Example |
|-------|-----------|---------|
| **Linearizability** | Reads reflect most recent write globally | Single-node DB |
| **Sequential consistency** | All nodes see operations in same order | Zookeeper |
| **Causal consistency** | Causally related operations are seen in order | MongoDB causal sessions |
| **Read-your-writes** | You always read what you just wrote | "Read from primary" in replicated DB |
| **Eventual consistency** | All nodes will converge, but may diverge temporarily | DynamoDB, Cassandra |

---

## Eventual Consistency in practice

Eventual consistency means: "if no new updates occur, all replicas will eventually converge to the same value."

**Scenario: social media likes**
```
User clicks Like on a post
→ Write goes to US-EAST replica: count = 1001
→ EU-WEST replica still shows: count = 1000  (replication lag ~100ms)
→ After sync: both show count = 1001
```

This is acceptable — seeing a like count that's off by 1 for 100ms is fine.

**Scenario: bank balance** (NOT acceptable for eventual consistency)
```
User has $100
User initiates withdrawal of $100 in New York
Same user initiates withdrawal of $100 in London (during partition)
Both succeed: user gets $200, account goes to -$100
```
→ Financial systems require strong consistency.

---

## ACID vs BASE

### ACID — traditional relational databases

| Property | Meaning |
|----------|---------|
| **Atomicity** | Transaction is all-or-nothing — either all operations succeed or all roll back |
| **Consistency** | DB always moves from one valid state to another — constraints are never violated |
| **Isolation** | Concurrent transactions don't interfere — each sees a consistent snapshot |
| **Durability** | Once committed, data survives crashes — written to disk |

### BASE — distributed NoSQL systems

| Property | Meaning |
|----------|---------|
| **Basically Available** | System responds to every request (may be stale or partial) |
| **Soft state** | State may change over time even without new input (due to replication) |
| **Eventually consistent** | System will reach consistency across all nodes — eventually |

### ACID vs BASE comparison

| | ACID | BASE |
|--|------|------|
| Priority | Correctness | Availability |
| Use case | Financial, inventory, user accounts | Social, analytics, content |
| Examples | MySQL, PostgreSQL, Oracle | Cassandra, DynamoDB, MongoDB |
| Consistency | Strong | Eventual |
| Performance trade-off | Lower throughput (locks, 2PC) | Higher throughput (no locks) |

---

## Database replication and consistency

Most relational databases offer **primary-replica replication**.

```
         Client
           │
   ┌───────┴───────┐
   ↓               ↓
[Primary DB]  [Replica 1]  [Replica 2]
   │
   └──── replicates ──────► [Replica 1]
                  └────────► [Replica 2]
```

- **Writes** → always go to Primary
- **Reads** → can go to any Replica

**Problem: replication lag**
Replicas are slightly behind the primary. A user might write a record and immediately read from a replica that doesn't have it yet.

**Solutions:**
- **Read-your-writes**: route reads to primary for the same user after they write
- **Sticky sessions**: route the same user to the same replica temporarily
- **Synchronous replication**: wait for replica to confirm before committing (strong consistency, slower writes)

---

## Interview answers

### What is the CAP theorem?
A distributed system can guarantee at most 2 of 3 properties: Consistency (every read gets the latest write), Availability (every request gets a response), and Partition Tolerance (system works despite network failures). Since network partitions are unavoidable, the real trade-off is between Consistency and Availability when a partition occurs.

### Give examples of CP and AP systems.
CP: Zookeeper, HBase, etcd — they refuse to serve potentially stale data. AP: Cassandra, DynamoDB, CouchDB — they keep serving even if data might be temporarily inconsistent.

### What is eventual consistency?
A consistency model where all nodes will eventually converge to the same value, but may be temporarily out of sync. Acceptable for non-critical data like likes, views, or preferences. Not acceptable for financial or inventory data.

### What is the difference between ACID and BASE?
ACID (used by relational DBs) prioritizes correctness: transactions are atomic, consistent, isolated, and durable. BASE (used by distributed NoSQL) prioritizes availability: the system is basically available, state is soft, and consistency is eventual. Choose ACID for financial data; BASE for high-throughput, eventually consistent use cases.

### When would you choose eventual consistency?
When availability is more important than immediate accuracy: social media counters (likes, views), product search indexes, user preferences, shopping carts. Any data where being slightly out of date for a few hundred milliseconds is acceptable.
