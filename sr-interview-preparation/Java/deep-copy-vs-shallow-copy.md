# Deep Copy vs Shallow Copy

## Glossary

| Term | Meaning |
|------|---------|
| **Object** | An instance of a class stored in heap memory |
| **Reference** | A variable that points to an object in memory. It's not the object itself — it's the address of where the object lives |
| **Heap memory** | Where Java stores objects. Multiple references can point to the same object here |
| **Primitive** | A basic value type (int, double, boolean, char). Stored directly in the variable, not as a reference |
| **Field** | A variable inside a class/object |
| **Nested object** | An object that contains another object as a field. E.g. a `Person` that has an `Address` field |
| **Copy** | A new separate object with the same data |
| **Shallow copy** | A copy of the object, but nested objects inside it are still shared (same reference) |
| **Deep copy** | A full independent copy — the object AND all nested objects inside it are duplicated |
| **clone()** | A method from Java's `Object` class that creates a shallow copy by default |
| **Cloneable** | A marker interface a class must implement to allow cloning |

---

## The core problem — references

To understand this, you need to understand how Java stores objects.

When you have a simple value:
```java
int a = 5;
int b = a; // b gets its own copy of 5
b = 10;

System.out.println(a); // 5 — not affected
System.out.println(b); // 10
```
Primitives are copied by value — completely independent.

But when you have an object:
```java
Person p1 = new Person("Juan");
Person p2 = p1; // p2 does NOT get a copy — it points to the SAME object

p2.name = "Carlos";

System.out.println(p1.name); // "Carlos" — p1 was affected too!
```

Both `p1` and `p2` point to the same object in memory.
Changing one changes the other. This is the problem that copy strategies solve.

---

## Shallow Copy

A shallow copy creates a **new object**, but any nested objects inside it
are **not duplicated** — the new object still holds references to the same nested objects.

Think of it like copying a folder shortcut — you get a new shortcut, but it still points to the same folder.

```java
public class Address {
    String city;

    Address(String city) {
        this.city = city;
    }
}

public class Person {
    String name;       // primitive-like (String is immutable — behaves safely)
    Address address;   // nested object — this is where shallow copy causes problems

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // Shallow copy constructor
    Person(Person other) {
        this.name = other.name;
        this.address = other.address; // copies the REFERENCE, not the object
    }
}
```

```java
Address addr = new Address("New York");
Person original = new Person("Juan", addr);
Person copy = new Person(original); // shallow copy

// Change the copy's city
copy.address.city = "London";

// Original is affected too!
System.out.println(original.address.city); // "London" — not what we wanted
```

### Why? Both point to the same Address object:
```
original ──► Person { name="Juan", address ──► Address { city="London" } }
                                        ▲
copy     ──► Person { name="Juan", address ─────────────────────────────┘ }
```

---

## Deep Copy

A deep copy creates a **new object AND new copies of all nested objects** inside it.
Everything is fully independent — changing the copy never affects the original.

Think of it like copying a folder and all its contents — completely separate.

```java
public class Person {
    String name;
    Address address;

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // Deep copy constructor
    Person(Person other) {
        this.name = other.name;
        this.address = new Address(other.address.city); // creates a NEW Address object
    }
}
```

```java
Address addr = new Address("New York");
Person original = new Person("Juan", addr);
Person copy = new Person(original); // deep copy

copy.address.city = "London";

System.out.println(original.address.city); // "New York" — original untouched
System.out.println(copy.address.city);     // "London"
```

### Now they are fully independent:
```
original ──► Person { name="Juan", address ──► Address { city="New York" } }

copy     ──► Person { name="Juan", address ──► Address { city="London"  } }
```

---

## Ways to implement copy in Java

### 1. Copy constructor (most common, cleanest)
```java
public class Person {
    String name;
    Address address;

    // Deep copy constructor
    public Person(Person other) {
        this.name = other.name;
        this.address = new Address(other.address); // Address also needs a copy constructor
    }
}
```

### 2. Implementing `clone()` (older approach)
```java
public class Person implements Cloneable {
    String name;
    Address address;

    @Override
    protected Object clone() throws CloneNotSupportedException {
        Person copy = (Person) super.clone(); // shallow clone from Object
        copy.address = new Address(this.address.city); // manually deep copy nested object
        return copy;
    }
}

// Usage
Person copy = (Person) original.clone();
```

> `clone()` is considered outdated and tricky to use correctly.
> Prefer copy constructors or serialization.

### 3. Serialization (deep copy of complex object graphs)
```java
// Serialize to bytes and deserialize back — creates a fully independent deep copy
// Every class in the graph must implement Serializable
ByteArrayOutputStream bos = new ByteArrayOutputStream();
ObjectOutputStream out = new ObjectOutputStream(bos);
out.writeObject(original);

ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
ObjectInputStream in = new ObjectInputStream(bis);
Person deepCopy = (Person) in.readObject();
```
Overkill for simple cases, but useful for deeply nested object graphs.

### 4. Libraries (real world)
In real projects people use libraries to avoid writing copy logic manually:
```java
// MapStruct, ModelMapper, or Apache Commons Lang
Person copy = SerializationUtils.clone(original); // Apache Commons
```

---

## Side by side comparison

| | Shallow Copy | Deep Copy |
|---|---|---|
| New object created? | Yes | Yes |
| Nested objects duplicated? | No — shared references | Yes — fully independent |
| Changes to copy affect original? | Yes (for nested objects) | No |
| Performance | Faster | Slower (more memory) |
| When to use | Nested objects are immutable or intentionally shared | You need full independence |

---

## When does shallow copy actually work fine?

When nested objects are **immutable** (like `String`), shallow copy is safe
because you can't modify them anyway — Java always creates a new object on reassignment.

```java
public class Config {
    String host;  // String is immutable — shallow copy is safe here
    int port;     // primitive — copied by value anyway

    Config(Config other) {
        this.host = other.host; // safe — String can't be mutated
        this.port = other.port;
    }
}
```

---

## Interview answers

### What is the difference between shallow and deep copy?
A shallow copy creates a new object but nested objects inside it are still shared — both the original and copy point to the same nested objects. A deep copy duplicates everything — the object and all nested objects — making them fully independent.

### When would a shallow copy cause a bug?
When you modify a nested object through the copy and unintentionally affect the original — because both hold a reference to the same nested object.

### What is the best way to implement deep copy in Java?
A copy constructor is the cleanest approach. For complex object graphs, serialization or a library like Apache Commons can be used.

### Is `clone()` a good way to copy objects?
It's an older approach and has pitfalls — it performs a shallow copy by default and requires manual handling of nested objects. Copy constructors are generally preferred.

### When is shallow copy acceptable?
When all nested fields are immutable (like String) or when you intentionally want the copy to share the same nested objects.
