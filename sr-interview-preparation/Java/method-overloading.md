# Method Overloading

## Glossary

| Term | Meaning |
|------|---------|
| **Method signature** | The combination of a method's name + its parameter types. E.g. `add(int, int)` |
| **Overloading** | Defining multiple methods with the **same name** but **different parameters** in the same class |
| **Parameter** | A variable listed in a method's definition. E.g. `void greet(String name)` — `name` is a parameter |
| **Argument** | The actual value you pass when calling a method. E.g. `greet("Juan")` — `"Juan"` is the argument |
| **Return type** | What a method gives back. E.g. `int add(...)` returns an `int` |
| **Compile-time** | What Java checks/decides when it builds your code (before it runs) |
| **JVM** | Java Virtual Machine — the engine that actually runs your Java program |
| **Entry point** | The method Java looks for to start running your program — always `public static void main(String[] args)` |

---

## What is Method Overloading?

Method overloading means having **multiple methods with the same name** in the same class,
but each one has a **different set of parameters**.

Java decides which one to call based on the **arguments you pass** — and it does this at **compile time**.

```java
public class Calculator {

    // Version 1 — two integers
    public int add(int a, int b) {
        return a + b;
    }

    // Version 2 — three integers
    public int add(int a, int b, int c) {
        return a + b + c;
    }

    // Version 3 — two doubles
    public double add(double a, double b) {
        return a + b;
    }
}
```

```java
Calculator calc = new Calculator();

calc.add(2, 3);         // calls version 1 → 5
calc.add(2, 3, 4);      // calls version 2 → 9
calc.add(2.5, 3.5);     // calls version 3 → 6.0
```

Java looks at what you pass and picks the right version automatically.

---

## What makes a valid overload?

You must change at least one of these:
- Number of parameters
- Type of parameters
- Order of parameter types

```java
// Valid overloads
void print(String s)
void print(int n)
void print(String s, int n)
void print(int n, String s)  // different ORDER — valid

// NOT a valid overload — only return type changed
int getValue()
double getValue()  // COMPILE ERROR — same name + same params
```

> Changing only the **return type** is NOT enough. Java uses the method signature
> (name + param types) to tell methods apart — return type is not part of the signature.

---

## Real-world examples

### System.out.println() — the most common overloaded method you already use
```java
System.out.println("Hello");     // println(String)
System.out.println(42);          // println(int)
System.out.println(3.14);        // println(double)
System.out.println(true);        // println(boolean)
```
All named `println` — Java picks the right one based on what you pass.

### String.valueOf()
```java
String.valueOf(42);       // valueOf(int)
String.valueOf(3.14);     // valueOf(double)
String.valueOf(true);     // valueOf(boolean)
String.valueOf('A');      // valueOf(char)
```

### A real service example
```java
public class NotificationService {

    // Send to a single user
    public void send(String userId, String message) {
        // ...
    }

    // Send to multiple users
    public void send(List<String> userIds, String message) {
        // ...
    }

    // Send with a priority level
    public void send(String userId, String message, int priority) {
        // ...
    }
}
```

---

## Can you overload the `main` method?

**Yes — but Java will only use the standard one as the entry point.**

```java
public class MyApp {

    // This is the entry point — Java starts here
    public static void main(String[] args) {
        System.out.println("Program started");
        main("Juan"); // you can call your overloaded version manually
    }

    // This is a valid overload — but Java won't call this automatically
    public static void main(String name) {
        System.out.println("Hello, " + name);
    }

    // Also valid
    public static void main(int number) {
        System.out.println("Number: " + number);
    }
}
```

Output:
```
Program started
Hello, Juan
```

The JVM always looks for exactly `public static void main(String[] args)` to start the program.
Your other `main` methods exist and work — but they're just regular static methods that you have to call yourself.

---

## Overloading vs Overriding — don't confuse them

This is a very common interview trap.

| | Overloading | Overriding |
|---|---|---|
| Where | Same class | Subclass overrides parent's method |
| Method name | Same | Same |
| Parameters | Must be different | Must be identical |
| Decided at | Compile time | Runtime |
| Keyword needed | None | `@Override` |

```java
// OVERLOADING — same class, different params
public class Printer {
    void print(String s) { ... }
    void print(int n) { ... }      // overload
}

// OVERRIDING — subclass, same signature
public class FancyPrinter extends Printer {
    @Override
    void print(String s) { ... }   // override — replaces parent's version
}
```

---

## Interview answers

### What is method overloading?
Defining multiple methods with the same name in the same class, but with different parameters. Java picks the right one at compile time based on the arguments passed.

### What can you change to create a valid overload?
The number, type, or order of parameters. Changing only the return type is not enough — it causes a compile error.

### Can you overload the main method?
Yes. But the JVM only uses `public static void main(String[] args)` as the entry point. Other overloads exist but must be called manually from your code.

### What is the difference between overloading and overriding?
Overloading = same class, same name, different parameters, resolved at compile time.
Overriding = subclass replaces a parent method with the same signature, resolved at runtime.
