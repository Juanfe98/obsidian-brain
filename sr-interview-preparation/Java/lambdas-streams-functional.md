# Lambdas, Streams & Functional Interfaces

## Glossary

| Term | Meaning |
|------|---------|
| **Functional interface** | An interface with exactly ONE abstract method. Can be used with lambdas |
| **Lambda** | A short, anonymous function you can pass around like a value. No class, no name |
| **Anonymous class** | A class defined and instantiated in one expression — the old way to do what lambdas do now |
| **Method reference** | A shorthand for a lambda that just calls an existing method. Written as `Class::method` |
| **Stream** | A pipeline for processing a sequence of elements — filter, transform, collect |
| **Intermediate operation** | A stream operation that returns another stream. Lazy — doesn't execute until a terminal op |
| **Terminal operation** | A stream operation that produces a result and triggers execution. E.g. `collect`, `forEach` |
| **Lazy evaluation** | Operations are not executed until a terminal operation is called |
| **Pipeline** | Chaining multiple stream operations together |
| **Predicate** | A functional interface that takes a value and returns `boolean`. Used for filtering |
| **Function** | A functional interface that takes a value and returns a transformed value |
| **Consumer** | A functional interface that takes a value and returns nothing. Used for side effects |
| **Supplier** | A functional interface that takes nothing and returns a value |
| **Immutable** | Cannot be changed after creation |

---

## Part 1 — Functional Interfaces

A functional interface is an interface with **exactly one abstract method**.
That single method is what a lambda will implement.

```java
@FunctionalInterface
public interface Greeting {
    void greet(String name); // only one abstract method
}
```

The `@FunctionalInterface` annotation is optional but good practice — it tells the compiler
to enforce the "one method" rule and makes the intent clear.

### The old way — anonymous class
Before lambdas, you implemented a functional interface like this:

```java
Greeting g = new Greeting() {
    @Override
    public void greet(String name) {
        System.out.println("Hello, " + name);
    }
};

g.greet("Juan"); // Hello, Juan
```

This is verbose — 5 lines just to say "print hello".

---

## Part 2 — Lambdas

A lambda is a **short, anonymous function** that implements a functional interface.
It replaces the verbose anonymous class syntax.

### Lambda syntax
```java
(parameters) -> expression
(parameters) -> { statements; }
```

### The same example with a lambda
```java
Greeting g = (name) -> System.out.println("Hello, " + name);
g.greet("Juan"); // Hello, Juan
```

Five lines became one. Same behavior, much cleaner.

### Lambda examples

```java
// No parameters
Runnable r = () -> System.out.println("Running!");

// One parameter — parentheses optional
Greeting g = name -> System.out.println("Hello, " + name);

// Two parameters
Comparator<Integer> comp = (a, b) -> a - b;

// Multiple statements — use curly braces
Greeting g2 = name -> {
    String upper = name.toUpperCase();
    System.out.println("Hello, " + upper + "!");
};

// Returns a value
Comparator<String> byLength = (a, b) -> a.length() - b.length();
```

---

## Part 3 — Built-in Functional Interfaces (java.util.function)

Java provides ready-made functional interfaces so you don't have to create your own.

### Predicate\<T\> — takes T, returns boolean
Used for filtering/testing conditions.

```java
Predicate<String> isLong = s -> s.length() > 5;

isLong.test("Hi");       // false
isLong.test("Hello World"); // true
```

### Function\<T, R\> — takes T, returns R
Used for transforming/mapping values.

```java
Function<String, Integer> length = s -> s.length();

length.apply("Hello"); // 5
length.apply("Java");  // 4
```

### Consumer\<T\> — takes T, returns nothing
Used for side effects — printing, saving, sending.

```java
Consumer<String> print = s -> System.out.println(s);
print.accept("Hello!"); // Hello!
```

### Supplier\<T\> — takes nothing, returns T
Used for providing/generating values.

```java
Supplier<String> greeting = () -> "Hello, World!";
greeting.get(); // "Hello, World!"
```

### BiFunction\<T, U, R\> — takes two inputs, returns R
```java
BiFunction<String, Integer, String> repeat = (s, n) -> s.repeat(n);
repeat.apply("Ha", 3); // "HaHaHa"
```

### Summary table

| Interface | Parameters | Returns | Use case |
|-----------|-----------|---------|----------|
| `Predicate<T>` | T | boolean | Filtering |
| `Function<T,R>` | T | R | Transforming |
| `Consumer<T>` | T | void | Side effects |
| `Supplier<T>` | none | T | Providing values |
| `BiFunction<T,U,R>` | T, U | R | Two-input transform |

---

## Part 4 — Method References

A method reference is an even shorter lambda when your lambda just calls an existing method.

```java
// Lambda
Consumer<String> print = s -> System.out.println(s);

// Method reference — same thing, shorter
Consumer<String> print = System.out::println;
```

### Four types of method references

```java
// 1. Static method
Function<String, Integer> parse = Integer::parseInt;
parse.apply("42"); // 42

// 2. Instance method on a specific object
String prefix = "Hello";
Predicate<String> startsWithHello = prefix::startsWith; // no, this is wrong — see below
// Correct:
Predicate<String> hasPrefix = s -> s.startsWith("Hello");

// 3. Instance method on an arbitrary object of a type
Function<String, String> toUpper = String::toUpperCase;
toUpper.apply("hello"); // "HELLO"

// 4. Constructor reference
Supplier<ArrayList> listFactory = ArrayList::new;
ArrayList list = listFactory.get(); // new ArrayList()
```

---

## Part 5 — Streams

