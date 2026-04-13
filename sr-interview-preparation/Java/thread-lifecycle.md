# Lifecycle of a Thread in Java

## Glossary

| Term | Meaning |
|------|---------|
| **Thread** | A single path of execution inside a program. Multiple threads = multiple things happening at the same time |
| **Process** | A running program. A process can have many threads inside it |
| **Concurrency** | Multiple threads making progress, not necessarily at the exact same instant |
| **Parallelism** | Multiple threads running at the literally same instant (requires multiple CPU cores) |
| **Runnable interface** | A Java interface with one method: `run()`. Defines what a thread will do |
| **Thread class** | Java's built-in class to create and control threads |
| **Scheduler** | The JVM/OS decides which thread runs and when — you don't control this directly |
| **Blocked** | A thread is waiting for something external (a lock, I/O) before it can continue |
| **Waiting** | A thread paused itself voluntarily until another thread wakes it up |
| **Synchronized** | A keyword that ensures only one thread can access a block of code at a time |
| **Lock / Monitor** | An internal mechanism Java uses to control access to synchronized code |
| **Deadlock** | Two threads are each waiting for the other to release a lock — both stuck forever |

---

## What is a Thread?

By default, your Java program runs on a single thread — the **main thread**.
Every line executes one after another.

But sometimes you want to do multiple things at once:
- Download a file while keeping the UI responsive
- Process 1000 records faster by splitting the work
- Handle multiple HTTP requests simultaneously

That's where threads come in.

---

## The 6 states of a Thread

```
NEW → RUNNABLE → (BLOCKED / WAITING / TIMED_WAITING) → TERMINATED
```

### 1. NEW
The thread object has been created but `.start()` has not been called yet.
The thread exists in memory but is not doing anything.

```java
Thread t = new Thread(() -> System.out.println("Hello"));
// State: NEW — created but not started
```

---

### 2. RUNNABLE
`.start()` has been called. The thread is either **running** or **ready to run**,
waiting for the CPU scheduler to give it time.

```java
t.start(); // State: RUNNABLE
```

> Important: RUNNABLE doesn't mean it's actively executing right now.
> It means it's eligible to run. The scheduler decides when.

---

### 3. BLOCKED
The thread is trying to enter a `synchronized` block, but another thread
is already inside it. It waits until the lock is released.

```java
synchronized (sharedObject) {
    // Only one thread can be here at a time
    // Other threads trying to enter → BLOCKED
}
```

---

### 4. WAITING
The thread paused itself indefinitely and is waiting to be woken up
by another thread. It won't do anything until explicitly notified.

```java
synchronized (lock) {
    lock.wait(); // thread goes to WAITING — releases the lock and waits
}

// From another thread:
synchronized (lock) {
    lock.notify(); // wakes up one waiting thread
}
```

---

### 5. TIMED_WAITING
Same as WAITING but with a timeout. The thread will wake up automatically
after the time expires, even if nobody notifies it.

```java
Thread.sleep(2000);      // TIMED_WAITING for 2 seconds
lock.wait(5000);         // TIMED_WAITING for up to 5 seconds
thread.join(1000);       // TIMED_WAITING for up to 1 second
```

---

### 6. TERMINATED
The thread has finished its work — `run()` completed normally or threw an exception.
A terminated thread cannot be restarted.

```java
// After run() finishes → TERMINATED
```

---

## Full lifecycle diagram

```
                    ┌─────────────────────────────────┐
                    │                                 │
        new         │   .start()                      │
[NEW] ──────► [object created] ──────► [RUNNABLE] ◄──┘
                                           │
                              scheduler gives CPU time
                                           │
                                      runs code
                                           │
                   ┌───────────────────────┼──────────────────────┐
                   │                       │                      │
               [BLOCKED]             [WAITING]            [TIMED_WAITING]
          waiting for lock        waiting for notify     sleep / wait(ms)
                   │                       │                      │
                   └───────────────────────┴──────────────────────┘
                                           │
                                      back to RUNNABLE
                                           │
                                    run() finishes
                                           │
                                    [TERMINATED]
```

