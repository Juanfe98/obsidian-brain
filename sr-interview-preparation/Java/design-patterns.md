# Design Patterns

## Glossary

| Term | Meaning |
|------|---------|
| **Design pattern** | A proven, reusable solution to a commonly occurring problem in software design |
| **Creational pattern** | Patterns about how objects are created. E.g. Singleton, Builder, Factory |
| **Structural pattern** | Patterns about how objects are composed/structured. E.g. Adapter, Decorator |
| **Behavioral pattern** | Patterns about how objects communicate and behave. E.g. Strategy, Observer |
| **Singleton** | Ensures only ONE instance of a class ever exists |
| **Builder** | Constructs complex objects step by step |
| **Strategy** | Defines a family of algorithms and makes them interchangeable at runtime |
| **Thread-safe** | Safe to use from multiple threads simultaneously without corrupting data |
| **Volatile** | A Java keyword that ensures a variable is always read from main memory, not a thread's local cache |
| **Boilerplate** | Repetitive code that must be written but adds little value |
| **Algorithm** | A set of steps to accomplish a task. E.g. sorting, discounting, compressing |

---

## Why Design Patterns?

Patterns are not code you copy-paste. They are **templates for solving recurring problems**.
Knowing them shows you can think architecturally and communicate solutions clearly with other developers.

There are 23 classic patterns (Gang of Four). We'll cover the 3 most asked in interviews.

---

## Pattern 1 — Singleton (Creational)

### The problem
Some objects should only exist once in your entire application:
- Database connection pool
- Configuration settings
- Logger
- Cache manager

If you create multiple instances, you get inconsistent state, wasted resources, or conflicting settings.

### What Singleton does
Ensures a class has **only one instance** and provides a **global access point** to it.

### Basic implementation
```java
public class AppConfig {

    // The single instance — stored as a static field
    private static AppConfig instance;

    // Private constructor — nobody can call new AppConfig() from outside
    private AppConfig() {
        System.out.println("Config loaded");
    }

    // The only way to get the instance
    public static AppConfig getInstance() {
        if (instance == null) {
            instance = new AppConfig(); // created only on first call
        }
        return instance;
    }

    public String getDatabaseUrl() {
        return "jdbc:mysql://localhost/mydb";
    }
}
```

```java
// Usage
AppConfig config1 = AppConfig.getInstance();
AppConfig config2 = AppConfig.getInstance();

System.out.println(config1 == config2); // true — same object
```

### Problem — the basic version is NOT thread-safe

If two threads call `getInstance()` at the same time when `instance` is null,
both might create a new instance — violating the singleton contract.

```
Thread 1: checks instance == null → true
Thread 2: checks instance == null → true  (before Thread 1 creates it)
Thread 1: creates instance
Thread 2: creates ANOTHER instance ← problem!
```

### Thread-safe Singleton — Double-Checked Locking
```java
public class AppConfig {
    // volatile ensures all threads see the updated value immediately
    private static volatile AppConfig instance;

    private AppConfig() {}

    public static AppConfig getInstance() {
        if (instance == null) {                    // first check — no lock (fast)
            synchronized (AppConfig.class) {       // lock only when needed
                if (instance == null) {            // second check — inside lock
                    instance = new AppConfig();
                }
            }
        }
        return instance;
    }
}
```

### Cleanest implementation — Enum Singleton (Bill Pugh)
Java guarantees enums are instantiated once and are thread-safe:

```java
public enum AppConfig {
    INSTANCE;

    public String getDatabaseUrl() {
        return "jdbc:mysql://localhost/mydb";
    }
}

// Usage
AppConfig.INSTANCE.getDatabaseUrl();
```

This is the most robust approach — serialization-safe, thread-safe, and concise.

### Real world
In Spring Boot, every `@Service`, `@Repository`, and `@Component` is a Singleton by default.
Spring manages the single instance for you.

---

## Pattern 2 — Builder (Creational)

### The problem
Some objects have many fields, some required, some optional.
Using a constructor with many parameters is messy and error-prone:

