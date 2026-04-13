# Java Memory Model

## Glossary

| Term | Meaning |
|------|---------|
| **JVM** | Java Virtual Machine — the engine that runs your Java program |
| **Memory** | Space your program uses to store data while running |
| **Stack** | A region of memory that stores method calls and local variables. Each thread has its own stack |
| **Heap** | A region of memory where all objects are stored. Shared across all threads |
| **Stack frame** | A block of memory pushed onto the stack when a method is called. Removed when the method returns |
| **Local variable** | A variable declared inside a method. Lives on the stack |
| **Reference** | A variable that holds the memory address of an object on the heap |
| **Garbage** | An object with no references pointing to it — nobody can reach it anymore |
| **Garbage Collector (GC)** | A JVM process that automatically finds and removes garbage objects to free memory |
| **Memory leak** | When objects are no longer needed but still have references — GC can't collect them |
| **OutOfMemoryError** | Thrown when the heap is full and GC can't free enough space |
| **StackOverflowError** | Thrown when the stack is full — usually caused by infinite recursion |
| **Metaspace** | Where Java stores class definitions and metadata (replaced PermGen in Java 8+) |

---

## Why does this matter?

Understanding memory helps you:
- Write more efficient code
- Diagnose bugs like `NullPointerException`, `OutOfMemoryError`, `StackOverflowError`
- Understand why objects behave the way they do when passed around
- Answer senior-level interview questions about performance

---

## The two main memory areas: Stack and Heap

```
┌─────────────────────────────────────────────────┐
│                    JVM Memory                   │
│                                                 │
│   ┌─────────────┐        ┌──────────────────┐   │
│   │    STACK    │        │      HEAP        │   │
│   │             │        │                  │   │
│   │ method calls│        │  all objects     │   │
│   │ local vars  │        │  created with    │   │
│   │ references  │───────►│  new             │   │
│   │             │        │                  │   │
│   │ per thread  │        │  shared by all   │   │
│   │             │        │  threads         │   │
│   └─────────────┘        └──────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │               METASPACE                 │   │
│   │    class definitions, static fields     │   │
│   └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## The Stack

The stack stores:
- **Method calls** — every time you call a method, a frame is pushed onto the stack
- **Local variables** — variables declared inside a method
- **Primitive values** — stored directly (int, double, boolean, etc.)
- **References** — the address pointing to an object on the heap

When a method finishes, its frame is **popped off** the stack automatically.
You don't manage this — Java does it for you.

```java
public class Example {
    public static void main(String[] args) {  // frame 1 pushed
        int x = 10;                           // x lives on the stack
        String name = greet("Juan");          // frame 2 pushed
        System.out.println(name);
    }                                         // frame 1 popped

    public static String greet(String person) { // frame 2
        String message = "Hello, " + person;    // message lives on stack
        return message;
    }                                           // frame 2 popped
}
```

### StackOverflowError — when the stack runs out of space
The most common cause is infinite recursion — a method that keeps calling itself:

```java
public void infinite() {
    infinite(); // calls itself forever — stack fills up → StackOverflowError
}
```

---

## The Heap

The heap stores:
- **All objects** created with `new`
- **Arrays**
- **Instance fields** of objects
- **Strings** (via String Pool — also on the heap)

The heap is shared across all threads — which is why thread safety matters.

```java
public static void main(String[] args) {
    // "name" reference lives on STACK
    // new Person(...) object lives on HEAP
    Person person = new Person("Juan", 30);
}
```

```
STACK                    HEAP
┌──────────────┐         ┌─────────────────────────┐
│ person  ─────┼────────►│ Person {                │
│              │         │   name = "Juan"          │
│              │         │   age  = 30              │
│              │         │ }                        │
└──────────────┘         └─────────────────────────┘
```

The variable `person` on the stack holds a **reference** (memory address) to the object on the heap.

---

## What happens when you pass objects to methods

This is a very common interview question and source of confusion.

Java is **always pass-by-value** — but for objects, the value being passed is the **reference**.

```java
public static void main(String[] args) {
    Person p = new Person("Juan");
    changeName(p);
    System.out.println(p.name); // "Carlos" — the object was modified
}

public static void changeName(Person person) {
    person.name = "Carlos"; // modifies the object on the heap
}
```

Why? Because `p` and `person` both hold a reference to the **same object** on the heap.
Modifying the object through either reference changes the same thing.

```java
public static void main(String[] args) {
    Person p = new Person("Juan");
    replace(p);
    System.out.println(p.name); // still "Juan" — p was not changed
}

