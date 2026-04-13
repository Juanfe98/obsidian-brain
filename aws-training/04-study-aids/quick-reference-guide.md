---
tags:
  - quick-reference
  - cheat-sheet
  - study-aid
category: Study Aids
difficulty: beginner
---

# AWS quick-reference-guide

One-page cheat sheet for the most important AWS concepts and services.

## Core Services At a Glance

| Service | What It Does | When to Use | Key Feature |
|---------|--------------|-------------|-------------|
| **[[ec2]]** | Virtual servers | Need compute | Scalable instances |
| **[[s3]]** | Object storage | Store files | 11 nines durability |
| **[[databases-overview\|RDS]]** | Managed relational DB | SQL databases | Automated backups |
| **[[databases-overview\|DynamoDB]]** | NoSQL database | Key-value, high throughput | Single-digit ms latency |
| **[[networking-overview\|VPC]]** | Private network | Network isolation | Security Groups |
| **Lambda** | Serverless functions | Event-driven code | 15 min max |
| **IAM** | Access management | Control who can do what | Users, roles, policies |
| **CloudWatch** | Monitoring | Track metrics/logs | Alarms and dashboards |
| **CloudFront** | CDN | Fast content delivery | Edge locations |
| **[[networking-overview\|Route 53]]** | DNS | Domain routing | Health checks |

---

## Storage Quick Reference

```
Files/Objects → S3
EC2 volumes → EBS
Shared files → EFS
Archive → S3 Glacier
```

### S3 Storage Classes (Fastest → Slowest Retrieval)

| Class | Retrieval | Use Case |
|-------|-----------|----------|
| S3 Standard | Instant | Frequent access |
| S3 Intelligent-Tiering | Instant | Unknown pattern |
| S3 Standard-IA | Instant | Infrequent access |
| S3 Glacier Instant | Instant | Archive, fast retrieval |
| S3 Glacier Flexible | Minutes-hours | Archive, occasional |
| S3 Glacier Deep Archive | 12-48 hours | Long-term archive |

---

## Database Quick Reference

```
SQL + ACID → RDS or Aurora
NoSQL + Speed → DynamoDB
MongoDB workload → DocumentDB
Caching → ElastiCache
```

### RDS Engines
- MySQL, PostgreSQL, MariaDB (open source)
- Oracle, SQL Server (commercial)
- Aurora (AWS proprietary, high performance)

---

## Compute Quick Reference

```
Full control → EC2
Serverless functions → Lambda
Containers → ECS/Fargate
Kubernetes → EKS
```

### EC2 Instance Families
- **t** = Burstable (variable workloads)
- **m** = General purpose (balanced)
- **c** = Compute optimized (CPU-heavy)
- **r** = Memory optimized (RAM-heavy)
- **i/d/h** = Storage optimized (IOPS/throughput)

### EC2 Pricing
- **On-Demand** = Baseline, no commitment
- **Reserved** = 1-3 year, ~40-60% savings
- **Spot** = Bid on spare, up to 90% savings, can be interrupted
- **Savings Plans** = Flexible commitment

---

## Networking Quick Reference

### VPC Components
```
VPC (10.0.0.0/16)
├── Public Subnet → Internet Gateway → Internet
├── Private Subnet → NAT Gateway → Internet (outbound only)
├── Security Groups (instance firewall)
└── NACLs (subnet firewall)
```

### Security Groups vs NACLs

| Feature | Security Groups | NACLs |
|---------|----------------|-------|
| Level | Instance | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow + Deny |
| Default | Deny all inbound | Allow all |

---

## Infrastructure Quick Reference

### Global Infrastructure Hierarchy
```
Region (e.g., us-east-1)
└── Availability Zones (AZ) - us-east-1a, us-east-1b
    └── Data Centers
```

**Edge Locations** = CloudFront cache points (>400 globally)

### Choosing a Region (4 Factors)
1. **Compliance** - Data residency laws
2. **Latency** - Proximity to users
3. **Service Availability** - Not all services in all regions
4. **Cost** - Pricing varies by region

---

## Security Quick Reference

### Shared Responsibility Model

**AWS Responsibility (OF the cloud):**
- Hardware, facilities, network
- Hypervisor, managed service infrastructure

**Your Responsibility (IN the cloud):**
- Data, applications
- OS patches (EC2)
- Identity & Access (IAM)
- Encryption
- Network configuration

### IAM Hierarchy
```
AWS Account (Root user)
└── IAM Users (individuals)
└── IAM Groups (collections of users)
└── IAM Roles (temporary credentials)
└── IAM Policies (permissions)
```

**Best Practices:**
- ✅ Enable MFA on root
- ✅ Don't use root for daily tasks
- ✅ Principle of least privilege
- ✅ Use roles for EC2, not access keys

---

## Durability vs Availability

**Durability** = Will data be lost?
- S3: 99.999999999% (11 nines) = ~1 object lost per 10M every 10,000 years

**Availability** = Can I access data now?
- S3 Standard: 99.99% = ~52 min downtime/year

---

## Multi-AZ vs Read Replicas