```java
// Which argument is which? Easy to mix up
User user = new User("Juan", "juan@email.com", 30, "New York", true, false, "PREMIUM", null);
```

- Hard to read
- Easy to swap arguments accidentally
- Can't skip optional fields without passing null

### What Builder does
Constructs a complex object **step by step** using a fluent, readable API.
You only set the fields you need.

### Implementation
```java
public class User {
    // Fields — some required, some optional
    private final String name;         // required
    private final String email;        // required
    private final int age;             // optional
    private final String city;         // optional
    private final boolean active;      // optional
    private final String plan;         // optional

    // Private constructor — only Builder can create User
    private User(Builder builder) {
        this.name   = builder.name;
        this.email  = builder.email;
        this.age    = builder.age;
        this.city   = builder.city;
        this.active = builder.active;
        this.plan   = builder.plan;
    }

    // Getters
    public String getName()  { return name; }
    public String getEmail() { return email; }

    // Static inner Builder class
    public static class Builder {
        // Required fields
        private final String name;
        private final String email;

        // Optional fields — with defaults
        private int age       = 0;
        private String city   = "";
        private boolean active = true;
        private String plan   = "FREE";

        // Constructor only takes required fields
        public Builder(String name, String email) {
            this.name  = name;
            this.email = email;
        }

        // Each setter returns the Builder — enables chaining
        public Builder age(int age) {
            this.age = age;
            return this;
        }

        public Builder city(String city) {
            this.city = city;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
            return this;
        }

        public Builder plan(String plan) {
            this.plan = plan;
            return this;
        }

        // Terminal method — builds and returns the final object
        public User build() {
            return new User(this);
        }
    }
}
```

```java
// Usage — clean, readable, flexible
User user = new User.Builder("Juan", "juan@email.com")
    .age(30)
    .city("New York")
    .plan("PREMIUM")
    .build();

// Minimal — only required fields
User simple = new User.Builder("Maria", "maria@email.com")
    .build();
```

Now it's clear what each value means. You only set what you need.

### Lombok — how it's done in real projects
In real Java projects, nobody writes the Builder by hand.
The `@Builder` annotation from Lombok generates it automatically:

```java
@Builder
public class User {
    private String name;
    private String email;
    private int age;
    private String city;
    private boolean active;
    private String plan;
}

// Usage is identical
User user = User.builder()
    .name("Juan")
    .email("juan@email.com")
    .age(30)
    .plan("PREMIUM")
    .build();
```

### Real world examples in Java
```java
// StringBuilder — classic builder for strings
String result = new StringBuilder()
    .append("Hello")
    .append(", ")
    .append("World")
    .toString();

// HttpRequest (Java 11+)
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Authorization", "Bearer token123")
    .GET()
    .build();
```

---

## Pattern 3 — Strategy (Behavioral)

### The problem
You have a behavior that needs to vary — like sorting, payment processing,
discounting, or file compression — and you don't want a giant `if/else` or `switch`
that you have to modify every time a new option is added.

### What Strategy does
Defines a **family of algorithms**, encapsulates each one in its own class,
and makes them **interchangeable at runtime**.

The class that uses the strategy doesn't know or care which one it gets —
it just calls the interface method.

### Implementation
```java
// 1. Define the strategy interface
public interface SortStrategy {
    void sort(int[] array);
}

// 2. Each algorithm is its own class
public class BubbleSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sorting with Bubble Sort...");
        // bubble sort logic
    }
}

public class QuickSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sorting with Quick Sort...");
        // quick sort logic
    }
}

public class MergeSort implements SortStrategy {
    @Override
    public void sort(int[] array) {
        System.out.println("Sorting with Merge Sort...");
        // merge sort logic
    }
}

// 3. Context class — uses a strategy, doesn't care which one
public class Sorter {
    private SortStrategy strategy;

    // Strategy injected — can be changed at runtime
    public Sorter(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public void sort(int[] array) {
        strategy.sort(array); // delegates to whichever strategy is set
    }
}
```

