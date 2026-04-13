---
tags:
  - comparison
  - databases
  - rds
  - aurora
  - dynamodb
  - nosql
  - relational
category: Comparisons
difficulty: intermediate
related:
  - "[[databases-overview]]"
  - "[[ec2]]"
  - "[[networking-overview]]"
---

# database-options-comparison

Choosing the right database service is critical for application performance, scalability, and cost.

## Quick Decision Guide

```
Need ACID transactions + SQL? → RDS or Aurora
Need NoSQL key-value? → DynamoDB
Need high performance relational? → Aurora
Need full DB control? → Database on EC2
Need in-memory cache? → ElastiCache
Need document database? → DocumentDB
```

## AWS Database Services Overview

| Service | Type | Use Case | Engine | Scaling |
|---------|------|----------|--------|---------|
| **[[databases-overview\|RDS]]** | Relational | Traditional SQL apps | MySQL, PostgreSQL, etc. | Vertical + Read replicas |
| **[[databases-overview\|Aurora]]** | Relational | High-performance SQL | MySQL/PostgreSQL compatible | Vertical + Auto read replicas |
| **[[databases-overview\|DynamoDB]]** | NoSQL (Key-Value) | High throughput, flexible schema | Proprietary | Automatic horizontal |
| **DocumentDB** | NoSQL (Document) | JSON workloads | MongoDB-compatible | Horizontal |
| **ElastiCache** | In-Memory | Caching, sessions | Redis, Memcached | Horizontal |
| **Neptune** | Graph | Relationships, networks | Gremlin, SPARQL | Horizontal |
| **Timestream** | Time-series | IoT, metrics | Proprietary | Automatic |

## Relational Databases: RDS vs Aurora vs EC2

| Feature | RDS | Aurora | Database on [[ec2]] |
|---------|-----|--------|------------|
| **Management** | Fully managed | Fully managed | Self-managed |
| **Performance** | Standard | 5x MySQL, 3x PostgreSQL | Variable |
| **Availability** | Multi-AZ option | Built-in multi-AZ | DIY |
| **Backup** | Automated | Automated + continuous | Manual |
| **Scaling** | Vertical + Read replicas | Auto-scaling storage + replicas | Manual |
| **Cost** | $$ | $$$ | $ (+ admin time) |
| **Engines** | 7 engines | MySQL, PostgreSQL | Any |
| **Replication** | Up to 15 read replicas | Up to 15 read replicas | DIY |
| **Failover** | ~60-120 seconds | ~30 seconds | Manual |
| **Storage** | Up to 64 TiB | Up to 128 TiB | Limited by EBS (16 TiB) |
| **IOPS** | Provisioned | Auto-scaling | Provisioned (EBS) |

### When to Use Each

**Use RDS when:**
✅ Need managed relational database
✅ Standard performance requirements
✅ Want to use specific engine (Oracle, SQL Server, MariaDB)
✅ Cost-conscious for moderate workloads
✅ Familiar with traditional RDBMS

**Use Aurora when:**
✅ Need high performance and availability
✅ MySQL or PostgreSQL compatible
✅ Large-scale applications
✅ Want automatic storage scaling
✅ Need fastest failover times
✅ Global database needed (Aurora Global)

**Use Database on [[ec2]] when:**
✅ Need specific database version/features not in RDS
✅ Require root access to OS
✅ Custom database software
✅ Specific compliance requirements
❌ **Not recommended** - You lose automation, backups, patching

## NoSQL: DynamoDB vs DocumentDB vs Others

| Feature | DynamoDB | DocumentDB | ElastiCache |
|---------|----------|------------|-------------|
| **Data Model** | Key-Value, Document | Document (JSON) | Key-Value |
| **Query Language** | PartiQL, DynamoDB API | MongoDB-compatible | Redis/Memcached commands |
| **Performance** | Single-digit millisecond | Milliseconds | Microseconds |
| **Scaling** | Automatic unlimited | Horizontal (sharding) | Horizontal (clustering) |
| **Persistence** | Durable | Durable | In-memory (optional persistence) |
| **Use Case** | High-throughput apps | MongoDB migrations | Caching, sessions |
| **Schema** | Flexible | Flexible (JSON) | None |
| **Transactions** | ACID | ACID | Limited |
| **Cost Model** | Pay per read/write | Instance-based | Instance-based |

## Detailed Database Comparison

### RDS Supported Engines

| Engine | Version Support | Best For | License |
|--------|----------------|----------|---------|
| **MySQL** | 5.7, 8.0 | Web apps, general purpose | Open source |
| **PostgreSQL** | 12, 13, 14, 15 | Complex queries, advanced features | Open source |
| **MariaDB** | 10.x | MySQL alternative | Open source |
| **Oracle** | 19c, 21c | Enterprise apps, legacy | Commercial |
| **SQL Server** | 2017, 2019, 2022 | Windows/.NET apps | Commercial |
| **Aurora MySQL** | MySQL 5.7, 8.0 compatible | High performance | AWS proprietary |
| **Aurora PostgreSQL** | PostgreSQL 11-15 compatible | High performance | AWS proprietary |

### DynamoDB Features