public static void replace(Person person) {
    person = new Person("Carlos"); // creates a new object — local reference only
    // the original p in main still points to "Juan"
}
```

Reassigning the local parameter does NOT affect the original reference in the caller.

---

## Garbage Collection

In languages like C, you manually allocate and free memory.
Java handles this automatically through the **Garbage Collector (GC)**.

The GC runs in the background and finds objects that are **no longer reachable**
(no reference points to them) and frees their memory.

```java
Person p = new Person("Juan");  // object created on heap
p = new Person("Maria");        // "Juan" object has no reference → eligible for GC
p = null;                       // "Maria" object has no reference → eligible for GC
```

You can't force GC to run (calling `System.gc()` is just a suggestion — JVM may ignore it).

### How GC decides what to collect — Reachability

An object is **reachable** if there is any path from a root reference to it.
Root references are: local variables, static fields, active thread stacks.

```java
// Object IS reachable — still referenced
Person p = new Person("Juan");

// Object is NOT reachable — can be collected
Person p2 = new Person("Maria");
p2 = null; // cut the reference
```

---

## Heap generations — how GC is organized

The heap is divided into regions to make GC more efficient:

```
HEAP
┌─────────────────────────────────────────────────┐
│                  Young Generation               │
│   ┌──────────┐   ┌──────────┐  ┌─────────────┐ │
│   │   Eden   │   │Survivor 0│  │ Survivor 1  │ │
│   │ (new obj)│   │          │  │             │ │
│   └──────────┘   └──────────┘  └─────────────┘ │
├─────────────────────────────────────────────────┤
│                  Old Generation                 │
│         (long-lived objects)                    │
└─────────────────────────────────────────────────┘
```

- **Eden** — new objects start here
- **Survivor spaces** — objects that survive a GC cycle move here
- **Old Generation** — objects that survive many cycles are promoted here

**Minor GC** — cleans Young Generation (fast, happens often)
**Major/Full GC** — cleans Old Generation (slow, pauses the app)

You don't need to memorize all of this — but knowing Young vs Old generation exists shows senior-level awareness.

---

## Memory leak in Java

Even though Java has GC, memory leaks can still happen — when objects are
no longer needed but you accidentally keep a reference to them.

```java
// Classic memory leak — adding to a list but never removing
public class Cache {
    private static List<byte[]> cache = new ArrayList<>();

    public void addToCache() {
        cache.add(new byte[1024 * 1024]); // adds 1MB each time
        // nobody ever removes from this list
        // objects stay reachable → GC can never collect them
        // eventually → OutOfMemoryError
    }
}
```

Common causes of memory leaks:
- Static collections that grow forever
- Listeners/callbacks that are registered but never removed
- Unclosed resources (streams, connections) — use try-with-resources

---

## Metaspace

Where Java stores:
- Class definitions (bytecode)
- Static fields
- Method metadata

Before Java 8 this was called **PermGen** and had a fixed size — it was a common source
of `OutOfMemoryError: PermGen space` in older apps. Metaspace grows dynamically.

---

## Quick summary

| Area | Stores | Managed by | Per thread? |
|------|--------|------------|-------------|
| Stack | Method frames, local vars, primitives, references | JVM automatically | Yes — each thread has its own |
| Heap | All objects, arrays, instance fields | Garbage Collector | No — shared |
| Metaspace | Class definitions, static fields | JVM | No — shared |

---

## Interview answers

### What is the difference between stack and heap memory?
Stack stores method calls, local variables, and primitives — managed automatically per thread. Heap stores all objects — shared across threads and managed by the Garbage Collector.

### What causes a StackOverflowError?
The stack runs out of space — most commonly caused by infinite recursion.

### What causes an OutOfMemoryError?
The heap is full and the GC cannot free enough space — often caused by a memory leak or objects being held longer than needed.

### What is the Garbage Collector?
A JVM process that automatically finds and removes objects with no reachable references, freeing heap memory.

### Is Java pass-by-value or pass-by-reference?
Java is always pass-by-value. For objects, the value passed is the reference (memory address). You can modify the object's fields through the reference, but you cannot change what the original variable points to.

### What is a memory leak in Java?
When objects are no longer needed but still have references — the GC cannot collect them. The heap fills up over time, eventually causing OutOfMemoryError.