```java
// Usage
int[] data = {5, 2, 8, 1, 9};

Sorter sorter = new Sorter(new QuickSort());
sorter.sort(data); // Sorting with Quick Sort...

// Switch strategy at runtime — no code change in Sorter
sorter.setStrategy(new MergeSort());
sorter.sort(data); // Sorting with Merge Sort...
```

### Real-world example — Payment processing
```java
public interface PaymentStrategy {
    void pay(double amount);
}

public class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;
    public CreditCardPayment(String cardNumber) { this.cardNumber = cardNumber; }

    public void pay(double amount) {
        System.out.println("Paid $" + amount + " with credit card " + cardNumber);
    }
}

public class PayPalPayment implements PaymentStrategy {
    private String email;
    public PayPalPayment(String email) { this.email = email; }

    public void pay(double amount) {
        System.out.println("Paid $" + amount + " via PayPal (" + email + ")");
    }
}

public class CryptoPayment implements PaymentStrategy {
    private String walletAddress;
    public CryptoPayment(String walletAddress) { this.walletAddress = walletAddress; }

    public void pay(double amount) {
        System.out.println("Paid $" + amount + " in crypto from " + walletAddress);
    }
}

public class Checkout {
    private PaymentStrategy paymentStrategy;

    public Checkout(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public void completePurchase(double amount) {
        paymentStrategy.pay(amount); // doesn't know or care which strategy
    }
}
```

```java
// User picks payment method at runtime
Checkout checkout = new Checkout(new CreditCardPayment("1234-5678-9012-3456"));
checkout.completePurchase(99.99); // Paid $99.99 with credit card...

// Switch to PayPal — zero changes to Checkout
checkout = new Checkout(new PayPalPayment("juan@email.com"));
checkout.completePurchase(99.99); // Paid $99.99 via PayPal...
```

### Strategy with lambdas (modern Java)
Since `PaymentStrategy` has one method, it's a functional interface.
You can replace classes with lambdas:

```java
PaymentStrategy creditCard = amount -> System.out.println("Paid $" + amount + " with card");
PaymentStrategy paypal     = amount -> System.out.println("Paid $" + amount + " via PayPal");

Checkout checkout = new Checkout(creditCard);
checkout.completePurchase(50.00);
```

---

## How the 3 patterns compare

| Pattern | Category | Solves | Key idea |
|---------|----------|--------|----------|
| **Singleton** | Creational | "I need exactly one instance" | Private constructor + static instance |
| **Builder** | Creational | "Construction of complex objects is messy" | Fluent step-by-step construction |
| **Strategy** | Behavioral | "I need to swap algorithms/behaviors at runtime" | Encapsulate each behavior in its own class |

---

## How they connect to SOLID

- **Singleton** → SRP (one job: manage a single instance)
- **Builder** → SRP (building the object is separated from using it)
- **Strategy** → OCP (add new strategies without modifying existing code) + DIP (depend on the interface, not concrete strategy)

---

## Interview answers

### What is the Singleton pattern?
A creational pattern that ensures only one instance of a class is created and provides a global access point to it. Used for shared resources like config, caches, or connection pools.

### What is the Builder pattern?
A creational pattern that constructs complex objects step by step using a fluent API. Solves the problem of constructors with many parameters — especially when some are optional.

### What is the Strategy pattern?
A behavioral pattern that defines a family of algorithms, encapsulates each one, and makes them interchangeable. The client depends on an interface — the concrete algorithm can be swapped at runtime without changing the client.

### How is Strategy different from simple if/else?
With if/else, adding a new behavior requires modifying existing code — violating OCP. With Strategy, you add a new class that implements the interface. Existing code never changes.

### Is Singleton thread-safe by default?
No. The basic implementation has a race condition. Use double-checked locking with `volatile`, or use an enum which Java guarantees is thread-safe and instantiated once.

### How does Spring Boot use Singleton?
Every Spring bean (`@Service`, `@Repository`, `@Component`) is a Singleton by default — Spring creates one instance and injects it wherever needed.