**Strengths:**
- Serverless (no instances to manage)
- Automatic scaling to handle millions of requests/second
- Single-digit millisecond latency
- Global tables for multi-region replication
- Built-in backup and point-in-time recovery
- Streams for change data capture

**Limitations:**
- No joins (denormalize data)
- Limited query patterns (design around access patterns)
- Item size limit: 400 KB
- More expensive for infrequent access patterns

**When to use:**
✅ Mobile/web/gaming backends
✅ Shopping carts
✅ Session management
✅ IoT data
✅ Metadata storage
✅ Need consistent performance at any scale

## Performance Comparison

| Database | Latency | Throughput | IOPS |
|----------|---------|------------|------|
| **DynamoDB** | <10ms | Unlimited (scales automatically) | N/A (serverless) |
| **Aurora** | Low | Very high | Auto-scaling |
| **RDS (io2)** | Low | High | Up to 64,000 provisioned |
| **ElastiCache** | <1ms (microseconds) | Very high | N/A (in-memory) |
| **DocumentDB** | Low-medium | High | Provisioned |

## High Availability Comparison

| Service | Multi-AZ | Failover Time | Read Replicas | Global |
|---------|----------|---------------|---------------|--------|
| **RDS** | Optional (extra cost) | 60-120 seconds | Up to 15 | Cross-region replicas |
| **Aurora** | Default (6 copies) | ~30 seconds | Up to 15 | Aurora Global Database |
| **DynamoDB** | Always (3 AZs) | Automatic | N/A | Global Tables |
| **DocumentDB** | Default | ~30 seconds | Up to 15 | No |
| **ElastiCache** | Optional | ~60 seconds | Read replicas | Global datastore |

## Cost Optimization Strategies

### RDS/Aurora
1. **Use Reserved Instances** - Save up to 60%
2. **Right-size instances** - Monitor CPU/memory
3. **Delete unused snapshots** - Keep only necessary backups
4. **Use Aurora Serverless** - For variable workloads
5. **Stop dev/test instances** - When not in use

### DynamoDB
1. **Use on-demand for unpredictable workloads**
2. **Use provisioned capacity for steady workloads**
3. **Enable auto-scaling**
4. **Archive old data to S3** - Use DynamoDB export
5. **Use DynamoDB Accelerator (DAX)** - Reduce read costs with caching

## Common Architecture Patterns

### Pattern 1: Web Application
```
Application → RDS (Multi-AZ)
           → ElastiCache (session store)
           → S3 (file storage)
```

### Pattern 2: High-Scale Mobile App
```
Mobile App → DynamoDB (user data)
          → ElastiCache (leaderboards)
          → S3 (media files)
```

### Pattern 3: E-commerce Platform
```
Web → Aurora (product catalog, orders)
   → DynamoDB (shopping cart, sessions)
   → ElastiCache (product cache)
   → DocumentDB (product reviews, metadata)
```

## Migration Paths

| From | To | Tool | Reason |
|------|-----|------|--------|
| On-prem MySQL/PostgreSQL | RDS | AWS DMS | Managed, backups |
| RDS MySQL/PostgreSQL | Aurora | In-place migration | Better performance |
| MongoDB | DocumentDB | mongodump/restore | AWS-managed MongoDB |
| RDBMS | DynamoDB | AWS DMS + restructure | Need NoSQL scale |
| Self-managed Redis | ElastiCache | Backup/restore | Managed caching |

## Key Exam Points

- **RDS** = Managed relational, 7 engines, Multi-AZ for HA
- **Aurora** = 5x MySQL / 3x PostgreSQL performance, auto-scaling storage
- **DynamoDB** = NoSQL, single-digit ms latency, automatic scaling
- **ElastiCache** = In-memory caching (Redis/Memcached)
- **DocumentDB** = MongoDB-compatible document database
- **Multi-AZ** = Synchronous replication for high availability
- **Read Replicas** = Asynchronous replication for read scaling
- **Aurora Serverless** = Auto-scaling compute capacity

## Decision Framework

### Step 1: Relational or NoSQL?

**Choose Relational (RDS/Aurora) if:**
- Need ACID transactions
- Complex queries with JOINs
- Existing relational schema
- SQL expertise in team

**Choose NoSQL (DynamoDB/DocumentDB) if:**
- Flexible schema needed
- Massive scale (millions of requests/sec)
- Simple query patterns
- High write throughput

### Step 2: Which Relational Database?

```
Need max performance? → Aurora
Standard workload? → RDS
Specific engine (Oracle/SQL Server)? → RDS
Variable workload? → Aurora Serverless
```

### Step 3: Which NoSQL Database?

```
Key-value or simple documents? → DynamoDB
MongoDB workload? → DocumentDB
Caching/sessions? → ElastiCache (Redis)
Graph relationships? → Neptune
Time-series data? → Timestream
```

## Related Notes

- [[databases-overview]] - Service details and features
- [[ec2]] - Running databases on EC2
- [[networking-overview]] - Database VPC configuration
- [[s3]] - Database backups and data lakes

---

**See Also:**
- [[storage-options-comparison]] - For data storage beyond databases
- [[04-study-aids/Quick Reference - Databases|Database Quick Reference]]
