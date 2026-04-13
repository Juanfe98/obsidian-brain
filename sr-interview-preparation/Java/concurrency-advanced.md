# Concurrency — Advanced

## Glossary

| Term | Meaning |
|------|---------|
| **ExecutorService** | A higher-level API to manage a pool of threads — submit tasks, get results, shut down gracefully |
| **Thread pool** | A group of reusable threads that pick up tasks from a queue instead of creating a new thread per task |
| **Callable** | Like `Runnable` but returns a result and can throw a checked exception |
| **Future** | A placeholder for a result that isn't ready yet — you can `.get()` it (blocks) or check `.isDone()` |
| **CompletableFuture** | A modern Future you can chain, combine, and compose without blocking |
| **volatile** | Guarantees that a variable is always read from/written to main memory, not a thread's local cache |
| **ReentrantLock** | A lock you acquire/release manually — more flexible than `synchronized` |
| **AtomicInteger** | A thread-safe integer — no locks, uses CPU-level CAS (compare-and-swap) operations |
| **ConcurrentHashMap** | A thread-safe HashMap — uses segment locking, much faster than `synchronized HashMap` |
| **BlockingQueue** | A queue that blocks the producer when full, and blocks the consumer when empty |
| **CAS** | Compare-And-Swap — a CPU instruction that atomically checks and updates a value |
| **Livelock** | Like deadlock, but threads keep changing state in response to each other without making progress |
| **Starvation** | A thread is perpetually denied access to resources because higher-priority threads keep taking them |

---

## Why raw threads are not enough

Creating a new thread per task is expensive: thread creation takes time and memory.
If 10,000 requests arrive simultaneously, you can't create 10,000 threads — the JVM will crash.

The solution: **thread pools** via `ExecutorService`.

---

## ExecutorService — Thread Pools

`ExecutorService` manages a pool of reusable worker threads.
You submit tasks; threads from the pool pick them up.

### Creating thread pools

```java
import java.util.concurrent.*;

// Fixed pool — always N threads alive. Best for CPU-bound tasks
ExecutorService fixed = Executors.newFixedThreadPool(4);

// Cached pool — creates threads as needed, reuses idle ones. Best for I/O-bound tasks
ExecutorService cached = Executors.newCachedThreadPool();

// Single thread — tasks execute sequentially, one at a time
ExecutorService single = Executors.newSingleThreadExecutor();

// Scheduled — run tasks with delay or on a schedule
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
```

### Submitting tasks

```java
ExecutorService pool = Executors.newFixedThreadPool(4);

// submit Runnable — fire and forget
pool.submit(() -> System.out.println("Task running in: " + Thread.currentThread().getName()));

// submit Callable — returns a result
Future<Integer> future = pool.submit(() -> {
    Thread.sleep(1000); // simulate work
    return 42;
});

// get() blocks until result is ready
Integer result = future.get(); // 42
System.out.println("Result: " + result);

// Always shut down — otherwise threads keep alive and leak
pool.shutdown();               // finish pending tasks, then stop
pool.awaitTermination(30, TimeUnit.SECONDS); // wait for shutdown
```

### How to size a thread pool

```
CPU-bound tasks:    pool size = number of CPU cores  (no point having more)
I/O-bound tasks:    pool size = cores * (1 + wait_time / cpu_time)
                    e.g. if I/O is 10x slower than CPU → pool size = cores * 10
```

---

## Callable vs Runnable

| | `Runnable` | `Callable<T>` |
|---|---|---|
| Return value | None (`void`) | Returns `T` |
| Checked exceptions | Cannot throw | Can throw |
| Used with | `Thread`, `ExecutorService` | `ExecutorService` only |

```java
// Runnable — no return
Runnable r = () -> System.out.println("Done");

// Callable — returns a value, can throw
Callable<String> c = () -> {
    if (someCondition) throw new IOException("Failed");
    return "Hello";
};
```

---

## CompletableFuture — async without blocking

`Future.get()` blocks the calling thread. `CompletableFuture` lets you chain operations
that execute asynchronously when results are ready.

### Basic usage

