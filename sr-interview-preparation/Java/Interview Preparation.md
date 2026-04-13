
# Java String Pool

## What is it?
The **String Pool** is a special memory area where Java stores and reuses **string literals**.

```java
String a = "hello";
String b = "hello";
```

Both `a` and `b` usually point to the same pooled object.

```java
System.out.println(a == b); // true
```

## Why does Java use it?
- Saves memory
- Improves performance
- Safe because `String` is immutable

## `==` vs `equals()`
- `==` compares references
- `equals()` compares content

```java
String a = "hello";
String b = "hello";
String c = new String("hello");

System.out.println(a == b);      // true
System.out.println(a == c);      // false
System.out.println(a.equals(c)); // true
```

## What happens if you reassign `b`?
```java
String a = "hello";
String b = "hello";

b = "world";
```

Result:
- `a` is still `"hello"`
- `b` now points to `"world"`

Strings are **immutable**, so Java does not modify `"hello"`. It just changes the reference held by `b`.

## What happens with `b += "!"`?
```java
String a = "hello";
String b = "hello";

b += "!";
```

This is roughly:

```java
b = b + "!";
```

Result:
- `a` stays `"hello"`
- `b` becomes `"hello!"`

Java creates a **new String** because strings cannot be changed in place.

## `intern()`
`intern()` returns the pooled version of a string.

```java
String x = new String("hello");
String y = x.intern();
String z = "hello";

System.out.println(x == z); // false
System.out.println(y == z); // true
```

## Interview answers

### What is the Java String Pool?
A memory area where Java stores and reuses string literals to save memory and improve performance.

### Why is it safe to reuse strings?
Because `String` is immutable.

### What is the difference between `==` and `equals()`?
`==` compares references, `equals()` compares content.

### What does `new String("hello")` do?
Creates a new object in heap memory, separate from the pooled literal.

### What happens when you do `b = "world"`?
`b` points to a new string; the original string is not modified.

### What happens when you do `b += "!"`?
Java creates a new string and reassigns `b`.

### What does `intern()` do?
Returns the pooled version of the string.
