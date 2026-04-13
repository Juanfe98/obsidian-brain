# Java Collections

## Glossary

| Term | Meaning |
|------|---------|
| **Collection** | A container object that holds multiple elements |
| **Collections Framework** | Java's built-in set of interfaces and classes for storing and manipulating groups of objects |
| **Interface** | A contract — e.g. `List` is an interface, `ArrayList` is a concrete implementation |
| **Generic** | A placeholder type written as `<T>`. E.g. `List<String>` means a list that only holds Strings |
| **Index** | A position number in a list. Starts at 0 |
| **Duplicate** | Two elements that are equal. Some collections allow them, some don't |
| **Order** | Whether elements maintain their insertion sequence |
| **Key-Value pair** | A Map entry — a key maps to a value. Like a dictionary word (key) and its definition (value) |
| **Hash** | A number computed from an object, used to quickly find it in memory |
| **Null** | The absence of a value |
| **Iteration** | Going through each element one by one |
| **Capacity** | The internal size of the underlying array. Grows automatically when needed |

---

## The big picture — Collection hierarchy

```
Iterable
└── Collection
    ├── List        → ordered, allows duplicates
    │   ├── ArrayList
    │   └── LinkedList
    ├── Set         → no duplicates
    │   ├── HashSet
    │   ├── LinkedHashSet
    │   └── TreeSet
    └── Queue       → FIFO order (first in, first out)
        └── LinkedList

Map (NOT a Collection — but part of the framework)
    ├── HashMap
    ├── LinkedHashMap
    └── TreeMap
```

---

## List — ordered, allows duplicates

A List is like a numbered shelf. You can put anything on it, duplicates are fine,
and each item has a position (index) starting at 0.

### ArrayList — the most commonly used

Backed by an array internally. Fast to read by index. Slower to insert/delete in the middle.

```java
List<String> fruits = new ArrayList<>();

fruits.add("Apple");
fruits.add("Banana");
fruits.add("Apple");   // duplicates allowed
fruits.add("Cherry");

System.out.println(fruits);        // [Apple, Banana, Apple, Cherry]
System.out.println(fruits.get(1)); // "Banana" — access by index
System.out.println(fruits.size()); // 4

fruits.remove("Banana");
System.out.println(fruits);        // [Apple, Apple, Cherry]

// Iterate
for (String fruit : fruits) {
    System.out.println(fruit);
}
```

### LinkedList — fast insert/delete, slower random access

Internally a chain of nodes. Each node points to the next.
Better when you frequently add/remove from the middle or ends.

```java
List<String> list = new LinkedList<>();
list.add("A");
list.add("B");
list.add(0, "Z"); // insert at index 0 — fast for LinkedList
```

### ArrayList vs LinkedList

| Operation | ArrayList | LinkedList |
|-----------|-----------|------------|
| Get by index `get(i)` | Fast O(1) | Slow O(n) |
| Add at end | Fast | Fast |
| Add/remove in middle | Slow O(n) | Fast O(1) |
| Memory | Less | More (stores pointers) |
| **Use when** | You read by index frequently | You insert/remove frequently |

> 90% of the time — use `ArrayList`. Only switch to `LinkedList` if you have a specific reason.

---

## Set — no duplicates

A Set is like a bag where each item can only appear once.
If you try to add a duplicate, it is silently ignored.

### HashSet — fastest, no guaranteed order

```java
Set<String> names = new HashSet<>();

names.add("Juan");
names.add("Maria");
names.add("Juan");   // duplicate — ignored silently

System.out.println(names);           // [Maria, Juan] — order not guaranteed
System.out.println(names.size());    // 2
System.out.println(names.contains("Juan")); // true — very fast lookup
```

### LinkedHashSet — no duplicates + insertion order preserved

```java
Set<String> names = new LinkedHashSet<>();
names.add("Charlie");
names.add("Alice");
names.add("Bob");
names.add("Alice"); // ignored

System.out.println(names); // [Charlie, Alice, Bob] — insertion order kept
```

### TreeSet — no duplicates + sorted order

```java
Set<Integer> numbers = new TreeSet<>();
numbers.add(5);
numbers.add(1);
numbers.add(3);
numbers.add(1); // ignored

System.out.println(numbers); // [1, 3, 5] — automatically sorted
```

### HashSet vs LinkedHashSet vs TreeSet

| | HashSet | LinkedHashSet | TreeSet |
|---|---------|--------------|---------|
| Duplicates | No | No | No |
| Order | None | Insertion order | Sorted |
| Speed | Fastest | Slightly slower | Slowest |
| **Use when** | Just need uniqueness | Need order + uniqueness | Need sorted + uniqueness |

---

## Map — key/value pairs

A Map is like a dictionary. Every entry has a unique key and a value.
You use the key to look up the value — like looking up a word to find its definition.

Maps are NOT part of the `Collection` interface but are in the Collections Framework.

### HashMap — most common, no guaranteed order

