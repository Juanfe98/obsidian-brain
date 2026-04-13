---
tags:
  - flashcards
  - study-aid
  - memorization
category: Study Aids
difficulty: beginner
---

# key-concepts-flashcards

Use these flashcard-style Q&A for quick memorization and review. Perfect for spaced repetition!

> **How to use:** Cover the answer, try to recall it, then reveal. Mark the ones you got wrong and review them again tomorrow.

---

## Fundamental Concepts

### Q: What is cloud computing?
**A:** On-demand delivery of IT resources and applications through the internet with pay-as-you-go pricing.

---

### Q: What are the 3 cloud deployment models?
**A:**
1. Cloud (fully in AWS)
2. Hybrid (cloud + on-premises)
3. On-premises (private cloud)

---

### Q: What are the 3 cloud service models?
**A:**
1. **IaaS** - Infrastructure (EC2, S3)
2. **PaaS** - Platform (RDS, Elastic Beanstalk)
3. **SaaS** - Software (WorkDocs, Chime)

---

### Q: Name the 6 advantages of cloud computing.
**A:**
1. Trade capital expense for variable expense
2. Benefit from massive economies of scale
3. Stop guessing capacity
4. Increase speed and agility
5. Stop spending money on data centers
6. Go global in minutes

---

## Infrastructure

### Q: What is an AWS Region?
**A:** A geographical area containing 2 or more Availability Zones (e.g., us-east-1, eu-west-1).

---

### Q: What is an Availability Zone (AZ)?
**A:** One or more isolated data centers within a Region, designed for fault isolation.

---

### Q: What are the 4 factors for choosing a Region?
**A:**
1. Compliance (data residency)
2. Latency (proximity to users)
3. Service availability
4. Cost

---

### Q: What is an Edge Location?
**A:** A site that CloudFront uses to cache content closer to users for faster delivery. There are 400+ edge locations worldwide.

---

### Q: How many copies does S3 store across how many AZs by default?
**A:** Minimum of 3 copies across at least 3 Availability Zones.

---

## Security & Compliance

### Q: What is the AWS Shared Responsibility Model?
**A:**
- **AWS** = Security OF the cloud (hardware, facilities, hypervisor)
- **Customer** = Security IN the cloud (data, apps, OS patches, IAM, encryption)

---

### Q: What are the 4 main IAM identity types?
**A:**
1. Users (individual people)
2. Groups (collection of users)
3. Roles (temporary credentials for services)
4. Policies (JSON permission documents)

---

### Q: What is the principle of least privilege?
**A:** Grant only the minimum permissions needed to perform a task. No more, no less.

---

### Q: What should you ALWAYS do with the root account?
**A:**
1. Enable MFA (Multi-Factor Authentication)
2. Don't use it for daily tasks
3. Create IAM users instead

---

### Q: What is CloudTrail used for?
**A:** Logging and tracking API calls (who did what, when). Think "audit trail."

---

### Q: What is AWS Shield?
**A:** DDoS (Distributed Denial of Service) protection. Standard is free, Advanced costs money.

---

### Q: What is AWS WAF?
**A:** Web Application Firewall - protects against common web exploits (SQL injection, XSS).

---

## Compute Services

### Q: What is EC2?
**A:** Elastic Compute Cloud - virtual servers in the cloud that you have full control over.

---

### Q: What does the instance type "m5.2xlarge" mean?
**A:**
- **m** = instance family (general purpose)
- **5** = generation (newer is better)
- **2xlarge** = size (8 vCPUs, 32 GB RAM)

---

### Q: What are the 5 EC2 instance families?
**A:**
1. **t** = Burstable (variable workloads)
2. **m** = General purpose
3. **c** = Compute optimized
4. **r** = Memory optimized (RAM)
5. **i/d/h** = Storage optimized

---

### Q: What is EC2 Auto Scaling?
**A:** Automatically add or remove EC2 instances based on demand to maintain performance and minimize cost.

---

### Q: What are the 4 main EC2 pricing models?
**A:**
1. **On-Demand** - Pay per hour/second, no commitment
2. **Reserved** - 1-3 year commitment, ~40-60% savings
3. **Spot** - Bid on spare capacity, up to 90% savings, can be interrupted
4. **Savings Plans** - Flexible commitment by $/hour

---

### Q: What is AWS Lambda?
**A:** Serverless compute - run code without managing servers. Pay only for execution time.

---

### Q: What are the 3 Lambda limitations?
**A:**
1. Max duration: **15 minutes**
2. Max memory: **10 GB**
3. Max deployment package: **50 MB** (zipped)

---

### Q: When should you use Lambda vs EC2?
**A:**
- **Lambda**: Event-driven, short tasks (<15 min), sporadic workloads
- **EC2**: Long-running, need OS control, consistent workloads

---

## Storage Services

