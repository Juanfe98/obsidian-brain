# Exception Handling in Java

## Glossary

| Term | Meaning |
|------|---------|
| **Exception** | An unexpected event that disrupts the normal flow of a program. E.g. dividing by zero, file not found |
| **Error** | A serious problem the program usually can't recover from. E.g. running out of memory |
| **Throw** | When Java (or you) signals that something went wrong — it "throws" an exception object |
| **Catch** | A block of code that handles a thrown exception so the program doesn't crash |
| **Stack trace** | The log Java prints when an exception is not caught — shows where it happened |
| **Checked exception** | An exception the compiler forces you to handle or declare. E.g. `IOException` |
| **Unchecked exception** | An exception the compiler does NOT force you to handle. E.g. `NullPointerException` |
| **RuntimeException** | The parent class of all unchecked exceptions |
| **finally** | A block that always runs — whether an exception happened or not |
| **propagate** | When an exception is not caught in the current method, it "bubbles up" to the caller |

---

## Why do we need exception handling?

Without it, one unexpected error crashes the entire program:

```java
int result = 10 / 0; // ArithmeticException — program crashes immediately
System.out.println("This never runs");
```

With exception handling, you control what happens when things go wrong — log it, show a message, retry, etc.

---

## The exception hierarchy

```
Throwable
├── Error                  (serious, don't catch these)
│   ├── OutOfMemoryError
│   └── StackOverflowError
└── Exception
    ├── IOException        (checked)
    ├── SQLException       (checked)
    └── RuntimeException   (unchecked)
        ├── NullPointerException
        ├── IllegalArgumentException
        ├── ArrayIndexOutOfBoundsException
        └── ArithmeticException
```

---

## try / catch / finally

The basic structure:

```java
try {
    // code that might throw an exception
} catch (ExceptionType e) {
    // what to do if that exception happens
} finally {
    // always runs — with or without exception
}
```

### Simple example
```java
public class Division {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;               // throws ArithmeticException
            System.out.println(result);        // never reached
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero: " + e.getMessage());
        } finally {
            System.out.println("This always runs");
        }
    }
}
```

Output:
```
Cannot divide by zero: / by zero
This always runs
```

---

## Catching multiple exceptions

You can have multiple `catch` blocks for different exception types:

```java
public void readFile(String path) {
    try {
        FileReader file = new FileReader(path);  // might throw FileNotFoundException
        int data = file.read();                  // might throw IOException
    } catch (FileNotFoundException e) {
        System.out.println("File not found: " + path);
    } catch (IOException e) {
        System.out.println("Error reading file: " + e.getMessage());
    } finally {
        System.out.println("Done attempting to read file");
    }
}
```

> Order matters — always catch **more specific** exceptions before **more general** ones.

```java
// WRONG — Exception is too broad, catches everything before the specific ones
catch (Exception e) { ... }
catch (IOException e) { ... }       // UNREACHABLE — compile warning

// CORRECT — specific first, general last
catch (FileNotFoundException e) { ... }
catch (IOException e) { ... }
catch (Exception e) { ... }
```

### Or catch multiple in one line (Java 7+)
```java
catch (FileNotFoundException | SQLException e) {
    System.out.println("Data error: " + e.getMessage());
}
```

---

## Checked vs Unchecked exceptions

### Checked exceptions — compiler forces you to handle them
These are exceptions that Java knows might happen for external reasons (files, networks, databases).
The compiler will refuse to build your code unless you either catch them or declare them.

```java
// This won't compile — FileNotFoundException is checked
public void readFile() {
    FileReader f = new FileReader("file.txt"); // COMPILE ERROR
}

// Option 1: catch it
public void readFile() {
    try {
        FileReader f = new FileReader("file.txt");
    } catch (FileNotFoundException e) {
        System.out.println("File not found");
    }
}

// Option 2: declare it with throws — let the caller handle it
public void readFile() throws FileNotFoundException {
    FileReader f = new FileReader("file.txt");
}
```

### Unchecked exceptions — compiler doesn't force you to handle them
These usually represent bugs in your code — bad input, null values, wrong index, etc.

```java
String name = null;
System.out.println(name.length()); // NullPointerException — unchecked, no compile error

int[] arr = {1, 2, 3};
System.out.println(arr[5]);        // ArrayIndexOutOfBoundsException — unchecked
```

You can still catch them, but Java won't force you to.

---

## Throwing exceptions yourself

You can throw exceptions manually using the `throw` keyword:

```java
public class UserService {

    public User findUser(String id) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be empty");
        }

        User user = database.find(id);

        if (user == null) {
            throw new RuntimeException("User not found: " + id);
        }

        return user;
    }
}
```

---

## Custom exceptions

You can create your own exception classes for domain-specific errors:

```java
// Define the custom exception
public class InsufficientFundsException extends RuntimeException {
    double amount;

    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Missing: " + amount);
        this.amount = amount;
    }
}
```

```java
// Use it
public class BankAccount {
    double balance;

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
    }
}
```

```java
// Catch it
try {
    account.withdraw(500);
} catch (InsufficientFundsException e) {
    System.out.println(e.getMessage()); // Insufficient funds. Missing: 300.0
}
```

This is very common in real projects — each domain has its own exception types.

---

## finally — practical use case

`finally` is mainly used to **release resources** — close a file, close a DB connection, etc.
You want this to happen no matter what.

```java
FileReader file = null;
try {
    file = new FileReader("data.txt");
    // read file...
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
} finally {
    if (file != null) {
        file.close(); // always close the file
    }
}
```

### try-with-resources (Java 7+) — cleaner way to handle this
Java can close resources automatically if they implement `AutoCloseable`:

```java
// The file is closed automatically when the try block ends
try (FileReader file = new FileReader("data.txt")) {
    // read file...
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

No need for `finally` just to close things — this is the modern preferred way.

---

## Exception propagation

If you don't catch an exception, it bubbles up to whoever called the method:

```java
public void methodC() {
    throw new RuntimeException("Something broke");
}

public void methodB() {
    methodC(); // exception not caught here — propagates up
}

public void methodA() {
    try {
        methodB(); // catches the exception from methodC
    } catch (RuntimeException e) {
        System.out.println("Caught in methodA: " + e.getMessage());
    }
}
```

The exception travels up the call stack until something catches it — or the program crashes.

---

## Quick comparison: checked vs unchecked

| | Checked | Unchecked |
|---|---|---|
| Compiler forces handling? | Yes | No |
| Parent class | `Exception` | `RuntimeException` |
| Typical cause | External systems (files, DB, network) | Programming bugs (null, bad index) |
| Examples | `IOException`, `SQLException` | `NullPointerException`, `IllegalArgumentException` |

---

## Interview answers

### What is an exception in Java?
An unexpected event that disrupts normal program flow. Java represents it as an object that gets thrown and can be caught.

### What is the difference between checked and unchecked exceptions?
Checked exceptions are enforced by the compiler — you must catch or declare them. They represent recoverable external issues. Unchecked exceptions (RuntimeException subclasses) usually represent programming bugs and the compiler doesn't force you to handle them.

### What does `finally` do?
It runs always — whether or not an exception was thrown. Used to release resources like files or DB connections.

### What is try-with-resources?
A Java 7+ feature that automatically closes resources (files, connections) when the try block ends, without needing a finally block.

### What is the difference between `throw` and `throws`?
`throw` is used to actually throw an exception. `throws` is used in a method signature to declare that the method might throw a checked exception, leaving it for the caller to handle.

### Can you create custom exceptions?
Yes. Extend `RuntimeException` for unchecked or `Exception` for checked. Custom exceptions are useful for domain-specific error handling.