```java
import java.util.concurrent.CompletableFuture;

// Run async, no result
CompletableFuture.runAsync(() -> System.out.println("Running async"));

// Compute async, returns result
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> {
    // runs in ForkJoinPool.commonPool() by default
    return "Hello";
});
```

### Chaining — thenApply, thenAccept, thenRun

```java
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> "user-123")              // fetch user id async
    .thenApply(id -> fetchUserFromDB(id))       // transform result
    .thenApply(user -> user.toUpperCase())      // transform again
    .exceptionally(ex -> "DEFAULT_USER");       // handle errors

result.thenAccept(System.out::println);         // consume result, no return
```

### Combining futures

```java
CompletableFuture<String> userFuture    = CompletableFuture.supplyAsync(() -> fetchUser());
CompletableFuture<String> accountFuture = CompletableFuture.supplyAsync(() -> fetchAccount());

// Wait for both, combine results
CompletableFuture<String> combined = userFuture.thenCombine(accountFuture,
    (user, account) -> user + " | " + account);

// Wait for ALL futures
CompletableFuture.allOf(userFuture, accountFuture).join();

// Wait for the FIRST one to complete
CompletableFuture.anyOf(userFuture, accountFuture).join();
```

### Real-world: parallel service calls

```java
// Instead of sequential (3 seconds total):
// String user    = fetchUser();    // 1s
// String flights = fetchFlights(); // 1s
// String hotels  = fetchHotels();  // 1s

// Run all in parallel (1 second total):
CompletableFuture<String> userF    = CompletableFuture.supplyAsync(() -> fetchUser());
CompletableFuture<String> flightsF = CompletableFuture.supplyAsync(() -> fetchFlights());
CompletableFuture<String> hotelsF  = CompletableFuture.supplyAsync(() -> fetchHotels());

CompletableFuture.allOf(userF, flightsF, hotelsF).join();
// All three results are ready simultaneously
```

---

## volatile — visibility guarantee

`volatile` ensures that writes by one thread are immediately visible to all other threads.
It does NOT make compound operations (like `++`) atomic.

```java
public class SharedFlag {
    // Without volatile: a thread might cache the value locally
    // and never see the updated value from another thread
    private volatile boolean running = true;

    public void stop() {
        running = false; // immediately visible to all threads
    }

    public void run() {
        while (running) { // always reads from main memory
            doWork();
        }
    }
}
```

**When to use `volatile`:**
- One thread writes, others only read
- Simple flag / status checks

**When NOT to use `volatile`:**
- Multiple threads write → use `AtomicInteger` or `synchronized`
- Complex multi-step operations → use locks

---

## synchronized vs ReentrantLock

### synchronized — simple, built-in

```java
public class Counter {
    private int count = 0;

    // Method-level: entire method is locked
    public synchronized void increment() {
        count++;
    }

    // Block-level: only critical section is locked (more fine-grained)
    public void decrement() {
        synchronized (this) {
            count--;
        }
    }
}
```

### ReentrantLock — more control

```java
import java.util.concurrent.locks.ReentrantLock;

public class Counter {
    private int count = 0;
    private final ReentrantLock lock = new ReentrantLock();

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock(); // always unlock in finally!
        }
    }

    // Try to acquire lock without blocking
    public boolean tryIncrement() {
        if (lock.tryLock()) {
            try {
                count++;
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false; // couldn't acquire lock
    }
}
```

### synchronized vs ReentrantLock

| Feature | `synchronized` | `ReentrantLock` |
|---------|---------------|-----------------|
| Syntax | Simple | Verbose (lock/unlock) |
| Try lock | No | Yes (`tryLock()`) |
| Timed lock | No | Yes (`tryLock(timeout)`) |
| Interruptible | No | Yes |
| Fairness | No guarantee | Can set `new ReentrantLock(true)` |
| Use when | Simple locking | Need advanced control |

---

## Atomic classes — lock-free thread safety

For single-variable thread safety, `Atomic*` classes are faster than `synchronized`
because they use CPU-level CAS operations (no lock, no blocking).