### Q: What is S3?
**A:** Simple Storage Service - object storage for files with 99.999999999% (11 nines) durability.

---

### Q: What does "11 nines" durability mean?
**A:** 99.999999999% durability = If you store 10 million objects, you might lose 1 every 10,000 years.

---

### Q: What are the 3 main S3 storage classes for active data?
**A:**
1. **S3 Standard** - Frequent access
2. **S3 Intelligent-Tiering** - Unknown pattern
3. **S3 Standard-IA** - Infrequent access

---

### Q: What are the 3 S3 Glacier archive classes?
**A:**
1. **Glacier Instant Retrieval** - Instant access
2. **Glacier Flexible Retrieval** - Minutes to hours
3. **Glacier Deep Archive** - 12-48 hours (cheapest)

---

### Q: What is the minimum storage duration for S3 Standard-IA?
**A:** 30 days. If you delete before 30 days, you still pay for 30 days.

---

### Q: What is EBS?
**A:** Elastic Block Store - block storage volumes for EC2 instances (like a hard drive).

---

### Q: What is EFS?
**A:** Elastic File System - network file system (NFS) that multiple EC2 instances can access concurrently.

---

### Q: S3 vs EBS vs EFS - which for what?
**A:**
- **S3** = Object storage, files, backups, unlimited
- **EBS** = Block storage, EC2 volumes, single instance
- **EFS** = File system, shared access, multi-instance

---

## Database Services

### Q: What is RDS?
**A:** Relational Database Service - managed SQL databases (MySQL, PostgreSQL, Oracle, SQL Server, MariaDB).

---

### Q: What makes Aurora different from RDS?
**A:**
- 5x faster than MySQL, 3x faster than PostgreSQL
- AWS proprietary engine
- Auto-scaling storage (up to 128 TiB)
- Faster failover (~30 seconds)

---

### Q: What is DynamoDB?
**A:** NoSQL key-value database with single-digit millisecond latency and automatic scaling.

---

### Q: RDS vs DynamoDB - when to use each?
**A:**
- **RDS**: Need SQL, ACID transactions, complex queries with JOINs
- **DynamoDB**: Need NoSQL, massive scale, flexible schema, high throughput

---

### Q: What is Multi-AZ in RDS?
**A:** Synchronous replication to a standby instance in another AZ for high availability. Automatic failover in ~60-120 seconds.

---

### Q: What are Read Replicas?
**A:** Asynchronous copies of the database for read scaling. Can be in different regions. No automatic failover.

---

### Q: Multi-AZ vs Read Replicas - what's the difference?
**A:**
- **Multi-AZ**: High availability (HA), synchronous, auto failover, same region
- **Read Replicas**: Performance (read scaling), asynchronous, manual promotion, can be cross-region

---

### Q: What is ElastiCache?
**A:** In-memory caching service (Redis or Memcached) for microsecond latency.

---

## Networking Services

### Q: What is a VPC?
**A:** Virtual Private Cloud - your own isolated virtual network in AWS where you launch resources.

---

### Q: What is a subnet?
**A:** A range of IP addresses within a VPC. Each subnet exists in one Availability Zone.

---

### Q: What's the difference between public and private subnets?
**A:**
- **Public**: Has route to Internet Gateway (direct internet access)
- **Private**: No direct internet route (uses NAT for outbound)

---

### Q: What is an Internet Gateway (IGW)?
**A:** Allows resources in public subnets to communicate with the internet (bidirectional).

---

### Q: What is a NAT Gateway?
**A:** Allows resources in private subnets to access the internet (outbound only) while remaining private.

---

### Q: What are Security Groups?
**A:** **Instance-level** stateful firewall with allow rules only. Default: deny all inbound, allow all outbound.

---

### Q: What are NACLs?
**A:** Network Access Control Lists - **subnet-level** stateless firewall with allow and deny rules.

---

### Q: Security Groups vs NACLs?
**A:**
| Feature | Security Groups | NACLs |
|---------|----------------|-------|
| Level | Instance | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow + Deny |
| Default | Deny inbound | Allow all |

---

### Q: What is Route 53?
**A:** AWS DNS service that routes users to applications. Also domain registration.

---

### Q: What are the 4 common Route 53 routing policies?
**A:**
1. **Simple** - Single resource
2. **Weighted** - Split traffic by percentage
3. **Latency** - Route to lowest latency
4. **Failover** - Primary/secondary with health checks

---

### Q: What is CloudFront?
**A:** Content Delivery Network (CDN) that caches content at edge locations for faster delivery.

---

## Monitoring & Management

### Q: What is CloudWatch?
**A:** Monitoring service for metrics, logs, and alarms. Think "performance monitoring."

---

