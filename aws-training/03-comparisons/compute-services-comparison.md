---
tags:
  - comparison
  - compute
  - ec2
  - lambda
  - ecs
  - serverless
category: Comparisons
difficulty: intermediate
related:
  - "[[ec2]]"
  - "[[cloud-computing-basics]]"
---

# compute-services-comparison

AWS offers multiple compute options for different workload requirements. Understanding when to use each is key to building efficient, cost-effective architectures.

## Quick Decision Guide

```
Need full server control? → EC2
Want serverless functions? → Lambda
Running containers? → ECS or EKS
Batch processing? → Batch
High-performance computing? → EC2 + HPC clusters
```

## Core Compute Services Overview

| Service | Type | Management | Use Case | Pricing |
|---------|------|------------|----------|---------|
| **[[ec2]]** | Virtual Machines | You manage | General purpose servers | Per hour/second |
| **Lambda** | Serverless Functions | AWS manages | Event-driven, short tasks | Per request + duration |
| **ECS** | Containers | Shared responsibility | Docker containers | EC2 or Fargate pricing |
| **EKS** | Kubernetes | Shared responsibility | Kubernetes workloads | Control plane + workers |
| **Fargate** | Serverless Containers | AWS manages | Containers without servers | Per vCPU/memory/second |
| **Elastic Beanstalk** | PaaS | AWS manages infrastructure | Quick app deployment | Underlying resource costs |
| **Lightsail** | VPS | Simplified | Simple web apps | Fixed monthly price |

## Detailed Comparison: EC2 vs Lambda vs Containers

| Feature | [[ec2]] | Lambda | ECS/Fargate |
|---------|---------|--------|-------------|
| **Launch Time** | Minutes | Milliseconds | Seconds to minutes |
| **Control** | Full OS access | Code only | Container orchestration |
| **Duration** | Unlimited | 15 minutes max | Unlimited |
| **Scaling** | Auto Scaling Groups | Automatic (1000s concurrent) | Auto scaling tasks |
| **Pricing** | Pay per hour/second running | Pay per invocation + GB-second | Pay per task |
| **State** | Stateful | Stateless | Can be either |
| **Maintenance** | You patch OS | AWS manages everything | You manage container, AWS manages infra |
| **Memory** | 0.5 GB - 24+ TB | 128 MB - 10 GB | 0.5 GB - 30 GB |
| **Ideal Duration** | Long-running | <15 minutes | Any |
| **Cold Start** | N/A (always on) | Yes (~100ms-1s) | Minimal |

## When to Use Each Service

### Use [[ec2]] When:

✅ **Long-running applications** - Web servers, app servers
✅ **Need full OS control** - Custom software, kernel modules
✅ **Consistent compute needs** - Predictable workloads
✅ **Stateful applications** - Maintain local state
✅ **Specific compliance** - Dedicated hardware required
✅ **High memory/CPU needs** - Large instances available
✅ **Third-party licensing** - BYOL (Bring Your Own License)

❌ **Don't use for:**
- Short, sporadic tasks (use Lambda)
- Event-driven workflows (use Lambda)
- Zero maintenance desired (use Lambda/Fargate)

**Example use cases:**
- Corporate websites
- Application servers
- Gaming servers
- CI/CD build agents
- Development environments

### Use Lambda When:

✅ **Event-driven tasks** - S3 uploads, DynamoDB changes
✅ **Sporadic workloads** - Run a few times per day/hour
✅ **Short duration** - Tasks under 15 minutes
✅ **Auto-scaling critical** - Handle unpredictable spikes
✅ **Serverless preferred** - No server management
✅ **Cost optimization** - Pay only for execution time

❌ **Don't use for:**
- Long-running processes (>15 min)
- Stateful applications
- Applications needing persistent connections
- Workloads requiring specific OS/kernel

**Example use cases:**
- Image/video processing on upload
- Real-time file processing
- Scheduled data backups
- API backends (with API Gateway)
- IoT backend processing
- Chatbots

### Use ECS/Fargate When:

✅ **Running containers** - Dockerized applications
✅ **Microservices architecture** - Multiple services
✅ **Want AWS-native orchestration** - Simpler than Kubernetes
✅ **Don't need Kubernetes features** - ECS is sufficient
✅ **Fargate**: Don't want to manage EC2 instances
✅ **ECS on EC2**: Need more control and cost optimization

❌ **Don't use for:**
- Simple scripts (use Lambda)
- Non-containerized apps (use EC2 or refactor)
- Need Kubernetes ecosystem (use EKS)

**Example use cases:**
- Microservices applications
- Batch processing jobs
- Machine learning inference
- CI/CD pipelines

## EC2 Instance Types Breakdown

| Family | Type | Use Case | Example Instances |
|--------|------|----------|-------------------|
| **General Purpose** | Balanced CPU/memory | Web servers, dev/test | t3, t4g, m5, m6i |
| **Compute Optimized** | High CPU | Batch processing, gaming, HPC | c5, c6i, c7g |
| **Memory Optimized** | High memory | Databases, caching | r5, r6i, x1, z1d |
| **Storage Optimized** | High IOPS/throughput | Data warehouses, big data | i3, i4i, d2, h1 |
| **Accelerated Computing** | GPU/FPGA | ML, graphics, video encoding | p4, g5, f1, inf1 |

### EC2 Instance Naming Convention

Example: **m5.2xlarge**
- **m** = Instance family (general purpose)
- **5** = Generation number (newer = better)
- **2xlarge** = Instance size (CPU/memory)

Sizes: nano < micro < small < medium < large < xlarge < 2xlarge < 4xlarge...

## EC2 Pricing Models

