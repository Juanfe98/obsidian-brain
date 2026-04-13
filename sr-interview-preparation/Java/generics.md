# Generics in Java

## Glossary

| Term | Meaning |
|------|---------|
| **Generic** | Code that works with any type, specified at the time you use it |
| **Type parameter** | A placeholder for a type, written as `<T>`. E.g. `List<T>` — T is replaced with a real type when used |
| **Type argument** | The actual type you plug in. E.g. `List<String>` — String is the type argument |
| **Raw type** | Using a generic class without specifying a type. E.g. `List` instead of `List<String>` — old, unsafe |
| **Type safety** | The compiler guarantees you only put the right types in — catches mistakes at compile time, not runtime |
| **Type erasure** | At runtime, Java removes all generic type info — generics only exist at compile time |
| **Bounded type** | Restricting what types are allowed. E.g. `<T extends Number>` — T must be a Number or subclass |
| **Wildcard** | The `?` symbol — means "some unknown type". Used when you don't care about the specific type |
| **Upper bound** | `<? extends X>` — the type must be X or a subclass of X |
| **Lower bound** | `<? super X>` — the type must be X or a superclass of X |
| **ClassCastException** | Runtime error when you try to cast an object to an incompatible type |

---

## The problem generics solve

Before generics (Java 1.4 and earlier), collections stored everything as `Object`.
You had to cast manually — and if you got it wrong, the program crashed at runtime.

```java
// Without generics — dangerous
List list = new ArrayList(); // raw type
list.add("Hello");
list.add(42);         // compiles fine — no complaints

String s = (String) list.get(0); // ok
String s2 = (String) list.get(1); // ClassCastException at RUNTIME — crashes!
```

The compiler had no idea what was in the list. The bug only appeared when the program ran.

---

## With generics — compile-time safety

```java
// With generics — safe
List<String> list = new ArrayList<>();
list.add("Hello");
list.add(42);  // COMPILE ERROR — caught immediately before the program even runs

String s = list.get(0); // no cast needed — Java knows it's a String
```

The compiler now enforces the type. Bugs are caught early.

---

## Generic classes

You can create your own classes that work with any type.

### Without generics — you'd need a separate class for every type
```java
public class IntBox {
    private int value;
    public IntBox(int value) { this.value = value; }
    public int getValue() { return value; }
}

public class StringBox {
    private String value;
    public StringBox(String value) { this.value = value; }
    public String getValue() { return value; }
}
// ... repeat for every type — terrible
```

### With generics — one class for all types
```java
public class Box<T> {        // T is a placeholder — "type parameter"
    private T value;

    public Box(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }
}
```

```java
// T becomes String
Box<String> stringBox = new Box<>("Hello");
String s = stringBox.getValue(); // "Hello" — no cast needed

// T becomes Integer
Box<Integer> intBox = new Box<>(42);
int n = intBox.getValue(); // 42

// T becomes a custom class
Box<Person> personBox = new Box<>(new Person("Juan"));
Person p = personBox.getValue();
```

One class, works with any type, fully type-safe.

---

## Generic methods

A method can also have its own type parameter, independent of the class:

```java
public class Utils {

    // Generic method — T is defined per method call
    public static <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.print(item + " ");
        }
        System.out.println();
    }

    public static <T> T getFirst(List<T> list) {
        return list.get(0);
    }
}
```

```java
Integer[] numbers = {1, 2, 3, 4};
String[] words = {"Hello", "World"};

Utils.printArray(numbers); // 1 2 3 4
Utils.printArray(words);   // Hello World

List<String> names = List.of("Juan", "Maria");
String first = Utils.getFirst(names); // "Juan"
```

---

## Bounded type parameters — restricting what T can be

Sometimes you want T to be any type, but within a certain range.

### Upper bound — `<T extends SomeClass>`
T must be SomeClass or any subclass of it.

```java
// T must be a Number or subclass (Integer, Double, Float...)
public static <T extends Number> double sum(List<T> list) {
    double total = 0;
    for (T item : list) {
        total += item.doubleValue(); // safe — we know T has doubleValue()
    }
    return total;
}
```

```java
List<Integer> ints = List.of(1, 2, 3);
List<Double> doubles = List.of(1.5, 2.5);

sum(ints);     // 6.0
sum(doubles);  // 4.0
sum(List.of("a", "b")); // COMPILE ERROR — String is not a Number
```

