# Comparable vs Comparator

## Glossary

| Term | Meaning |
|------|---------|
| **Comparable** | An interface a class implements to define its own natural sort order |
| **Comparator** | A separate object that defines a custom sort order — without modifying the class |
| **Natural ordering** | The default sort order for a type. E.g. numbers ascending, strings alphabetical |
| **compareTo()** | The method defined by Comparable — returns negative, zero, or positive |
| **compare()** | The method defined by Comparator — same return convention |
| **Negative return** | Means the first element should come BEFORE the second |
| **Positive return** | Means the first element should come AFTER the second |
| **Zero return** | Means the two elements are equal in sort order |

---

## The problem — sorting custom objects

Sorting primitives and Strings is easy — Java knows the natural order.
But what about your own classes?

```java
List<Person> people = List.of(
    new Person("Carlos", 35),
    new Person("Juan", 28),
    new Person("Maria", 31)
);

Collections.sort(people); // ERROR — Java doesn't know how to sort Person
```

You need to tell Java how to compare `Person` objects.
You have two options: **Comparable** or **Comparator**.

---

## Comparable — the class defines its own order

Implement `Comparable<T>` directly on the class.
This defines the **natural ordering** — the default way this object is sorted.

```java
public class Person implements Comparable<Person> {
    String name;
    int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public int compareTo(Person other) {
        return this.age - other.age; // sort by age ascending
        // negative → this comes first
        // positive → other comes first
        // zero     → same order
    }
}
```

```java
List<Person> people = new ArrayList<>(List.of(
    new Person("Carlos", 35),
    new Person("Juan", 28),
    new Person("Maria", 31)
));

Collections.sort(people); // uses compareTo() automatically

// Result: Juan(28), Maria(31), Carlos(35) — sorted by age
```

### Limitation
A class can only implement `Comparable` once — one natural order.
What if you sometimes want to sort by age, sometimes by name?
That's where `Comparator` comes in.

---

## Comparator — external, flexible sorting

A `Comparator` is a separate object that defines sort logic.
You can create as many as you need — one per sort strategy.

```java
// Sort by name
Comparator<Person> byName = (p1, p2) -> p1.name.compareTo(p2.name);

// Sort by age
Comparator<Person> byAge = (p1, p2) -> p1.age - p2.age;

// Sort by age descending
Comparator<Person> byAgeDesc = (p1, p2) -> p2.age - p1.age;
```

```java
List<Person> people = new ArrayList<>(List.of(
    new Person("Carlos", 35),
    new Person("Juan", 28),
    new Person("Maria", 31)
));

people.sort(byName);    // [Carlos, Juan, Maria] — alphabetical
people.sort(byAge);     // [Juan(28), Maria(31), Carlos(35)]
people.sort(byAgeDesc); // [Carlos(35), Maria(31), Juan(28)]
```

### Comparator with method references (cleanest)
```java
people.sort(Comparator.comparing(p -> p.name));
people.sort(Comparator.comparingInt(p -> p.age));
```

### Chaining — sort by multiple fields
```java
// Sort by age, then by name if ages are equal
Comparator<Person> byAgeThenName = Comparator
    .comparingInt((Person p) -> p.age)
    .thenComparing(p -> p.name);

people.sort(byAgeThenName);
```

### Reversed
```java
people.sort(Comparator.comparingInt((Person p) -> p.age).reversed());
```

---

## Comparable vs Comparator — side by side

| | Comparable | Comparator |
|---|-----------|-----------|
| Where defined | Inside the class | Outside the class |
| Method | `compareTo(T other)` | `compare(T o1, T o2)` |
| How many orderings | One (natural) | As many as you want |
| Modifies the class? | Yes | No |
| Used with | `Collections.sort(list)` | `list.sort(comparator)` |
| Best for | One obvious natural order | Multiple sort strategies |

---

## Real world example

```java
List<Product> products = getProducts();

// Sort by price for display
products.sort(Comparator.comparingDouble(Product::getPrice));

// Sort by name for search results
products.sort(Comparator.comparing(Product::getName));

// Sort by rating descending, then price ascending
products.sort(
    Comparator.comparingDouble(Product::getRating).reversed()
              .thenComparingDouble(Product::getPrice)
);
```

---

## Interview answers

### What is the difference between Comparable and Comparator?
Comparable is implemented by the class itself to define its natural ordering — one sort order per class. Comparator is external — you create separate comparator objects for different sort strategies without modifying the class.

### When would you use Comparator over Comparable?
When you need multiple sort orders, when you can't modify the class (third-party library), or when the sort logic doesn't belong inside the class itself.

### What do the return values of compareTo() mean?
Negative = the current object comes before the other. Zero = equal. Positive = the current object comes after the other.
