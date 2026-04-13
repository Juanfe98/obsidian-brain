# Caching

## Glossary

| Term | Meaning |
|------|---------|
| **Cache** | A fast storage layer that holds frequently accessed data to reduce expensive operations |
| **Cache hit** | The requested data was found in the cache — fast response |
| **Cache miss** | Data not in cache — must fetch from the source (DB, API), then optionally store in cache |
| **Cache eviction** | Removing items from cache when it's full, using a policy (LRU, LFU, TTL) |
| **TTL** | Time To Live — how long a cached item is valid before it expires |
| **LRU** | Least Recently Used — evict the item that hasn't been accessed the longest |
| **LFU** | Least Frequently Used — evict the item accessed the fewest times |
| **Redis** | A popular in-memory data store used as a distributed cache |
| **Cache invalidation** | Removing or updating a cached entry when the underlying data changes |
| **Cache stampede** | Many requests simultaneously hit a cache miss and all query the DB at once |
| **Write-through** | Write to cache and DB simultaneously — always consistent |
| **Cache-aside** | App checks cache first; on miss, loads from DB and populates cache |
| **Stale data** | Cached data that no longer matches the source of truth |

---

## Why caching?

Reading from a database involves disk I/O, network overhead, and query processing.
Caching serves the same data from memory — orders of magnitude faster.

```
Database read:  ~1–10 ms
Redis read:     ~0.1–1 ms (10–100x faster)
Memory read:    ~0.0001 ms (1000–10000x faster)
```

Use cache when data:
- Is **read frequently** and **changes rarely** (user profiles, product catalog)
- Is **expensive to compute** (aggregations, reports)
- Is **accessed by many users** (homepage, trending content)

---

## Cache hierarchy — levels of caching

```
Layer 1: CPU caches (L1/L2/L3)  — hardware managed, nanoseconds
Layer 2: Application memory cache — in-process, e.g. Guava Cache, Caffeine
Layer 3: Distributed cache        — shared across servers, e.g. Redis, Memcached
Layer 4: Database query cache     — DB-level result caching
Layer 5: CDN                      — edge caching of HTTP responses
```

In a typical web application, you mainly work with layers 2, 3, and 5.

---

## Cache-Aside (Lazy Loading) — most common pattern

The application manages the cache manually.
Load data into cache on the first miss; serve from cache on subsequent hits.

```
READ:
1. Check cache for key
2. If HIT → return cached value (fast)
3. If MISS → query database
4. Store result in cache with TTL
5. Return result

WRITE:
1. Write to database
2. Invalidate or update cache entry
```

```java
public User getUser(String userId) {
    // 1. Check cache
    User cached = redis.get("user:" + userId);
    if (cached != null) {
        return cached; // cache hit
    }

    // 2. Cache miss — query DB
    User user = userRepository.findById(userId);

    // 3. Populate cache with TTL
    redis.set("user:" + userId, user, Duration.ofMinutes(30));

    return user;
}

public void updateUser(User user) {
    // 1. Write to DB
    userRepository.save(user);

    // 2. Invalidate cache so next read gets fresh data
    redis.delete("user:" + user.getId());
}
```

**Pros:** Only caches what's actually requested. Simple to implement.
**Cons:** First request always misses (cold start). Stale data if invalidation fails.

---

## Write-Through — always consistent

Write to cache and database simultaneously on every write.
Cache is always in sync with the DB.

```
WRITE:
1. Write to cache
2. Write to database (synchronously)
3. Return success

READ:
1. Always hits cache (data was pre-populated on write)
```

**Pros:** Cache always consistent with DB. Reads are always fast.
**Cons:** Write latency is higher (two writes per operation). Caches data that may never be read.

---

## Write-Behind (Write-Back) — optimized writes

Write to cache immediately, write to DB asynchronously later.

```
WRITE:
1. Write to cache (fast — returns immediately)
2. Queue DB write for async processing
3. DB updated shortly after

READ:
1. Serve from cache
```

**Pros:** Very fast writes. DB can batch updates efficiently.
**Cons:** Risk of data loss if cache fails before DB write. Complex to implement.

---

## Cache eviction policies

When cache is full, what do you remove?

