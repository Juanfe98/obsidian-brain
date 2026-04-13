# Scalability & Load Balancing

## Glossary

| Term | Meaning |
|------|---------|
| **Scalability** | The ability of a system to handle increased load by adding resources |
| **Vertical scaling (scale up)** | Adding more power to an existing machine (more CPU, RAM) |
| **Horizontal scaling (scale out)** | Adding more machines to distribute the load |
| **Load balancer** | A component that distributes incoming requests across multiple servers |
| **Stateless** | A server that holds no user session data — any server can handle any request |
| **Stateful** | A server that remembers user session — requests must go to the same server |
| **Throughput** | Number of requests/operations processed per unit of time |
| **Latency** | Time it takes for one request to complete |
| **Availability** | Percentage of time the system is operational (99.9% = 8.7 hrs downtime/year) |
| **SLA** | Service Level Agreement — contractual guarantee of uptime/performance |
| **SPOF** | Single Point of Failure — one component whose failure brings the whole system down |
| **CDN** | Content Delivery Network — servers distributed globally to serve static assets close to users |

---

## Vertical Scaling (Scale Up)

Add more resources to a single machine: more CPU cores, more RAM, faster disks.

```
Before:   [Server: 4 CPU, 8GB RAM] → handles 1000 req/s
After:    [Server: 32 CPU, 64GB RAM] → handles 8000 req/s
```

**Pros:**
- Simple — no application changes needed
- No distributed system complexity

**Cons:**
- Has a hard limit — you can't add infinite hardware
- Expensive at the top end
- Still a single point of failure
- Downtime during upgrades

---

## Horizontal Scaling (Scale Out)

Add more machines. Each handles a share of the load. A load balancer distributes traffic.

```
Before:   [Server] → handles 1000 req/s

After:    [Load Balancer]
               ├── [Server 1] → 250 req/s
               ├── [Server 2] → 250 req/s
               ├── [Server 3] → 250 req/s
               └── [Server 4] → 250 req/s
```

**Pros:**
- Virtually unlimited scale — add more servers as needed
- No single point of failure (if one server dies, others continue)
- Cheaper commodity hardware
- Rolling deployments — update one server at a time

**Cons:**
- Complexity — you now have a distributed system
- Servers must be stateless (or share state via external store)
- Load balancer itself must be HA (redundant)

---

## Stateless Design — The Key to Horizontal Scaling

For horizontal scaling to work, servers must be **stateless**:
each request must be processable by any server without needing information from a previous request.

### Stateful — doesn't scale

```
User logs in → Server 1 stores session in memory
Next request → Load balancer sends to Server 2
Server 2 has no session → User gets logged out
```

### Stateless — scales

```
User logs in → Server creates JWT token → Client stores token
Next request → Client sends JWT → Any server can validate it
Session data stored in Redis, not in server memory
```

**Rule: Push all state out of the server — into the client (JWT) or shared store (Redis, DB).**

---

## Load Balancing

A load balancer sits between clients and servers, distributing requests.

### Load balancing algorithms

| Algorithm | How it works | Best for |
|-----------|-------------|----------|
| **Round Robin** | Requests go to servers in rotation: 1, 2, 3, 1, 2, 3... | Servers of equal capacity |
| **Least Connections** | Send to server with fewest active connections | Mixed request durations |
| **IP Hash** | Same client IP always goes to same server | Sticky sessions (legacy) |
| **Weighted Round Robin** | Servers get requests proportional to their weight | Servers of different capacity |
| **Random** | Pick a random server | Simple, works well at scale |

### Layer 4 vs Layer 7 load balancing

| | Layer 4 (Transport) | Layer 7 (Application) |
|--|---------------------|----------------------|
| Works at | TCP/UDP level | HTTP level |
| Sees | IP + port | URL, headers, body |
| Routing | By IP/port only | By path, header, content |
| Speed | Faster (less inspection) | Slower but smarter |
| Example | AWS NLB | AWS ALB, NGINX, HAProxy |
| Can route | Any TCP traffic | HTTP only |

