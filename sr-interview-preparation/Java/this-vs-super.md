# `this` vs `super` Keywords

## `this` — refers to the current instance

### 1. Refer to current class fields (avoid naming ambiguity)
```java
public class Person {
    String name;

    Person(String name) {
        this.name = name; // this.name = field, name = parameter
    }
}
```

### 2. Call another constructor in the same class
```java
public class Person {
    String name;
    int age;

    Person(String name) {
        this(name, 0); // calls the constructor below
    }

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```
> Must be the **first line** in the constructor.

### 3. Pass current instance as argument
```java
someMethod(this); // passes this object to a method
```

---

## `super` — refers to the parent class

### 1. Call parent constructor
```java
public class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }
}

public class Dog extends Animal {
    String breed;

    Dog(String name, String breed) {
        super(name); // calls Animal(String name)
        this.breed = breed;
    }
}
```
> Must be the **first line** in the constructor.

### 2. Call parent method (when overridden)
```java
public class Animal {
    void speak() {
        System.out.println("...");
    }
}

public class Dog extends Animal {
    @Override
    void speak() {
        super.speak(); // runs Animal's speak()
        System.out.println("Woof!");
    }
}
```

### 3. Access parent field (when shadowed)
```java
public class Animal {
    String type = "Animal";
}

public class Dog extends Animal {
    String type = "Dog";

    void print() {
        System.out.println(super.type); // "Animal"
        System.out.println(this.type);  // "Dog"
    }
}
```

---

## Quick comparison

| | `this` | `super` |
|---|---|---|
| Refers to | Current instance | Parent class |
| Constructor call | `this(...)` — same class | `super(...)` — parent class |
| Method call | `this.method()` | `super.method()` |
| Must be first line? | Yes (when calling constructor) | Yes (when calling constructor) |

---

## Key rules
- `this(...)` and `super(...)` **cannot both appear** in the same constructor
- Both must be the **first statement** if used in a constructor
- `super` only goes **one level up** (direct parent)

---

## Interview answers

### What is `this` in Java?
A reference to the current object. Used to access fields/methods of the current class or call other constructors.

### What is `super` in Java?
A reference to the parent class. Used to call the parent constructor, access overridden methods, or access shadowed fields.

### Can you use both `this()` and `super()` in the same constructor?
No. Only one can appear, and it must be the first line.

### When would you use `super.method()`?
When you override a method but still want to run the parent's version of it.
