# Optional in Java

## Glossary

| Term | Meaning |
|------|---------|
| **Optional<T>** | A container that may or may not hold a value — a clean alternative to returning null |
| **NullPointerException (NPE)** | The most common Java runtime error — caused by calling a method on a null reference |
| **null** | The absence of a value. Returning null from methods forces callers to always check for it |
| **Chaining** | Calling multiple methods in sequence — Optional enables this even when values might be absent |

---

## The problem — null is dangerous

When a method can return nothing, the traditional approach is to return `null`.
But null is invisible — callers can easily forget to check for it.

```java
public User findUser(String id) {
    return database.find(id); // might return null if not found
}

// Caller forgets to check
User user = findUser("123");
System.out.println(user.getName()); // NullPointerException if user is null — app crashes
```

---

## Optional — make absence explicit

`Optional<T>` is a wrapper that forces the caller to acknowledge
that the value might not be there.

```java
public Optional<User> findUser(String id) {
    User user = database.find(id);
    return Optional.ofNullable(user); // wraps the value — might be empty
}
```

Now the caller can't ignore the fact that the value might be absent.

---

## Creating an Optional

```java
// Has a value
Optional<String> name = Optional.of("Juan");

// Empty — no value
Optional<String> empty = Optional.empty();

// Might be null — most common in practice
Optional<String> maybe = Optional.ofNullable(someValueThatMightBeNull);
```

> Never use `Optional.of(null)` — it throws NullPointerException.
> Use `Optional.ofNullable()` when the value might be null.

---

## Using an Optional

### isPresent() / isEmpty() — check if value exists
```java
Optional<User> user = findUser("123");

if (user.isPresent()) {
    System.out.println(user.get().getName());
}

if (user.isEmpty()) {  // Java 11+
    System.out.println("User not found");
}
```

### get() — get the value (risky — throws if empty)
```java
User u = user.get(); // throws NoSuchElementException if empty — avoid alone
```

### orElse() — provide a default value
```java
User u = findUser("123").orElse(new User("Guest"));
```

### orElseGet() — provide a default via supplier (lazy — only runs if empty)
```java
User u = findUser("123").orElseGet(() -> createDefaultUser());
```

### orElseThrow() — throw an exception if empty
```java
User u = findUser("123")
    .orElseThrow(() -> new RuntimeException("User not found"));
```

### ifPresent() — run code only if value exists
```java
findUser("123").ifPresent(user -> System.out.println("Found: " + user.getName()));
```

### map() — transform the value if present
```java
Optional<String> name = findUser("123")
    .map(User::getName); // returns Optional<String> — empty if user not found
```

### filter() — keep value only if condition is met
```java
Optional<User> activeUser = findUser("123")
    .filter(user -> user.isActive());
```

---

## Real-world example

```java
// Find user, get their city, uppercase it — or return "UNKNOWN"
String city = findUser("123")
    .map(User::getAddress)
    .map(Address::getCity)
    .map(String::toUpperCase)
    .orElse("UNKNOWN");

// Without Optional — messy and error-prone
User user = findUser("123");
String city;
if (user != null && user.getAddress() != null && user.getAddress().getCity() != null) {
    city = user.getAddress().getCity().toUpperCase();
} else {
    city = "UNKNOWN";
}
```

---

## What NOT to do with Optional

```java
// Don't use Optional as a field — it's not serializable
public class User {
    private Optional<String> nickname; // BAD
}

// Don't use Optional as a method parameter
public void process(Optional<String> name) { } // BAD — just use null check or overload

// Don't wrap collections in Optional
public Optional<List<User>> getUsers() { } // BAD — return empty list instead
public List<User> getUsers() { return Collections.emptyList(); } // GOOD
```

> **Rule:** Use Optional only as a **return type** for methods that might not find a result.

---

## Interview answers

### What is Optional in Java?
A container class introduced in Java 8 that may or may not hold a value. It makes the possibility of absence explicit, forcing callers to handle the case where no value is present — reducing NullPointerExceptions.

### What is the difference between orElse() and orElseGet()?
`orElse()` always evaluates the default value — even if Optional has a value. `orElseGet()` takes a Supplier and only evaluates it when the Optional is empty. Prefer `orElseGet()` when the default is expensive to compute.

### When should you NOT use Optional?
As a field in a class, as a method parameter, or wrapping a collection. Optional is designed only as a method return type to signal that a result might be absent.
