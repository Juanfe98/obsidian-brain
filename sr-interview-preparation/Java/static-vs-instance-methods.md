# Static vs Instance Methods

## Core difference

| | Instance method | Static method |
|---|---|---|
| Belongs to | The object | The class itself |
| Needs an object to call? | Yes | No |
| Can access instance fields? | Yes | No |
| Can access static fields? | Yes | Yes |
| Called via | `object.method()` | `ClassName.method()` |

---

## Instance method — needs an object

```java
public class BankAccount {
    double balance;

    public void deposit(double amount) {
        this.balance += amount; // accesses instance field
    }

    public double getBalance() {
        return this.balance;
    }
}

// Usage
BankAccount account = new BankAccount();
account.deposit(100);
account.getBalance(); // 100.0
```

Each `BankAccount` object has its own `balance`. The method operates on **that specific object's data**.

---

## Static method — belongs to the class

```java
public class MathUtils {
    public static int add(int a, int b) {
        return a + b;
    }

    public static double celsiusToFahrenheit(double c) {
        return c * 9 / 5 + 32;
    }
}

// Usage — no object needed
MathUtils.add(2, 3);
MathUtils.celsiusToFahrenheit(100);
```

No state, no object. Just input → output.

---

## Real-world examples

### Static: utility/helper classes
```java
// Java's own standard library
Math.abs(-5);
Math.max(10, 20);
Collections.sort(list);
Arrays.asList(1, 2, 3);
```
These don't need any object state — they just process what you pass in.

### Static: factory methods (alternative to constructors)
```java
public class DatabaseConnection {
    private String url;

    private DatabaseConnection(String url) {
        this.url = url;
    }

    // Static factory — controls how objects are created
    public static DatabaseConnection create(String url) {
        validate(url);
        return new DatabaseConnection(url);
    }

    private static void validate(String url) {
        if (url == null || url.isEmpty()) throw new IllegalArgumentException("Invalid URL");
    }
}

// Usage
DatabaseConnection conn = DatabaseConnection.create("jdbc:mysql://localhost/db");
```

### Instance: business logic tied to object state
```java
public class Order {
    List<Item> items;
    String status;

    public double calculateTotal() {
        return items.stream()
                    .mapToDouble(Item::getPrice)
                    .sum();
    }

    public void cancel() {
        if (this.status.equals("SHIPPED")) throw new IllegalStateException("Cannot cancel shipped order");
        this.status = "CANCELLED";
    }
}
```
These methods only make sense **in the context of a specific order**.

---

## The key question to decide which to use

> "Does this method need to know about a specific object's state?"

- **Yes** → instance method
- **No** → static method (utility, helper, factory)

---

## Common mistake — calling static method on an instance
```java
BankAccount acc = new BankAccount();
acc.deposit(100);       // correct — instance method
MathUtils.add(1, 2);    // correct — static method

// This compiles but is misleading — avoid it
MathUtils utils = new MathUtils();
utils.add(1, 2); // works but bad practice — use MathUtils.add()
```

---

## Interview answers

### What is the difference between static and instance methods?
Instance methods operate on object state and need an object to be called. Static methods belong to the class, have no access to instance state, and can be called without creating an object.

### When would you use a static method?
For utility/helper logic that doesn't depend on object state — math operations, conversions, factory methods, validators.

### Can a static method call an instance method?
Not directly — it has no reference to `this`. It would need an object passed as a parameter.

### Can an instance method call a static method?
Yes, always.