| Feature | Multi-AZ | Read Replicas |
|---------|----------|---------------|
| Purpose | High Availability | Read Scaling |
| Replication | Synchronous | Asynchronous |
| Location | Same region, different AZ | Can be cross-region |
| Failover | Automatic (~60s) | Manual promotion |
| Billing | ~2x cost | Per replica |
| Endpoint | Single DNS name | Separate endpoints |

---

## Pricing Quick Facts

### Always Free Services
- IAM
- CloudFormation
- Auto Scaling
- VPC
- Consolidated Billing (Organizations)

### Free Tier (12 months)
- EC2: 750 hours/month t2.micro
- S3: 5 GB Standard storage
- RDS: 750 hours/month db.t2.micro
- Lambda: 1M requests + 400K GB-seconds

### Data Transfer Costs
- ✅ **IN** to AWS = FREE
- ❌ **OUT** from AWS = CHARGED
- ✅ Between services in same AZ = FREE
- ❌ Between AZs = CHARGED
- ❌ Between Regions = CHARGED

---

## Monitoring & Management

### CloudWatch vs CloudTrail vs Config

| Service | What It Tracks | Use Case |
|---------|---------------|----------|
| **CloudWatch** | Performance metrics | "Is my CPU high?" |
| **CloudTrail** | API calls | "Who deleted this?" |
| **Config** | Configuration changes | "When did this change?" |

### Trusted Advisor - 5 Pillars
1. Cost Optimization
2. Performance
3. Security
4. Fault Tolerance
5. Service Limits

---

## Common Use Case Patterns

### Static Website
```
Route 53 → CloudFront → S3 (static files)
```

### Web Application
```
Route 53 → ALB → EC2 Auto Scaling → RDS Multi-AZ
                                  → S3 (assets)
```

### Serverless API
```
Route 53 → API Gateway → Lambda → DynamoDB
                                → S3
```

### Big Data Pipeline
```
S3 (raw data) → Lambda/EMR (processing) → Redshift (warehouse)
                                        → Athena (queries)
```

---

## Service Limits to Remember

| Service | Limit | Note |
|---------|-------|------|
| Lambda max duration | 15 minutes | Per execution |
| Lambda max memory | 10 GB | Configurable |
| S3 max object size | 5 TB | Use multipart for >5 GB |
| VPC per region | 5 | Default, can increase |
| Security Groups per VPC | 2,500 | Default |
| Rules per Security Group | 60 | Inbound + outbound |

---

## Important Port Numbers

| Port | Service | Use |
|------|---------|-----|
| 22 | SSH | Linux remote access |
| 3389 | RDP | Windows remote access |
| 80 | HTTP | Web traffic |
| 443 | HTTPS | Secure web traffic |
| 3306 | MySQL | Database |
| 5432 | PostgreSQL | Database |
| 1433 | SQL Server | Database |

---

## Acronyms Cheat Sheet

- **AZ** = Availability Zone
- **IAM** = Identity and Access Management
- **VPC** = Virtual Private Cloud
- **EC2** = Elastic Compute Cloud
- **EBS** = Elastic Block Store
- **EFS** = Elastic File System
- **S3** = Simple Storage Service
- **RDS** = Relational Database Service
- **ALB** = Application Load Balancer
- **NLB** = Network Load Balancer
- **NAT** = Network Address Translation
- **IGW** = Internet Gateway
- **NACL** = Network Access Control List
- **CDN** = Content Delivery Network
- **DNS** = Domain Name System
- **SDK** = Software Development Kit
- **CLI** = Command Line Interface
- **AMI** = Amazon Machine Image
- **ECS** = Elastic Container Service
- **EKS** = Elastic Kubernetes Service
- **SNS** = Simple Notification Service
- **SQS** = Simple Queue Service

---

## Well-Architected Framework - 6 Pillars

1. **Operational Excellence** - Run, monitor, improve
2. **Security** - Protect data and systems
3. **Reliability** - Recover from failures
4. **Performance Efficiency** - Efficient resource use
5. **Cost Optimization** - Minimize costs
6. **Sustainability** - Environmental impact

---

## Decision Flowcharts

### Which Database?

```
Need ACID + SQL?
├─ YES → High performance?
│        ├─ YES → Aurora
│        └─ NO → RDS
└─ NO → Key-value + speed?
         ├─ YES → DynamoDB
         └─ NO → DocumentDB (if MongoDB)
```

### Which Storage?

```
What are you storing?
├─ Files/Objects → S3
├─ EC2 boot/data volumes → EBS
├─ Shared file system → EFS
└─ Archive → S3 Glacier
```

### Which Compute?

```
How long does it run?
├─ <15 min + event-driven → Lambda
├─ Containers → ECS/Fargate
└─ Always on / long tasks → EC2
```

---

## Related Study Materials

- [[cloud-practitioner-exam-prep]] - Full exam checklist
- [[key-concepts-flashcards]] - Memory aids
- [[storage-options-comparison]] - Detailed storage guide
- [[database-options-comparison]] - Detailed database guide
- [[compute-services-comparison]] - Detailed compute guide
- [[02-core-services/moc-core-services|Core Services MOC]] - Service deep dives

---

**Pro Tip:** Print this page and keep it handy while studying! 📄
