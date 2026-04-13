---
tags:
  - fundamentals
  - infrastructure
  - regions
  - availability-zones
category: Fundamentals
difficulty: beginner
prerequisites:
  - "[[cloud-computing-basics]]"
related:
  - "[[ec2]]"
  - "[[s3]]"
  - "[[databases-overview]]"
  - "[[networking-overview]]"
---

## Data Center

Is where the hardware is located. It typically houses hundreds of servers.

## Availability zones

- Data centers are clustered into a AZ. Within each AZ there is at least one data center.
- AZ's that are located in a specific geographical zone are from an AWS region. 
- AZ's are designed for fault isolation which prevents data center from being affected as a whole. Meaning that if one AZ goes down for a certain reason, it is very unlikely for the others to go down for the same reason.

## AWS Regions

- Is a geographical area, typically consisting of two or more availability zones.
- Communication between regions uses the AWS backbone network infrastructure.

![[assets/Pasted image 20260109000645.png]]

## How Infrastructure Relates to AWS Services

Understanding Regions and AZs is crucial when working with AWS services:

- **[[ec2]]** instances run in specific AZs. You can launch instances across multiple AZs for high availability.
- **[[s3]]** automatically replicates data across multiple AZs within a Region for durability.
- **[[databases-overview|RDS]]** can be configured in multi-AZ deployments for automatic failover.
- **[[networking-overview|VPC]]** spans all AZs in a Region, with subnets existing in specific AZs.