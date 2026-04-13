# Immutability

## Glossary

| Term | Meaning |
|------|---------|
| **Immutable object** | An object whose state cannot be changed after it is constructed |
| **Mutable object** | An object whose state can change after construction (setters, add, remove, etc.) |
| **Defensive copy** | Creating a new copy of a mutable object before storing or returning it, so the original can't be modified from outside |
| **Value object** | An object defined entirely by its data, not its identity — immutability is a natural fit |
| **String pool** | A JVM cache of String literals — only works because String is immutable (shared safely) |
| **Unmodifiable collection** | A wrapper that blocks modification operations — but the underlying collection can still change |
| **Immutable collection** | A collection that truly cannot be changed — no wrapper, no reference to a mutable original |

---

## What immutability means

An immutable object is one that, once created, **never changes**. Every field is set in the constructor and never modified after that. There are no setters, no `add()`, no `remove()` — nothing that alters internal state.

**The key mental model:** after construction, an immutable object is frozen. You can share it freely — across threads, across classes, across calls — and nothing can break it.

Contrast with mutable objects:
```java
// Mutable — state can change at any time
List<String> names = new ArrayList<>();
names.add("Juan");   // OK
names.remove("Juan"); // OK — state changed

// Immutable — state is fixed at creation
String name = "Juan";
name.toUpperCase(); // does NOT change name — returns a NEW String
// name is still "Juan"
```

---

## Why immutability matters

### 1. Thread safety — no synchronization needed

A mutable object shared across threads requires locks to prevent race conditions.
An immutable object can be shared across any number of threads with zero synchronization — there's nothing to protect because nothing can change.

```java
// Mutable shared state — needs synchronization
public class Counter {
    private int count = 0;
    public synchronized void increment() { count++; } // lock needed
}

// Immutable — no synchronization needed, ever
public final class Config {
    private final String apiUrl;
    private final int timeout;

    public Config(String apiUrl, int timeout) {
        this.apiUrl = apiUrl;
        this.timeout = timeout;
    }

    public String getApiUrl() { return apiUrl; }
    public int getTimeout()   { return timeout; }
    // Nothing can change — safe to share across all threads
}
```

### 2. Safe as HashMap keys and HashSet elements

`HashMap` and `HashSet` rely on `hashCode()` being stable. If an object's fields change after it's been added to a map, its hashCode changes — the map can no longer find it.

Immutable objects are perfect keys because their state (and therefore their hashCode) never changes.

### 3. Easier to reason about

With mutable objects, you have to track *when* and *where* state changes throughout the code.
With immutable objects, a value is what it is — always. No surprises, no need to trace mutations.

### 4. Safe sharing without defensive copies

With mutable objects, you often need to return a copy to prevent callers from modifying your internals. With immutable objects, you can return the object directly — nobody can mutate it.

---

## How to build an immutable class

Five rules:

```java
// 1. Make the class final — prevents subclasses from adding mutable state
public final class Money {

    // 2. Make all fields private and final — can't be changed after assignment
    private final int amount;
    private final String currency;

    // 3. Initialize all fields in the constructor only
    public Money(int amount, String currency) {
        // 4. Defensively copy mutable inputs — don't store references to mutable objects
        this.amount   = amount;              // int is primitive — no copy needed
        this.currency = currency;            // String is already immutable — fine
    }

    // 5. No setters — only getters
    public int getAmount()      { return amount; }
    public String getCurrency() { return currency; }

    // If you need a "modified" version, return a NEW object
    public Money add(int extra) {
        return new Money(this.amount + extra, this.currency); // new object, original unchanged
    }
}
```

### Defensive copy with mutable fields

The tricky part: if a field is a mutable type (array, `Date`, `List`), you must copy it on the way **in** and on the way **out**.

```java
public final class Schedule {
    private final Date startDate; // Date is mutable!

    public Schedule(Date startDate) {
        // Copy on the way IN — don't store the caller's reference
        this.startDate = new Date(startDate.getTime());
    }

    public Date getStartDate() {
        // Copy on the way OUT — don't expose the internal reference
        return new Date(startDate.getTime());
    }
}
```

```java
// Without defensive copy — immutability is broken
public final class ScheduleBroken {
    private final Date startDate;

    public ScheduleBroken(Date startDate) {
        this.startDate = startDate; // stores the caller's reference!
    }
}

Date d = new Date();
ScheduleBroken s = new ScheduleBroken(d);
d.setTime(0); // mutates the date — s.startDate changed! immutability violated
```

