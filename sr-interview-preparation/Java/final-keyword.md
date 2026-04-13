# The final Keyword

## Glossary

| Term | Meaning |
|------|---------|
| **final variable** | A variable that can only be assigned once — its value cannot change |
| **final method** | A method that cannot be overridden by subclasses |
| **final class** | A class that cannot be extended (no subclasses allowed) |
| **Immutable** | An object whose state cannot change after creation |
| **Constant** | A value that never changes — typically `static final` |

---

## final variable — assign once, never change

```java
final int MAX_SIZE = 100;
MAX_SIZE = 200; // COMPILE ERROR — cannot reassign a final variable
```

For objects, `final` means the **reference** cannot change — but the object's contents can:

```java
final List<String> names = new ArrayList<>();
names = new ArrayList<>();  // COMPILE ERROR — can't reassign the reference
names.add("Juan");          // OK — the list itself can still be modified
```

### Common use — constants
```java
public class Config {
    public static final String API_URL = "https://api.example.com";
    public static final int MAX_RETRIES = 3;
}

// Usage
Config.API_URL    // always the same
Config.MAX_RETRIES // always 3
```

Convention: constants are `static final` and written in `UPPER_SNAKE_CASE`.

### In constructor — forces initialization
```java
public class Order {
    private final String id;      // must be set in constructor
    private final LocalDate date;

    public Order(String id) {
        this.id = id;                        // set once
        this.date = LocalDate.now();         // set once
    }
    // id and date can never change after this — guaranteed
}
```

This is how you build **immutable** objects — all fields are `final`.

---

## final method — cannot be overridden

```java
public class PaymentProcessor {

    public final void logTransaction(double amount) {
        System.out.println("Transaction: $" + amount); // always logs this way
    }

    public void processPayment(double amount) { // can be overridden
        // default logic
    }
}

public class StripeProcessor extends PaymentProcessor {

    @Override
    public void processPayment(double amount) { // OK — not final
        System.out.println("Stripe processing $" + amount);
    }

    @Override
    public void logTransaction(double amount) { // COMPILE ERROR — method is final
    }
}
```

Use `final` on methods when the behavior must NEVER be changed by subclasses —
usually for security or correctness reasons.

---

## final class — cannot be extended

```java
public final class String { ... }  // you cannot extend String
public final class Integer { ... } // you cannot extend Integer
```

```java
public class MyString extends String { } // COMPILE ERROR — String is final
```

### Why make a class final?
- **Security** — prevent subclasses from changing behavior (e.g. authentication logic)
- **Immutability** — guarantees the class can never be subclassed and made mutable
- **Performance** — JVM can optimize final classes more aggressively

---

## Summary

| Used on | Meaning |
|---------|---------|
| Variable | Can only be assigned once |
| Method | Cannot be overridden |
| Class | Cannot be extended |

---

## Interview answers

### What does the final keyword do in Java?
Applied to a variable: it can only be assigned once. Applied to a method: it cannot be overridden. Applied to a class: it cannot be extended.

### What is the difference between final, finally, and finalize()?
`final` is a keyword for variables/methods/classes. `finally` is a block in try-catch that always runs. `finalize()` is a deprecated method called by GC before destroying an object — avoid using it.

### Why is String a final class?
To guarantee immutability and security. If String could be subclassed, someone could create a mutable String and break the String Pool, security checks, and other guarantees Java relies on.
