# OOP Principles

## Glossary

| Term | Meaning |
|------|---------|
| **OOP** | Object-Oriented Programming — a way of writing code organized around objects that have data and behavior |
| **Class** | A blueprint/template for creating objects |
| **Object** | A concrete instance of a class |
| **Field** | A variable inside a class that holds data (also called attribute or property) |
| **Method** | A function inside a class that defines behavior |
| **Inheritance** | A class acquiring fields and methods from another class using `extends` |
| **Parent class** | The class being extended. Also called superclass or base class |
| **Child class** | The class that extends another. Also called subclass |
| **Override** | A child class providing its own version of a parent method |
| **Access modifier** | Keywords that control visibility: `public`, `private`, `protected`, package-private |
| **Getter/Setter** | Methods used to read or modify private fields safely |
| **Polymorphism** | One interface, many forms — the same method call behaves differently depending on the object |
| **Encapsulation** | Hiding internal data and exposing only what's needed |
| **Abstraction** | Hiding complexity — showing only the essential features |
| **Coupling** | How dependent two classes are on each other. Low coupling = good |

---

## The 4 Pillars of OOP

---

## 1. Encapsulation — "protect your data"

Encapsulation means **hiding the internal state** of an object and only
allowing access through controlled methods (getters/setters).

The idea: don't let anyone directly reach in and change your data. Make them go through a door you control.

### Without encapsulation — dangerous
```java
public class BankAccount {
    public double balance; // anyone can change this directly
}

BankAccount acc = new BankAccount();
acc.balance = -99999; // no validation — this should never be allowed
```

### With encapsulation — safe
```java
public class BankAccount {
    private double balance; // hidden from outside

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount > balance) throw new IllegalStateException("Insufficient funds");
        balance -= amount;
    }
}

BankAccount acc = new BankAccount();
acc.balance = -99999;   // COMPILE ERROR — balance is private
acc.deposit(-500);      // throws exception — protected by validation
acc.deposit(100);       // works correctly
```

### Access modifiers at a glance

| Modifier | Accessible from |
|----------|----------------|
| `private` | Only within the same class |
| `protected` | Same class + subclasses + same package |
| `public` | Everywhere |
| (none) | Same package only |

---

## 2. Inheritance — "reuse and extend"

Inheritance lets a child class **reuse** fields and methods from a parent class,
and **add or override** behavior on top of it.

Think of it as: a `Dog` IS an `Animal`. It gets everything Animal has, plus its own stuff.

```java
public class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + " is eating");
    }

    public void sleep() {
        System.out.println(name + " is sleeping");
    }
}

public class Dog extends Animal {
    String breed;

    Dog(String name, String breed) {
        super(name); // reuse Animal's constructor
        this.breed = breed;
    }

    public void fetch() {
        System.out.println(name + " fetches the ball!");
    }
}

public class Cat extends Animal {
    Cat(String name) {
        super(name);
    }

    public void purr() {
        System.out.println(name + " purrs...");
    }
}
```

```java
Dog dog = new Dog("Rex", "Labrador");
dog.eat();    // inherited from Animal
dog.sleep();  // inherited from Animal
dog.fetch();  // Dog's own method

Cat cat = new Cat("Whiskers");
cat.eat();    // inherited from Animal
cat.purr();   // Cat's own method
```

### Key rules of inheritance
- A class can only extend **one** parent class (single inheritance)
- A child class inherits all `public` and `protected` members
- `private` members are NOT inherited — they're hidden
- Use `super` to access parent methods/constructors

---

## 3. Polymorphism — "one interface, many behaviors"

Polymorphism means the **same method call** can produce **different results**
depending on which object is actually behind it.

This is the most powerful OOP concept and is what makes code flexible and extensible.

### There are two types:

### Compile-time polymorphism = Method Overloading
The compiler picks which method to call based on the parameters.
(We already covered this — same name, different params)

```java
void print(String s) { ... }
void print(int n) { ... }
// Java decides at compile time which one to call
```

### Runtime polymorphism = Method Overriding
Java decides at **runtime** which version of a method to call,
based on the actual object type — not the reference type.

```java
public class Animal {
    public void speak() {
        System.out.println("...");
    }
}

public class Dog extends Animal {
    @Override
    public void speak() {
        System.out.println("Woof!");
    }
}

public class Cat extends Animal {
    @Override
    public void speak() {
        System.out.println("Meow!");
    }
}
```

```java
// The reference type is Animal — but the actual object is different
Animal a1 = new Dog("Rex");
Animal a2 = new Cat("Whiskers");
Animal a3 = new Animal();

a1.speak(); // Woof!   — Java looks at the actual object (Dog)
a2.speak(); // Meow!   — Java looks at the actual object (Cat)
a3.speak(); // ...     — Java looks at the actual object (Animal)
```