---

## Java's built-in immutable types

| Type | Notes |
|------|-------|
| `String` | Immutable since Java 1.0 — powers the String Pool |
| `Integer`, `Long`, `Double`, etc. | All wrapper types are immutable |
| `LocalDate`, `LocalTime`, `LocalDateTime` | The modern date/time API is fully immutable |
| `BigDecimal`, `BigInteger` | Math operations return new instances |
| `Optional<T>` | Immutable wrapper |
| `record` types (Java 16+) | Immutable data carriers by design |

---

## Immutable collections (Java 9+)

### `List.of()`, `Set.of()`, `Map.of()` — truly immutable

```java
// Java 9+ factory methods — truly immutable, throw UnsupportedOperationException on mutation
List<String> roles   = List.of("ADMIN", "USER", "GUEST");
Set<Integer> ids     = Set.of(1, 2, 3);
Map<String, Integer> scores = Map.of("Alice", 100, "Bob", 90);

roles.add("MODERATOR"); // ❌ throws UnsupportedOperationException — truly immutable
```

### `Collections.unmodifiableList()` — NOT the same thing

```java
List<String> original    = new ArrayList<>(List.of("a", "b", "c"));
List<String> unmodifiable = Collections.unmodifiableList(original);

unmodifiable.add("d"); // ❌ throws — you can't modify via the wrapper

original.add("d");     // ✅ original can still be modified
// unmodifiable now reflects the change — it's a VIEW, not a true immutable copy
```

**Key distinction:**
- `List.of()` → no reference to a mutable backing list → truly immutable
- `Collections.unmodifiableList()` → wraps a mutable list → "unmodifiable view", not immutable

---

## Java Records — immutable by design (Java 16+)

Records are a concise way to create immutable data carriers. The compiler generates the constructor, getters, `equals()`, `hashCode()`, and `toString()` automatically.

```java
// All fields are private and final automatically
public record Point(int x, int y) {}

// Equivalent to a full immutable class with:
// - private final int x
// - private final int y
// - canonical constructor
// - getters: x(), y()
// - equals, hashCode, toString

Point p = new Point(10, 20);
p.x();    // 10 — getter (no "get" prefix in records)
p.y();    // 20

// No setters exist — can't mutate a record
// To "change" a value, create a new record
Point moved = new Point(p.x() + 5, p.y());
```

Records are the modern replacement for immutable value objects that previously required a lot of boilerplate.

---

## Immutability vs `final`

A common confusion: `final` on a variable means the **reference** can't be reassigned — it does NOT make the object immutable.

```java
final List<String> list = new ArrayList<>();
list = new ArrayList<>(); // ❌ can't reassign the reference
list.add("item");         // ✅ the list itself is still mutable

final String s = "hello";
s = "world";              // ❌ can't reassign
// s is also immutable — but because String is immutable, not because of final
```

`final` is one tool for achieving immutability (locking field references), but immutability requires all five rules together.

---

## Interview answers

### What is an immutable object?
An object whose state cannot change after construction. All fields are set in the constructor and never modified. No setters, no mutable references exposed. Examples: `String`, `Integer`, `LocalDate`, records.

### Why is immutability important for concurrency?
Immutable objects can be shared across threads with zero synchronization — there is no mutable state to protect. This eliminates race conditions and deadlocks for that data entirely. It's the simplest form of thread safety.

### What is a defensive copy and when do you need it?
A defensive copy is a new copy of a mutable object made to prevent external code from modifying your internals. You need it when an immutable class holds a reference to a mutable type (like `Date` or `List`): copy on the way in (in the constructor) and copy on the way out (in getters).

### What is the difference between Collections.unmodifiableList() and List.of()?
`Collections.unmodifiableList()` wraps a mutable list — the wrapper rejects mutations, but the underlying list can still be modified via the original reference. `List.of()` creates a truly immutable list with no backing mutable list — it cannot be changed by anyone. For true immutability, use `List.of()`.

### What are Java records and how do they relate to immutability?
Records (Java 16+) are immutable data carriers. The compiler automatically generates private final fields, a canonical constructor, getters, `equals`, `hashCode`, and `toString`. They're the modern, concise alternative to writing immutable value classes by hand.

### Is a final variable the same as an immutable object?
No. `final` means the variable's reference cannot be reassigned — it says nothing about what the object itself can do. A `final List` still allows `add()` and `remove()`. Immutability is a property of the object's design, not of how the variable is declared.
