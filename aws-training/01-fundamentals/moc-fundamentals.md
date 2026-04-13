---
tags:
  - moc
  - fundamentals
category: Map of Content
---

# Fundamentals - Map of Content

This section covers the foundational concepts you need to understand before diving into AWS services.

## Overview

Understanding cloud computing basics and AWS infrastructure is essential for working with any AWS service. These concepts apply across all services and regions.

## Notes in this Section

### 1. [[cloud-computing-basics]]
**What you'll learn:**
- Definition of cloud computing
- Key benefits (programmable resources, dynamic abilities, pay-as-you-go)
- Comparison: Cloud vs Traditional on-premise

**Why it matters:** Understanding the fundamental value proposition of cloud computing helps you make better architectural decisions.

### 2. [[aws-infrastructure]]
**What you'll learn:**
- Data Centers - Physical locations housing servers
- Availability Zones (AZs) - Clustered data centers for fault isolation
- Regions - Geographic areas containing multiple AZs
- How infrastructure components relate to services

**Why it matters:** Every AWS service runs within this infrastructure. Understanding Regions and AZs is crucial for:
- High availability design
- Disaster recovery planning
- Compliance with data residency requirements
- Cost optimization

## Learning Path

```
Start Here → cloud-computing-basics → aws-infrastructure → Core Services
```

1. **Start with** [[cloud-computing-basics]] to understand WHY cloud computing exists
2. **Then learn** [[aws-infrastructure]] to understand HOW AWS organizes its global infrastructure
3. **Next move to** [[02-core-services/moc-core-services|Core Services MOC]] to explore specific AWS services

## Key Concepts to Remember

- **Fault Isolation**: AZs are designed so failures in one don't affect others
- **Multi-AZ Deployments**: Many services can replicate across AZs for high availability
- **Regions**: Choose based on latency, compliance, and service availability
- **Pay-as-you-go**: Only pay for what you use, scale up/down as needed

## Quick Reference

| Concept | Definition | Example |
|---------|-----------|---------|
| Data Center | Physical facility housing servers | Building with hundreds of servers |
| Availability Zone (AZ) | Cluster of data centers | us-east-1a, us-east-1b |
| Region | Geographic area with 2+ AZs | us-east-1 (N. Virginia) |
| Multi-AZ | Deployment across multiple AZs | RDS with automatic failover |

---

**Next:** [[02-core-services/moc-core-services|Core Services Map of Content]]