### Q: CloudWatch vs CloudTrail vs Config?
**A:**
- **CloudWatch** = Performance metrics ("Is CPU high?")
- **CloudTrail** = API call logging ("Who did this?")
- **Config** = Configuration tracking ("When did this change?")

---

### Q: What is Trusted Advisor?
**A:** Best practice checker for cost optimization, security, performance, fault tolerance, and service limits.

---

### Q: What is CloudFormation?
**A:** Infrastructure as Code (IaC) - define AWS resources in templates (JSON/YAML) for automated deployment.

---

### Q: What is AWS Organizations?
**A:** Service to manage multiple AWS accounts centrally. Enables consolidated billing.

---

## Billing & Pricing

### Q: What are the 3 fundamental pricing characteristics?
**A:**
1. Pay-as-you-go (no upfront)
2. Pay less when you reserve
3. Pay less per unit by using more (volume discounts)

---

### Q: Data transfer pricing rule?
**A:**
- Data IN to AWS: **FREE**
- Data OUT from AWS: **CHARGED**
- Between AZs: **CHARGED**
- Between Regions: **CHARGED**

---

### Q: What services are always free?
**A:** IAM, VPC, CloudFormation, Auto Scaling, Consolidated Billing (Organizations).

---

### Q: What are the 4 AWS Support plans?
**A:**
1. **Basic** - Free (forums only)
2. **Developer** - $29/month (email, <24hr)
3. **Business** - $100+/month (24/7 phone, <1hr urgent)
4. **Enterprise** - $15K+/month (TAM, <15min critical)

---

### Q: What is included ONLY in Enterprise support?
**A:** TAM (Technical Account Manager) and Concierge support team.

---

### Q: What AWS tools help with cost management? (Name 4)
**A:**
1. **AWS Pricing Calculator** - Estimate costs
2. **Cost Explorer** - Visualize spending
3. **AWS Budgets** - Set alerts
4. **Cost and Usage Reports** - Detailed data

---

## Well-Architected Framework

### Q: What are the 6 pillars of the Well-Architected Framework?
**A:**
1. Operational Excellence
2. Security
3. Reliability
4. Performance Efficiency
5. Cost Optimization
6. Sustainability

---

### Q: What is the Well-Architected Tool?
**A:** Free tool to review your architecture against AWS best practices across the 6 pillars.

---

## Advanced Services (Know What They Are)

### Q: What is AWS Elastic Beanstalk?
**A:** Platform as a Service (PaaS) - upload code, AWS handles deployment, capacity, load balancing, auto-scaling.

---

### Q: What is Amazon Athena?
**A:** Serverless query service to analyze data in S3 using SQL.

---

### Q: What is Amazon Redshift?
**A:** Data warehouse for analytics and business intelligence on petabyte-scale data.

---

### Q: What is AWS Glue?
**A:** ETL service (Extract, Transform, Load) for preparing data for analytics.

---

### Q: What is Amazon SageMaker?
**A:** Service to build, train, and deploy machine learning models.

---

### Q: What is Amazon SNS?
**A:** Simple Notification Service - pub/sub messaging (one message to many subscribers).

---

### Q: What is Amazon SQS?
**A:** Simple Queue Service - message queue for decoupling applications.

---

### Q: SNS vs SQS?
**A:**
- **SNS** = Pub/Sub (push), one-to-many
- **SQS** = Queue (pull), one-to-one, decoupling

---

## Common Exam Tricks

### Q: If a question mentions "serverless," what services should you think of?
**A:** Lambda, DynamoDB, S3, API Gateway, SNS, SQS, Step Functions, Fargate.

---

### Q: If a question asks about "11 nines durability," what service?
**A:** S3 (and EFS).

---

### Q: If a question asks about "single-digit millisecond latency," what service?
**A:** DynamoDB.

---

### Q: If a question mentions "who did what," what service?
**A:** CloudTrail (API call logging).

---

### Q: If a question asks about caching or session storage, what services?
**A:** ElastiCache (Redis/Memcached) or DynamoDB.

---

### Q: If a question mentions "data warehouse" or "analytics," what service?
**A:** Redshift (data warehouse) or Athena (query S3 with SQL).

---

## Study Tips

✅ Review these flashcards daily
✅ Cover the answer, try to recall, then check
✅ Mark the ones you miss and review them again
✅ Use spaced repetition (review again in 1 day, 3 days, 7 days)
✅ Shuffle the order to avoid memorizing sequences

---

## Related Study Materials

- [[cloud-practitioner-exam-prep]] - Full exam checklist
- [[quick-reference-guide]] - One-page cheat sheet
- [[storage-options-comparison]] - Detailed comparisons
- [[database-options-comparison]] - Database selection
- [[compute-services-comparison]] - Compute options
- [[02-core-services/moc-core-services|Core Services MOC]] - Deep dives

---

**Pro Tip:** Create your own flashcards for concepts you find difficult! ✏️
