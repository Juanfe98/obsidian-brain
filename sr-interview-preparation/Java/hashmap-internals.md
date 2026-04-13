# HashMap Internals

## Glossary

| Term | Meaning |
|------|---------|
| **Bucket** | A slot in the internal array of a HashMap. Each bucket holds one or more entries |
| **Hash function** | Converts a key into a number (the hash) used to find the right bucket |
| **Collision** | Two different keys produce the same bucket index — both entries land in the same bucket |
| **Linked list** | A chain of nodes — how HashMap handles collisions (before Java 8) |
| **Red-Black Tree** | A self-balancing tree — how HashMap handles collisions when a bucket gets too full (Java 8+) |
| **Load factor** | A threshold (default 0.75) — when 75% of buckets are filled, the map resizes |
| **Rehashing** | When the map grows, all entries are redistributed into a new larger array |
| **Capacity** | The number of buckets in the internal array. Default is 16 |

---

## How HashMap works internally

Most developers use HashMap as a black box. Senior engineers understand what's inside.

### The internal structure

A HashMap is backed by an **array of buckets**. Each bucket can hold multiple entries.

```
Internal array (default size 16):
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │ ...
└──┬──┴─────┴─────┴──┬──┴─────┴──┬──┴─────┴─────┘
   │                 │            │
 Entry             Entry        Entry → Entry (collision)
("Juan"→95)    ("Maria"→88)  ("Carlos"→92, "Ana"→78)
```

---

## Step by step — what happens when you call put()

```java
map.put("Juan", 95);
```

**Step 1 — compute hashCode()**
Java calls `"Juan".hashCode()` to get an integer. E.g. `2364776`

**Step 2 — find the bucket index**
The hash is mapped to a bucket index:
```java
index = hashCode & (capacity - 1)  // fast version of hashCode % capacity
// e.g. 2364776 & 15 = 8  → goes to bucket 8
```

**Step 3 — store the entry**
The key-value pair is stored in bucket 8.

**Step 4 — collision handling**
If another key maps to the same bucket:
- Java chains the new entry to the existing one
- Before Java 8: as a **linked list**
- Java 8+: as a linked list, but converts to a **Red-Black Tree** if the bucket has more than 8 entries (much faster lookups)

---

## Step by step — what happens when you call get()

```java
map.get("Juan");
```

1. Compute `"Juan".hashCode()` → same hash as before
2. Find the bucket index → same bucket 8
3. Look through the entries in bucket 8, comparing keys with `equals()`
4. Return the matching value → `95`

This is why **both hashCode() and equals() must be correct**:
- `hashCode()` finds the right bucket (fast)
- `equals()` confirms the right entry within the bucket

---

## Load factor and resizing

Default capacity = **16 buckets**
Default load factor = **0.75**

When the map is **75% full** (12 entries for a 16-bucket map):
1. A new array of **double the size** (32 buckets) is created
2. All existing entries are **rehashed** and redistributed
3. This is expensive — O(n) — but happens infrequently

```java
// You can set initial capacity if you know the size in advance
// Avoids expensive resizing
Map<String, Integer> map = new HashMap<>(100); // start with 100 buckets
```

---

## Time complexity

| Operation | Average case | Worst case (all in one bucket) |
|-----------|-------------|-------------------------------|
| put() | O(1) | O(n) |
| get() | O(1) | O(n) — O(log n) with tree (Java 8+) |
| remove() | O(1) | O(n) |

In practice, with a good hashCode() → always O(1).

---

## What makes a good hashCode()?

A good hash function distributes keys **evenly** across buckets.
Bad distribution → many collisions → performance degrades.

```java
// BAD — always returns the same hash — everything lands in one bucket
@Override
public int hashCode() {
    return 42; // technically valid, but O(n) for all operations
}

// GOOD — uses the actual data to produce a well-distributed hash
@Override
public int hashCode() {
    return Objects.hash(name, age); // Java's built-in, well-distributed
}
```

---

## HashMap vs Hashtable vs ConcurrentHashMap

| | HashMap | Hashtable | ConcurrentHashMap |
|---|---------|-----------|-------------------|
| Thread-safe | No | Yes (synchronized) | Yes (lock striping) |
| Null keys | 1 allowed | Not allowed | Not allowed |
| Performance | Fast | Slow (full lock) | Fast (partial lock) |
| Use when | Single thread | Legacy code | Multi-thread |

> In modern code: use **HashMap** for single-threaded, **ConcurrentHashMap** for multi-threaded.
> Hashtable is legacy — avoid it.

---

## Interview answers

### How does HashMap work internally?
It uses an array of buckets. When you put a key-value pair, Java computes the key's hashCode(), maps it to a bucket index, and stores the entry there. On get(), it recomputes the hash to find the bucket, then uses equals() to find the exact entry.

### What happens when two keys have the same hashCode()?
A collision — both entries land in the same bucket. Before Java 8, they were stored as a linked list. Java 8+ converts the list to a Red-Black Tree when a bucket exceeds 8 entries, improving worst-case lookup from O(n) to O(log n).

### What is the load factor in HashMap?
The threshold that triggers resizing. Default is 0.75 — when 75% of buckets are filled, the internal array doubles in size and all entries are rehashed.

### Why is HashMap not thread-safe?
Multiple threads can modify the internal array simultaneously — causing data corruption or infinite loops during rehashing. Use ConcurrentHashMap for thread-safe operations.