**Example Layer 7 routing:**
```
/api/users  → Users Service cluster
/api/orders → Orders Service cluster
/api/search → Search Service cluster
```

### Health checks

Load balancers periodically ping each server. If a server fails the health check, traffic is no longer sent to it.

```
GET /actuator/health → { "status": "UP" }  → server stays in rotation
GET /actuator/health → timeout/500           → server removed from rotation
```

---

## DNS & Global Load Balancing

For global scale, use **DNS-based routing** to direct users to the nearest data center.

```
User in Europe  → DNS resolves api.company.com → EU servers
User in USA     → DNS resolves api.company.com → US servers
User in Asia    → DNS resolves api.company.com → APAC servers
```

Tools: AWS Route 53 (with latency-based routing), Cloudflare, Akamai.

---

## CDN — Content Delivery Network

A CDN caches static assets (images, JS, CSS, videos) at servers globally (edge nodes),
so users download from a server close to them — not from your origin.

```
Without CDN:
User in Tokyo → requests logo.png → travels to US server (150ms)

With CDN:
User in Tokyo → requests logo.png → served from CDN edge in Tokyo (5ms)
```

**What to serve from CDN:**
- Static files: images, CSS, JavaScript bundles, fonts
- API responses that are public and rarely change
- Video and large binary files

**What NOT to put on CDN:**
- Personalized content (user-specific data)
- Real-time data (prices, availability)
- Authenticated responses

---

## Availability & Redundancy

### Availability tiers

| Uptime | Downtime/year | Downtime/month |
|--------|--------------|----------------|
| 99% | 3.65 days | 7.2 hours |
| 99.9% ("three nines") | 8.7 hours | 43 minutes |
| 99.99% ("four nines") | 52 minutes | 4.4 minutes |
| 99.999% ("five nines") | 5 minutes | 26 seconds |

### Eliminating Single Points of Failure

Every critical component should have a redundant backup:

```
Database:      Primary + Replica (failover)
Load balancer: Active + Standby pair
Cache:         Redis Cluster or Sentinel
Message queue: Kafka with replication factor > 1
Servers:       Multiple instances across availability zones
```

---

## Practical design example — scaling a web app

### Step 1: Single server (starting point)
```
[Client] → [Server (app + DB)]
```
Problem: single point of failure, limited scale.

### Step 2: Separate database
```
[Client] → [App Server] → [Database]
```
Now app and DB scale independently.

### Step 3: Add load balancer + multiple app servers
```
[Client] → [Load Balancer] → [App Server 1]
                           → [App Server 2]
                           → [App Server 3]
                                  ↓
                             [Database]
```

### Step 4: Add cache + CDN
```
[Client] → [CDN] → [Load Balancer] → [App Servers] → [Cache (Redis)]
                                                    → [Database]
```

### Step 5: Database read replicas
```
[App Servers] → [Cache] → [DB Primary] (writes)
                        → [DB Replica 1] (reads)
                        → [DB Replica 2] (reads)
```

---

## Interview answers

### What is the difference between vertical and horizontal scaling?
Vertical scaling (scale up) adds more resources (CPU, RAM) to a single server — simple but has a hard limit and remains a single point of failure. Horizontal scaling (scale out) adds more servers — requires a load balancer and stateless design, but is virtually unlimited and eliminates single points of failure.

### How does a load balancer work?
A load balancer distributes incoming requests across multiple backend servers using algorithms like round-robin or least connections. It also performs health checks and routes traffic only to healthy servers.

### What does stateless mean and why does it matter?
A stateless server holds no user-specific data in memory — any server can handle any request. This is required for horizontal scaling: if Server 1 holds your session and goes down, Server 2 can't recover it. With stateless design (JWT, external session store like Redis), any server handles any request.

### What is a CDN?
A Content Delivery Network caches static assets at edge servers distributed globally. Users are served from the nearest edge node instead of your origin server — dramatically reducing latency and origin load.

### How would you design a system for high availability?
Eliminate single points of failure: run multiple app servers behind a load balancer, use database replicas with failover, deploy Redis in cluster/sentinel mode, distribute across availability zones, and use health checks to automatically remove failed instances from rotation.
