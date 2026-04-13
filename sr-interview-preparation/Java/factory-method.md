# Factory Method

## Glossary

| Term | Meaning |
|------|---------|
| **Constructor** | A special method that runs when you create an object with `new`. E.g. `new User()` |
| **Instance** | A concrete object created from a class. E.g. `User u = new User()` — `u` is an instance |
| **Instance field** | A variable that belongs to a specific object. Each instance has its own copy. E.g. `this.name` |
| **Static** | Belongs to the class itself, not to any object. Shared across all instances |
| **Private constructor** | A constructor marked `private` — nobody outside the class can call `new` directly |
| **Factory method** | A static method that creates and returns an object, instead of using `new` directly |

---

## The problem with constructors

When you use `new`, Java just creates the object — no questions asked.

```java
public class DatabaseConnection {
    String url;

    public DatabaseConnection(String url) {
        this.url = url;
    }
}

// Anyone can do this — even with a broken URL
DatabaseConnection conn = new DatabaseConnection(null);
DatabaseConnection conn2 = new DatabaseConnection("");
```

You have no control. The object gets created regardless of whether the input is valid.

---

## What is a Factory Method?

A **factory method** is a `static` method inside a class whose job is to **create and return an instance of that class**.

Instead of calling `new` directly, you call the factory method — and it decides whether and how to create the object.

Think of it like a real factory: you don't build the car yourself, you tell the factory what you want, and it handles the construction.

```java
public class DatabaseConnection {
    private String url; // instance field — each connection has its own url

    // Constructor is private — nobody can call new DatabaseConnection() from outside
    private DatabaseConnection(String url) {
        this.url = url;
    }

    // Factory method — the only way to create a DatabaseConnection
    public static DatabaseConnection create(String url) {
        if (url == null || url.isEmpty()) {
            throw new IllegalArgumentException("URL cannot be empty");
        }
        return new DatabaseConnection(url); // only created if valid
    }
}
```

```java
// Usage
DatabaseConnection conn = DatabaseConnection.create("jdbc:mysql://localhost/db"); // works
DatabaseConnection bad  = DatabaseConnection.create(null); // throws exception — protected!
DatabaseConnection bad2 = new DatabaseConnection("url");   // won't compile — constructor is private
```

---

## Why use a Factory Method instead of a constructor?

### 1. Validate before creating
```java
public static User create(String email, String password) {
    if (!email.contains("@")) throw new IllegalArgumentException("Invalid email");
    if (password.length() < 8) throw new IllegalArgumentException("Password too short");
    return new User(email, password);
}
```
A constructor can't easily reject bad input in a clean way. A factory method can.

### 2. Give the method a meaningful name
Constructors always have the same name as the class. Factory methods can be descriptive:

```java
public class Payment {
    private Payment(...) {}

    public static Payment withCreditCard(String cardNumber, double amount) { ... }
    public static Payment withPayPal(String email, double amount) { ... }
    public static Payment withCrypto(String walletAddress, double amount) { ... }
}

// Much clearer to read:
Payment p = Payment.withCreditCard("1234-5678", 99.99);
```

### 3. Return a cached instance (reuse objects)
```java
public class Config {
    private static Config instance; // static field — shared across all
    private Config() {}

    public static Config getInstance() {
        if (instance == null) {
            instance = new Config(); // only created once
        }
        return instance; // everyone gets the same object
    }
}
```
This is actually the **Singleton pattern** — a very common design pattern built on top of factory methods.

---

## Real examples in Java's standard library

Java itself uses factory methods everywhere:

```java
// Instead of new ArrayList()
List<String> list = List.of("a", "b", "c");

// Instead of new HashMap()
Map<String, Integer> map = Map.of("key", 1);

// Instead of new Integer(5) — deprecated
Integer n = Integer.valueOf(5);

// LocalDate has no public constructor — you must use factory methods
LocalDate today = LocalDate.now();
LocalDate date  = LocalDate.of(2026, 3, 18);
```

---

## Summary

| | Constructor (`new`) | Factory Method |
|---|---|---|
| Syntax | `new ClassName()` | `ClassName.create()` |
| Can validate input? | Limited | Yes |
| Can have a descriptive name? | No | Yes |
| Can return cached object? | No | Yes |
| Can be private? | Yes (blocks direct creation) | N/A |

---

## Interview answers

### What is a factory method?
A static method that creates and returns an instance of a class, giving you control over how objects are created — with validation, meaningful naming, or object reuse.

### Why use a factory method instead of a constructor?
To validate input before creating the object, to give creation methods meaningful names, or to control object lifecycle (e.g., return a cached instance).

### What is the relationship between factory methods and the Singleton pattern?
Singleton uses a factory method (`getInstance()`) to ensure only one instance is ever created and returned.
