# Resilience Patterns

## Glossary

| Term | Meaning |
|------|---------|
| **Resilience** | The ability of a system to recover from failures and continue operating |
| **Circuit breaker** | Stops calling a failing service to let it recover — like an electrical circuit breaker |
| **Retry** | Automatically reattempt a failed operation, with optional backoff |
| **Exponential backoff** | Retry with increasing delays (1s, 2s, 4s, 8s) to avoid overwhelming a recovering service |
| **Jitter** | Randomness added to retry delays to prevent all retries from happening simultaneously |
| **Bulkhead** | Isolates parts of a system so that failure in one doesn't cascade to others |
| **Timeout** | Maximum time to wait for a response — prevents indefinite blocking |
| **Fallback** | An alternative response when the primary operation fails |
| **Rate limiter** | Limits requests per unit time — protects services from being overwhelmed |
| **Resilience4j** | A Java library implementing resilience patterns (used with Spring Boot) |
| **Cascading failure** | One service failure propagates and brings down other services |

---

## Why resilience patterns?

In a distributed system, **failures are inevitable**. Networks fail, services crash, databases slow down.

Without patterns, one slow dependency can take down your entire system:

```
[User] → [API] → [Order Service] → [Payment Service (slow)] → timeout after 30s
                      ↑
All Order Service threads are stuck waiting for Payment Service
→ Order Service runs out of threads
→ Order Service stops responding
→ API crashes too
→ Entire system down because of ONE slow service
```

With resilience patterns, failures are contained.

---

## 1. Timeout — never wait forever

Every remote call must have a timeout. Without it, a slow dependency holds your threads forever.

```java
// RestTemplate with timeout
RestTemplate restTemplate = new RestTemplate();
restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory() {{
    setConnectTimeout(2000);  // 2 seconds to connect
    setReadTimeout(5000);     // 5 seconds to read response
}});

// WebClient (reactive) with timeout
WebClient.builder()
    .baseUrl("http://payment-service")
    .build()
    .get()
    .uri("/pay")
    .retrieve()
    .bodyToMono(String.class)
    .timeout(Duration.ofSeconds(5))
    .block();
```

**Rule of thumb:**
- External APIs: 2-5 seconds
- Internal microservices: 500ms-2 seconds
- DB queries: 1-10 seconds depending on complexity

---

## 2. Retry — handle transient failures

Many failures are transient (temporary): network blip, momentary overload.
Retrying usually succeeds.

```java
// With Resilience4j
RetryConfig config = RetryConfig.custom()
    .maxAttempts(3)
    .waitDuration(Duration.ofMillis(500))
    .retryOnException(e -> e instanceof IOException || e instanceof TimeoutException)
    .build();

Retry retry = Retry.of("payment", config);

Callable<String> callable = Retry.decorateCallable(retry, () -> paymentService.pay(order));
String result = callable.call();
```

### Exponential backoff with jitter

Don't retry immediately at fixed intervals — you'll hammer a recovering service.

```
Fixed interval retry (BAD):
Attempt 1 fails → wait 1s
Attempt 2 fails → wait 1s
Attempt 3 fails → wait 1s
All retriers do this simultaneously → 1000 requests at t=1s, t=2s, t=3s

Exponential backoff with jitter (GOOD):
Attempt 1 fails → wait 1s + random(0-500ms)
Attempt 2 fails → wait 2s + random(0-1s)
Attempt 3 fails → wait 4s + random(0-2s)
Retries spread out → recovering service isn't slammed
```

```java
RetryConfig config = RetryConfig.custom()
    .maxAttempts(4)
    .intervalFunction(IntervalFunction.ofExponentialRandomBackoff(
        Duration.ofMillis(500),  // initial wait
        2.0,                     // multiplier
        Duration.ofSeconds(10)   // max wait
    ))
    .build();
```

### When NOT to retry

- HTTP 4xx errors (400, 401, 403, 404) — retrying won't help, it's a client error
- Idempotent operations only (GET, PUT) — retrying a POST might create duplicates
- When timeout itself is slow — retrying a 30s timeout 3 times = 90 seconds of blocking

---

## 3. Circuit Breaker — stop calling a failing service

The circuit breaker monitors failure rates. When failures exceed a threshold,
it "opens" and stops calls to the failing service, letting it recover.

### The three states

```
CLOSED (normal)
├── Requests pass through normally
├── Monitors failure rate
└── If failures > threshold → opens

OPEN (failing)
├── Requests are immediately rejected (no call to failing service)
├── Caller gets error or fallback immediately
└── After reset timeout → goes to HALF-OPEN

HALF-OPEN (testing)
├── Allows a few test requests through
├── If they succeed → CLOSED (service recovered)
└── If they fail → OPEN again (still failing)
```

```
[Normal traffic]
     │
  [CLOSED] ───── failures exceed 50% ──────► [OPEN]
     ▲                                           │
     │                                   after 30 seconds
     │                                           │
     └───── test requests succeed ─────── [HALF-OPEN]
```

### Resilience4j Circuit Breaker

```java
// Configuration
CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .failureRateThreshold(50)                    // open when 50% of calls fail
    .slowCallRateThreshold(50)                   // also open when 50% are slow
    .slowCallDurationThreshold(Duration.ofSeconds(2)) // "slow" = >2 seconds
    .waitDurationInOpenState(Duration.ofSeconds(30))  // stay open 30s before testing
    .minimumNumberOfCalls(10)                    // need at least 10 calls to evaluate
    .build();

CircuitBreaker cb = CircuitBreaker.of("paymentService", config);

// Wrap the call
Supplier<String> protectedCall = CircuitBreaker.decorateSupplier(cb,
    () -> paymentService.pay(order));

try {
    String result = protectedCall.get();
} catch (CallNotPermittedException e) {
    // Circuit is OPEN — return fallback immediately
    return "Payment temporarily unavailable, please try again";
}
```

