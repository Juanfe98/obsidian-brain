---
tags:
  - study-guide
  - exam-prep
  - cloud-practitioner
  - certification
category: Study Aids
difficulty: beginner
related:
  - "[[cloud-computing-basics]]"
  - "[[aws-infrastructure]]"
  - "[[ec2]]"
  - "[[s3]]"
  - "[[databases-overview]]"
  - "[[networking-overview]]"
---

# AWS cloud-practitioner-exam-prep Checklist

This checklist helps you prepare for the AWS Certified Cloud Practitioner (CLF-C02) exam.

## Exam Overview

- **Duration:** 90 minutes
- **Questions:** 65 (50 scored + 15 unscored)
- **Format:** Multiple choice and multiple response
- **Passing Score:** 700/1000
- **Cost:** $100 USD
- **Validity:** 3 years

## Exam Domains & Weights

| Domain | Weight |
|--------|--------|
| 1. Cloud Concepts | 24% |
| 2. Security and Compliance | 30% |
| 3. Cloud Technology and Services | 34% |
| 4. Billing, Pricing, and Support | 12% |

---

## Domain 1: Cloud Concepts (24%)

### ✅ Define the Benefits of AWS Cloud

- [ ] Understand the [[cloud-computing-basics|six advantages of cloud computing]]:
  - [ ] Trade capital expense for variable expense
  - [ ] Benefit from massive economies of scale
  - [ ] Stop guessing capacity
  - [ ] Increase speed and agility
  - [ ] Stop spending money on data centers
  - [ ] Go global in minutes

- [ ] Compare cloud computing models:
  - [ ] IaaS (Infrastructure as a Service) - [[ec2]], [[s3]]
  - [ ] PaaS (Platform as a Service) - Elastic Beanstalk, RDS
  - [ ] SaaS (Software as a Service) - Amazon Chime, WorkDocs

- [ ] Compare deployment models:
  - [ ] Cloud (fully in AWS)
  - [ ] Hybrid (cloud + on-premises)
  - [ ] On-premises (private cloud)

### ✅ AWS Well-Architected Framework

Understand the six pillars:

- [ ] **Operational Excellence** - Run and monitor systems
- [ ] **Security** - Protect information and systems
- [ ] **Reliability** - Recover from failures, meet demand
- [ ] **Performance Efficiency** - Use resources efficiently
- [ ] **Cost Optimization** - Avoid unnecessary costs
- [ ] **Sustainability** - Minimize environmental impact

### ✅ Cloud Economics

- [ ] Understand Total Cost of Ownership (TCO)
- [ ] Benefits of cloud financial management
- [ ] Pay-as-you-go pricing model
- [ ] Cost savings vs on-premises

---

## Domain 2: Security and Compliance (30%)

### ✅ AWS Shared Responsibility Model

- [ ] **AWS Responsibility (Security OF the cloud)**:
  - [ ] Physical security of data centers
  - [ ] Hardware and network infrastructure
  - [ ] Hypervisor and managed services

- [ ] **Customer Responsibility (Security IN the cloud)**:
  - [ ] Customer data
  - [ ] OS patching (for [[ec2]])
  - [ ] Application security
  - [ ] [[networking-overview|Security Groups]] and firewall configuration
  - [ ] Encryption
  - [ ] Identity and Access Management (IAM)

### ✅ IAM (Identity and Access Management)

- [ ] Users, Groups, Roles, Policies
- [ ] Principle of least privilege
- [ ] Multi-Factor Authentication (MFA)
- [ ] Access keys vs passwords
- [ ] IAM best practices:
  - [ ] Enable MFA for root account
  - [ ] Don't use root for daily tasks
  - [ ] Grant least privilege
  - [ ] Use groups to assign permissions

### ✅ Security Services

- [ ] **AWS WAF** - Web application firewall
- [ ] **AWS Shield** - DDoS protection
  - [ ] Standard (free) vs Advanced
- [ ] **Amazon GuardDuty** - Threat detection
- [ ] **Amazon Inspector** - Security assessments
- [ ] **AWS Artifact** - Compliance reports
- [ ] **AWS KMS** - Key Management Service for encryption
- [ ] **AWS Secrets Manager** - Rotate and manage secrets
- [ ] **AWS CloudTrail** - API call logging and auditing

### ✅ Compliance

- [ ] AWS Compliance programs (HIPAA, PCI DSS, GDPR, etc.)
- [ ] AWS Artifact for compliance documentation
- [ ] AWS Config for resource compliance

---

## Domain 3: Cloud Technology and Services (34%)

### ✅ Compute Services

**[[ec2]] - Elastic Compute Cloud**
- [ ] Virtual servers in the cloud
- [ ] Instance types (t3, m5, c5, r5, etc.)
- [ ] [[EC2|Auto Scaling]] - Automatically adjust capacity
- [ ] Elastic Load Balancing (ALB, NLB, CLB)
- [ ] AMI (Amazon Machine Images)

**Serverless Compute**
- [ ] **AWS Lambda** - Run code without servers (15 min max)
- [ ] **AWS Fargate** - Serverless containers

