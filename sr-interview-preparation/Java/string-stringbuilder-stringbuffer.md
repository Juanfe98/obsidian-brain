# String vs StringBuilder vs StringBuffer

## Glossary

| Term | Meaning |
|------|---------|
| **Immutable** | Cannot be changed after creation — any "change" creates a new object |
| **Mutable** | Can be changed in place without creating a new object |
| **Concatenation** | Joining strings together with `+` |
| **Thread-safe** | Safe to use from multiple threads simultaneously |
| **Synchronized** | Only one thread can access a block at a time — makes it thread-safe but slower |
| **String Pool** | Memory area where Java caches string literals to reuse them |
| **Heap** | Where objects are allocated — new String objects land here |

---

## String — immutable

Every time you "modify" a String, Java creates a **new object**.
The original is never changed.

```java
String s = "Hello";
s = s + " World"; // does NOT modify "Hello" — creates a brand new String "Hello World"
                  // "Hello" is now eligible for garbage collection
```

### Why immutability matters here — the concatenation trap

```java
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i; // creates a NEW String object on every iteration
}
// Creates 10,000 intermediate String objects — very wasteful
```

Each `+=` allocates a new object in memory. For large loops this is a serious performance problem.

---

## StringBuilder — mutable, fast, not thread-safe

`StringBuilder` modifies the same object in place — no new objects created.
Use this for building strings in loops or with many concatenations.

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i); // modifies the same object — no new allocations
}
String result = sb.toString();
```

### Common methods
```java
StringBuilder sb = new StringBuilder("Hello");

sb.append(" World");      // "Hello World"
sb.insert(5, ",");        // "Hello, World"
sb.replace(7, 12, "Java"); // "Hello, Java"
sb.delete(5, 7);          // "Hello Java"
sb.reverse();             // "avaJ olleH"
sb.toString();            // convert back to String
```

### Method chaining
```java
String result = new StringBuilder()
    .append("Hello")
    .append(", ")
    .append("World")
    .append("!")
    .toString(); // "Hello, World!"
```

---

## StringBuffer — mutable, thread-safe, slower

Identical to `StringBuilder` but every method is `synchronized`.
Safe to use from multiple threads — but the synchronization overhead makes it slower.

```java
StringBuffer sb = new StringBuffer();
sb.append("Hello");
sb.append(" World");
String result = sb.toString();
```

---

## Comparison

| | String | StringBuilder | StringBuffer |
|---|--------|--------------|--------------|
| Mutable? | No | Yes | Yes |
| Thread-safe? | Yes (immutable) | No | Yes |
| Performance | Slow for concatenation | Fast | Slower than StringBuilder |
| Use when | Fixed/few concatenations | Single-threaded, many concatenations | Multi-threaded string building |

---

## When to use what

```java
// Few concatenations — String is fine
String greeting = "Hello, " + name + "!";

// Loop / many concatenations — use StringBuilder
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(", ");
}

// Multi-threaded string building — use StringBuffer
StringBuffer sb = new StringBuffer(); // rare in practice
```

> In practice: **String** for simple cases, **StringBuilder** for everything else.
> **StringBuffer** is rarely needed — if you need thread safety, there are better approaches.

---

## Interview answers

### What is the difference between String and StringBuilder?
String is immutable — every modification creates a new object. StringBuilder is mutable — it modifies in place. StringBuilder is much faster for repeated concatenations.

### When would you use StringBuilder over String concatenation?
When building a string in a loop or combining many strings — String concatenation in a loop creates thousands of temporary objects. StringBuilder reuses the same buffer.

### What is the difference between StringBuilder and StringBuffer?
Both are mutable. StringBuffer is synchronized (thread-safe) but slower. StringBuilder is not thread-safe but faster. Use StringBuilder unless you specifically need thread safety.