Notice: all three variables are of type `Animal` — but Java knows at runtime
what the real object is, and calls the right `speak()`.

### Why is this powerful?
```java
// You can write one method that works for ANY Animal
public void makeItSpeak(Animal animal) {
    animal.speak(); // works for Dog, Cat, Bird — anything that extends Animal
}

makeItSpeak(new Dog("Rex"));      // Woof!
makeItSpeak(new Cat("Whiskers")); // Meow!

// Add a new animal tomorrow — this method still works with zero changes
makeItSpeak(new Parrot("Polly")); // Hello!
```

This is the open/closed principle in action — open for extension, closed for modification.

---

## 4. Abstraction — "hide the complexity"

Abstraction means exposing **only what's necessary** and hiding the details of how it works.

You use something without needing to know how it works internally.

Think of driving a car — you use the steering wheel and pedals without knowing
how the engine, transmission, or brakes work internally.

### In Java — abstraction is achieved through:

**Abstract classes** (already covered)
```java
public abstract class PaymentProcessor {
    // Hide implementation details — each provider handles it differently
    public abstract void processPayment(double amount);

    // Shared concrete behavior
    public void logTransaction(double amount) {
        System.out.println("Transaction logged: $" + amount);
    }
}

public class StripeProcessor extends PaymentProcessor {
    @Override
    public void processPayment(double amount) {
        // Stripe-specific implementation hidden here
        System.out.println("Processing $" + amount + " via Stripe");
    }
}

public class PayPalProcessor extends PaymentProcessor {
    @Override
    public void processPayment(double amount) {
        // PayPal-specific implementation hidden here
        System.out.println("Processing $" + amount + " via PayPal");
    }
}
```

**Interfaces** (already covered)
```java
public interface EmailService {
    void sendEmail(String to, String subject, String body);
    // Caller doesn't care if it uses SendGrid, Mailchimp, or SMTP
}
```

```java
// The rest of the app only knows about the interface
// The implementation details are abstracted away
EmailService emailService = new SendGridEmailService();
emailService.sendEmail("user@example.com", "Welcome!", "Hello!");
```

---

## How all 4 pillars work together

Here's a real-world example that combines all four:

```java
// ABSTRACTION — hide implementation details behind an interface
public interface Notification {
    void send(String message);
}

// INHERITANCE + ENCAPSULATION — shared base with protected state
public abstract class BaseNotification implements Notification {
    private String recipient; // ENCAPSULATION — private field

    BaseNotification(String recipient) {
        this.recipient = recipient;
    }

    protected String getRecipient() { // controlled access
        return recipient;
    }
}

// POLYMORPHISM — different behavior, same interface
public class EmailNotification extends BaseNotification {
    EmailNotification(String email) { super(email); }

    @Override
    public void send(String message) {
        System.out.println("Email to " + getRecipient() + ": " + message);
    }
}

public class SmsNotification extends BaseNotification {
    SmsNotification(String phone) { super(phone); }

    @Override
    public void send(String message) {
        System.out.println("SMS to " + getRecipient() + ": " + message);
    }
}
```

```java
// All treated as Notification — polymorphism in action
List<Notification> notifications = List.of(
    new EmailNotification("juan@email.com"),
    new SmsNotification("+1234567890")
);

for (Notification n : notifications) {
    n.send("Your order has shipped!"); // each handles it differently
}
```

Output:
```
Email to juan@email.com: Your order has shipped!
SMS to +1234567890: Your order has shipped!
```

---

## Quick summary

| Pillar | One line | Keyword |
|--------|----------|---------|
| **Encapsulation** | Protect your data — hide fields, expose methods | `private` + getters/setters |
| **Inheritance** | Reuse and extend — child gets parent's behavior | `extends` |
| **Polymorphism** | Same call, different behavior depending on the object | `@Override` |
| **Abstraction** | Hide complexity — show only what's needed | `abstract`, `interface` |

---

## Interview answers

### What are the 4 pillars of OOP?
Encapsulation, Inheritance, Polymorphism, and Abstraction.

### What is encapsulation?
Hiding internal state by making fields private and exposing controlled access through methods. Prevents invalid state and reduces coupling.

### What is inheritance?
A child class acquiring fields and methods from a parent class using `extends`. Promotes code reuse. Java supports single inheritance only.

### What is polymorphism?
The ability for the same method call to behave differently depending on the actual object. At compile time via overloading, at runtime via overriding.

### What is abstraction?
Hiding implementation details and exposing only what's necessary. Achieved through abstract classes and interfaces.

### What is the difference between abstraction and encapsulation?
Encapsulation is about protecting data (hiding fields). Abstraction is about hiding complexity (hiding implementation). They work together but are different concerns.