**Other Compute**
- [ ] **Elastic Beanstalk** - Easy app deployment (PaaS)
- [ ] **Amazon Lightsail** - Simple VPS solution

### ✅ Storage Services

**[[s3]] - Simple Storage Service**
- [ ] Object storage with 11 nines durability
- [ ] Storage classes:
  - [ ] S3 Standard
  - [ ] S3 Intelligent-Tiering
  - [ ] S3 Standard-IA (Infrequent Access)
  - [ ] S3 One Zone-IA
  - [ ] S3 Glacier Instant/Flexible/Deep Archive
- [ ] Lifecycle policies
- [ ] Versioning
- [ ] Replication (cross-region, same-region)
- [ ] [[S3|S3 use cases]]: backups, data lakes, static websites

**Other Storage**
- [ ] **EBS (Elastic Block Store)** - Block storage for [[ec2]]
- [ ] **EFS (Elastic File System)** - Shared file system
- [ ] **AWS Storage Gateway** - Hybrid cloud storage
- [ ] **AWS Backup** - Centralized backup

### ✅ Database Services

- [ ] **[[databases-overview|Amazon RDS]]** - Managed relational databases
  - [ ] Engines: MySQL, PostgreSQL, Oracle, SQL Server, MariaDB
  - [ ] Multi-AZ for high availability
  - [ ] Read replicas for scaling

- [ ] **[[databases-overview|Amazon Aurora]]** - High-performance relational DB
  - [ ] 5x faster than MySQL, 3x faster than PostgreSQL
  - [ ] Serverless option available

- [ ] **[[databases-overview|Amazon DynamoDB]]** - NoSQL key-value database
  - [ ] Single-digit millisecond latency
  - [ ] Serverless, auto-scaling

- [ ] **Amazon ElastiCache** - In-memory caching (Redis, Memcached)
- [ ] **Amazon DocumentDB** - MongoDB-compatible
- [ ] **Amazon Neptune** - Graph database

### ✅ Networking Services

**[[networking-overview|Amazon VPC]]** (Virtual Private Cloud)
- [ ] Private virtual network in AWS
- [ ] [[aws-infrastructure|Subnets]] (public and private)
- [ ] Internet Gateway (IGW)
- [ ] NAT Gateway
- [ ] [[networking-overview|Security Groups]] (stateful firewall)
- [ ] Network ACLs (stateless firewall)
- [ ] VPC Peering
- [ ] VPC Endpoints (private access to AWS services)

**Content Delivery & DNS**
- [ ] **Amazon CloudFront** - CDN (Content Delivery Network)
- [ ] **[[networking-overview|Amazon Route 53]]** - DNS service
  - [ ] Routing policies (simple, weighted, latency, failover)

**Connectivity**
- [ ] **AWS Direct Connect** - Dedicated network connection
- [ ] **AWS VPN** - Encrypted connection over internet

### ✅ Management & Monitoring

- [ ] **AWS CloudWatch** - Monitoring and observability
  - [ ] Metrics, logs, alarms
- [ ] **AWS CloudTrail** - API call logging (who did what)
- [ ] **AWS Config** - Resource configuration tracking
- [ ] **AWS Systems Manager** - Operational insights
- [ ] **AWS Trusted Advisor** - Best practice recommendations
  - [ ] Cost optimization, security, performance, fault tolerance
- [ ] **AWS CloudFormation** - Infrastructure as Code (IaC)
- [ ] **AWS Organizations** - Multi-account management

### ✅ Application Integration

- [ ] **Amazon SNS** - Simple Notification Service (pub/sub)
- [ ] **Amazon SQS** - Simple Queue Service (message queue)
- [ ] **AWS Step Functions** - Workflow orchestration

### ✅ Analytics & Machine Learning

- [ ] **Amazon Athena** - Query data in [[s3]] using SQL
- [ ] **Amazon Redshift** - Data warehouse
- [ ] **Amazon Kinesis** - Real-time data streaming
- [ ] **AWS Glue** - ETL service
- [ ] **Amazon SageMaker** - Build, train, deploy ML models
- [ ] **Amazon Rekognition** - Image/video analysis
- [ ] **Amazon Comprehend** - Natural language processing

### ✅ Global Infrastructure

- [ ] [[aws-infrastructure|Regions]] - Geographic areas (e.g., us-east-1)
- [ ] [[aws-infrastructure|Availability Zones (AZs)]] - Isolated data centers within a region
- [ ] **Edge Locations** - CloudFront caching locations
- [ ] Choose regions based on:
  - [ ] Latency
  - [ ] Cost
  - [ ] Compliance
  - [ ] Service availability

---

## Domain 4: Billing, Pricing, and Support (12%)

### ✅ Pricing Models

- [ ] **Pay-as-you-go** - No upfront costs
- [ ] **Save when you reserve** - Reserved Instances (1-3 years)
- [ ] **Pay less by using more** - Volume discounts
- [ ] **Pay less as AWS grows** - Economies of scale