| Model | Description | Savings | Best For | Commitment |
|-------|-------------|---------|----------|------------|
| **On-Demand** | Pay per hour/second | 0% (baseline) | Short-term, unpredictable | None |
| **Reserved (1yr)** | Commit to 1 year | ~40% | Steady state | 1 year |
| **Reserved (3yr)** | Commit to 3 years | ~60% | Long-term predictable | 3 years |
| **Spot Instances** | Bid on spare capacity | Up to 90% | Fault-tolerant workloads | None (can be terminated) |
| **Savings Plans** | Commit to $/hour | ~40-60% | Flexible compute | 1 or 3 years |
| **Dedicated Hosts** | Physical server | Varies | Licensing, compliance | On-Demand or Reserved |

### When to Use Each Pricing Model

**On-Demand:**
- Development/testing
- New applications (unknown pattern)
- Short-term projects

**Reserved Instances:**
- Production databases
- Always-on web servers
- Predictable workloads

**Spot Instances:**
- Batch processing
- Data analysis
- CI/CD build agents
- Stateless web servers (with Auto Scaling)
- Non-critical workloads

**Savings Plans:**
- Mix of EC2, Lambda, Fargate
- Flexible instance types/regions

## Lambda Pricing & Limits

**Pricing:**
- Free tier: 1M requests + 400,000 GB-seconds/month
- After: $0.20 per 1M requests
- Duration: $0.0000166667 per GB-second

**Limits:**
- Maximum duration: 15 minutes (900 seconds)
- Memory: 128 MB to 10 GB
- Disk space (/tmp): 10 GB
- Concurrent executions: 1,000 (default, can increase)
- Deployment package: 50 MB (zipped), 250 MB (unzipped)

## Scaling Comparison

| Service | Scaling Method | Speed | Limit |
|---------|---------------|-------|-------|
| **EC2 Auto Scaling** | Add/remove instances | Minutes | Instance limits |
| **Lambda** | Automatic per request | Milliseconds | 1,000 concurrent (default) |
| **ECS Service Auto Scaling** | Add/remove tasks | Seconds to minutes | Cluster capacity |
| **Fargate** | Automatic per task | Seconds | Account limits |

## Common Architecture Patterns

### Pattern 1: Traditional Web Application
```
Users → Load Balancer → [[ec2]] Auto Scaling Group
                       → [[databases-overview|RDS]]
                       → [[s3]] (static content)
```

### Pattern 2: Serverless Web API
```
Users → API Gateway → Lambda → DynamoDB
                   → Lambda → S3
```

### Pattern 3: Microservices
```
Users → ALB → ECS/Fargate (multiple services)
           → Lambda (event processing)
           → RDS + DynamoDB
```

### Pattern 4: Hybrid (Best of Both)
```
Users → CloudFront → S3 (static site)
                  → API Gateway → Lambda (API)
                  → EC2 (background jobs)
                  → RDS (data)
```

## Compute Service Selection Framework

### Step 1: Execution Pattern

**Continuous/Long-Running:**
→ EC2, ECS on EC2, or EKS

**Event-Driven/Short Tasks:**
→ Lambda

**Containers:**
→ ECS, EKS, or Fargate

### Step 2: Management Preference

**Full Control:**
→ EC2

**Shared Responsibility:**
→ ECS on EC2, EKS

**Fully Managed:**
→ Lambda, Fargate, Elastic Beanstalk

### Step 3: Cost Optimization

**Predictable Workload:**
→ Reserved EC2 or Savings Plans

**Variable/Sporadic:**
→ Lambda or Spot Instances

**Minimal Admin Time:**
→ Lambda (no server management cost)

## Performance Comparison

| Metric | EC2 | Lambda | ECS/Fargate |
|--------|-----|--------|-------------|
| **Cold Start** | N/A | 100ms - 1s | Seconds |
| **Warm Performance** | Consistent | Consistent | Consistent |
| **Network** | Up to 100 Gbps | N/A (managed) | Up to 10 Gbps |
| **Compute Power** | Up to 448 vCPUs | Up to 10 GB memory = ~6 vCPU | Up to 16 vCPUs |
| **Predictability** | High | Medium (cold starts) | High |

## Key Exam Points

- **EC2** = Virtual machines, full control, multiple instance types
- **Lambda** = Serverless, event-driven, 15-minute max, pay per invocation
- **Auto Scaling** = Automatically adjusts capacity based on demand
- **Spot Instances** = Up to 90% savings, can be interrupted
- **Reserved Instances** = 1-3 year commitment, ~40-60% savings
- **ECS** = Container orchestration, simpler than Kubernetes
- **Fargate** = Serverless containers, no EC2 management
- **t-family (t3, t4g)** = Burstable performance, good for variable workloads
- **m-family** = General purpose, balanced compute/memory/network

## Decision Tree

```
Need to run code?
├─ Is it containerized?
│  ├─ YES → Need Kubernetes?
│  │  ├─ YES → EKS
│  │  └─ NO → ECS or Fargate
│  └─ NO → Is it event-driven and <15 min?
│     ├─ YES → Lambda
│     └─ NO → EC2
└─ Need full OS control?
   ├─ YES → EC2
   └─ NO → Lambda or Elastic Beanstalk
```

## Related Notes

- [[ec2]] - Detailed EC2 features and instance types
- [[cloud-computing-basics]] - Fundamental compute concepts
- [[aws-infrastructure]] - How compute relates to AZs and Regions
- [[networking-overview]] - VPC configuration for compute services

---

**See Also:**
- [[storage-options-comparison]] - Storage for compute workloads
- [[database-options-comparison]] - Databases for applications
