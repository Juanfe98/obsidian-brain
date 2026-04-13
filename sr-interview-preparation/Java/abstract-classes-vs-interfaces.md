# Abstract Classes vs Interfaces

## Glossary

| Term | Meaning |
|------|---------|
| **Abstract class** | A class that cannot be instantiated (you can't do `new AbstractClass()`). It exists to be extended by other classes |
| **Interface** | A contract that defines what methods a class must have, without defining how they work |
| **Abstract method** | A method with no body — just a signature. The subclass is forced to implement it |
| **Concrete method** | A regular method with a full body/implementation |
| **Extend** | When a class inherits from another class using `extends` |
| **Implement** | When a class fulfills an interface's contract using `implements` |
| **Instantiate** | Creating an object from a class using `new` |
| **Subclass** | A class that extends another class. Also called a "child class" |
| **Override** | Providing your own implementation of a method defined in a parent class or interface |

---

## The problem they both solve

Sometimes you want to define a **template or contract** that other classes must follow,
without writing the full implementation yourself.

For example: every `Animal` can `speak()` — but *how* they speak is different.
You don't want to implement `speak()` in `Animal`, you want to **force each subclass to do it**.

Both abstract classes and interfaces help you do that — but in different ways.

---

## Abstract Class

An abstract class is like a **partially built class**. It can have:
- Abstract methods (no body — subclasses must implement them)
- Concrete methods (full implementation — subclasses inherit them)
- Instance fields (regular variables that hold state)
- Constructors

```java
public abstract class Animal {
    String name; // instance field — each animal has a name

    // Constructor — even abstract classes can have one
    Animal(String name) {
        this.name = name;
    }

    // Abstract method — no body, subclass MUST implement this
    public abstract void speak();

    // Concrete method — already implemented, subclasses inherit it
    public void sleep() {
        System.out.println(name + " is sleeping...");
    }
}
```

Now any class that extends `Animal` is **forced** to implement `speak()`:

```java
public class Dog extends Animal {
    Dog(String name) {
        super(name); // calls Animal's constructor
    }

    @Override
    public void speak() {
        System.out.println(name + " says: Woof!");
    }
}

public class Cat extends Animal {
    Cat(String name) {
        super(name);
    }

    @Override
    public void speak() {
        System.out.println(name + " says: Meow!");
    }
}
```

```java
// Usage
Dog dog = new Dog("Rex");
dog.speak();  // Rex says: Woof!
dog.sleep();  // Rex is sleeping... (inherited from Animal)

Animal a = new Animal("?"); // ERROR — cannot instantiate abstract class
```

---

## Interface

An interface is a **pure contract**. It says: "any class that implements me MUST have these methods."

It does NOT say how — just what.

```java
public interface Flyable {
    void fly(); // abstract by default — no body needed
    void land();
}
```

Any class that `implements Flyable` must provide `fly()` and `land()`:

```java
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("Bird flaps wings and flies");
    }

    @Override
    public void land() {
        System.out.println("Bird lands on a branch");
    }
}

public class Airplane implements Flyable {
    @Override
    public void fly() {
        System.out.println("Airplane uses engines to fly");
    }

    @Override
    public void land() {
        System.out.println("Airplane lands on runway");
    }
}
```

```java
// Both are Flyable — you can treat them the same way
Flyable f1 = new Bird();
Flyable f2 = new Airplane();

f1.fly(); // Bird flaps wings and flies
f2.fly(); // Airplane uses engines to fly
```

Notice: `Bird` and `Airplane` have nothing in common — one is an animal, one is a machine.
An interface lets completely unrelated classes share a common contract.

---

## A class can implement MULTIPLE interfaces

This is a big deal. In Java, a class can only extend **one** class — but it can implement **many** interfaces.

```java
public interface Flyable {
    void fly();
}

public interface Swimmable {
    void swim();
}

// Duck can both fly and swim
public class Duck extends Animal implements Flyable, Swimmable {
    Duck(String name) {
        super(name);
    }

    @Override
    public void speak() {
        System.out.println("Quack!");
    }

    @Override
    public void fly() {
        System.out.println("Duck flies low over the water");
    }

    @Override
    public void swim() {
        System.out.println("Duck paddles across the pond");
    }
}
```

---

## Default methods in interfaces (Java 8+)

Since Java 8, interfaces can have **default methods** — methods with a body.
This lets you add new methods to an interface without breaking all existing classes that implement it.

```java
public interface Flyable {
    void fly();

    // Default method — classes don't have to override this
    default void checkWeather() {
        System.out.println("Checking weather before flying...");
    }
}
```

---

## Head to head comparison

| | Abstract Class | Interface |
|---|---|---|
| Can have abstract methods? | Yes | Yes (all methods are abstract by default) |
| Can have concrete methods? | Yes | Yes (only with `default` keyword, Java 8+) |
| Can have instance fields? | Yes | No (only constants) |
| Can have a constructor? | Yes | No |
| Extend/Implement keyword | `extends` | `implements` |
| How many can a class use? | Only **one** | **Many** |
| Represents | A shared base with common behavior | A capability or contract |

---

## How to decide which one to use

Ask yourself:

### Use an **Abstract Class** when:
- Classes share common code/behavior (e.g., `sleep()` is the same for all animals)
- You need shared instance fields (e.g., all animals have a `name`)
- There is a clear **"is-a"** relationship (Dog IS an Animal)

### Use an **Interface** when:
- Unrelated classes need to share a contract (Bird and Airplane are both Flyable)
- You want a class to have multiple capabilities
- There is a **"can-do"** relationship (Duck CAN fly, CAN swim)

> **Rule of thumb:**
> Abstract class = what something **IS**
> Interface = what something **CAN DO**

---

## Real-world examples

### Abstract class — Spring's `AbstractController`
Spring framework has abstract classes that handle common HTTP logic.
You extend them and only implement what's specific to your endpoint.

### Interfaces everywhere in Java
```java
List<String> list = new ArrayList<>();  // ArrayList implements List interface
List<String> list2 = new LinkedList<>(); // LinkedList also implements List

// You can swap implementations without changing your code
// because both honor the List contract
```

```java
Comparable    // any class that can be sorted implements this
Runnable      // any class that can run in a thread implements this
Serializable  // any class that can be saved to disk implements this
```

---

## Interview answers

### What is an abstract class?
A class that cannot be instantiated and may contain abstract methods (no body) that subclasses must implement. It can also have concrete methods and fields shared by all subclasses.

### What is an interface?
A contract that defines what methods a class must implement, without defining how. A class can implement multiple interfaces.

### What is the difference between abstract classes and interfaces?
Abstract classes can have state (fields), constructors, and concrete methods — they represent a shared base. Interfaces define capabilities/contracts and a class can implement many of them. Use abstract classes for "is-a" relationships and interfaces for "can-do" capabilities.

### Can you instantiate an abstract class?
No. You can only instantiate its concrete subclasses.

### Can an interface have method implementations?
Yes, since Java 8, using the `default` keyword.

### Why can a class only extend one class but implement many interfaces?
To avoid the "diamond problem" — if a class extended two classes that both had the same method, Java wouldn't know which one to use. Interfaces avoid this issue (especially before default methods).