### ✅ Free Tier

- [ ] **Always Free** - DynamoDB (25 GB), Lambda (1M requests/month)
- [ ] **12 Months Free** - [[ec2]] t2.micro (750 hours/month), [[s3]] (5 GB)
- [ ] **Trials** - SageMaker, Lightsail

### ✅ Cost Management Tools

- [ ] **AWS Pricing Calculator** - Estimate costs
- [ ] **AWS Cost Explorer** - Visualize and analyze costs
- [ ] **AWS Budgets** - Set custom budgets and alerts
- [ ] **AWS Cost and Usage Report** - Detailed billing data
- [ ] **AWS Billing Dashboard** - View current charges
- [ ] **Cost Allocation Tags** - Organize and track costs

### ✅ Support Plans

| Plan | Price | Use Case | Response Time |
|------|-------|----------|---------------|
| **Basic** | Free | All customers | N/A (forums only) |
| **Developer** | $29/month | Testing/dev | <12-24 hours |
| **Business** | $100+/month | Production workloads | <1 hour (urgent) |
| **Enterprise** | $15,000+/month | Mission-critical | <15 min (critical) |

**What each plan includes:**
- [ ] Basic: Account and billing support, forums
- [ ] Developer: + Email support during business hours
- [ ] Business: + 24/7 phone/chat, Trusted Advisor (all checks)
- [ ] Enterprise: + TAM (Technical Account Manager), concierge support

### ✅ AWS Marketplace

- [ ] Third-party software marketplace
- [ ] Pre-configured AMIs
- [ ] Pay-as-you-go or BYOL

---

## Study Strategy

### Week 1-2: Fundamentals
- [ ] Complete [[cloud-computing-basics]]
- [ ] Complete [[aws-infrastructure]]
- [ ] Understand shared responsibility model
- [ ] Review [[01-fundamentals/moc-fundamentals|Fundamentals MOC]]

### Week 3-4: Core Services
- [ ] Study [[ec2]], [[s3]], [[databases-overview]], [[networking-overview]]
- [ ] Review [[02-core-services/moc-core-services|Core Services MOC]]
- [ ] Complete all comparison documents in [[03-comparisons/]]
- [ ] Understand when to use each service

### Week 5-6: Security & Billing
- [ ] IAM deep dive
- [ ] Security services (WAF, Shield, GuardDuty, etc.)
- [ ] Pricing models and cost management
- [ ] Support plans

### Week 7-8: Practice & Review
- [ ] Take practice exams
- [ ] Review [[04-study-aids/quick-reference-guide|quick-reference-guide]]
- [ ] Review [[04-study-aids/key-concepts-flashcards|flashcards]]
- [ ] Focus on weak areas

---

## Common Exam Traps

❌ **Confusing similar services:**
- S3 vs EBS vs EFS (storage types)
- RDS vs DynamoDB vs Aurora (database types)
- Security Groups vs NACLs (firewall rules)

❌ **Shared Responsibility confusion:**
- AWS manages hardware, not your data
- Customer manages OS patches on EC2
- AWS manages patches on RDS

❌ **Pricing misconceptions:**
- Data transfer OUT is charged, IN is free (mostly)
- Some services are always free (CloudWatch basic, IAM)
- Reserved Instances require commitment

---

## Quick Memorization Tips

### The "11 Nines"
- [[s3]] durability: **99.999999999%** (11 nines)
- Means: If you store 10M objects, you might lose 1 every 10,000 years

### Service Name Patterns
- **Amazon** = Managed service (Amazon RDS, Amazon S3)
- **AWS** = Platform/tool (AWS Lambda, AWS IAM)

### Multi-AZ vs Read Replicas
- **Multi-AZ** = High Availability (synchronous, same region)
- **Read Replicas** = Performance (asynchronous, can be cross-region)

### Security Groups vs NACLs
- **Security Groups** = Instance-level, stateful, allow rules only
- **NACLs** = Subnet-level, stateless, allow + deny rules

---

## Related Study Materials

- [[cloud-computing-basics]] - Foundation concepts
- [[aws-infrastructure]] - Regions, AZs, edge locations
- [[02-core-services/moc-core-services|Core Services MOC]] - All service details
- [[storage-options-comparison]] - When to use each storage type
- [[database-options-comparison]] - Database selection guide
- [[compute-services-comparison]] - Compute options
- [[quick-reference-guide]] - One-page cheat sheet
- [[key-concepts-flashcards]] - Memorization aids

---

## Final Checklist Before Exam

- [ ] Reviewed all domains above
- [ ] Completed 2-3 practice exams (scoring 80%+)
- [ ] Understand shared responsibility model
- [ ] Know core services (EC2, S3, RDS, DynamoDB, VPC, Lambda)
- [ ] Understand IAM (users, groups, roles, policies)
- [ ] Know pricing models and free tier
- [ ] Familiar with support plans
- [ ] Understand Well-Architected Framework
- [ ] Reviewed all comparison documents
- [ ] Comfortable with service selection (when to use what)

**Good luck on your exam! 🎯**