```java
import java.util.concurrent.atomic.*;

AtomicInteger counter = new AtomicInteger(0);

counter.incrementAndGet();           // ++counter, returns new value
counter.getAndIncrement();           // counter++, returns old value
counter.addAndGet(5);                // counter += 5
counter.compareAndSet(10, 20);       // if value == 10, set to 20 (CAS)

AtomicBoolean flag = new AtomicBoolean(false);
flag.compareAndSet(false, true);     // only sets to true if currently false

AtomicReference<User> userRef = new AtomicReference<>(null);
userRef.compareAndSet(null, newUser); // only sets if currently null
```

**Use atomic classes when:** one variable, high contention, simple operations.
**Use synchronized/locks when:** multiple variables must be updated together atomically.

---

## Thread-safe collections

### ConcurrentHashMap — recommended over synchronized HashMap

```java
// DO NOT use this for concurrent access:
Map<String, Integer> bad = Collections.synchronizedMap(new HashMap<>());
// locks the ENTIRE map on every operation

// USE this instead:
ConcurrentHashMap<String, Integer> good = new ConcurrentHashMap<>();
// uses segment locking — only locks part of the map
// reads are lock-free

// Atomic operations on ConcurrentHashMap:
good.putIfAbsent("key", 0);
good.computeIfAbsent("key", k -> expensiveComputation(k));
good.merge("key", 1, Integer::sum); // thread-safe counter
```

### BlockingQueue — producer-consumer pattern

```java
import java.util.concurrent.*;

BlockingQueue<String> queue = new LinkedBlockingQueue<>(100); // max 100 items

// Producer thread — blocks if queue is full
Thread producer = new Thread(() -> {
    while (true) {
        queue.put("task-" + System.currentTimeMillis()); // blocks when full
    }
});

// Consumer thread — blocks if queue is empty
Thread consumer = new Thread(() -> {
    while (true) {
        String task = queue.take(); // blocks when empty
        process(task);
    }
});
```

---

## Common concurrency problems

| Problem | Description | Solution |
|---------|-------------|----------|
| **Race condition** | Two threads modify shared state simultaneously → unpredictable result | `synchronized`, `AtomicInteger`, `ConcurrentHashMap` |
| **Deadlock** | T1 waits for T2's lock, T2 waits for T1's → both stuck forever | Always acquire locks in same order |
| **Livelock** | Threads keep responding to each other but make no progress | Add randomness/backoff |
| **Starvation** | Low-priority thread never gets CPU time | Use fair locks, avoid priority inversion |
| **Visibility issue** | Thread reads stale cached value | `volatile` or synchronization |

---

## Interview answers

### What is the difference between Runnable and Callable?
`Runnable` runs a task and returns nothing. `Callable<T>` runs a task and returns a result of type `T`. `Callable` can also throw checked exceptions. Both can be submitted to an `ExecutorService`.

### What is CompletableFuture and how is it better than Future?
`Future` blocks the calling thread when you call `.get()`. `CompletableFuture` allows chaining async operations with `.thenApply()`, combining multiple futures with `allOf()`, and handling errors with `.exceptionally()` — all without blocking.

### When would you use volatile?
When one thread writes a variable and other threads only read it — a flag or status field. `volatile` ensures all threads see the latest value. It does NOT make compound operations atomic — for that, use `AtomicInteger` or `synchronized`.

### What is the difference between synchronized and ReentrantLock?
Both achieve mutual exclusion. `synchronized` is simpler. `ReentrantLock` offers more features: try-lock with timeout, interruptible lock acquisition, and optional fairness. Use `synchronized` for simple cases; use `ReentrantLock` when you need those extra capabilities.

### What is ConcurrentHashMap and why is it better than synchronizedMap?
`Collections.synchronizedMap()` wraps every operation with a lock on the entire map — one thread can access it at a time. `ConcurrentHashMap` uses segment-based locking (in Java 8+, CAS for reads), so multiple threads can read and write to different segments simultaneously — much higher throughput.

### How do you avoid a deadlock?
Always acquire locks in the same order across all threads. Also consider using `tryLock()` with a timeout instead of blocking indefinitely, or restructure to avoid needing multiple locks at once.

### What thread pool type would you use for CPU-bound vs I/O-bound tasks?
CPU-bound: `newFixedThreadPool(N)` where N = number of CPU cores. I/O-bound: `newCachedThreadPool()` or a larger fixed pool, since threads spend most time waiting for I/O and the CPU can handle more of them.
