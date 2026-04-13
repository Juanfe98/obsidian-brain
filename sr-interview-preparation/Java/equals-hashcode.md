# equals() and hashCode()

## Glossary

| Term | Meaning |
|------|---------|
| **equals()** | A method that determines if two objects are logically equal (same content) |
| **hashCode()** | A method that returns an integer representing the object — used internally by HashMap, HashSet |
| **Hash bucket** | An internal slot in a HashMap where entries are stored based on their hashCode |
| **Collision** | When two different objects produce the same hashCode — they land in the same bucket |
| **Contract** | A rule that must always be respected. Violating it breaks Java's built-in data structures |
| **Identity equality** | `==` — are these the exact same object in memory? |
| **Logical equality** | `equals()` — do these objects represent the same value? |

---

## The default behavior (from Object class)

Every Java class inherits `equals()` and `hashCode()` from `Object`.

By default:
- `equals()` → checks reference equality (same as `==`)
- `hashCode()` → returns a number based on memory address

```java
Person p1 = new Person("Juan", 30);
Person p2 = new Person("Juan", 30);

System.out.println(p1 == p2);       // false — different objects in memory
System.out.println(p1.equals(p2));  // false — default equals() uses ==
```

Two objects with identical data are NOT considered equal by default.
This causes big problems with collections.

---

## The problem with collections

```java
Set<Person> people = new HashSet<>();
people.add(new Person("Juan", 30));
people.add(new Person("Juan", 30)); // should be a duplicate — but isn't!

System.out.println(people.size()); // 2 — wrong! Expected 1
```

```java
Map<Person, String> roles = new HashMap<>();
roles.put(new Person("Juan", 30), "ADMIN");

String role = roles.get(new Person("Juan", 30)); // same data — different object
System.out.println(role); // null — can't find it!
```

HashMap and HashSet use `hashCode()` and `equals()` to find objects.
Without overriding them, two objects with the same data are treated as different.

---

## The contract — rules you MUST follow

1. If `a.equals(b)` is `true` → `a.hashCode()` must equal `b.hashCode()`
2. If `a.hashCode() == b.hashCode()` → `a.equals(b)` MAY or MAY NOT be true (collision is ok)
3. `equals()` must be consistent — same result every time for unchanged objects
4. `a.equals(null)` must always return `false`

> **The golden rule:** If you override `equals()`, you MUST also override `hashCode()`.
> If you only override one, collections break in unpredictable ways.

---

## Correct implementation

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;                  // same reference — definitely equal
        if (obj == null) return false;                 // null is never equal
        if (getClass() != obj.getClass()) return false; // different types — not equal

        Person other = (Person) obj;                   // safe to cast now
        return age == other.age &&
               Objects.equals(name, other.name);       // compare fields
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age); // generates a hash based on these fields
    }
}
```

```java
Person p1 = new Person("Juan", 30);
Person p2 = new Person("Juan", 30);

System.out.println(p1.equals(p2));  // true
System.out.println(p1.hashCode() == p2.hashCode()); // true

Set<Person> people = new HashSet<>();
people.add(p1);
people.add(p2); // recognized as duplicate

System.out.println(people.size()); // 1 — correct!
```

---

## In real projects — Lombok does this for you

```java
@EqualsAndHashCode
public class Person {
    private String name;
    private int age;
}

// Or with all features at once
@Data // includes @EqualsAndHashCode automatically
public class Person {
    private String name;
    private int age;
}
```

---

## Interview answers

### Why override equals() and hashCode() together?
HashMap and HashSet first use hashCode() to find the bucket, then equals() to confirm the match. If hashCode() is inconsistent with equals(), objects can't be found in collections.

### What happens if you only override equals() but not hashCode()?
Two equal objects may have different hash codes — they land in different buckets in a HashMap, so lookups return null even when the key exists.

### What is the contract between equals() and hashCode()?
If two objects are equal (equals() returns true), they must have the same hashCode(). The reverse is not required — two objects can have the same hashCode without being equal (this is a collision).
