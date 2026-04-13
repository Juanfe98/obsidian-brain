# SOLID Principles

## Glossary

| Term | Meaning |
|------|---------|
| **SOLID** | An acronym for 5 design principles that make code easier to maintain, extend, and understand |
| **Responsibility** | A reason for a class to change. A class should only have one |
| **Coupling** | How dependent one class is on another. High coupling = hard to change one without breaking the other |
| **Dependency** | When a class needs another class to work |
| **Abstraction** | Depending on interfaces/abstract classes instead of concrete implementations |
| **Subtype** | A class that extends or implements another. E.g. `Dog` is a subtype of `Animal` |
| **Interface segregation** | Splitting large interfaces into smaller, focused ones |
| **Dependency injection** | Providing a class its dependencies from outside instead of creating them internally |
| **Refactor** | Restructuring existing code without changing its behavior |
| **Violation** | Breaking one of the rules — leads to code that's hard to maintain |

---

## Why SOLID?

Without these principles, code becomes:
- **Rigid** — changing one thing breaks many others
- **Fragile** — small changes cause unexpected failures
- **Hard to test** — classes do too much, can't be tested in isolation

SOLID is a set of guidelines to avoid these problems.
They are not strict rules — they are principles to apply with judgment.

---

## S — Single Responsibility Principle (SRP)

> "A class should have only ONE reason to change."

A class should do **one thing** and do it well.
If a class handles multiple concerns, a change in one concern can break the others.

### Violation — one class doing too much
```java
public class UserService {

    public void createUser(User user) {
        // 1. Validate user
        if (user.getEmail() == null) throw new IllegalArgumentException("Email required");

        // 2. Save to database
        database.save(user);

        // 3. Send welcome email
        String body = "Welcome, " + user.getName() + "!";
        emailClient.send(user.getEmail(), "Welcome", body);

        // 4. Log the action
        logger.log("User created: " + user.getEmail());
    }
}
```

This class has 4 reasons to change:
- Validation rules change
- Database changes
- Email template changes
- Logging format changes

### Fixed — each class has one responsibility
```java
public class UserValidator {
    public void validate(User user) {
        if (user.getEmail() == null) throw new IllegalArgumentException("Email required");
    }
}

public class UserRepository {
    public void save(User user) {
        database.save(user);
    }
}

public class WelcomeEmailService {
    public void sendWelcome(User user) {
        String body = "Welcome, " + user.getName() + "!";
        emailClient.send(user.getEmail(), "Welcome", body);
    }
}

public class UserService {
    private UserValidator validator;
    private UserRepository repository;
    private WelcomeEmailService emailService;

    public void createUser(User user) {
        validator.validate(user);
        repository.save(user);
        emailService.sendWelcome(user);
    }
}
```

Now each class has exactly ONE reason to change.

---

## O — Open/Closed Principle (OCP)

> "A class should be OPEN for extension but CLOSED for modification."

You should be able to add new behavior **without changing existing code**.
This prevents breaking things that already work.

### Violation — modifying existing code to add new behavior
```java
public class DiscountService {

    public double calculateDiscount(String customerType, double price) {
        if (customerType.equals("REGULAR")) {
            return price * 0.05;
        } else if (customerType.equals("PREMIUM")) {
            return price * 0.10;
        } else if (customerType.equals("VIP")) {   // added later — modified existing class
            return price * 0.20;
        }
        return 0;
    }
}
```

Every time a new customer type appears, you modify this class — risking breaking existing logic.

### Fixed — extend without modifying
```java
// Define the abstraction
public interface DiscountStrategy {
    double calculate(double price);
}

// Each type is its own class — no modification to existing code needed
public class RegularDiscount implements DiscountStrategy {
    public double calculate(double price) { return price * 0.05; }
}

public class PremiumDiscount implements DiscountStrategy {
    public double calculate(double price) { return price * 0.10; }
}

public class VipDiscount implements DiscountStrategy {
    public double calculate(double price) { return price * 0.20; }
}

// Service doesn't change when new discount types are added
public class DiscountService {
    public double calculateDiscount(DiscountStrategy strategy, double price) {
        return strategy.calculate(price);
    }
}
```

Adding a new customer type = adding a new class. Nothing existing is touched.

---

## L — Liskov Substitution Principle (LSP)

> "A subclass should be replaceable by its parent class without breaking the program."

If you have code that works with a `Animal`, it should work with any subclass
(`Dog`, `Cat`, `Bird`) without knowing which one it is — and without breaking.

### Violation — subclass breaks parent's contract
```java
public class Bird {
    public void fly() {
        System.out.println("Flying!");
    }
}

public class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins can't fly!"); // breaks the contract
    }
}
```

```java
// This code breaks when given a Penguin
public void makeBirdFly(Bird bird) {
    bird.fly(); // crashes for Penguin — LSP violated
}
```

The parent (`Bird`) says "I can fly". The child (`Penguin`) says "I can't". The contract is broken.

### Fixed — restructure the hierarchy to match reality
```java
public abstract class Bird {
    public abstract void move();
}

public interface Flyable {
    void fly();
}

public class Sparrow extends Bird implements Flyable {
    public void move() { fly(); }
    public void fly() { System.out.println("Sparrow flying!"); }
}

public class Penguin extends Bird {
    public void move() { System.out.println("Penguin swimming!"); }
    // Penguin doesn't implement Flyable — honest about its capabilities
}
```

Now `Penguin` never promises it can fly — no contract broken.

### Simple way to remember LSP
Ask: "Can every subclass be used wherever the parent is used, without surprises?"
If no → LSP is violated.