### Spring Boot with Resilience4j annotations

```java
@Service
public class PaymentService {

    @CircuitBreaker(name = "payment", fallbackMethod = "paymentFallback")
    @Retry(name = "payment")
    @TimeLimiter(name = "payment")
    public CompletableFuture<String> pay(Order order) {
        return CompletableFuture.supplyAsync(() -> externalPaymentApi.charge(order));
    }

    // Fallback called when circuit opens or all retries exhausted
    public CompletableFuture<String> paymentFallback(Order order, Exception e) {
        log.error("Payment failed, using fallback. Error: {}", e.getMessage());
        return CompletableFuture.completedFuture("PAYMENT_DEFERRED");
    }
}
```

### application.yml configuration

```yaml
resilience4j:
  circuitbreaker:
    instances:
      payment:
        failure-rate-threshold: 50
        wait-duration-in-open-state: 30s
        minimum-number-of-calls: 10
  retry:
    instances:
      payment:
        max-attempts: 3
        wait-duration: 500ms
        exponential-backoff-multiplier: 2
  timelimiter:
    instances:
      payment:
        timeout-duration: 5s
```

---

## 4. Bulkhead — isolate failures

A bulkhead limits the resources one operation can use, preventing it from
consuming all resources and affecting other operations.

**Analogy:** Ships have bulkheads — watertight compartments. If one floods, the others don't.

```
Without bulkhead:
All threads in one pool
Slow payment API uses all 200 threads
→ No threads left for order creation, user lookup, etc.
→ Everything fails

With bulkhead:
Payment API pool:    20 threads (isolated)
Order creation pool: 50 threads
User lookup pool:    30 threads
Other operations:   100 threads

Payment API being slow → only affects payment calls
→ Everything else continues normally
```

```java
// Thread pool bulkhead
BulkheadConfig config = BulkheadConfig.custom()
    .maxConcurrentCalls(20)              // max 20 concurrent calls
    .maxWaitDuration(Duration.ofMillis(100)) // wait max 100ms for a slot
    .build();

Bulkhead bulkhead = Bulkhead.of("paymentBulkhead", config);

Supplier<String> protected = Bulkhead.decorateSupplier(bulkhead,
    () -> paymentService.pay(order));
```

---

## 5. Fallback — graceful degradation

When a service fails, return something useful instead of an error.

```java
@CircuitBreaker(name = "recommendations", fallbackMethod = "defaultRecommendations")
public List<Product> getRecommendations(String userId) {
    return recommendationService.getPersonalized(userId); // might fail
}

// Fallback: return popular products when recommendation service is down
public List<Product> defaultRecommendations(String userId, Exception e) {
    return productService.getTopSellers(); // always works
}
```

**Fallback strategies:**
- Return cached data (last known good value)
- Return default/static content
- Return empty result (gracefully empty)
- Enqueue for later processing
- Return a friendly error message

---

## 6. Rate Limiter — protect from overload

Limit how many requests a service accepts per time window.

```java
// Resilience4j rate limiter
RateLimiterConfig config = RateLimiterConfig.custom()
    .limitForPeriod(100)                    // 100 requests
    .limitRefreshPeriod(Duration.ofSeconds(1)) // per second
    .timeoutDuration(Duration.ofMillis(25))    // wait max 25ms for a slot
    .build();

RateLimiter limiter = RateLimiter.of("api", config);

Supplier<String> limited = RateLimiter.decorateSupplier(limiter, () -> api.call());
```

**Use cases:**
- Protecting downstream services from being overwhelmed
- Enforcing API quotas per customer
- Preventing abuse (too many login attempts)
- Fair resource distribution

---

## Combining patterns — the right order

Patterns should be applied in this order (outer to inner):

```
Rate Limiter → Bulkhead → Circuit Breaker → Retry → Timeout → [actual call]
```

Why this order:
1. **Rate Limiter** first — reject excess traffic before it consumes resources
2. **Bulkhead** — isolate resources before entering the circuit breaker
3. **Circuit Breaker** — if service is failing, don't even try
4. **Retry** — only retry if circuit is closed and we're worth trying
5. **Timeout** — each individual attempt has a max wait time

---

## Interview answers

### What is a circuit breaker and why is it useful?
A circuit breaker monitors calls to a dependency. When failures exceed a threshold, it "opens" and immediately rejects further calls (instead of waiting for timeouts), letting the failing service recover. After a reset period, it allows test calls. If they succeed, the circuit closes. This prevents cascading failures.

### What is the difference between retry and circuit breaker?
Retry handles transient, individual failures — try again in case it was a network blip. Circuit breaker handles systemic failure — when a service is consistently failing, stop calling it entirely to allow recovery. They complement each other: retry within a circuit breaker.

### What is exponential backoff with jitter?
Retry with increasing wait times (1s, 2s, 4s, 8s) plus random noise. The exponential growth prevents hammering a recovering service. The jitter prevents the "thundering herd" where all retriers wake up at the same moment.

### What is a bulkhead pattern?
Isolating resource pools so failure in one area doesn't exhaust resources for others. Like ship bulkheads — if one compartment floods, others stay dry. In practice: separate thread pools or connection pools per downstream dependency.

### What is graceful degradation?
Returning a useful (if reduced) response when a dependency fails, instead of failing completely. Example: when the recommendation service is down, return top-selling products instead of an error. Users get a degraded experience, not a broken one.