---

## How to create a thread — two ways

### Way 1: Implement Runnable (preferred)
```java
public class MyTask implements Runnable {
    @Override
    public void run() {
        System.out.println("Running in thread: " + Thread.currentThread().getName());
    }
}

// Create and start
Thread t = new Thread(new MyTask());
t.start();
```

### Way 2: Extend Thread
```java
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Running in: " + getName());
    }
}

MyThread t = new MyThread();
t.start();
```

> Prefer `Runnable` — it separates the task from the thread mechanism,
> and since Java only allows one parent class, extending Thread blocks
> you from extending anything else.

### Way 3: Lambda (modern, clean)
```java
Thread t = new Thread(() -> {
    System.out.println("Running in: " + Thread.currentThread().getName());
});
t.start();
```

---

## Real example — doing two things at the same time

```java
public class Main {
    public static void main(String[] args) {

        Thread downloader = new Thread(() -> {
            System.out.println("Downloading file...");
            Thread.sleep(3000); // simulate download
            System.out.println("Download complete");
        });

        Thread logger = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                System.out.println("Logging heartbeat " + i);
                Thread.sleep(700);
            }
        });

        downloader.start();
        logger.start();

        // Both run at the same time
    }
}
```

---

## Thread.sleep() vs wait()

These look similar but are very different:

| | `Thread.sleep(ms)` | `object.wait()` |
|---|---|---|
| Who calls it | Any thread | Thread inside `synchronized` block |
| Releases lock? | **No** | **Yes** |
| Woken up by | Time expiring | `notify()` or `notifyAll()` |
| State | TIMED_WAITING | WAITING or TIMED_WAITING |

---

## Common problem: Race condition

When two threads access and modify shared data at the same time, results become unpredictable:

```java
public class Counter {
    int count = 0;

    public void increment() {
        count++; // NOT thread-safe — read, add, write are 3 separate steps
    }
}

Counter c = new Counter();

Thread t1 = new Thread(() -> { for (int i = 0; i < 1000; i++) c.increment(); });
Thread t2 = new Thread(() -> { for (int i = 0; i < 1000; i++) c.increment(); });

t1.start();
t2.start();

// Expected: 2000 — Actual: some random number less than 2000
```

### Fix with `synchronized`
```java
public synchronized void increment() {
    count++; // only one thread can run this at a time
}
```

### Fix with `AtomicInteger` (modern, preferred)
```java
import java.util.concurrent.atomic.AtomicInteger;

AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet(); // thread-safe, no locks needed
```

---

## Deadlock — the worst thread problem

Two threads waiting for each other forever:

```java
Object lockA = new Object();
Object lockB = new Object();

Thread t1 = new Thread(() -> {
    synchronized (lockA) {
        synchronized (lockB) { /* needs B */ }
    }
});

Thread t2 = new Thread(() -> {
    synchronized (lockB) {
        synchronized (lockA) { /* needs A */ }
    }
});

// t1 holds A, waits for B
// t2 holds B, waits for A
// → Both stuck forever = deadlock
```

**How to avoid:** always acquire locks in the same order across all threads.

---

## Interview answers

### What are the states of a thread in Java?
NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED.

### What is the difference between BLOCKED and WAITING?
BLOCKED means the thread is waiting to acquire a lock held by another thread. WAITING means the thread voluntarily paused itself and is waiting to be explicitly notified by another thread.

### What is the difference between `sleep()` and `wait()`?
`sleep()` pauses the thread for a fixed time and does NOT release any locks. `wait()` pauses the thread and DOES release the lock, allowing other threads to enter the synchronized block.

### What is a race condition?
When two threads access and modify shared data at the same time, causing unpredictable results. Fixed with `synchronized` or atomic classes.

### What is a deadlock?
When two or more threads are each waiting for a lock held by the other — all stuck forever. Prevented by always acquiring locks in a consistent order.

### What is the difference between extending Thread and implementing Runnable?
Both work, but `Runnable` is preferred. It separates the task from the thread, and since Java only allows single inheritance, extending `Thread` prevents extending any other class.