| Policy | Strategy | Best for |
|--------|----------|----------|
| **LRU** (Least Recently Used) | Remove item not accessed the longest | General purpose — most common |
| **LFU** (Least Frequently Used) | Remove item with fewest accesses | Popularity-based access (trending) |
| **TTL** (Time To Live) | Remove items after expiry | Time-sensitive data |
| **FIFO** | Remove oldest item regardless of access | Simple queues |

Redis default eviction: `allkeys-lru` (LRU across all keys).

---

## Redis — the standard distributed cache

Redis is an in-memory key-value store used as cache, message broker, and session store.

### Basic operations

```java
// Spring Boot with Redis
@Autowired
private RedisTemplate<String, Object> redisTemplate;

// String operations
redisTemplate.opsForValue().set("key", "value", Duration.ofMinutes(10));
String val = (String) redisTemplate.opsForValue().get("key");
redisTemplate.delete("key");

// Hash operations (like a map for one entity)
redisTemplate.opsForHash().put("user:123", "name", "Juan");
redisTemplate.opsForHash().put("user:123", "email", "juan@email.com");
Map<?, ?> user = redisTemplate.opsForHash().entries("user:123");

// Set expiry
redisTemplate.expire("user:123", Duration.ofHours(1));
```

### Spring Cache abstraction — simplest approach

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        return RedisCacheManager.builder(factory)
            .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30)))
            .build();
    }
}

@Service
public class UserService {

    @Cacheable(value = "users", key = "#userId")
    public User getUser(String userId) {
        // Only runs on cache miss; result stored in Redis automatically
        return userRepository.findById(userId);
    }

    @CacheEvict(value = "users", key = "#user.id")
    public void updateUser(User user) {
        userRepository.save(user);
        // Cache entry evicted automatically after save
    }

    @CachePut(value = "users", key = "#user.id")
    public User saveUser(User user) {
        return userRepository.save(user);
        // Updates cache with new value (doesn't evict, replaces)
    }
}
```

---

## Cache invalidation — the hardest problem

> "There are only two hard things in Computer Science: cache invalidation and naming things."
> — Phil Karlton

### Strategies

| Strategy | How | Trade-off |
|----------|-----|-----------|
| **TTL-based** | Entries expire after a fixed time | Stale for up to TTL duration |
| **Event-based** | Write path evicts/updates cache | Tight coupling between write and cache |
| **Versioning** | Include version in cache key: `user:123:v2` | Cache grows, old keys linger |
| **Write-through** | Always write to cache on update | Higher write latency |

### Cache stampede / thundering herd

When a popular cache key expires, many requests simultaneously miss and all hit the DB.

```
00:00:00 — Cache key expires for product-789
00:00:00 — 500 concurrent requests come in
00:00:00 — All 500 get cache miss, all query DB simultaneously
→ DB gets 500 queries at once → overload
```

**Solutions:**
- **Mutex/lock** — first miss acquires a lock and populates cache; others wait
- **Probabilistic early expiration** — refresh key slightly before TTL to avoid simultaneous expiry
- **Background refresh** — a background job refreshes popular keys before they expire

---

## What NOT to cache

- **User-specific, private data** that varies per request (personal recommendations with auth)
- **Financial transactions** or anything requiring real-time accuracy
- **Data that changes on every request** — no benefit, only overhead
- **Very large objects** — can blow up memory quickly

---

## Interview answers

### What is caching and why is it used?
Caching stores frequently accessed data in a faster layer (memory) to avoid expensive operations like DB queries. A cache hit returns data in sub-millisecond time vs 1-10ms for a DB read. It improves throughput and reduces DB load.

### What is cache-aside vs write-through?
Cache-aside (lazy loading): app checks cache on read; on miss, loads from DB and stores in cache. DB is the source of truth. Write-through: writes go to cache and DB simultaneously — cache is always consistent but writes are slower.

### What is a cache stampede and how do you prevent it?
When a cached key expires, many concurrent requests all get a miss and hit the DB simultaneously. Prevent with: mutex lock (first miss locks, others wait), probabilistic early expiration (refresh before TTL ends), or background refresh jobs.

### What eviction policy would you use?
LRU for general-purpose caching — evict what hasn't been accessed recently. LFU for content with strong popularity signals (trending). TTL for time-sensitive data like session tokens or price data.

### When would you NOT use a cache?
For data requiring strict accuracy (financial), user-private data requiring authorization checks, data that changes every request, or very large objects that would exhaust memory.
