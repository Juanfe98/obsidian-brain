# System Design — Interview Preparation

System design is one of the most important topics for senior engineering roles.
You will be asked to design large-scale systems from scratch and explain trade-offs.

---

## What interviewers look for

1. **Clarify requirements** before designing — ask about scale, users, SLAs
2. **Think in trade-offs** — there is no perfect solution, only trade-offs
3. **Start simple, then scale** — monolith → then add components as needed
4. **Know the vocabulary** — latency, throughput, availability, consistency
5. **Drive the conversation** — don't wait to be asked, explain your thinking

---

## Files in this folder

| File | Topics |
|------|--------|
| `scalability-and-load-balancing.md` | Vertical vs horizontal scaling, load balancers, stateless design |
| `caching.md` | Redis, CDN, cache strategies, eviction, invalidation |
| `cap-theorem.md` | CAP, consistency models, BASE vs ACID, trade-offs |
| `message-queues.md` | Kafka, RabbitMQ, pub-sub, async patterns |
| `resilience-patterns.md` | Circuit breaker, retry, bulkhead, timeout, fallback |

---

## Key numbers to memorize

| Metric | Value |
|--------|-------|
| L1 cache read | ~1 ns |
| L2 cache read | ~10 ns |
| RAM read | ~100 ns |
| SSD read | ~100 μs |
| Network round-trip (same region) | ~1 ms |
| Network round-trip (cross-continent) | ~150 ms |
| Disk seek | ~10 ms |

These help you reason about where bottlenecks are.

---

## Framework for answering design questions

```
1. Clarify requirements (5 min)
   - Functional: what does the system do?
   - Non-functional: scale, availability, latency, consistency

2. Estimate scale (2 min)
   - Users, requests/sec, data size, read vs write ratio

3. High-level design (10 min)
   - Draw major components: clients, API layer, services, DB, cache

4. Deep dive (15 min)
   - Focus on bottlenecks, critical paths, chosen trade-offs

5. Trade-offs & alternatives (5 min)
   - What did you sacrifice? What would you do differently at 10x scale?
```
