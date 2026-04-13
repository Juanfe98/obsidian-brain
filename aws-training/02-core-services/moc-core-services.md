---
tags:
  - moc
  - core-services
category: Map of Content
---

# Core Services - Map of Content

This section covers the fundamental AWS services you'll use most frequently. Each service category addresses different architectural needs.

## Service Categories

### ⚙️ Compute - [[ec2]]
**What it does:** Virtual servers in the cloud

**Key features:**
- Launch virtual machines (EC2 instances) on demand
- Multiple instance types for different workloads
- Auto Scaling for dynamic capacity management

**Use when:** You need to run applications, websites, or workloads that require compute resources

**Common patterns:**
- Web servers behind load balancers
- Application servers
- Batch processing jobs
- Development/test environments

### 📦 Storage - [[s3]]
**What it does:** Object storage service for any amount of data

**Key features:**
- 99.999999999% (11 nines) durability
- Multiple storage classes for different access patterns
- Lifecycle policies for automatic data management
- Redundant storage across 3+ Availability Zones

**Use when:** You need to store files, backups, logs, or build data lakes

**Common patterns:**
- Static website hosting
- Backup and archiving
- Data lakes for analytics
- Content distribution

### 🗄️ Databases - [[databases-overview]]
**What it does:** Managed database services for different data models

**Key services:**
- **RDS** - Managed relational databases (MySQL, PostgreSQL, etc.)
- **Aurora** - High-performance MySQL/PostgreSQL-compatible database
- **DynamoDB** - NoSQL key-value database with single-digit millisecond performance

**Use when:** You need persistent data storage with query capabilities

**Common patterns:**
- Application data storage (RDS)
- Session management (DynamoDB)
- High-throughput applications (Aurora)
- Flexible schema workloads (DynamoDB)

### 🔗 Application Integration - [[step-functions]]
**What it does:** Services that connect and coordinate other AWS services together

**Key services:**
- **Step Functions** - Serverless orchestration of visual workflows
- **SQS** - Message queuing for decoupled communication
- **SNS** - Pub/sub notifications
- **EventBridge** - Event-driven routing between services

**Use when:** You need to coordinate multiple services, decouple components, or build event-driven architectures

**Common patterns:**
- Multi-step workflow orchestration (Step Functions)
- Asynchronous task processing (SQS)
- Fan-out notifications (SNS)
- Event-driven microservices (EventBridge)

### 🌐 Networking - [[networking-overview]]
**What it does:** Network isolation and DNS services

**Key services:**
- **VPC** - Private virtual networks for your resources
- **Route 53** - DNS service and domain management

**Key concepts:**
- Security Groups for instance-level firewalls
- VPC Endpoints for private service access
- Multi-AZ subnet architecture

**Use when:** You need to control network access and routing

**Common patterns:**
- Public web tier + private app tier + private database tier
- Private access to S3 via VPC endpoints
- Multi-region DNS failover

## How Services Work Together

### Common Architecture Pattern

```
Internet → Route 53 (DNS) → VPC → EC2 (web/app servers) → RDS (database)
                                  ↓
                                  S3 (static assets, backups)
```

### Service Relationships

| Service | Works With | How They Connect |
|---------|-----------|-----------------|
| [[ec2]] | [[networking-overview\|VPC]] | EC2 instances run inside VPC subnets |
| [[ec2]] | [[s3]] | EC2 can read/write data to S3 buckets |
| [[ec2]] | [[databases-overview\|RDS]] | EC2 apps connect to RDS databases |
| [[databases-overview\|RDS]] | [[networking-overview\|VPC]] | RDS runs inside VPC for isolation |
| [[s3]] | [[networking-overview\|VPC Endpoints]] | Private S3 access without internet gateway |
| [[step-functions]] | [[ec2]], [[databases-overview\|DynamoDB]], [[s3]] | Orchestrates multiple services into automated workflows |

## Learning Path by Service

### Recommended Study Order

1. **Start with Networking** - [[networking-overview]]
   - Understanding VPC is foundational for all other services
   - Learn about Security Groups, subnets, and routing

2. **Then Compute** - [[ec2]]
   - Learn how to launch and manage virtual servers
   - Understand instance types and Auto Scaling

3. **Next Storage** - [[s3]]
   - Understand object storage vs block storage
   - Learn storage classes and lifecycle policies

4. **Finally Databases** - [[databases-overview]]
   - Compare relational vs NoSQL options
   - Understand when to use each database type

5. **Then Application Integration** - [[step-functions]]
   - Learn how to orchestrate services into workflows
   - Understand event-driven and decoupled architectures

### By Use Case

**Building a web application:**
1. [[networking-overview|VPC]] - Create isolated network
2. [[ec2]] - Launch web/app servers
3. [[databases-overview|RDS]] - Set up database
4. [[s3]] - Store static assets and backups

**Data analytics platform:**
1. [[s3]] - Build data lake
2. [[ec2]] - Run analytics workloads
3. [[databases-overview|DynamoDB]] - Fast queries on processed data

**High availability architecture:**
1. [[aws-infrastructure]] (prerequisite) - Understand Regions/AZs
2. [[networking-overview|VPC]] - Multi-AZ subnet design
3. [[ec2]] - Auto Scaling across AZs
4. [[databases-overview|RDS]] - Multi-AZ deployment

## Quick Service Comparison

### Storage Options
| Service | Type | Use Case | Durability |
|---------|------|----------|------------|
| [[s3]] | Object Storage | Files, backups, data lakes | 11 nines |
| EBS | Block Storage | EC2 instance volumes | Single AZ |
| EFS | File Storage | Shared file systems | Multi-AZ |

### Database Options
| Service | Type | Best For | Scaling |
|---------|------|----------|---------|
| [[databases-overview\|RDS]] | Relational | Structured data, ACID transactions | Vertical |
| [[databases-overview\|Aurora]] | Relational | High performance relational | Vertical + Read replicas |
| [[databases-overview\|DynamoDB]] | NoSQL | Flexible schema, high throughput | Automatic horizontal |

## Tags for Filtering

Use these tags in Obsidian to filter notes:
- `#compute` - Compute services
- `#storage` - Storage services
- `#databases` - Database services
- `#networking` - Networking services
- `#application-integration` - Application Integration services
- `#ec2` `#s3` `#rds` `#aurora` `#dynamodb` `#vpc` `#route53` `#step-functions` - Specific services

---

**Previous:** [[01-fundamentals/moc-fundamentals|Fundamentals Map of Content]]
**Home:** [[00 - AWS Learning Hub]]