### Multiple bounds
```java
// T must implement both Comparable and Serializable
public <T extends Comparable<T> & Serializable> T findMax(List<T> list) { ... }
```

---

## Wildcards — when you don't know the exact type

A wildcard `?` means "I don't know or care what the specific type is."

### Unbounded wildcard `<?>`
"A list of anything"

```java
public void printList(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

printList(List.of(1, 2, 3));          // works
printList(List.of("a", "b", "c"));    // works
printList(List.of(new Person("Juan"))); // works
```

### Upper bounded wildcard `<? extends X>` — read safely
"A list of X or anything that extends X"
Use when you want to **read** from a collection.

```java
// Works with List<Integer>, List<Double>, List<Float> — all are Numbers
public double sumList(List<? extends Number> list) {
    double total = 0;
    for (Number n : list) {
        total += n.doubleValue();
    }
    return total;
}

sumList(List.of(1, 2, 3));       // works — Integer extends Number
sumList(List.of(1.5, 2.5));      // works — Double extends Number
```

### Lower bounded wildcard `<? super X>` — write safely
"A list of X or any superclass of X"
Use when you want to **add** to a collection.

```java
// Can add Integers to List<Integer>, List<Number>, or List<Object>
public void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}
```

### Easy memory trick — PECS
**P**roducer **E**xtends, **C**onsumer **S**uper

- If you're **reading** (producing values from the list) → use `extends`
- If you're **writing** (consuming values into the list) → use `super`

---

## Common naming conventions for type parameters

By convention, single uppercase letters are used:

| Letter | Typically means |
|--------|----------------|
| `T` | Type (generic, most common) |
| `E` | Element (used in collections) |
| `K` | Key (used in maps) |
| `V` | Value (used in maps) |
| `N` | Number |
| `R` | Return type |

```java
public interface Map<K, V> { ... }    // K = key type, V = value type
public interface List<E> { ... }      // E = element type
```

---

## Real-world example — a generic API response wrapper

In real projects you'll often see generics used to wrap API responses:

```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;           // could be a User, a List<Product>, anything

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public T getData() { return data; }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
}
```

```java
// Returns a single user
ApiResponse<User> userResponse = new ApiResponse<>(true, "OK", new User("Juan"));
User user = userResponse.getData();

// Returns a list of products
ApiResponse<List<Product>> productsResponse = new ApiResponse<>(true, "OK", productList);
List<Product> products = productsResponse.getData();
```

One wrapper class that works for any response type — no casting, fully type-safe.

---

## Type erasure — what happens at runtime

Generics exist only at **compile time**. When Java compiles your code,
it removes all generic type information — this is called **type erasure**.

At runtime, `List<String>` and `List<Integer>` are both just `List`.

```java
List<String> strings = new ArrayList<>();
List<Integer> integers = new ArrayList<>();

System.out.println(strings.getClass() == integers.getClass()); // true — both are just ArrayList
```

This is why you can't do:
```java
// These don't work — type info is gone at runtime
if (list instanceof List<String>) { ... }   // COMPILE ERROR
new T();                                     // COMPILE ERROR — can't instantiate T
T[] array = new T[10];                       // COMPILE ERROR
```

---

## Interview answers

### What are generics in Java?
A feature that lets you write classes and methods that work with any type, specified at compile time. They provide type safety — the compiler catches type mismatches before the program runs.

### What problem do generics solve?
Before generics, collections stored `Object` and required manual casting, which could cause `ClassCastException` at runtime. Generics move type checking to compile time.

### What is type erasure?
At runtime, Java removes all generic type information. `List<String>` and `List<Integer>` both become `List`. Generics only exist at compile time.

### What is a bounded type parameter?
A restriction on what type T can be. `<T extends Number>` means T must be Number or a subclass. It lets you call methods defined on the bound.

### What is a wildcard?
The `?` symbol representing an unknown type. Used when you don't need to know the exact type — just read from the collection (use `? extends`) or write to it (use `? super`).

### What is the PECS rule?
Producer Extends, Consumer Super. If you read from a collection use `<? extends T>`. If you write to a collection use `<? super T>`.