A Stream is a **pipeline for processing collections** of data.
Instead of writing loops, you describe WHAT you want done — Java handles HOW.

```java
// Old way — imperative (you describe HOW)
List<String> result = new ArrayList<>();
for (String name : names) {
    if (name.startsWith("J")) {
        result.add(name.toUpperCase());
    }
}

// Stream way — declarative (you describe WHAT)
List<String> result = names.stream()
    .filter(name -> name.startsWith("J"))
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

### How a stream pipeline works

```
source → intermediate operations (lazy) → terminal operation (triggers execution)

list.stream()
    .filter(...)      ← intermediate — returns a new stream
    .map(...)         ← intermediate — returns a new stream
    .sorted()         ← intermediate — returns a new stream
    .collect(...)     ← terminal — triggers everything, produces result
```

Nothing executes until the terminal operation is called. This is **lazy evaluation**.

---

## Most important stream operations

### filter — keep elements that match a condition
```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());

// [2, 4, 6, 8, 10]
```

### map — transform each element
```java
List<String> names = List.of("juan", "maria", "carlos");

List<String> upper = names.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// [JUAN, MARIA, CARLOS]
```

### sorted — sort elements
```java
List<Integer> sorted = numbers.stream()
    .sorted()
    .collect(Collectors.toList());

// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Custom sort
List<String> byLength = names.stream()
    .sorted((a, b) -> a.length() - b.length())
    .collect(Collectors.toList());
```

### distinct — remove duplicates
```java
List<Integer> unique = List.of(1, 2, 2, 3, 3, 3).stream()
    .distinct()
    .collect(Collectors.toList());

// [1, 2, 3]
```

### limit / skip — pagination
```java
List<Integer> firstThree = numbers.stream()
    .limit(3)
    .collect(Collectors.toList()); // [1, 2, 3]

List<Integer> skipThree = numbers.stream()
    .skip(3)
    .collect(Collectors.toList()); // [4, 5, 6, 7, 8, 9, 10]
```

### forEach — terminal, do something with each element
```java
names.stream()
    .forEach(System.out::println);
```

### count — terminal, count elements
```java
long count = names.stream()
    .filter(n -> n.length() > 4)
    .count();
```

### findFirst / findAny — terminal, get an element
```java
Optional<String> first = names.stream()
    .filter(n -> n.startsWith("J"))
    .findFirst();

first.ifPresent(System.out::println); // Juan
```

### anyMatch / allMatch / noneMatch — terminal, boolean checks
```java
boolean anyAdult = people.stream().anyMatch(p -> p.age >= 18);
boolean allAdult = people.stream().allMatch(p -> p.age >= 18);
boolean noneMinor = people.stream().noneMatch(p -> p.age < 0);
```

### reduce — combine all elements into one value
```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

int sum = numbers.stream()
    .reduce(0, (acc, n) -> acc + n); // 15

// Or with method reference
int sum2 = numbers.stream()
    .reduce(0, Integer::sum); // 15
```

### collect — most powerful terminal operation
```java
// To a list
List<String> list = stream.collect(Collectors.toList());

// To a set
Set<String> set = stream.collect(Collectors.toSet());

// Join strings
String joined = names.stream()
    .collect(Collectors.joining(", ")); // "juan, maria, carlos"

// Group by a property
Map<String, List<Person>> byCity = people.stream()
    .collect(Collectors.groupingBy(p -> p.city));

// Count by property
Map<String, Long> countByCity = people.stream()
    .collect(Collectors.groupingBy(p -> p.city, Collectors.counting()));
```

---

## Real-world example — putting it all together

```java
List<Order> orders = getOrders();

// Find the total value of completed orders over $100, sorted by value
double total = orders.stream()
    .filter(o -> o.getStatus().equals("COMPLETED"))   // only completed
    .filter(o -> o.getValue() > 100)                  // over $100
    .mapToDouble(Order::getValue)                     // extract the value
    .sum();                                           // add them up

// Get names of top 3 customers by order count
List<String> topCustomers = orders.stream()
    .collect(Collectors.groupingBy(Order::getCustomerName, Collectors.counting()))
    .entrySet().stream()
    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
    .limit(3)
    .map(Map.Entry::getKey)
    .collect(Collectors.toList());
```

---

## Streams vs loops — when to use each

| | Stream | Loop |
|---|---|---|
| Readability | High for data transformations | Better for complex logic |
| Performance | Similar, sometimes better (parallel streams) | Slightly faster for simple cases |
| Parallel processing | Easy — `.parallelStream()` | Complex to implement |
| Side effects | Avoid — streams should be pure | Fine |
| **Use when** | Filtering, mapping, collecting data | Complex iterations, index needed |

---

## Interview answers

### What is a functional interface?
An interface with exactly one abstract method. It can be implemented using a lambda expression.

### What is a lambda in Java?
A concise, anonymous function that implements a functional interface. Introduced in Java 8 to replace verbose anonymous class syntax.

### What is the difference between map and filter in streams?
`filter` keeps elements that match a condition (returns same type). `map` transforms each element into something else (can change the type).

### What is lazy evaluation in streams?
Intermediate operations (filter, map, sorted) are not executed until a terminal operation (collect, forEach, count) is called. This allows Java to optimize the pipeline.

### What is the difference between intermediate and terminal operations?
Intermediate operations return a new stream and are lazy. Terminal operations trigger execution and produce a result — after a terminal op the stream is consumed and cannot be reused.

### What does collect(Collectors.groupingBy(...)) do?
Groups stream elements by a key into a Map, where each key maps to a list of matching elements.

### Can streams be reused?
No. Once a terminal operation is called, the stream is closed. You must create a new stream to process the data again.