```java
Map<String, Integer> scores = new HashMap<>();

scores.put("Juan", 95);
scores.put("Maria", 88);
scores.put("Carlos", 92);
scores.put("Juan", 99);   // key already exists — value is updated

System.out.println(scores);              // {Carlos=92, Juan=99, Maria=88}
System.out.println(scores.get("Maria")); // 88
System.out.println(scores.get("Pedro")); // null — key doesn't exist
System.out.println(scores.containsKey("Juan")); // true
System.out.println(scores.size());       // 3

// Safe get with default value
int score = scores.getOrDefault("Pedro", 0); // 0 — instead of null

// Iterate over entries
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + " → " + entry.getValue());
}
```

### LinkedHashMap — insertion order preserved

```java
Map<String, String> capitals = new LinkedHashMap<>();
capitals.put("France", "Paris");
capitals.put("Japan", "Tokyo");
capitals.put("Brazil", "Brasília");

System.out.println(capitals); // {France=Paris, Japan=Tokyo, Brazil=Brasília} — order kept
```

### TreeMap — sorted by key

```java
Map<String, Integer> sorted = new TreeMap<>();
sorted.put("Banana", 2);
sorted.put("Apple", 5);
sorted.put("Cherry", 1);

System.out.println(sorted); // {Apple=5, Banana=2, Cherry=1} — sorted alphabetically
```

### HashMap vs LinkedHashMap vs TreeMap

| | HashMap | LinkedHashMap | TreeMap |
|---|---------|--------------|---------|
| Key order | None | Insertion order | Sorted by key |
| Speed | Fastest | Slightly slower | Slower |
| Null keys | 1 allowed | 1 allowed | Not allowed |
| **Use when** | Just need key/value lookup | Need ordered iteration | Need keys sorted |

---

## Choosing the right collection — decision guide

```
Do you need key → value lookup?
    YES → Map
        Need sorted keys?     → TreeMap
        Need insertion order? → LinkedHashMap
        Just fast lookup?     → HashMap  ✓ (default)

    NO → Do you need to avoid duplicates?
        YES → Set
            Need sorted?          → TreeSet
            Need insertion order? → LinkedHashSet
            Just fast + unique?   → HashSet  ✓ (default)

        NO → List
            Frequent index access?     → ArrayList  ✓ (default)
            Frequent insert in middle? → LinkedList
```

---

## Real-world examples

### Counting word frequency (HashMap)
```java
String[] words = {"apple", "banana", "apple", "cherry", "banana", "apple"};

Map<String, Integer> frequency = new HashMap<>();

for (String word : words) {
    frequency.put(word, frequency.getOrDefault(word, 0) + 1);
}

System.out.println(frequency); // {apple=3, banana=2, cherry=1}
```

### Remove duplicates from a list (HashSet)
```java
List<Integer> withDuplicates = List.of(1, 2, 2, 3, 3, 3, 4);
Set<Integer> unique = new HashSet<>(withDuplicates);

System.out.println(unique); // [1, 2, 3, 4]
```

### Group users by role (Map of Lists)
```java
Map<String, List<String>> usersByRole = new HashMap<>();

usersByRole.put("ADMIN", List.of("Juan", "Maria"));
usersByRole.put("USER", List.of("Carlos", "Ana", "Pedro"));

System.out.println(usersByRole.get("ADMIN")); // [Juan, Maria]
```

---

## Important: always declare using the interface type

```java
// Good — declared as interface, implemented as ArrayList
List<String> names = new ArrayList<>();

// Bad — declared as concrete class
ArrayList<String> names = new ArrayList<>();
```

Why? If you later need to switch from `ArrayList` to `LinkedList`,
you only change one word. The rest of your code doesn't change.
This is abstraction in practice.

---

## Thread safety warning

The standard collections (`ArrayList`, `HashMap`, `HashSet`) are **NOT thread-safe**.
If multiple threads access them simultaneously you can get corrupted data.

For concurrent use:
```java
// Thread-safe alternatives
List<String> list = Collections.synchronizedList(new ArrayList<>());
Map<String, Integer> map = new ConcurrentHashMap<>();
```

---

## Interview answers

### What is the difference between List, Set, and Map?
List is ordered and allows duplicates. Set does not allow duplicates. Map stores key-value pairs with unique keys. List and Set implement Collection; Map does not.

### What is the difference between ArrayList and LinkedList?
ArrayList is backed by an array — fast for random access by index. LinkedList is a chain of nodes — fast for insertions and deletions in the middle. ArrayList is the default choice in most cases.

### What is the difference between HashMap and TreeMap?
HashMap has no guaranteed order and is faster. TreeMap keeps keys sorted and is slightly slower. Use TreeMap when you need sorted keys.

### What is the difference between HashSet and TreeSet?
HashSet is faster with no ordering. TreeSet keeps elements sorted. Both reject duplicates.

### Can a HashMap have a null key?
Yes — HashMap allows one null key and multiple null values. TreeMap does not allow null keys.

### Why should you declare collections using the interface type?
To reduce coupling. If you declare `List<String>` instead of `ArrayList<String>`, you can swap the implementation without changing the rest of the code.

### Are Java collections thread-safe?
No — ArrayList, HashMap, HashSet are not thread-safe. Use ConcurrentHashMap or Collections.synchronizedList() for concurrent access.