---

## I — Interface Segregation Principle (ISP)

> "A class should not be forced to implement methods it doesn't use."

Don't create fat interfaces with many methods.
Split them into smaller, focused interfaces.

### Violation — fat interface forces irrelevant methods
```java
public interface Worker {
    void work();
    void eat();
    void sleep();
}

public class HumanWorker implements Worker {
    public void work()  { System.out.println("Working..."); }
    public void eat()   { System.out.println("Eating..."); }
    public void sleep() { System.out.println("Sleeping..."); }
}

public class RobotWorker implements Worker {
    public void work()  { System.out.println("Working..."); }
    public void eat()   { throw new UnsupportedOperationException("Robots don't eat"); }  // forced!
    public void sleep() { throw new UnsupportedOperationException("Robots don't sleep"); } // forced!
}
```

`RobotWorker` is forced to implement methods that make no sense for it.

### Fixed — split into focused interfaces
```java
public interface Workable {
    void work();
}

public interface Eatable {
    void eat();
}

public interface Sleepable {
    void sleep();
}

// Human implements all
public class HumanWorker implements Workable, Eatable, Sleepable {
    public void work()  { System.out.println("Working..."); }
    public void eat()   { System.out.println("Eating..."); }
    public void sleep() { System.out.println("Sleeping..."); }
}

// Robot only implements what it needs
public class RobotWorker implements Workable {
    public void work() { System.out.println("Working..."); }
}
```

Each class only implements what it actually needs.

---

## D — Dependency Inversion Principle (DIP)

> "Depend on abstractions, not on concrete implementations."

High-level classes (business logic) should not depend on low-level classes (database, email, etc.).
Both should depend on interfaces/abstractions.

This is the foundation of **Dependency Injection** — a core concept in Spring Boot.

### Violation — high-level class depends on concrete low-level class
```java
public class OrderService {
    // Directly creating a concrete dependency — tightly coupled
    private MySQLOrderRepository repository = new MySQLOrderRepository();

    public void placeOrder(Order order) {
        repository.save(order);
    }
}
```

Problems:
- Can't test `OrderService` without a real MySQL database
- Want to switch to PostgreSQL? You must modify `OrderService`
- `OrderService` is tightly coupled to MySQL

### Fixed — depend on an abstraction
```java
// The abstraction
public interface OrderRepository {
    void save(Order order);
}

// Concrete implementations
public class MySQLOrderRepository implements OrderRepository {
    public void save(Order order) { /* MySQL logic */ }
}

public class PostgreSQLOrderRepository implements OrderRepository {
    public void save(Order order) { /* PostgreSQL logic */ }
}

public class InMemoryOrderRepository implements OrderRepository {
    public void save(Order order) { /* in-memory for tests */ }
}

// High-level class depends on the abstraction — not the implementation
public class OrderService {
    private OrderRepository repository; // interface — not concrete class

    // Dependency is injected from outside
    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public void placeOrder(Order order) {
        repository.save(order); // works for any implementation
    }
}
```

```java
// Production — use MySQL
OrderService service = new OrderService(new MySQLOrderRepository());

// Tests — use in-memory, no real database needed
OrderService service = new OrderService(new InMemoryOrderRepository());

// Switch to PostgreSQL — zero changes to OrderService
OrderService service = new OrderService(new PostgreSQLOrderRepository());
```

This is exactly how **Spring Boot's `@Autowired` and `@Service`** work under the hood —
Spring injects the right implementation automatically.

---

## All 5 principles at a glance

| Letter | Principle | One line |
|--------|-----------|----------|
| **S** | Single Responsibility | One class = one job |
| **O** | Open/Closed | Add new behavior by adding code, not changing existing code |
| **L** | Liskov Substitution | Subclasses must honor their parent's contract |
| **I** | Interface Segregation | Don't force classes to implement methods they don't need |
| **D** | Dependency Inversion | Depend on interfaces, not concrete classes |

---

## How they connect in a real project

```java
// S — UserService only orchestrates, each class has one job
// D — depends on interfaces, not concrete classes
// O — new payment methods don't change existing code
public class OrderService {
    private OrderRepository repository;     // D — interface
    private PaymentProcessor payment;       // D — interface
    private NotificationService notifier;   // D — interface

    public OrderService(OrderRepository repository,
                        PaymentProcessor payment,
                        NotificationService notifier) {
        this.repository = repository;
        this.payment = payment;
        this.notifier = notifier;
    }

    public void placeOrder(Order order) {
        payment.process(order);     // O — any PaymentProcessor works
        repository.save(order);     // O — any Repository works
        notifier.notify(order);     // O — any Notifier works
    }
}
```

---

## Interview answers

### What are the SOLID principles?
Five design principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. They guide writing code that is maintainable, testable, and extensible.

### What is the Single Responsibility Principle?
A class should have only one reason to change — it should do one thing. Mixing concerns makes code harder to maintain and test.

### What is the Open/Closed Principle?
Classes should be open for extension but closed for modification. Add new behavior by creating new classes, not by changing existing ones.

### What is the Liskov Substitution Principle?
Any subclass should be usable in place of its parent without breaking the program. Subclasses must honor the contract defined by the parent.

### What is the Dependency Inversion Principle?
High-level classes should depend on abstractions (interfaces), not concrete implementations. This is the foundation of dependency injection in frameworks like Spring.

### How does DIP relate to Spring Boot?
Spring Boot uses dependency injection — you declare what interface you need and Spring provides the right implementation automatically. This is DIP in practice.
